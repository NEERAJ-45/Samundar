import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { IDailyRecord } from '@/lib/models/DailyRecord';
import '@/lib/models/DailyRecord';
import type { IProfile } from '@/lib/models/Profile';
import '@/lib/models/Profile';
import { sendEmail } from '@/lib/email';

const CRON_SECRET = process.env.CRON_SECRET || '';

function meetsRequirement(ids: string[]): boolean {
  const hasDsa = ids.some((id) => id.startsWith('dsa-'));
  const hasSd = ids.some((id) => id.startsWith('sd-'));
  const hasOther = ids.some((id) => id.startsWith('cs-') || id.startsWith('proj-') || id.startsWith('rev-'));
  return hasDsa && hasSd && hasOther;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    if (secret !== CRON_SECRET) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const today = new Date().toISOString().slice(0, 10);
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    const DailyRecord = conn.model<IDailyRecord>('DailyRecord');
    const Profile = conn.model<IProfile>('Profile');

    const todayRecord = await DailyRecord.findOne({ date: today }).lean();

    if (todayRecord && meetsRequirement(todayRecord.completedTaskIds)) {
      return NextResponse.json({ status: 'ok', message: 'Requirements met — no email sent' });
    }

    const profiles = await Profile.find({}).lean();
    if (profiles.length === 0) {
      return NextResponse.json({ status: 'ok', message: 'No users found — nothing to do' });
    }

    const completedCount = todayRecord?.completedTaskIds?.length || 0;
    const emailText = [
      'Subject: Daily Report Not Submitted',
      '',
      `Date: ${today}`,
      `Tasks completed today: ${completedCount}`,
      '',
      'Why haven\'t you submitted on the dashboard?',
      '',
      'Required for today:',
      '  - At least 1 DSA task',
      '  - At least 1 System Design concept',
      '  - At least 1 from other categories (Core CS / Project / Revision)',
    ].join('\n');

    const results = await Promise.all(
      profiles.map((p) =>
        sendEmail({
          to: p.email,
          subject: 'Daily Report Not Submitted',
          text: emailText,
        }),
      ),
    );

    return NextResponse.json({
      status: 'reminder_sent',
      users: profiles.length,
      results,
    });
  } catch (error: any) {
    console.error('[CRON] daily-check error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
