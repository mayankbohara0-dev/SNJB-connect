import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AuthCheck from "@/components/AuthCheck";

import { createServerClient } from '@/lib/supabase-server';
import { isAdminEmail } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "SNJB Connect - Anonymous Campus Social",
  description: "Connect, share, and confess anonymously with your campus community.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  let userRole = undefined;

  if (user) {
    // We need to fetch profile safely.
    // Since layout runs on server, we can check database directly.
    const { data: profile } = await (supabase.from('profiles') as any).select('role').eq('id', user.id).single();
    const profileData = profile as any;
    userRole = profileData?.role;

    if (isAdminEmail(user.email)) {
      isAdmin = true;
      // If user is admin by email but not by role, we treat them as admin in UI.
      // The page logic will handle the DB update/enforcement.
    } else if (userRole === 'admin') {
      isAdmin = true;
    }
  }

  return (
    <html lang="en">
      <body className={`${inter.variable} ${jakarta.variable} antialiased bg-background text-foreground font-sans`}>
        <div className="min-h-screen">
          {children}
        </div>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
