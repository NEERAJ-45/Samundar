import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { ProfileProvider } from '@/components/providers/ProfileProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { Toaster } from '@/components/ui/toast';
import { Caveat, Kalam, Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat', display: 'swap' });
const kalam = Kalam({ subsets: ['latin'], weight: ['300', '400', '700'], variable: '--font-kalam', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-ibm-plex-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'ProdigyOS — Engineering Operating System',
  description: 'Personal Engineering Mastery Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${caveat.variable} ${kalam.variable} ${fraunces.variable} ${inter.variable} ${ibmPlexMono.variable}`}>
      <body className="antialiased">
        <SessionProvider>
          <QueryProvider>
            <ProfileProvider>
              {children}
              <Toaster />
            </ProfileProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
