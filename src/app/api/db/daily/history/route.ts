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
    const customUri = request.headers.get('x-mongodb-url') || undefined;
    const conn = await connectToDatabase(customUri);
    if (!conn) {
      return NextResponse.json({ dbConnected: false, records: [] });
    }
    const DailyRecord = conn.model<IDailyRecord>('DailyRecord');
    const records = await DailyRecord.find({ userEmail })
      .sort({ date: -1 })
      .limit(365)
      .lean();
    return NextResponse.json({ dbConnected: true, records });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
