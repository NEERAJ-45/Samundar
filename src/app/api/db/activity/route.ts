import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import '@/lib/models/Activity';
import { logActivity } from '@/lib/activity-logger';
import Activity from '@/lib/models/Activity';
import { getDbUri } from '../request';

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await request.json();
    if (!text) {
      return NextResponse.json({ error: 'text required' }, { status: 400 });
    }
    await connectToDatabase(getDbUri(request));
    await logActivity(userEmail, text);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase(getDbUri(request));
    const activities = await Activity.find({ userEmail })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return NextResponse.json({
      activities: activities.map((a: { text: string; createdAt: Date }) => ({ text: a.text, createdAt: a.createdAt })),
    });
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

    await connectToDatabase(getDbUri(request));
    const result = await Activity.deleteMany({ userEmail });

    return NextResponse.json({ success: true, deletedCount: result.deletedCount });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

