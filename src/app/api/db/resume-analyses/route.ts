import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import type { IResumeAnalysis } from '@/lib/models/ResumeAnalysis';
import '@/lib/models/ResumeAnalysis';
import { connectToDatabase } from '@/lib/db';
import { getDbUri } from '../request';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unexpected error';
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ dbConnected: false, error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await connectToDatabase(getDbUri(request));
    if (!conn) {
      return NextResponse.json({ dbConnected: false, data: [] });
    }

    const url = new URL(request.url);
    const resumeId = url.searchParams.get('resumeId');

    const Analysis = conn.model<IResumeAnalysis>('ResumeAnalysis');
    const filter: Record<string, unknown> = { userEmail };
    if (resumeId) filter.resumeId = resumeId;
    const list = await Analysis.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ dbConnected: true, data: list });
  } catch (error: unknown) {
    return NextResponse.json({ dbConnected: false, error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const conn = await connectToDatabase(getDbUri(request));
    if (!conn) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 400 });
    }

    const Analysis = conn.model<IResumeAnalysis>('ResumeAnalysis');
    const result = await Analysis.deleteOne({ _id: id, userEmail });
    return NextResponse.json({ success: result.deletedCount > 0 });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
