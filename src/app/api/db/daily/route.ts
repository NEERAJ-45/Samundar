import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { IDailyRecord } from '@/lib/models/DailyRecord';
import '@/lib/models/DailyRecord';
import { auth } from '@/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userEmail = session.user.email;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    if (!date) {
      return NextResponse.json({ error: 'date query param required' }, { status: 400 });
    }
    const customUri = request.headers.get('x-mongodb-url') || undefined;
    const conn = await connectToDatabase(customUri);
    if (!conn) {
      return NextResponse.json({ dbConnected: false, record: null });
    }
    const DailyRecord = conn.model<IDailyRecord>('DailyRecord');
    const record = await DailyRecord.findOne({ date, userEmail }).lean();
    return NextResponse.json({ dbConnected: true, record: record || null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
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
    const { date, completedTaskIds, note } = body;
    if (!date) {
      return NextResponse.json({ error: 'date is required' }, { status: 400 });
    }
    const DailyRecord = conn.model<IDailyRecord>('DailyRecord');
    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (completedTaskIds !== undefined) updateData.completedTaskIds = completedTaskIds;
    if (note !== undefined) updateData.note = note;
    const record = await DailyRecord.findOneAndUpdate(
      { date, userEmail },
      { $set: updateData },
      { upsert: true, new: true },
    );
    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
