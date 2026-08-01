import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import Highlight from '@/lib/models/Highlight';
import { getDbUri } from '../request';

function getErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Internal server error';
  return NextResponse.json({ error: message }, { status: 500 });
}

function getDbUri(request: Request): string | undefined {
  return request.headers.get('x-mongodb-url') || undefined;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    const session = await auth();
    const userEmail = session?.user?.email || '';

    if (!bookId || !userEmail) {
      return NextResponse.json({ highlights: [] });
    }

    const conn = await connectToDatabase(getDbUri(request));
    if (!conn) {
      return NextResponse.json({ highlights: [] });
    }

    const highlights = await Highlight.find({ bookId, userEmail }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ highlights });
  } catch {
    return NextResponse.json({ highlights: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookId, pageNumber, text, color, rects } = body;
    const session = await auth();
    const userEmail = session?.user?.email || '';

    if (!bookId || !userEmail || pageNumber == null) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await connectToDatabase(getDbUri(request));
    if (!conn) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const highlight = await Highlight.create({
      id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      bookId,
      pageNumber,
      text: text || '',
      color: color || '#fbbf24',
      rects: rects || [],
      userEmail,
    });

    return NextResponse.json({ highlight }, { status: 201 });
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

    await Highlight.deleteOne({ id, userEmail });
    return NextResponse.json({ success: true });
  } catch (error) {
    return getErrorResponse(error);
  }
}
