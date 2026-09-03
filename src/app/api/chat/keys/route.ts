import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import { ChatKey } from '@/lib/models/ChatKey';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, publicKey } = body;

    if (!userId || !publicKey) {
      return NextResponse.json({ error: 'userId and publicKey required' }, { status: 400 });
    }

    if (typeof publicKey !== 'string' || publicKey.length < 40) {
      return NextResponse.json({ error: 'Invalid publicKey format' }, { status: 400 });
    }

    await connectToDatabase();

    await ChatKey.findOneAndUpdate(
      { userId },
      { publicKey, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/chat/keys error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    await connectToDatabase();

    const key = await ChatKey.findOne({ userId }).lean();
    if (!key) {
      return NextResponse.json({ error: 'Key not found' }, { status: 404 });
    }

    return NextResponse.json({
      userId: key.userId,
      publicKey: key.publicKey,
      updatedAt: key.updatedAt,
    });
  } catch (error) {
    console.error('GET /api/chat/keys error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
