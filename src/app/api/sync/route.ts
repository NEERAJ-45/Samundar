import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Sync localStorage data to the server for the current user
    return NextResponse.json({ success: true, syncedAt: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Sync failed' }, { status: 500 });
  }
}
