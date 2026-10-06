"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Film,
  Video,
  FolderKanban,
  Sparkles,
  Volume2,
  HardDrive,
  Cpu,
  Settings,
  Camera,
  ChevronDown,
  Layers,
  ShieldCheck,
  Activity,
  Plus,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navigationSections = [
    {
      title: "STUDIO WORKSPACE",
      items: [
        {
          name: "AI Video Creator",
          href: "/avatar-studio",
          icon: Sparkles,
          badge: "NEW",
        },
        {
          name: "Campaign Projects",
          href: "/projects",
          icon: FolderKanban,
        },
        {
          name: "Teleprompter & Cam",
          href: "/projects/new",
          icon: Camera,
        },
      ],
    },
    {
      title: "CREATIVE ASSETS",
      items: [
        {
          name: "Media Vault",
          href: "/media-vault",
          icon: HardDrive,
        },
        {
          name: "Voice & Audio Lab",
          href: "/voice-lab",
          icon: Volume2,
        },
      ],
    },
    {
      title: "SYSTEM & ENGINE",
      items: [
        {
          name: "Render Queue",
          href: "/render-queue",
          icon: Cpu,
        },
        {
          name: "Studio Settings",
          href: "/settings",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <aside className="hidden lg:flex w-72 flex-col shrink-0 border-r border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl">
      {/* Workspace Brand Switcher */}
      <div className="p-4 border-b border-zinc-800/80">
        <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 hover:border-zinc-700 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-md shadow-indigo-600/20">
              <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-zinc-950">
                <Film className="h-4 w-4 text-indigo-400 group-hover:text-emerald-400 transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white tracking-tight">
                Mocha Studio Pro
              </span>
              <span className="text-[10px] text-zinc-400 font-medium">
                Enterprise Workspace
              </span>
            </div>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navigationSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              {section.title}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all group ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                      : "text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`h-4 w-4 transition-colors ${
                        isActive
                          ? "text-white"
                          : "text-zinc-500 group-hover:text-zinc-300"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Engine Status / System Footer */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/60">
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-bold text-zinc-300">
                FFmpeg Node Engine
              </span>
            </div>
            <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
              HEALTHY
            </span>
          </div>

          <div className="flex justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-800/60">
            <span>Runtime: Node.js 24</span>
            <span>VPS Ready: YES</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
