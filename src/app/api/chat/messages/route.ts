import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import { ChatMessage } from '@/lib/models/ChatMessage';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { from, to, nonce, ciphertext } = body;

    if (!from || !to || !nonce || !ciphertext) {
      return NextResponse.json(
        { error: 'from, to, nonce, and ciphertext required' },
        { status: 400 }
      );
    }

    if (typeof ciphertext !== 'string' || ciphertext.length < 20) {
      return NextResponse.json({ error: 'Invalid ciphertext' }, { status: 400 });
    }

    await connectToDatabase();

    const message = await ChatMessage.create({ from, to, nonce, ciphertext });

    return NextResponse.json({ ok: true, id: message._id.toString() });
  } catch (error) {
    console.error('POST /api/chat/messages error:', error);
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
    const since = searchParams.get('since');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    await connectToDatabase();

    const query: Record<string, unknown> = { to: userId };
    if (since) {
      query.createdAt = { $gt: new Date(since) };
    }

    const messages = await ChatMessage.find(query)
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m._id.toString(),
        from: m.from,
        to: m.to,
        nonce: m.nonce,
        ciphertext: m.ciphertext,
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    console.error('GET /api/chat/messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
