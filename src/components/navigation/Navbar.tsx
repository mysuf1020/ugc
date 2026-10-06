import Link from "next/link";
import { Video, PlusCircle, Settings, Film, Sparkles } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/projects" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-zinc-950">
              <Film className="h-5 w-5 text-indigo-400 group-hover:text-emerald-400 transition-colors" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">UGC Studio</span>
              <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-zinc-400 font-medium -mt-0.5">Creator Video Engine</span>
          </div>
        </Link>

        {/* Center / Nav Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/projects"
            className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            <Video className="h-4 w-4 text-zinc-400" />
            <span>Projects</span>
          </Link>

          <Link
            href="/settings"
            className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            <Settings className="h-4 w-4 text-zinc-400" />
            <span>Settings</span>
          </Link>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/projects/new"
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-600/25 hover:from-indigo-500 hover:to-indigo-400 transition-all active:scale-[0.98]"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">New Video</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
