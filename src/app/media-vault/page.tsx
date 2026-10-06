"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HardDrive,
  UserCheck,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface MediaAsset {
  id: string;
  projectId: string;
  brandName: string;
  type: "char" | "product";
  url: string;
  createdAt: string;
}

export default function MediaVaultPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVaultAssets();
  }, []);

  async function fetchVaultAssets() {
    try {
      setLoading(true);
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        const collected: MediaAsset[] = [];
        data.projects?.forEach((p: { id: string; brandName: string; avatarImageUrl?: string; productImageUrl?: string; createdAt: string }) => {
          if (p.avatarImageUrl) {
            collected.push({
              id: `${p.id}-char`,
              projectId: p.id,
              brandName: p.brandName,
              type: "char",
              url: p.avatarImageUrl,
              createdAt: p.createdAt,
            });
          }
          if (p.productImageUrl) {
            collected.push({
              id: `${p.id}-prod`,
              projectId: p.id,
              brandName: p.brandName,
              type: "product",
              url: p.productImageUrl,
              createdAt: p.createdAt,
            });
          }
        });
        setAssets(collected);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20 mb-2">
            <HardDrive className="h-3.5 w-3.5" />
            <span>Asset Storage & Reusability</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Creative Media Vault
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Perpustakaan Model Karakter dan Model Produk yang siap dipakai kembali di proyek video UGC Anda.
          </p>
        </div>

        <Link
          href="/avatar-studio"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-500 transition-all"
        >
          <Sparkles className="h-4 w-4" />
          <span>Upload Aset Baru</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 p-12 text-center">
          <HardDrive className="h-10 w-10 text-zinc-600 mb-3" />
          <h3 className="text-base font-semibold text-white">Belum Ada Aset Tersimpan</h3>
          <p className="mt-1 max-w-sm text-xs text-zinc-500">
            Aset foto model wajah dan barang yang Anda unggah di AI Video Studio otomatis tersimpan di sini.
          </p>
          <Link
            href="/avatar-studio"
            className="mt-5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
          >
            Mulai di AI Video Studio
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-2 backdrop-blur-sm transition-all hover:border-zinc-700 hover:shadow-xl"
            >
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black">
                <img
                  src={asset.url}
                  alt={asset.brandName}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md ${
                      asset.type === "char"
                        ? "bg-indigo-600/80 text-white"
                        : "bg-emerald-600/80 text-white"
                    }`}
                  >
                    {asset.type === "char" ? "Model Char" : "Model Barang"}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 px-1 pb-1">
                <span className="block text-xs font-bold text-zinc-200 truncate">
                  {asset.brandName}
                </span>
                <span className="text-[10px] text-zinc-500">
                  {new Date(asset.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
