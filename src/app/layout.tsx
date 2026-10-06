import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "UGC Studio Pro - Enterprise Video Engine",
  description: "Enterprise User-Generated Content Video Engine with AI Character & Product Synthesis.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50 text-slate-900 antialiased">
      <body className="min-h-full flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
        {/* Left Enterprise Sidebar */}
        <Sidebar />

        {/* Right Main Application Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
          <Header />
          <main className="flex-1 overflow-y-auto bg-slate-50/80">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
