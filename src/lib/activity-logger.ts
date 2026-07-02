import Activity from '@/lib/models/Activity';

export async function logActivity(userEmail: string, text: string) {
  if (!userEmail) return;
  try {
    await Activity.create({ text, userEmail, createdAt: new Date() });
  } catch (error) {
    console.error('[ActivityLogger] Failed to log activity:', error);
  }
}
