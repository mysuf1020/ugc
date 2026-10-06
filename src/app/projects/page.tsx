"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Video, FileText, Camera, Sliders, Trash2, Clock, Sparkles, Loader2 } from "lucide-react";

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
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
            Rendered
          </span>
        );
      case "RECORDED":
        return (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-300">
            Recorded
          </span>
        );
      case "SCRIPTED":
        return (
          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
            Scripted
          </span>
        );
      default:
        return (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Campaign Projects</h1>
          <p className="mt-1 text-sm text-slate-600">
            Pusat manajemen kampanye video UGC: naskah, aset rekaman, dan riwayat render.
          </p>
        </div>
        <Link
          href="/avatar-studio"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-all active:scale-[0.98]"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Buat Video UGC Baru</span>
        </Link>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 mb-3">
            <Video className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Belum Ada Proyek UGC</h3>
          <p className="mt-1.5 max-w-sm text-xs text-slate-500">
            Mulai buat video pertama Anda dengan mengunggah Model Karakter dan Model Produk di AI Video Studio.
          </p>
          <Link
            href="/avatar-studio"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
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
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase tracking-wider border border-slate-200">
                      {project.brandName}
                    </span>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(project.status)}
                      <button
                        onClick={() => handleDelete(project.id, project.title)}
                        disabled={deletingId === project.id}
                        className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Hapus Proyek"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {project.productDescription}
                  </p>

                  {/* Metadata Row */}
                  <div className="mt-4 flex items-center gap-3 text-xs text-slate-500 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{project.targetDurationSec}s</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Camera className="h-3.5 w-3.5 text-slate-400" />
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
                <div className="mt-5 grid grid-cols-3 gap-1.5 border-t border-slate-100 pt-3">
                  <Link
                    href={`/projects/${project.id}/script`}
                    className="flex flex-col items-center justify-center rounded-xl bg-slate-50 py-2 px-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all"
                  >
                    <FileText className="h-4 w-4 mb-0.5 text-slate-500" />
                    <span>Naskah</span>
                  </Link>

                  <Link
                    href={`/projects/${project.id}/record`}
                    className="flex flex-col items-center justify-center rounded-xl bg-slate-50 py-2 px-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all"
                  >
                    <Camera className="h-4 w-4 mb-0.5 text-slate-500" />
                    <span>Rekam</span>
                  </Link>

                  <Link
                    href={`/projects/${project.id}/editor`}
                    className="flex flex-col items-center justify-center rounded-xl bg-slate-50 py-2 px-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all"
                  >
                    <Sliders className="h-4 w-4 mb-0.5 text-slate-500" />
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
