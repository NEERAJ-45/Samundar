import type { Metadata } from "next";
import { ProfileProvider } from "@/components/providers/ProfileProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProdigyOS — Engineering Operating System",
  description: "Personal Engineering Mastery Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ProfileProvider>
          {children}
        </ProfileProvider>
      </body>
    </html>
  );
}
