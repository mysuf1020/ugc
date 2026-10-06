import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navigation/Navbar";

export const metadata: Metadata = {
  title: "UGC Studio - Personal AI Video Creator",
  description: "Create viral UGC videos with AI scripts, teleprompter recording, and 9:16 video editor.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full bg-[#09090b] text-zinc-100 antialiased">
      <body className="min-h-full flex flex-col bg-[#09090b] text-zinc-100">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
