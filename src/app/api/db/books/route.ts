import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import Book from '@/lib/models/Book';
import BookContent from '@/lib/models/BookContent';
import { extractTextFromPdfBuffer } from '@/lib/pdf-extractor';
import { logActivity } from '@/lib/activity-logger';
import { getDbUri } from '../request';
function getErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Internal server error';
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email || '';
    if (!userEmail) {
      return NextResponse.json({ books: [] });
    }

    const conn = await connectToDatabase(getDbUri(request));
    if (!conn) {
      return NextResponse.json({ books: [] });
    }

    const books = await Book.find({ userEmail }).sort({ id: -1 }).lean();
    return NextResponse.json({ books });
  } catch {
    return NextResponse.json({ books: [] });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email || '';
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    let bookData: Record<string, unknown>;
    let pdfFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      pdfFile = formData.get('pdf') as File | null;
      bookData = {
        title: formData.get('title') as string || '',
        author: formData.get('author') as string || '',
        category: formData.get('category') as string || 'other',
        status: formData.get('status') as string || 'TO_READ',
        progress: parseInt(formData.get('progress') as string || '0', 10),
        rating: parseInt(formData.get('rating') as string || '0', 10),
      };
    } else {
      const body = await request.json();
      bookData = body;
    }

    const conn = await connectToDatabase(getDbUri(request));
    if (!conn) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const bookId = (bookData.id as string) || `b-${Date.now()}`;

    let pdfBuffer: Buffer | undefined;

    if (pdfFile) {
      const bytes = await pdfFile.arrayBuffer();
      pdfBuffer = Buffer.from(bytes);
    }

    const book = await Book.create({
      ...bookData,
      id: bookId,
      pdfData: pdfBuffer || undefined,
      hasPdf: !!pdfBuffer,
      userEmail,
    });

    logActivity(userEmail, `Added book "${bookData.title}"`);

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
              title: String(bookData.title || ''),
              author: String(bookData.author || ''),
              category: String(bookData.category || 'other'),
              content: cleanText.slice(0, 50000),
              contentLength: cleanText.length,
              indexedAt: new Date(),
            },
            { upsert: true }
          );
        }
      } catch {
        // non-fatal
      }
    }

    return NextResponse.json({ book }, { status: 201 });
  } catch (error) {
    return getErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const session = await auth();
    const userEmail = session?.user?.email || '';

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const conn = await connectToDatabase(getDbUri(request));
    if (!conn) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const existing = await Book.findOne({ id });
    if (!existing) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }
    if (existing.userEmail !== userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userEmail: _ignoredUserEmail, ...safeBody } = body as Record<string, unknown>;

    const book = await Book.findOneAndUpdate(
      { id },
      { $set: safeBody },
      { new: true, runValidators: true }
    ).lean();

    logActivity(existing.userEmail, `Updated book "${book.title}"`);

    return NextResponse.json({ book });
  } catch (error) {
    return getErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const session = await auth();
    const userEmail = session?.user?.email || '';

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const conn = await connectToDatabase(getDbUri(request));
    if (!conn) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const existing = await Book.findOne({ id });
    if (existing && existing.userEmail !== userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (existing) {
      logActivity(existing.userEmail, `Deleted book "${existing.title}"`);
    }

    await Book.deleteOne({ id });
    return NextResponse.json({ success: true });
  } catch (error) {
    return getErrorResponse(error);
  }
}
