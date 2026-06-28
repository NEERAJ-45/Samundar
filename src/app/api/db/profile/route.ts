import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Profile from '@/lib/models/Profile';
import crypto from 'crypto';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const checkOnly = searchParams.get('check') === 'true';
    const customUri = request.headers.get('x-mongodb-url') || undefined;

    const conn = await connectToDatabase(customUri);
    if (!conn) {
      return NextResponse.json({ dbConnected: false, data: null });
    }

    if (!email) {
      return NextResponse.json({ error: 'Missing email parameter' }, { status: 400 });
    }

    const doc = await Profile.findOne({ email });
    
    if (checkOnly) {
      return NextResponse.json({ dbConnected: true, exists: !!doc });
    }

    if (doc) {
      // Exclude password from response metadata
      const profileObj = doc.toObject();
      delete profileObj.password;
      return NextResponse.json({ dbConnected: true, data: profileObj });
    }

    return NextResponse.json({ dbConnected: true, data: null });
  } catch (error: any) {
    return NextResponse.json({ dbConnected: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const customUri = request.headers.get('x-mongodb-url') || undefined;
    const conn = await connectToDatabase(customUri);
    if (!conn) {
      return NextResponse.json({ dbConnected: false, error: 'Database not configured' }, { status: 400 });
    }

    const body = await request.json();
    const { email, activePillar, activeCategory, nextLearningUnit, nextLearningDuration } = body;

    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

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
      const { password, ...rest } = updated as any;
      return NextResponse.json({ success: true, dbConnected: true, data: rest });
    }

    return NextResponse.json({ success: true, dbConnected: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const customUri = request.headers.get('x-mongodb-url') || undefined;
    const conn = await connectToDatabase(customUri);
    if (!conn) {
      return NextResponse.json({ dbConnected: false, error: 'Database not configured' }, { status: 400 });
    }

    const body = await request.json();
    const { email, name, role, goals, mongodbUrl, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const existing = await Profile.findOne({ email });

    if (existing) {
      // Check password match
      if (existing.password !== hashedPassword) {
        return NextResponse.json({ error: 'Incorrect password for this email address.' }, { status: 401 });
      }

      // Update fields if provided (login + update details)
      if (name) existing.name = name;
      if (role) existing.role = role;
      if (goals) existing.goals = goals;
      if (mongodbUrl !== undefined) existing.mongodbUrl = mongodbUrl;
      await existing.save();

      const profileObj = existing.toObject();
      delete profileObj.password;
      return NextResponse.json({ success: true, dbConnected: true, data: profileObj });
    }

    // New profile registration
    if (!name) {
      return NextResponse.json({ error: 'Display Name is required to register.' }, { status: 400 });
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
