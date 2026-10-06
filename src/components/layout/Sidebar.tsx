"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Film,
  FolderKanban,
  Sparkles,
  Volume2,
  HardDrive,
  Cpu,
  Settings,
  Camera,
  ChevronDown,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navigationSections = [
    {
      title: "WORKSPACE",
      items: [
        {
          name: "Video Generator",
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
          name: "Teleprompter Studio",
          href: "/projects/new",
          icon: Camera,
        },
      ],
    },
    {
      title: "ASSETS & MEDIA",
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
      title: "SYSTEM & OPERATIONS",
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
    <aside className="hidden lg:flex w-64 flex-col shrink-0 border-r border-slate-200 bg-white">
      {/* Workspace Brand Switcher */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5 hover:border-slate-300 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
              <Film className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900 tracking-tight">
                UGC Studio Pro
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Creator Workspace
              </span>
            </div>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navigationSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {section.title}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`h-4 w-4 transition-colors ${
                        isActive ? "text-white" : "text-slate-400"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
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
      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-bold text-slate-700">
                Render Engine
              </span>
            </div>
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">
              ONLINE
            </span>
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
            <span>FFmpeg: Active</span>
            <span>Self-Hosted</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
