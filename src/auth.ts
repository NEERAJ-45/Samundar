import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import * as bcrypt from 'bcrypt-ts';
import { connectToDatabase } from '@/lib/db';
import Profile from '@/lib/models/Profile';
import LoginAttempt from '@/lib/models/LoginAttempt';
import { authConfig } from './auth.config';

const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email    = credentials?.email    as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        await connectToDatabase();

        const windowStart = new Date(Date.now() - 15 * 60 * 1000);
        const recentFails = await LoginAttempt.countDocuments({
          userEmail: email,
          success:   false,
          timestamp: { $gte: windowStart },
        });
        if (recentFails >= 5) {
          throw new Error('LOCKED');
        }

        const user = await Profile.findOne({ email });
        if (!user) {
          await LoginAttempt.create({ userEmail: email, success: false, failReason: 'user_not_found' });
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password as string);

        await LoginAttempt.create({ userEmail: email, success: isValid, timestamp: new Date() });

        if (!isValid) return null;

        return {
          id:    user._id.toString(),
          email: user.email,
          name:  user.name,
          role:  user.role,
        };
      },
    }),
  ],
});

export { handlers, auth, signIn, signOut };
export const { GET, POST } = handlers;
