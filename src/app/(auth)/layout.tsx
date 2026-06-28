import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ProdigyOS — Sign In',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#07070a] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      {children}
    </div>
  );
}
