import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "UGC Studio Pro - Enterprise AI Video Creator",
  description: "Enterprise User-Generated Content Video Engine with AI Character & Product Synthesis.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full bg-[#09090b] text-zinc-100 antialiased">
      <body className="min-h-full flex h-screen bg-[#09090b] text-zinc-100 overflow-hidden">
        {/* Left Enterprise Sidebar */}
        <Sidebar />

        {/* Right Main Application Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-[#0a0a0d]/60">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
