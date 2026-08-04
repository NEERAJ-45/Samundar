import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function requireDbUserEmail() {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
        return { errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }

    return { userEmail: email };
}

export function getDbUri(request: Request): string | undefined {
    return request.headers.get('x-mongodb-url') || undefined;
}