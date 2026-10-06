"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Camera,
  CheckCircle2,
  RefreshCw,
  Clock,
  Layers,
  Save,
  Loader2,
  SlidersHorizontal,
  ChevronRight,
  Flame,
} from "lucide-react";

interface ScriptPageProps {
  params: Promise<{ id: string }>;
}

export default function ScriptStudioPage({ params }: ScriptPageProps) {
  const { id: projectId } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [brandName, setBrandName] = useState("");

  const [hooks, setHooks] = useState<string[]>([]);
  const [selectedHookIndex, setSelectedHookIndex] = useState(0);

  const [hookText, setHookText] = useState("");
  const [problemText, setProblemText] = useState("");
  const [solutionText, setSolutionText] = useState("");
  const [demoText, setDemoText] = useState("");
  const [ctaText, setCtaText] = useState("");

  useEffect(() => {
    fetchProjectAndScript();
  }, [projectId]);

  async function fetchProjectAndScript() {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        const p = data.project;
        setProjectTitle(p.title);
        setBrandName(p.brandName);

        if (p.scripts && p.scripts.length > 0) {
          const s = p.scripts[0];
          setHookText(s.hookText || "");
          setProblemText(s.problemText || "");
          setSolutionText(s.solutionText || "");
          setDemoText(s.demoText || "");
          setCtaText(s.ctaText || "");
          setSelectedHookIndex(s.selectedHookIndex || 0);

          if (s.hookOptions) {
            try {
              setHooks(JSON.parse(s.hookOptions));
            } catch {
              setHooks([s.hookText]);
            }
          }
        } else {
          // If no script exists yet, automatically trigger generation
          await handleGenerateScript();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateScript() {
    try {
      setGenerating(true);
      const res = await fetch("/api/ai/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      if (res.ok) {
        const data = await res.json();
        const s = data.script;
        setHookText(s.hookText);
        setProblemText(s.problemText);
        setSolutionText(s.solutionText);
        setDemoText(s.demoText);
        setCtaText(s.ctaText);
        setHooks(data.hooks || [s.hookText]);
        setSelectedHookIndex(0);
      }
    } catch (err) {
      console.error("Generate script error:", err);
    } finally {
      setGenerating(false);
    }
  }

  function handleSelectHook(hook: string, index: number) {
    setSelectedHookIndex(index);
    setHookText(hook);
  }

  // Calculate estimated speaking time (~2.6 words per second in Indonesian conversational tempo)
  const fullWords = `${hookText} ${problemText} ${solutionText} ${demoText} ${ctaText}`.trim().split(/\s+/).filter(Boolean).length;
  const estSeconds = Math.round(fullWords / 2.6);

  async function handleSaveAndProceed() {
    setSaving(true);
    try {
      const res = await fetch("/api/ai/script", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          hookText,
          problemText,
          solutionText,
          demoText,
          ctaText,
          selectedHookIndex,
          convertToScenes: true, // Splits into 4 storyboard scenes for recording!
        }),
      });

      if (res.ok) {
        router.push(`/projects/${projectId}/record`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading && !generating) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Top Breadcrumb & Workflow Indicator */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Link href="/projects" className="hover:text-white transition-colors">
            Projects
          </Link>
          <span>/</span>
          <span className="text-zinc-200 font-medium">{projectTitle || "Project"}</span>
          <span>/</span>
          <span className="text-indigo-400 font-semibold">Naskah AI & Hooks</span>
        </div>

        {/* Workflow steps */}
        <div className="flex items-center gap-2 rounded-xl bg-zinc-900/80 px-3 py-1.5 border border-zinc-800 text-xs">
          <span className="text-zinc-400">1. Brief</span>
          <ChevronRight className="h-3 w-3 text-zinc-600" />
          <span className="font-semibold text-indigo-400">2. Naskah AI</span>
          <ChevronRight className="h-3 w-3 text-zinc-600" />
          <span className="text-zinc-500">3. Rekam</span>
          <ChevronRight className="h-3 w-3 text-zinc-600" />
          <span className="text-zinc-500">4. Editor 9:16</span>
        </div>
      </div>

      {/* Header with Title and AI Regenerate CTA */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20 mb-2">
            <Flame className="h-3.5 w-3.5 text-orange-400" />
            <span>High-Converting UGC Copywriting</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            AI Script & Hook Studio
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Pilih variasi hook paling memikat di 3 detik pertama, lalu sesuaikan alur naskah scene per scene.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGenerateScript}
            disabled={generating}
            className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${generating ? "animate-spin text-indigo-400" : ""}`} />
            <span>{generating ? "Menghasilkan Naskah..." : "Regenerate AI"}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAndProceed}
            disabled={saving || generating}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-indigo-400 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            <span>Lanjut ke Recording Studio</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Viral Hooks Selector (1/3) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Pilihan Viral Hooks (0-3s)
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-zinc-500">
                {hooks.length} Opsi
              </span>
            </div>

            <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
              3 detik pertama menentukan 80% keberhasilan video UGC. Pilih hook yang paling memancing rasa penasaran audiens:
            </p>

            <div className="mt-4 space-y-2.5">
              {hooks.map((hook, index) => {
                const isSelected = selectedHookIndex === index;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectHook(hook, index)}
                    className={`w-full rounded-xl border p-3.5 text-left text-xs transition-all relative ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-500/15 text-white shadow-sm shadow-indigo-500/15"
                        : "border-zinc-800/80 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[10px] uppercase tracking-wider text-indigo-400">
                        Opsi #{index + 1}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      )}
                    </div>
                    <p className="leading-snug font-medium line-clamp-3">
                      &ldquo;{hook}&rdquo;
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Script Duration Meter */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">Estimasi Durasi Video</span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
                <Clock className="h-4 w-4" />
                <span>± {estSeconds} Detik</span>
              </div>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${Math.min(100, (estSeconds / 60) * 100)}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-zinc-500">
              <span>{fullWords} Kata</span>
              <span>Rasio ideal: 25-45 detik</span>
            </div>
          </div>
        </div>

        {/* Right Column: Scene-by-Scene Structured Script Editor (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Scene 1: Hook */}
          <div className="rounded-2xl border border-indigo-500/30 bg-zinc-900/60 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold border border-indigo-500/30">
                  1
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Scene 1: Hook Pembuka (0-3 Detik)
                </span>
              </div>
              <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400">
                Paling Krusial
              </span>
            </div>
            <textarea
              rows={2}
              value={hookText}
              onChange={(e) => setHookText(e.target.value)}
              placeholder="Teks hook pembuka video..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed font-medium"
            />
          </div>

          {/* Scene 2: Problem */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                  2
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Scene 2: Problem & Relatable Pain (3-10 Detik)
                </span>
              </div>
              <span className="text-[11px] text-zinc-500">Membangun Empati Audiens</span>
            </div>
            <textarea
              rows={3}
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="Deskripsi masalah nyata yang dialami sehari-hari..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed"
            />
          </div>

          {/* Scene 3: Solution & Product Demo */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  3
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Scene 3: Solusi & Demo Produk (10-25 Detik)
                </span>
              </div>
              <span className="text-[11px] text-zinc-500">Tunjukkan Hasil Nyata</span>
            </div>
            <div className="space-y-3">
              <textarea
                rows={3}
                value={solutionText}
                onChange={(e) => setSolutionText(e.target.value)}
                placeholder="Pengenalan brand dan kenapa produk ini menyelesaikan masalah tersebut..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
              />
              <textarea
                rows={2}
                value={demoText}
                onChange={(e) => setDemoText(e.target.value)}
                placeholder="Penjelasan demo pemakaian singkat (tekstur, fitur, rasa pakai)..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Scene 4: CTA */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30">
                  4
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Scene 4: Call to Action (25-30 Detik)
                </span>
              </div>
              <span className="text-[11px] text-zinc-500">Ajakan Beli / Klik Keranjang</span>
            </div>
            <textarea
              rows={2}
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              placeholder="Instruksi jelas untuk penonton checkout sekarang juga..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 leading-relaxed font-medium"
            />
          </div>

          {/* Action Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleSaveAndProceed}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-indigo-400 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              <span>Simpan Naskah & Masuk ke Recording Studio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
