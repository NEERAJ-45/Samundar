import { NextResponse } from 'next/server';
import * as bcrypt from 'bcrypt-ts';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import Profile from '@/lib/models/Profile';
import { getDbUri } from '../request';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const checkOnly = searchParams.get('check') === 'true';

    const conn = await connectToDatabase(getDbUri(request));
    if (!conn) {
      return NextResponse.json({ dbConnected: false, data: null });
    }

    const doc = await Profile.findOne({ email });

    if (checkOnly) {
      return NextResponse.json({ dbConnected: true, exists: !!doc });
    }

    if (doc) {
      const profileObj = doc.toObject();
      delete profileObj.password;
      return NextResponse.json({ dbConnected: true, data: profileObj });
    }

    return NextResponse.json({ dbConnected: true, data: null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ dbConnected: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await connectToDatabase(getDbUri(request));
    if (!conn) {
      return NextResponse.json({ dbConnected: false, error: 'Database not configured' }, { status: 400 });
    }

    const body = await request.json();
    const { activePillar, activeCategory, nextLearningUnit, nextLearningDuration } = body;

    const profile = await Profile.findOne({ email });
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const updates: Record<string, string> = {};
    if (activePillar !== undefined) updates.activePillar = activePillar;
    if (activeCategory !== undefined) updates.activeCategory = activeCategory;
    if (nextLearningUnit !== undefined) updates.nextLearningUnit = nextLearningUnit;
    if (nextLearningDuration !== undefined) updates.nextLearningDuration = nextLearningDuration;

    await Profile.updateOne({ email }, { $set: updates });

    const updated = await Profile.findOne({ email }).lean();
    if (updated) {
      const rest = updated as Record<string, unknown>;
      return NextResponse.json({ success: true, dbConnected: true, data: rest });
    }

    return NextResponse.json({ success: true, dbConnected: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await connectToDatabase(getDbUri(request));
    if (!conn) {
      return NextResponse.json({ dbConnected: false, error: 'Database not configured' }, { status: 400 });
    }

    const body = await request.json();
    const { name, role, goals, mongodbUrl, password } = body;

    if (!password || !name) {
      return NextResponse.json({ error: 'Missing password or name' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const existing = await Profile.findOne({ email });

    if (existing) {
      if (name) existing.name = name;
      if (role) existing.role = role;
      if (goals) existing.goals = goals;
      if (mongodbUrl !== undefined) existing.mongodbUrl = mongodbUrl;
      existing.password = hashedPassword;
      await existing.save();

      const profileObj = existing.toObject();
      delete profileObj.password;
      return NextResponse.json({ success: true, dbConnected: true, data: profileObj });
    }

    const doc = await Profile.create({
      email,
      name,
      role: role || 'Software Engineer',
      password: hashedPassword,
      goals: goals || [],
      mongodbUrl: mongodbUrl || '',
    });

    const profileObj = doc.toObject();
    delete profileObj.password;
    return NextResponse.json({ success: true, dbConnected: true, data: profileObj });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
