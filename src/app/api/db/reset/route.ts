import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import Profile from '@/lib/models/Profile';
import LoginAttempt from '@/lib/models/LoginAttempt';
import '@/lib/models/Completion';
import '@/lib/models/Activity';
import '@/lib/models/Project';
import '@/lib/models/Revision';
import '@/lib/models/Note';
import '@/lib/models/CustomTopic';
import { getDbUri } from '../request';

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email || '';

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await connectToDatabase(getDbUri(request));
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    console.error('[API/db/reset]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
