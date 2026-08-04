import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import type { IRevision } from '@/lib/models/Revision';
import '@/lib/models/Revision';
import { logActivity } from '@/lib/activity-logger';
import { getDbUri } from '../request';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email || '';
    if (!userEmail) {
      return NextResponse.json({ dbConnected: false, data: [] });
    }

    const conn = await connectToDatabase(getDbUri(request));
    if (!conn) {
      return NextResponse.json({ dbConnected: false, data: [] });
    }
    const Revision = conn.model<IRevision>('Revision');
    const list = await Revision.find({ userEmail });
    return NextResponse.json({ dbConnected: true, data: list });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ dbConnected: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email || '';
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await connectToDatabase(getDbUri(request));
    if (!conn) {
      return NextResponse.json({ dbConnected: false, error: 'Database not configured' }, { status: 400 });
    }
    const body = await request.json();
    const { id, concept, stage, dueDate, completed } = body;

    if (!id || !concept || stage === undefined || !dueDate) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const Revision = conn.model<IRevision>('Revision');
    const existing = await Revision.findOne({ id, userEmail });
    const doc = await Revision.findOneAndUpdate(
      { id, userEmail },
      { concept, stage, dueDate, completed: !!completed },
      { upsert: true, new: true }
    );
    logActivity(userEmail, existing ? `Updated revision for "${concept}"` : `Added revision for "${concept}"`);
    return NextResponse.json({ success: true, data: doc });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return POST(request);
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email || '';
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await connectToDatabase(getDbUri(request));
    if (!conn) {
      return NextResponse.json({ dbConnected: false, error: 'Database not configured' }, { status: 400 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const Revision = conn.model<IRevision>('Revision');
    const existing = await Revision.findOne({ id, userEmail });
    await Revision.deleteOne({ id, userEmail });
    logActivity(userEmail, `Removed revision for "${existing?.concept || id}"`);
    return NextResponse.json({ success: true, deleted: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
