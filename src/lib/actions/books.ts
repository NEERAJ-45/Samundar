'use server';

import { connectToDatabase } from '@/lib/db';
import Book from '@/lib/models/Book';
import BookContent from '@/lib/models/BookContent';
import { extractTextFromPdfBuffer } from '@/lib/pdf-extractor';
import { logActivity } from '@/lib/activity-logger';

export async function createBook(formData: FormData) {
  try {
    const userEmail = formData.get('userEmail') as string;
    const title = formData.get('title') as string;
    const author = formData.get('author') as string || '';
    const category = formData.get('category') as string || 'other';
    const status = formData.get('status') as string || 'TO_READ';
    const progress = parseInt(formData.get('progress') as string || '0', 10);
    const rating = parseInt(formData.get('rating') as string || '0', 10);
    const pdfFile = formData.get('pdf') as File | null;
    const pdfUrl = formData.get('pdfUrl') as string | null;

    if (!userEmail || !title?.trim()) {
      return { error: 'userEmail and title required' };
    }

    const conn = await connectToDatabase();
    if (!conn) {
      return { error: 'Database unavailable' };
    }

    const bookId = `b-${Date.now()}`;
    let pdfBuffer: Buffer | undefined;

    if (pdfFile) {
      const bytes = await pdfFile.arrayBuffer();
      pdfBuffer = Buffer.from(bytes);
    }

    const book = await Book.create({
      id: bookId,
      title: title.trim(),
      author,
      category,
      status,
      progress,
      rating,
      pdfData: pdfBuffer || undefined,
      hasPdf: !!(pdfBuffer || pdfUrl),
      pdfUrl: pdfUrl || '',
      userEmail,
    });

    logActivity(userEmail, `Added book "${title}"`);

    if (pdfBuffer) {
      try {
        const text = await extractTextFromPdfBuffer(pdfBuffer);
        const cleanText = text.replace(/\s+/g, ' ').trim();
        if (cleanText.length > 20) {
          await BookContent.findOneAndUpdate(
            { bookId, sourceType: 'tracked' },
            {
              bookId,
              sourceType: 'tracked',
              title: title.trim(),
              author,
              category,
              content: cleanText.slice(0, 50000),
              contentLength: cleanText.length,
              indexedAt: new Date(),
            },
            { upsert: true }
          );
        }
      } catch {
        // indexing failure is non-fatal
      }
    }

    return { book: JSON.parse(JSON.stringify(book)) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to add book' };
  }
}
