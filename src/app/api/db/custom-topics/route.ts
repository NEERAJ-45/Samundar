import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import type { ICustomTopic } from '@/lib/models/CustomTopic';
import '@/lib/models/CustomTopic';
import { logActivity } from '@/lib/activity-logger';
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
    const CustomTopic = conn.model<ICustomTopic>('CustomTopic');
    const list = await CustomTopic.find({ userEmail });
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
    const { storagePrefix, id, title, difficulty, link } = body;

    if (!storagePrefix || !id || !title || !difficulty) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const CustomTopic = conn.model<ICustomTopic>('CustomTopic');
    const existing = await CustomTopic.findOne({ storagePrefix, id, userEmail });
    const doc = await CustomTopic.findOneAndUpdate(
      { storagePrefix, id, userEmail },
      { title, difficulty, link: link || '' },
      { upsert: true, new: true }
    );
    logActivity(userEmail, existing ? `Updated custom topic "${title}"` : `Added custom topic "${title}"`);
    return NextResponse.json({ success: true, data: doc });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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
    const { searchParams } = new URL(request.url);
    const storagePrefix = searchParams.get('storagePrefix');
    const idStr = searchParams.get('id');

    if (!storagePrefix) {
      return NextResponse.json({ error: 'Missing storagePrefix' }, { status: 400 });
    }

    const CustomTopic = conn.model<ICustomTopic>('CustomTopic');

    if (!idStr) {
      await CustomTopic.deleteMany({ storagePrefix, userEmail });
      logActivity(userEmail, `Reset all custom topics in ${storagePrefix}`);
      return NextResponse.json({ success: true, deleted: true });
    }

    const id = Number(idStr);
    const existing = await CustomTopic.findOne({ storagePrefix, id, userEmail });
    await CustomTopic.deleteOne({ storagePrefix, id, userEmail });
    logActivity(userEmail, `Removed custom topic "${existing?.title || id}" from ${storagePrefix}`);
    return NextResponse.json({ success: true, deleted: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
