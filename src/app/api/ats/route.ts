import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { runAts } from '@/lib/ats/analyze';
import { limitForAction } from '@/lib/ats/quota';
import type { IResumeAnalysis } from '@/lib/models/ResumeAnalysis';
import '@/lib/models/ResumeAnalysis';
import { connectToDatabase } from '@/lib/db';
import { getDbUri } from '../db/request';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'ATS analysis failed';
}

export async function POST(request: Request) {
  const session = await auth();
  const userEmail = session?.user?.email;
  if (!userEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const resume = typeof body.resume === 'string' ? body.resume.trim() : '';
    const jobDescription = typeof body.jobDescription === 'string' ? body.jobDescription.trim() : '';
    const roleTitle = typeof body.roleTitle === 'string' && body.roleTitle.trim() ? body.roleTitle.trim() : null;
    const action = body.action === 'optimize' ? 'optimize' : 'analyze';

    if (!resume) {
      return NextResponse.json({ error: 'Resume source is required' }, { status: 400 });
    }
    if (!jobDescription) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }

    const conn = await connectToDatabase(getDbUri(request));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let used = 0;
    if (conn) {
      const Analysis = conn.model<IResumeAnalysis>('ResumeAnalysis');
      used = await Analysis.countDocuments({ userEmail, action, createdAt: { $gte: today } });
      if (used >= limitForAction(action)) {
        return NextResponse.json({ error: 'Daily ATS limit reached. Try again tomorrow.' }, { status: 429 });
      }
    }

    const result = await runAts({
      resume,
      jobDescription,
      roleTitle,
      action,
    });

    if (conn) {
      const Analysis = conn.model<IResumeAnalysis>('ResumeAnalysis');
      const resumeId = typeof body.resumeId === 'string' && body.resumeId ? body.resumeId : null;
      await Analysis.create({
        userEmail,
        resumeId,
        action,
        jd: jobDescription,
        roleTitle,
        resumeSnapshot: resume,
        scores: result.scores,
        missingKeywords: result.missingKeywords,
        presentKeywords: result.presentKeywords,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        recommendations: result.recommendations,
        optimizedSource: result.optimizedSource ?? null,
      });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
