import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { IActivity } from '@/lib/models/Activity';
import '@/lib/models/Activity';
import { logActivity } from '@/lib/activity-logger';
import { auth } from '@/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userEmail = session.user.email;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const customUri = request.headers.get('x-mongodb-url') || undefined;
    const conn = await connectToDatabase(customUri);
    if (!conn) {
      return NextResponse.json({ dbConnected: false, data: [] });
    }

    const Activity = conn.model<IActivity>('Activity');
    const activities = await Activity.find({ userEmail }).sort({ createdAt: -1 }).limit(limit).lean();

    return NextResponse.json({ dbConnected: true, data: activities });
  } catch (error: any) {
    return NextResponse.json({ dbConnected: false, error: error.message, data: [] });
  }
}

export async function POST(request: Request) {
  try {
    const { userEmail, text } = await request.json();
    if (!userEmail || !text) {
      return NextResponse.json({ error: 'userEmail and text required' }, { status: 400 });
    }
    await logActivity(userEmail, text);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
