import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import Article from '@/lib/models/Article';
import { logActivity } from '@/lib/activity-logger';
import { getDbUri } from '../request';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email || '';
    if (!userEmail) {
      return NextResponse.json({ articles: [] });
    }

    const conn = await connectToDatabase(getDbUri(request));
    if (!conn) {
      return NextResponse.json({ articles: [] });
    }

    const articles = await Article.find({ userEmail }).sort({ updatedAt: -1 }).lean();
    return NextResponse.json({ articles });
  } catch {
    return NextResponse.json({ articles: [] });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email || '';
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await connectToDatabase(getDbUri(request));
    if (!conn) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const body = await request.json();

    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'title required' }, { status: 400 });
    }

    const articleId = body.id || `art-${Date.now()}`;

    const article = await Article.findOneAndUpdate(
      { id: articleId, userEmail },
      {
        id: articleId,
        title: body.title.trim(),
        content: body.content || '',
        codeFiles: body.codeFiles || [],
        assets: body.assets || [],
        userEmail,
      },
      { upsert: true, new: true }
    );

    logActivity(userEmail, `${body.id ? 'Updated' : 'Created'} article "${body.title}"`);

    return NextResponse.json({ article }, { status: body.id ? 200 : 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const session = await auth();
    const userEmail = session?.user?.email || '';

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await connectToDatabase(getDbUri(request));
    if (!conn) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const existing = await Article.findOne({ id, userEmail });
    if (existing) {
      logActivity(userEmail, `Deleted article "${existing.title}"`);
    }

    await Article.deleteOne({ id, userEmail });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
