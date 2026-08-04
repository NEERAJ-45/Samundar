import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import type { IProblemBookmark } from '@/lib/models/ProblemBookmark';
import '@/lib/models/ProblemBookmark';
import { getDbUri } from '../request';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ dbConnected: false, data: [] });
    }

    const conn = await connectToDatabase(getDbUri(request));
    if (!conn) {
      return NextResponse.json({ dbConnected: false, data: [] });
    }
    const Bookmark = conn.model<IProblemBookmark>('ProblemBookmark');
    const list = await Bookmark.find({ userEmail });
    return NextResponse.json({ dbConnected: true, data: list });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ dbConnected: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await connectToDatabase(getDbUri(request));
    if (!conn) {
      return NextResponse.json({ dbConnected: false, error: 'Database not configured' }, { status: 400 });
    }
    const body = await request.json();
    const { storagePrefix, itemId, bookmarked, resetAll } = body;

    if (resetAll) {
      if (!storagePrefix) {
        return NextResponse.json({ error: 'Missing storagePrefix' }, { status: 400 });
      }
      const Bookmark = conn.model<IProblemBookmark>('ProblemBookmark');
      await Bookmark.deleteMany({ storagePrefix, userEmail });
      return NextResponse.json({ success: true, deleted: true });
    }

    if (!storagePrefix || !itemId) {
      return NextResponse.json({ error: 'Missing storagePrefix or itemId' }, { status: 400 });
    }

    const Bookmark = conn.model<IProblemBookmark>('ProblemBookmark');
    if (bookmarked) {
      const doc = await Bookmark.findOneAndUpdate(
        { storagePrefix, itemId, userEmail },
        { storagePrefix, itemId, userEmail },
        { upsert: true, new: true }
      );
      return NextResponse.json({ success: true, data: doc });
    } else {
      await Bookmark.deleteOne({ storagePrefix, itemId, userEmail });
      return NextResponse.json({ success: true, deleted: true });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
