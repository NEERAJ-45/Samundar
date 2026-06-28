import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import LoginAttempt from '@/lib/models/LoginAttempt';
import Profile from '@/lib/models/Profile';
import type { IProject } from '@/lib/models/Project';
import '@/lib/models/Project';
import type { IActivity } from '@/lib/models/Activity';
import '@/lib/models/Activity';
import type { ICompletion } from '@/lib/models/Completion';
import '@/lib/models/Completion';
import type { IRevision } from '@/lib/models/Revision';
import '@/lib/models/Revision';

function computeProgress(features?: { done?: boolean }[]): number {
  if (!features?.length) return 0;
  return Math.round((features.filter((f) => f.done).length / features.length) * 100);
}

function computeStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const daySet = new Set(dates.map((d) => d.split('T')[0]));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  const yest = new Date(today); yest.setDate(yest.getDate() - 1);
  const yesterStr = yest.toISOString().split('T')[0];
  if (!daySet.has(todayStr) && !daySet.has(yesterStr)) return 0;
  let streak = 0;
  const cur = new Date(daySet.has(todayStr) ? today : yest);
  while (daySet.has(cur.toISOString().split('T')[0])) { streak++; cur.setDate(cur.getDate() - 1); }
  return streak;
}

async function deriveStats(conn: mongoose.Connection, userEmail: string) {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const attempts = await LoginAttempt.find({
    userEmail, success: true, timestamp: { $gte: ninetyDaysAgo },
  }).sort({ timestamp: 1 }).lean();
  const dates = attempts.map((a: any) => new Date(a.timestamp).toISOString());
  const streak = computeStreak(dates);

  const Completion = conn.model<ICompletion>('Completion');
  const allCompletions = await Completion.find({ userEmail }).lean();
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const weekCount = allCompletions.filter((c: any) => new Date(c.completedAt) >= weekStart).length;
  const monthCount = allCompletions.filter((c: any) => new Date(c.completedAt) >= monthStart).length;
  const total = allCompletions.length || 1;

  const weeklyPct = Math.min(100, Math.round(weekCount / Math.max(1, Math.round(total / 4)) * 100));
  const monthlyPct = Math.min(100, Math.round(monthCount / Math.max(1, Math.round(total / 3)) * 100));

  const Revision = conn.model<IRevision>('Revision');
  const revisions = await Revision.find({ userEmail }).lean();
  const avgStage = revisions.reduce((s: number, r: any) => s + (r.stage || 0), 0) / (revisions.length || 1);
  const readiness = Math.min(100, Math.round(avgStage / 5 * 100));

  const dueCount = await Revision.countDocuments({
    userEmail, dueDate: { $lte: new Date().toISOString().split('T')[0] }, completed: false,
  });

  let readinessLabel = 'Just started';
  if (avgStage >= 1) readinessLabel = 'Learning';
  if (avgStage >= 2.5) readinessLabel = 'Practicing';
  if (avgStage >= 4) readinessLabel = 'Strong';

  return { streak, weeklyPct, monthlyPct, readiness, readinessLabel, weekCount, monthCount, dueCount };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail') || request.headers.get('x-user-email') || '';
    const customUri = request.headers.get('x-mongodb-url') || undefined;

    if (!userEmail) {
      return NextResponse.json({ error: 'userEmail required' }, { status: 400 });
    }

    const conn = await connectToDatabase(customUri);
    if (!conn) {
      return NextResponse.json({ dbConnected: false }, { status: 503 });
    }

    const Project = conn.model<IProject>('Project');
    const Activity = conn.model<IActivity>('Activity');

    const [projects, activities, stats, profile] = await Promise.all([
      Project.find({ userEmail }).lean(),
      Activity.find({ userEmail }).sort({ createdAt: -1 }).limit(10).lean(),
      deriveStats(conn, userEmail),
      Profile.findOne({ email: userEmail }).lean(),
    ]);

    return NextResponse.json({
      dbConnected: true,
      stats: [
        { value: String(stats.streak), label: 'Current Streak', sub: 'days' },
        { value: `${stats.weeklyPct}%`, label: 'Weekly Progress', sub: `${stats.weekCount} completed` },
        { value: `${stats.monthlyPct}%`, label: 'Monthly Progress', sub: `${stats.monthCount} completed` },
        { value: `${stats.readiness}%`, label: 'Interview Readiness', sub: stats.readinessLabel },
      ],
      focusItems: [
        { label: 'Active Pillar', value: profile?.activePillar || 'Data Structures & Algorithms', badge: profile?.activeCategory || 'Trees' },
        { label: 'Next Learning Unit', value: profile?.nextLearningUnit || 'AVL Tree Rotations', badge: profile?.nextLearningDuration || '45 min' },
        { label: 'Due Revisions', value: `${stats.dueCount} concept${stats.dueCount === 1 ? '' : 's'} need review`, badge: stats.dueCount > 0 ? 'Overdue' : 'Up to date' },
      ],
      projects: projects.map((p: any) => ({
        name: p.name,
        status: p.status,
        progress: `${computeProgress(p.features)}%`,
      })),
      activities: activities.map((a: any) => ({ text: a.text, createdAt: a.createdAt })),
    });
  } catch (error: any) {
    return NextResponse.json({ dbConnected: false, error: error.message }, { status: 500 });
  }
}
