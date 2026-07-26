'use client';

import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';

const MobileNav = dynamic(() => import('@/components/layout/mobile-nav').then(m => m.MobileNav));
const QuoteToast = dynamic(() => import('@/components/ui/quote-toast').then(m => m.QuoteToast));
const PageTransition = dynamic(() => import('@/components/shared/PageTransition').then(m => m.PageTransition));

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar global />
        <main className="flex-1 overflow-y-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <MobileNav />
      <QuoteToast />
    </div>
  );
}
