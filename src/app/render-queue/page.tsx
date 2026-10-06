"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Cpu,
  CheckCircle2,
  AlertCircle,
  Download,
  Film,
  Clock,
  HardDrive,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface ExportJob {
  id: string;
  projectId: string;
  resolution: string;
  outputPath: string | null;
  fileSize: number | null;
  status: string;
  progress: number;
  startedAt: string;
  project: {
    title: string;
    brandName: string;
  };
}

export default function RenderQueuePage() {
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      setLoading(true);
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        const collected: ExportJob[] = [];
        data.projects?.forEach((p: { id: string; title: string; brandName: string; exports: ExportJob[] }) => {
          p.exports?.forEach((exp) => {
            collected.push({
              ...exp,
              project: { title: p.title, brandName: p.brandName },
            });
          });
        });
        setJobs(collected);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20 mb-2">
            <Cpu className="h-3.5 w-3.5" />
            <span>FFmpeg Production Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Video Render Queue
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Monitoring antrean proses stitching, encoding H.264, dan ekspor video 1080x1920.
          </p>
        </div>

        <button
          onClick={fetchJobs}
          className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 p-12 text-center">
          <Film className="h-10 w-10 text-zinc-600 mb-3" />
          <h3 className="text-base font-semibold text-white">Tidak Ada Antrean Aktif</h3>
          <p className="mt-1 max-w-sm text-xs text-zinc-500">
            Semua proses rendering selesai. Video baru yang Anda generate akan tercatat di sini.
          </p>
          <Link
            href="/avatar-studio"
            className="mt-5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
          >
            Buka AI Video Studio
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-zinc-800 bg-zinc-950/70 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-5 py-3.5">Campaign & Brand</th>
                <th className="px-5 py-3.5">Resolusi</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Ukuran File</th>
                <th className="px-5 py-3.5">Tanggal</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-white">{job.project?.title}</div>
                    <div className="text-[10px] text-zinc-500">{job.project?.brandName}</div>
                  </td>
                  <td className="px-5 py-4 font-mono text-zinc-400">{job.resolution}</td>
                  <td className="px-5 py-4">
                    {job.status === "COMPLETED" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Completed</span>
                      </span>
                    ) : job.status === "PROCESSING" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Rendering {job.progress}%</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-red-400 border border-red-500/20">
                        <AlertCircle className="h-3 w-3" />
                        <span>Failed</span>
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-zinc-400">
                    {job.fileSize ? `${(job.fileSize / 1024 / 1024).toFixed(1)} MB` : "-"}
                  </td>
                  <td className="px-5 py-4 text-zinc-500 text-[11px]">
                    {new Date(job.startedAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {job.outputPath && job.status === "COMPLETED" ? (
                      <a
                        href={job.outputPath}
                        download="video_render.mp4"
                        className="inline-flex items-center gap-1 rounded-lg bg-zinc-800 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-500 transition-colors"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </a>
                    ) : (
                      <span className="text-zinc-600">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
