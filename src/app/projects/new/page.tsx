"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2, Target, MessageSquare, Clock, Zap } from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [brandName, setBrandName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [tone, setTone] = useState("casual");
  const [targetDurationSec, setTargetDurationSec] = useState(30);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !brandName.trim() || !productDescription.trim()) {
      setError("Judul proyek, nama brand, dan deskripsi produk wajib diisi.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          brandName,
          productDescription,
          targetAudience,
          tone,
          targetDurationSec,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Redirect directly to the Script Generator Studio for this project!
        router.push(`/projects/${data.project.id}/script`);
      } else {
        const errData = await res.json();
        setError(errData.error || "Gagal membuat proyek.");
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Kembali ke Daftar Proyek</span>
      </Link>

      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20 mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Langkah 1: Brief Produk</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Buat Proyek Video UGC Baru
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Masukkan detail produk yang ingin Anda ulas. Data ini akan dipakai AI untuk merancang hook viral dan naskah scene terstruktur.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm space-y-5">
          {/* Brand Name & Title */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Nama Brand / Produk <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: BrightBoost Serum, Ergodesk Pro"
                value={brandName}
                onChange={(e) => {
                  setBrandName(e.target.value);
                  if (!title) {
                    setTitle(`Video UGC - ${e.target.value}`);
                  }
                }}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Judul Proyek / Catatan <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Kampanye TikTok Shop Ramadhan"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Product Description / USP */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Deskripsi Produk, Manfaat Utama, & USP <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Jelaskan keunggulan produk secara spesifik. Misalnya: Serum pencerah wajah dengan 5% Niacinamide + Ceramide, tekstur cepat meresap tidak lengket, hasil terlihat cerah dalam 7 hari pemakaian, aman untuk kulit sensitif."
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Target Audiens (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Pekerja kantoran yang sering lembur, Mahasiswa, Ibu muda usia 25-35 tahun"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Tone of Voice Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Tone of Voice (Gaya Bahasa Kreator)
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { id: "casual", label: "Casual & Friendly", desc: "Santai seperti ngobrol ke teman" },
                { id: "energetic", label: "Energetic / Hype", desc: "Semangat tinggi & bikin penasaran" },
                { id: "emotional", label: "Storytelling", desc: "Curhat masalah pribadi to solution" },
                { id: "hard-sell", label: "Direct & Urgent", desc: "Fokus promo & diskon cepat" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTone(item.id)}
                  className={`flex flex-col rounded-xl border p-3 text-left transition-all ${
                    tone === item.id
                      ? "border-indigo-500 bg-indigo-500/15 text-white shadow-sm shadow-indigo-500/10"
                      : "border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
                  }`}
                >
                  <span className="text-xs font-bold text-zinc-200">{item.label}</span>
                  <span className="mt-1 text-[11px] text-zinc-500 leading-tight">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target Duration */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Target Durasi Video
            </label>
            <div className="flex gap-3">
              {[
                { sec: 15, label: "15 Detik", note: "Format Ringkas (Ultra Fast Pace)" },
                { sec: 30, label: "30 Detik", note: "Standar Ideal UGC TikTok/Reels" },
                { sec: 60, label: "60 Detik", note: "In-Depth Review / Unboxing" },
              ].map((item) => (
                <button
                  key={item.sec}
                  type="button"
                  onClick={() => setTargetDurationSec(item.sec)}
                  className={`flex-1 rounded-xl border p-3 text-center transition-all ${
                    targetDurationSec === item.sec
                      ? "border-emerald-500 bg-emerald-500/15 text-white"
                      : "border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <span className="text-xs font-bold block">{item.label}</span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">{item.note}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/projects"
            className="rounded-xl border border-zinc-800 px-5 py-3 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-7 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-indigo-400 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>Lanjut ke Script Generator</span>
          </button>
        </div>
      </form>
    </div>
  );
}
