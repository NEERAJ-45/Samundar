import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { ICompletion } from '@/lib/models/Completion';
import '@/lib/models/Completion';
import { auth } from '@/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = session.user.email;
    const customUri = request.headers.get('x-mongodb-url') || undefined;
    const effectiveUri = customUri || process.env.MONGODB_URI || 'NOT SET';

    console.log('[API/completions] Using URI:', effectiveUri.substring(0, 60) + '...');

    const conn = await connectToDatabase(customUri);
    if (!conn) {
      return NextResponse.json({ dbConnected: false, data: [] });
    }
    const Completion = conn.model<ICompletion>('Completion');
    const list = await Completion.find({ userEmail });
    return NextResponse.json({ dbConnected: true, data: list });
  } catch (error: any) {
    console.error('[API/completions] Connection error:', error.message);
    return NextResponse.json({ dbConnected: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userEmail = session.user.email;

    const customUri = request.headers.get('x-mongodb-url') || undefined;
    const conn = await connectToDatabase(customUri);
    if (!conn) {
      return NextResponse.json({ dbConnected: false, error: 'Database not configured' }, { status: 400 });
    }
    const body = await request.json();
    const { storagePrefix, itemId, completedAt } = body;

    if (!storagePrefix || !itemId) {
      return NextResponse.json({ error: 'Missing storagePrefix or itemId' }, { status: 400 });
    }

    const Completion = conn.model<ICompletion>('Completion');
    if (completedAt) {
      const doc = await Completion.findOneAndUpdate(
        { storagePrefix, itemId, userEmail },
        { completedAt },
        { upsert: true, new: true }
      );
      return NextResponse.json({ success: true, data: doc });
    } else {
      await Completion.deleteOne({ storagePrefix, itemId, userEmail });
      return NextResponse.json({ success: true, deleted: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
