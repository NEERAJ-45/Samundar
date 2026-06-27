import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import CustomTopic from '@/lib/models/CustomTopic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail') || request.headers.get('x-user-email') || 'NEERAJ';
    const customUri = request.headers.get('x-mongodb-url') || undefined;

    const conn = await connectToDatabase(customUri);
    if (!conn) {
      return NextResponse.json({ dbConnected: false, data: [] });
    }
    const list = await CustomTopic.find({ userEmail });
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
    const { storagePrefix, id, title, difficulty, link } = body;
    const userEmail = body.userEmail || request.headers.get('x-user-email') || 'NEERAJ';

    if (!storagePrefix || !id || !title || !difficulty) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const doc = await CustomTopic.findOneAndUpdate(
      { storagePrefix, id, userEmail },
      { title, difficulty, link: link || '' },
      { upsert: true, new: true }
    );
    return NextResponse.json({ success: true, data: doc });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const customUri = request.headers.get('x-mongodb-url') || undefined;
    const conn = await connectToDatabase(customUri);
    if (!conn) {
      return NextResponse.json({ dbConnected: false, error: 'Database not configured' }, { status: 400 });
    }
    const { searchParams } = new URL(request.url);
    const storagePrefix = searchParams.get('storagePrefix');
    const idStr = searchParams.get('id');
    const userEmail = searchParams.get('userEmail') || request.headers.get('x-user-email') || 'NEERAJ';

    if (!storagePrefix || !idStr) {
      return NextResponse.json({ error: 'Missing storagePrefix or id' }, { status: 400 });
    }

    const id = Number(idStr);
    await CustomTopic.deleteOne({ storagePrefix, id, userEmail });
    return NextResponse.json({ success: true, deleted: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
