import { NextRequest, NextResponse } from 'next/server';
import { getDSATrackerRepository } from '@/lib/repository/factory';

export async function PATCH(request: NextRequest) {
  try {
    const { problemId, domainId, topicId, patternId } = await request.json();

    if (!problemId || !domainId || !topicId || !patternId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const repo = getDSATrackerRepository();
    const problem = await repo.getProblem(domainId, topicId, patternId, problemId);

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    const now = new Date().toISOString().split('T')[0];
    const newCompleted = !problem.completed;

    await repo.updateProblemActivity(domainId, topicId, patternId, problemId, {
      completed: newCompleted,
      activity: {
        completed: newCompleted,
        attemptCount: problem.activity.attemptCount + 1,
        solveCount: newCompleted ? problem.activity.solveCount + 1 : Math.max(0, problem.activity.solveCount - 1),
        firstSolvedDate: problem.activity.firstSolvedDate || (newCompleted ? now : null),
        lastSolvedDate: now,
        revisionCount: problem.activity.revisionCount,
        activityLog: [
          ...problem.activity.activityLog,
          {
            date: now,
            action: newCompleted ? 'SOLVED' : 'BOOKMARKED',
            timeSpentMinutes: 0,
            notes: '',
          },
        ],
      },
    });

    await repo.recalculateAllMetrics();

    const [tracker, dashboard] = await Promise.all([
      repo.getTracker(),
      repo.getDashboardMetrics(),
    ]);

    return NextResponse.json({
      success: true,
      completed: newCompleted,
      domains: tracker.pillar.domains,
      dashboard,
    });
  } catch (error) {
    console.error('Failed to update problem:', error);
    return NextResponse.json({ error: 'Failed to update problem' }, { status: 500 });
  }
}
