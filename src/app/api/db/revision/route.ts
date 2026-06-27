import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { IRevision } from '@/lib/models/Revision';
import '@/lib/models/Revision';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail') || request.headers.get('x-user-email') || 'NEERAJ';
    const customUri = request.headers.get('x-mongodb-url') || undefined;

    const conn = await connectToDatabase(customUri);
    if (!conn) {
      return NextResponse.json({ dbConnected: false, data: [] });
    }
    const Revision = conn.model<IRevision>('Revision');
    const list = await Revision.find({ userEmail });
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
    const { id, concept, stage, dueDate, completed } = body;
    const userEmail = body.userEmail || request.headers.get('x-user-email') || 'NEERAJ';

    if (!id || !concept || stage === undefined || !dueDate) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const Revision = conn.model<IRevision>('Revision');
    const doc = await Revision.findOneAndUpdate(
      { id, userEmail },
      { concept, stage, dueDate, completed: !!completed },
      { upsert: true, new: true }
    );
    return NextResponse.json({ success: true, data: doc });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return POST(request);
}

export async function DELETE(request: Request) {
  try {
    const customUri = request.headers.get('x-mongodb-url') || undefined;
    const conn = await connectToDatabase(customUri);
    if (!conn) {
      return NextResponse.json({ dbConnected: false, error: 'Database not configured' }, { status: 400 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userEmail = searchParams.get('userEmail') || request.headers.get('x-user-email') || 'NEERAJ';

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const Revision = conn.model<IRevision>('Revision');
    await Revision.deleteOne({ id, userEmail });
    return NextResponse.json({ success: true, deleted: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
