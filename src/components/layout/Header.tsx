"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Sparkles,
  Command,
  Bell,
  Cpu,
  Layers,
  Shield,
  Plus,
} from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  function getPageTitle() {
    if (pathname.includes("/avatar-studio")) return "AI Video Studio";
    if (pathname.includes("/media-vault")) return "Creative Media Vault";
    if (pathname.includes("/voice-lab")) return "Voice & Audio Lab";
    if (pathname.includes("/render-queue")) return "Video Render Queue";
    if (pathname.includes("/settings")) return "Studio System Settings";
    if (pathname.includes("/projects/new")) return "Create New Campaign";
    if (pathname.includes("/projects")) return "Campaign Projects Hub";
    return "Workspace";
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Active Module Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500 font-medium hidden sm:inline">Workspace</span>
          <span className="text-zinc-600 hidden sm:inline">/</span>
          <span className="font-bold text-zinc-100">{getPageTitle()}</span>
        </div>
      </div>

      {/* Center: Search & Quick Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search campaigns, brands, or voice assets..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 pl-9 pr-12 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <div className="absolute right-2.5 top-2 flex items-center gap-0.5 rounded border border-zinc-800 bg-zinc-950 px-1 py-0.5 text-[10px] text-zinc-500 font-mono">
            <span>⌘K</span>
          </div>
        </div>
      </div>

      {/* Right: Telemetry & Actions */}
      <div className="flex items-center gap-3">
        {/* System Health Metric Badge */}
        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-[11px] font-medium text-zinc-300">
          <Cpu className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-zinc-400">Render Pipeline:</span>
          <span className="text-emerald-400 font-bold">READY</span>
        </div>

        {/* Quick Action Button */}
        <Link
          href="/avatar-studio"
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:from-indigo-500 hover:to-emerald-400 transition-all active:scale-[0.98]"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New AI Video</span>
        </Link>

        {/* User / Workspace Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs">
            M
          </div>
        </div>
      </div>
    </header>
  );
}
