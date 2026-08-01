import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import type { INote } from '@/lib/models/Note';
import '@/lib/models/Note';
import { logActivity } from '@/lib/activity-logger';
import { getDbUri } from '../request';

function humanizePrefix(storagePrefix: string): string {
  return storagePrefix
    .replace(/-notes$/, '')
    .replace(/-completed$/, '')
    .replace(/-progress$/, '')
    .replace(/-checklist$/, '')
    .replace(/-questions$/, '')
    .replace(/-topics$/, '')
    .replace(/-custom$/, '')
    .replace(/-/g, ' ');
}

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
    const Note = conn.model<INote>('Note');
    const list = await Note.find({ userEmail });
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
    const { storagePrefix, itemId, note, resetAll, itemTitle } = body;

    if (resetAll) {
      if (!storagePrefix) {
        return NextResponse.json({ error: 'Missing storagePrefix' }, { status: 400 });
      }
      const Note = conn.model<INote>('Note');
      await Note.deleteMany({ storagePrefix, userEmail });
      logActivity(userEmail, `Reset all notes in ${storagePrefix}`);
      return NextResponse.json({ success: true, deleted: true });
    }

    if (!storagePrefix || !itemId) {
      return NextResponse.json({ error: 'Missing storagePrefix or itemId' }, { status: 400 });
    }

    const Note = conn.model<INote>('Note');
    const sectionName = humanizePrefix(storagePrefix);
    const displayName = itemTitle || `#${itemId}`;
    if (note) {
      const doc = await Note.findOneAndUpdate(
        { storagePrefix, itemId, userEmail },
        { note },
        { upsert: true, new: true }
      );
      logActivity(userEmail, `Added note to "${displayName}" in ${sectionName}`);
      return NextResponse.json({ success: true, data: doc });
    } else {
      await Note.deleteOne({ storagePrefix, itemId, userEmail });
      return NextResponse.json({ success: true, deleted: true });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
