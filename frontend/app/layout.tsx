import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { AISidebar } from "@/components/layout/AISidebar";
import { BottomNav } from "@/components/layout/BottomNav";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Personal Dashboard",
    template: "%s · Personal Dashboard",
  },
  description: "Project management, tasks, and daily briefings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-4 pb-20 sm:p-6 md:pb-6">
                {children}
              </main>
            </div>
          </div>
          <BottomNav />
          <AISidebar />
        </Providers>
      </body>
    </html>
  );
}
