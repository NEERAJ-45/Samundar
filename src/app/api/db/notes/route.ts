import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { INote } from '@/lib/models/Note';
import '@/lib/models/Note';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail') || request.headers.get('x-user-email') || 'NEERAJ';
    const customUri = request.headers.get('x-mongodb-url') || undefined;

    const conn = await connectToDatabase(customUri);
    if (!conn) {
      return NextResponse.json({ dbConnected: false, data: [] });
    }
    const Note = conn.model<INote>('Note');
    const list = await Note.find({ userEmail });
    return NextResponse.json({ dbConnected: true, data: list });
  } catch (error: any) {
    return NextResponse.json({ dbConnected: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const customUri = request.headers.get('x-mongodb-url') || undefined;
    const conn = await connectToDatabase(customUri);
    if (!conn) {
      return NextResponse.json({ dbConnected: false, error: 'Database not configured' }, { status: 400 });
    }
    const body = await request.json();
    const { storagePrefix, itemId, note } = body;
    const userEmail = body.userEmail || request.headers.get('x-user-email') || 'NEERAJ';

    if (!storagePrefix || !itemId) {
      return NextResponse.json({ error: 'Missing storagePrefix or itemId' }, { status: 400 });
    }

    const Note = conn.model<INote>('Note');
    if (note) {
      const doc = await Note.findOneAndUpdate(
        { storagePrefix, itemId, userEmail },
        { note },
        { upsert: true, new: true }
      );
      return NextResponse.json({ success: true, data: doc });
    } else {
      await Note.deleteOne({ storagePrefix, itemId, userEmail });
      return NextResponse.json({ success: true, deleted: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
