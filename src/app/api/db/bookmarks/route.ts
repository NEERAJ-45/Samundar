import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import Bookmark from '@/lib/models/Bookmark';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');
    const session = await auth();
    const userEmail = session?.user?.email;

    if (!bookId || !userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await connectToDatabase();
    if (!conn) return NextResponse.json({ bookmarks: [] });

    const bookmarks = await Bookmark.find({ bookId, userEmail }).sort({ pageNumber: 1 }).lean();
    return NextResponse.json({ bookmarks });
  } catch {
    return NextResponse.json({ bookmarks: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, bookId, pageNumber, note } = body;
    const session = await auth();
    const userEmail = session?.user?.email;

    if (!id || !bookId || !pageNumber || !userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    await Bookmark.findOneAndUpdate(
      { id },
      { id, bookId, pageNumber, note: note || '', userEmail },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save bookmark' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const session = await auth();
    const userEmail = session?.user?.email;

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await connectToDatabase();
    if (!conn) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

    await Bookmark.deleteOne({ id, userEmail });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 });
  }
}
