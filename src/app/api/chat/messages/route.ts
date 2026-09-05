import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ChatMessage } from '@/lib/models/ChatMessage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from, text } = body;

    if (!from || !text) {
      return NextResponse.json(
        { error: 'from and text required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const message = await ChatMessage.create({ from, text });

    return NextResponse.json({ ok: true, id: message._id.toString() });
  } catch (error) {
    console.error('POST /api/chat/messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');

    await connectToDatabase();

    const query: Record<string, unknown> = {};
    if (since) {
      query.createdAt = { $gt: new Date(since) };
    }

    const messages = await ChatMessage.find(query)
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m._id.toString(),
        from: m.from,
        text: m.text,
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    console.error('GET /api/chat/messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
