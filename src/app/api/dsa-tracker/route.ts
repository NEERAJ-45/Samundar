import { NextResponse } from 'next/server';
import { getDSATrackerRepository } from '@/lib/repository/factory';

export async function GET() {
  try {
    const repo = getDSATrackerRepository();
    const [tracker, dashboard] = await Promise.all([
      repo.getTracker(),
      repo.getDashboardMetrics(),
    ]);

    return NextResponse.json({
      domains: tracker.pillar.domains,
      dashboard,
    });
  } catch (error) {
    console.error('Failed to load DSA tracker:', error);
    return NextResponse.json(
      { error: 'Failed to load DSA tracker data' },
      { status: 500 }
    );
  }
}
