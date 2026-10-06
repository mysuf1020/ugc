"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Video, FileText, Camera, Sliders, Trash2, Clock, Sparkles, AlertCircle, Loader2 } from "lucide-react";

interface ProjectItem {
  id: string;
  title: string;
  brandName: string;
  productDescription: string;
  status: string;
  tone: string;
  targetDurationSec: number;
  createdAt: string;
  _count: {
    scenes: number;
    scripts: number;
  };
  scenes: {
    id: string;
    activeTakeId: string | null;
  }[];
  exports: {
    id: string;
    outputPath: string | null;
  }[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      setLoading(true);
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Hapus proyek "${title}" beserta semua video rekaman dan naskahnya?`)) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "RENDERED":
        return (
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            Rendered
          </span>
        );
      case "RECORDED":
        return (
          <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
            Recorded
          </span>
        );
      case "SCRIPTED":
        return (
          <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
            Scripted
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-zinc-500/10 px-2.5 py-0.5 text-xs font-semibold text-zinc-400 border border-zinc-500/20">
            Draft
          </span>
        );
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Banner / Hero Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">UGC Creator Studio</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Pusat produksi konten UGC: Naskah AI, perekaman teleprompter, dan editor kanvas vertikal 9:16.
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-indigo-400 transition-all active:scale-[0.98]"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Buat Video UGC Baru</span>
        </Link>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
            <Video className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold text-white">Belum Ada Proyek UGC</h3>
          <p className="mt-1.5 max-w-sm text-sm text-zinc-400">
            Mulai buat video pertama Anda! Masukkan brief produk, biarkan AI merumuskan hook viral, lalu rekam via teleprompter.
          </p>
          <Link
            href="/projects/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-500 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Mulai Sekarang</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const recordedCount = project.scenes.filter((s) => s.activeTakeId).length;
            const totalScenes = project._count.scenes || 4;

            return (
              <div
                key={project.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80 hover:shadow-xl hover:shadow-black/40"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-300 uppercase tracking-wider">
                      {project.brandName}
                    </span>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(project.status)}
                      <button
                        onClick={() => handleDelete(project.id, project.title)}
                        disabled={deletingId === project.id}
                        className="rounded-lg p-1 text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        title="Hapus Proyek"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {project.productDescription}
                  </p>

                  {/* Metadata Row */}
                  <div className="mt-4 flex items-center gap-3 text-xs text-zinc-400 border-t border-zinc-800/60 pt-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-zinc-500" />
                      <span>{project.targetDurationSec}s</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Camera className="h-3.5 w-3.5 text-zinc-500" />
                      <span>
                        {recordedCount}/{totalScenes} Takes
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="capitalize">{project.tone}</span>
                    </div>
                  </div>
                </div>

                {/* Workflow Navigation Links */}
                <div className="mt-5 grid grid-cols-3 gap-1.5 border-t border-zinc-800/80 pt-4">
                  <Link
                    href={`/projects/${project.id}/script`}
                    className="flex flex-col items-center justify-center rounded-xl bg-zinc-950/60 py-2.5 px-2 text-center text-xs font-medium text-zinc-300 hover:bg-indigo-600/10 hover:text-indigo-400 hover:border-indigo-500/30 border border-zinc-800 transition-all"
                  >
                    <FileText className="h-4 w-4 mb-1 text-zinc-400" />
                    <span>Naskah</span>
                  </Link>

                  <Link
                    href={`/projects/${project.id}/record`}
                    className="flex flex-col items-center justify-center rounded-xl bg-zinc-950/60 py-2.5 px-2 text-center text-xs font-medium text-zinc-300 hover:bg-indigo-600/10 hover:text-indigo-400 hover:border-indigo-500/30 border border-zinc-800 transition-all"
                  >
                    <Camera className="h-4 w-4 mb-1 text-zinc-400" />
                    <span>Rekam</span>
                  </Link>

                  <Link
                    href={`/projects/${project.id}/editor`}
                    className="flex flex-col items-center justify-center rounded-xl bg-zinc-950/60 py-2.5 px-2 text-center text-xs font-medium text-zinc-300 hover:bg-indigo-600/10 hover:text-indigo-400 hover:border-indigo-500/30 border border-zinc-800 transition-all"
                  >
                    <Sliders className="h-4 w-4 mb-1 text-zinc-400" />
                    <span>Editor 9:16</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
