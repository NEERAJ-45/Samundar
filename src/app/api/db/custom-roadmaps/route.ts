import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import type { ICustomRoadmap } from '@/lib/models/CustomRoadmap';
import '@/lib/models/CustomRoadmap';
import { getDbUri } from '../request';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email || '';
    if (!userEmail) {
      return NextResponse.json({ dbConnected: false, data: [] });
    }

    const conn = await connectToDatabase(getDbUri(request));
    if (!conn) {
      return NextResponse.json({ dbConnected: false, data: [] });
    }
    const CustomRoadmap = conn.model<ICustomRoadmap>('CustomRoadmap');
    const list = await CustomRoadmap.find({ userEmail });
    return NextResponse.json({ dbConnected: true, data: list });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ dbConnected: false, error: message }, { status: 500 });
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
      return NextResponse.json({ dbConnected: false, error: 'Database not configured' }, { status: 400 });
    }
    const body = await request.json();
    const { title, description, questions, color, hours, difficulty } = body;

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'Missing required parameters: title and questions array' }, { status: 400 });
    }

    const slug = slugify(`${title}-${userEmail}`);
    const storageKey = `custom-roadmap-${slug}-completed`;

    const questionsWithIds = questions.map((q: { title: string; difficulty: string; link?: string }, i: number) => ({
      id: i + 1,
      title: q.title,
      difficulty: q.difficulty || 'MEDIUM',
      link: q.link || '',
    }));

    const CustomRoadmap = conn.model<ICustomRoadmap>('CustomRoadmap');

    const existing = await CustomRoadmap.findOne({ slug, userEmail });
    if (existing) {
      return NextResponse.json({ error: 'A roadmap with this title already exists' }, { status: 409 });
    }

    const doc = await CustomRoadmap.create({
      slug,
      title,
      description: description || '',
      storageKey,
      questions: questionsWithIds,
      color: color || '#8b5cf6',
      hours: hours || 0,
      difficulty: difficulty || 'Medium',
      userEmail,
    });

    return NextResponse.json({ success: true, data: doc });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email || '';
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await connectToDatabase(getDbUri(request));
    if (!conn) {
      return NextResponse.json({ dbConnected: false, error: 'Database not configured' }, { status: 400 });
    }
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    const CustomRoadmap = conn.model<ICustomRoadmap>('CustomRoadmap');
    await CustomRoadmap.deleteOne({ slug, userEmail });
    return NextResponse.json({ success: true, deleted: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
