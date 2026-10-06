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
  Loader2,
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
        setHooks(s.hookOptions || [s.hookText]);
        setSelectedHookIndex(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  function handleSelectHook(hook: string, index: number) {
    setSelectedHookIndex(index);
    setHookText(hook);
  }

  async function handleSaveAndProceed() {
    setSaving(true);
    try {
      const fullScript = `${hookText}\n\n${problemText}\n\n${solutionText}\n\n${demoText}\n\n${ctaText}`;
      const res = await fetch("/api/ai/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          hookText,
          problemText,
          solutionText,
          demoText,
          ctaText,
          selectedHookIndex,
          hookOptions: hooks,
          fullScript,
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

  const fullWords = `${hookText} ${problemText} ${solutionText} ${demoText} ${ctaText}`
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const estSeconds = Math.round((fullWords / 130) * 60);

  if (loading && !generating) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Top Breadcrumb & Workflow Indicator */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/projects" className="hover:text-slate-900 transition-colors">
            Projects
          </Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">{projectTitle || "Project"}</span>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Naskah AI & Hooks</span>
        </div>

        {/* Workflow steps */}
        <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 border border-slate-200 text-xs shadow-xs">
          <span className="text-slate-500">1. Brief</span>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <span className="font-semibold text-slate-900">2. Naskah AI</span>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <span className="text-slate-400">3. Rekam</span>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <span className="text-slate-400">4. Editor 9:16</span>
        </div>
      </div>

      {/* Header with Title and AI Regenerate CTA */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 border border-slate-200 mb-2">
            <Flame className="h-3.5 w-3.5 text-amber-600" />
            <span>High-Converting UGC Copywriting</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            AI Script & Hook Studio
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Pilih variasi hook paling memikat di 3 detik pertama, lalu sesuaikan alur naskah scene per scene.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGenerateScript}
            disabled={generating}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${generating ? "animate-spin text-slate-900" : ""}`} />
            <span>{generating ? "Menghasilkan Naskah..." : "Regenerate AI"}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAndProceed}
            disabled={saving || generating}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
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
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-500" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Pilihan Viral Hooks (0-3s)
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                {hooks.length} Opsi
              </span>
            </div>

            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
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
                        ? "border-slate-900 bg-white ring-1 ring-slate-900 shadow-xs text-slate-900"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[10px] uppercase tracking-wider text-slate-700">
                        Opsi #{index + 1}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
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
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Estimasi Durasi Video</span>
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm">
                <Clock className="h-4 w-4 text-slate-500" />
                <span>± {estSeconds} Detik</span>
              </div>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-slate-900 transition-all duration-300"
                style={{ width: `${Math.min(100, (estSeconds / 60) * 100)}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-slate-500">
              <span>{fullWords} Kata</span>
              <span>Rasio ideal: 25-45 detik</span>
            </div>
          </div>
        </div>

        {/* Right Column: Scene-by-Scene Structured Script Editor (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Scene 1: Hook */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 text-white text-xs font-bold">
                  1
                </span>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Scene 1: Hook Pembuka (0-3 Detik)
                </span>
              </div>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200">
                Paling Krusial
              </span>
            </div>
            <textarea
              rows={2}
              value={hookText}
              onChange={(e) => setHookText(e.target.value)}
              placeholder="Teks hook pembuka video..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none leading-relaxed font-medium"
            />
          </div>

          {/* Scene 2: Problem */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 text-white text-xs font-bold">
                  2
                </span>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Scene 2: Problem & Relatable Pain (3-10 Detik)
                </span>
              </div>
              <span className="text-[11px] text-slate-500">Membangun Empati Audiens</span>
            </div>
            <textarea
              rows={3}
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="Deskripsi masalah nyata yang dialami sehari-hari..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Scene 3: Solution & Product Demo */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 text-white text-xs font-bold">
                  3
                </span>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Scene 3: Solusi & Demo Produk (10-25 Detik)
                </span>
              </div>
              <span className="text-[11px] text-slate-500">Tunjukkan Hasil Nyata</span>
            </div>
            <div className="space-y-3">
              <textarea
                rows={3}
                value={solutionText}
                onChange={(e) => setSolutionText(e.target.value)}
                placeholder="Pengenalan brand dan kenapa produk ini menyelesaikan masalah tersebut..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none leading-relaxed"
              />
              <textarea
                rows={2}
                value={demoText}
                onChange={(e) => setDemoText(e.target.value)}
                placeholder="Penjelasan demo pemakaian singkat (tekstur, fitur, rasa pakai)..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Scene 4: CTA */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 text-white text-xs font-bold">
                  4
                </span>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Scene 4: Call to Action (25-30 Detik)
                </span>
              </div>
              <span className="text-[11px] text-slate-500">Ajakan Beli / Klik Keranjang</span>
            </div>
            <textarea
              rows={2}
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              placeholder="Instruksi jelas untuk penonton checkout sekarang juga..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none leading-relaxed font-medium"
            />
          </div>

          {/* Action Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleSaveAndProceed}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
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
