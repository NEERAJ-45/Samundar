import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import type { IWhiteboard } from '@/lib/models/Whiteboard';
import '@/lib/models/Whiteboard';
import { getDbUri } from '../request';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ dbConnected: false, data: [] });
    }

    const conn = await connectToDatabase(getDbUri(request));
    if (!conn) {
      return NextResponse.json({ dbConnected: false, data: [] });
    }

    const Whiteboard = conn.model<IWhiteboard>('Whiteboard');
    const list = await Whiteboard.find({ userEmail }).sort({ updatedAt: 1 }).lean();
    return NextResponse.json({
      dbConnected: true,
      data: list.map((b) => ({
        boardId: b.boardId,
        name: b.name,
        scene: b.scene,
        updatedAt: b.updatedAt,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ dbConnected: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await connectToDatabase(getDbUri(request));
    if (!conn) {
      return NextResponse.json({ dbConnected: false, error: 'Database not configured' }, { status: 400 });
    }

    const body = await request.json();
    const { boardId, name, scene, delete: deleteFlag } = body;

    const Whiteboard = conn.model<IWhiteboard>('Whiteboard');

    if (deleteFlag) {
      if (!boardId) {
        return NextResponse.json({ error: 'Missing boardId' }, { status: 400 });
      }
      await Whiteboard.deleteOne({ boardId, userEmail });
      return NextResponse.json({ success: true, deleted: true });
    }

    if (!boardId) {
      return NextResponse.json({ error: 'Missing boardId' }, { status: 400 });
    }

    const update: Record<string, unknown> = {};
    if (typeof name === 'string' && name.trim()) update.name = name.trim();
    if (typeof scene === 'string') update.scene = scene;

    const doc = await Whiteboard.findOneAndUpdate(
      { boardId, userEmail },
      { $set: update },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      data: { boardId: doc.boardId, name: doc.name, scene: doc.scene, updatedAt: doc.updatedAt },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}