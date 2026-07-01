import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Profile from '@/lib/models/Profile';
import LoginAttempt from '@/lib/models/LoginAttempt';
import '@/lib/models/Completion';
import '@/lib/models/Activity';
import '@/lib/models/Project';
import '@/lib/models/Revision';
import '@/lib/models/Note';
import '@/lib/models/CustomTopic';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail') || request.headers.get('x-user-email') || '';

    if (!userEmail) {
      return NextResponse.json({ error: 'userEmail required' }, { status: 400 });
    }

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({ dbConnected: false }, { status: 503 });
    }

    const Completion = conn.model('Completion');
    const Activity = conn.model('Activity');
    const Project = conn.model('Project');
    const Revision = conn.model('Revision');
    const Note = conn.model('Note');
    const CustomTopic = conn.model('CustomTopic');

    await Promise.all([
      Completion.deleteMany({ userEmail }),
      Activity.deleteMany({ userEmail }),
      Project.deleteMany({ userEmail }),
      Revision.deleteMany({ userEmail }),
      Note.deleteMany({ userEmail }),
      CustomTopic.deleteMany({ userEmail }),
      LoginAttempt.deleteMany({ userEmail }),
      Profile.updateOne(
        { email: userEmail },
        {
          $set: {
            activePillar: 'Data Structures & Algorithms',
            activeCategory: 'Trees',
            nextLearningUnit: 'AVL Tree Rotations',
            nextLearningDuration: '45 min',
          },
        }
      ),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API/db/reset]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
