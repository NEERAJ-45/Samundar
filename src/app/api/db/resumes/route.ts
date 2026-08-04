import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import type { IResume } from '@/lib/models/Resume';
import '@/lib/models/Resume';
import { getDbUri } from '../request';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
}

function base64ToBuffer(base64: string): Buffer {
  const raw = base64.replace(/^data:application\/pdf;base64,/, '').replace(/^data:.*;base64,/, '');
  return Buffer.from(raw, 'base64');
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ dbConnected: false, error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await connectToDatabase(getDbUri(request));
    if (!conn) {
      return NextResponse.json({ dbConnected: false, data: [] });
    }
    const Resume = conn.model<IResume>('Resume');
    const list = await Resume.find({ userEmail }).select('-pdfData').sort({ updatedAt: -1 });
    return NextResponse.json({ dbConnected: true, data: list });
  } catch (error: unknown) {
    return NextResponse.json({ dbConnected: false, error: getErrorMessage(error) }, { status: 500 });
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
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!body.latexSource || typeof body.latexSource !== 'string') {
      return NextResponse.json({ error: 'Missing LaTeX source' }, { status: 400 });
    }

    const Resume = conn.model<IResume>('Resume');

    const updateFields: Record<string, unknown> = {
      latexSource: body.latexSource,
      title: body.title || 'Untitled Resume',
      company: body.company || '',
    };

    if (body.pdfData && typeof body.pdfData === 'string') {
      try {
        updateFields.pdfData = base64ToBuffer(body.pdfData);
      } catch {
        return NextResponse.json({ error: 'Invalid PDF data format' }, { status: 400 });
      }
    }

    if (body.id) {
      if (typeof body.id !== 'string') {
        return NextResponse.json({ error: 'Invalid resume ID' }, { status: 400 });
      }
      const doc = await Resume.findOneAndUpdate(
        { _id: body.id, userEmail },
        { $set: updateFields },
        { new: true, runValidators: true },
      ).select('-pdfData');
      if (!doc) {
        return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: doc });
    }

    const doc = await Resume.create({
      userEmail,
      title: body.title || 'Untitled Resume',
      company: body.company || '',
      latexSource: body.latexSource,
      pdfData: updateFields.pdfData || undefined,
    });

    const docData = doc.toObject();
    return NextResponse.json({ success: true, data: docData }, { status: 201 });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    if (message.includes('E11000')) {
      return NextResponse.json({ error: 'A resume with this identifier already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing resume ID' }, { status: 400 });
    }

    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await connectToDatabase(getDbUri(request));
    if (!conn) {
      return NextResponse.json({ dbConnected: false, error: 'Database not configured' }, { status: 400 });
    }

    const Resume = conn.model<IResume>('Resume');
    const result = await Resume.deleteOne({ _id: id, userEmail });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
