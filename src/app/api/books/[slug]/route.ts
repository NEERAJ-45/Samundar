import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import books, { getBookBySlug } from '@/data/books';

const BOOKS_DIR = join(process.cwd(), 'src', 'assets', 'Being-Backend-Prodigy');

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const book = getBookBySlug(slug);

  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  }

  const filePath = join(BOOKS_DIR, book.path);

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const fileBuffer = await readFile(filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${book.title}.pdf"`,
      'Content-Length': String(fileBuffer.length),
    },
  });
}
