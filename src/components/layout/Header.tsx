"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Sparkles,
  Cpu,
} from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  function getPageTitle() {
    if (pathname.includes("/avatar-studio")) return "AI Video Studio";
    if (pathname.includes("/media-vault")) return "Creative Media Vault";
    if (pathname.includes("/voice-lab")) return "Voice & Audio Lab";
    if (pathname.includes("/render-queue")) return "Video Render Queue";
    if (pathname.includes("/settings")) return "Studio Settings";
    if (pathname.includes("/projects/new")) return "Create Campaign";
    if (pathname.includes("/projects")) return "Campaign Projects";
    return "Workspace";
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      {/* Left: Active Module Breadcrumb */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium hidden sm:inline">Workspace</span>
        <span className="text-slate-300 hidden sm:inline">/</span>
        <span className="font-bold text-slate-900 text-sm">{getPageTitle()}</span>
      </div>

      {/* Center: Search & Quick Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns, brands, or voice assets..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-12 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition-colors"
          />
          <div className="absolute right-2.5 top-2 flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1 py-0.5 text-[10px] text-slate-400 font-mono">
            <span>⌘K</span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Status Badge */}
        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-700">
          <Cpu className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-slate-500">Pipeline:</span>
          <span className="text-emerald-600 font-bold">READY</span>
        </div>

        {/* Quick Action Button */}
        <Link
          href="/avatar-studio"
          className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-all active:scale-[0.98]"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Buat Video Baru</span>
        </Link>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs">
            M
          </div>
        </div>
      </div>
    </header>
  );
}
