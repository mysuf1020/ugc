"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";

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
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Kembali ke Daftar Proyek</span>
      </Link>

      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 border border-slate-200 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-slate-700" />
          <span>Brief Campaign UGC</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Buat Proyek Video Baru
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Masukkan detail produk yang ingin Anda ulas. Data ini akan dipakai AI untuk merancang hook viral dan naskah scene terstruktur.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          {/* Brand Name & Title */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Nama Brand / Produk <span className="text-red-500">*</span>
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Judul Proyek / Catatan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Kampanye TikTok Shop Ramadhan"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Product Description / USP */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Deskripsi Produk, Manfaat Utama, & USP <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Jelaskan keunggulan produk secara spesifik. Misalnya: Serum pencerah wajah dengan 5% Niacinamide + Ceramide, tekstur cepat meresap tidak lengket, hasil terlihat cerah dalam 7 hari pemakaian, aman untuk kulit sensitif."
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Target Audiens (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Pekerja kantoran yang sering lembur, Mahasiswa, Ibu muda usia 25-35 tahun"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none"
            />
          </div>

          {/* Tone of Voice Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
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
                      ? "border-slate-900 bg-white ring-1 ring-slate-900 shadow-xs"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900">{item.label}</span>
                  <span className="mt-1 text-[11px] text-slate-500 leading-tight">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target Duration */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
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
                      ? "border-slate-900 bg-white ring-1 ring-slate-900 shadow-xs"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 block">{item.label}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{item.note}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/projects"
            className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-7 py-3 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
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
