"use client";

import { useEffect, useState } from "react";
import { Key, Shield, Volume2, Sparkles, CheckCircle2, AlertCircle, Save, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [aiPreference, setAiPreference] = useState("gemini");
  const [geminiKey, setGeminiKey] = useState("");
  const [openAiKey, setOpenAiKey] = useState("");
  const [elevenLabsKey, setElevenLabsKey] = useState("");
  const [defaultVoice, setDefaultVoice] = useState("id-ID-ArdiNeural");
  const [adminPin, setAdminPin] = useState("");

  const [hasGemini, setHasGemini] = useState(false);
  const [hasOpenAi, setHasOpenAi] = useState(false);
  const [hasElevenLabs, setHasElevenLabs] = useState(false);
  const [hasPin, setHasPin] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setAiPreference(data.aiProviderPreference || "gemini");
        setGeminiKey(data.geminiApiKey || "");
        setOpenAiKey(data.openAiApiKey || "");
        setElevenLabsKey(data.elevenLabsApiKey || "");
        setDefaultVoice(data.defaultTtsVoice || "id-ID-ArdiNeural");
        setHasGemini(data.hasGeminiKey);
        setHasOpenAi(data.hasOpenAiKey);
        setHasElevenLabs(data.hasElevenLabsKey);
        setHasPin(data.hasAdminPin);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiProviderPreference: aiPreference,
          geminiApiKey: geminiKey,
          openAiApiKey: openAiKey,
          elevenLabsApiKey: elevenLabsKey,
          defaultTtsVoice: defaultVoice,
          adminPin: adminPin,
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Settings successfully saved!" });
        await fetchSettings();
      } else {
        setMessage({ type: "error", text: "Failed to save settings. Please try again." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error occurred." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Studio Settings</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Kelola kunci API AI, konfigurasi suara narasi, dan proteksi keamanan VPS studio Anda.
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 flex items-center gap-3 rounded-xl border p-4 text-sm font-medium ${
            message.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/20 bg-red-500/10 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: AI Provider & Keys */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 pb-5 border-b border-zinc-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">AI Scriptwriting & Intelligence</h2>
              <p className="text-xs text-zinc-400">
                Pilih provider AI utama untuk generator naskah dan viral hooks. Jika belum disetel, studio otomatis memakai template cerdas bawaan.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {/* Preferred Provider */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-2">
                Prioritas Provider AI
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() => setAiPreference("gemini")}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                    aiPreference === "gemini"
                      ? "border-indigo-500 bg-indigo-500/15 text-white shadow-sm shadow-indigo-500/10"
                      : "border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <span>Google Gemini</span>
                  {hasGemini && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => setAiPreference("openai")}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                    aiPreference === "openai"
                      ? "border-indigo-500 bg-indigo-500/15 text-white shadow-sm shadow-indigo-500/10"
                      : "border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <span>OpenAI (GPT-4o)</span>
                  {hasOpenAi && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
                </button>
              </div>
            </div>

            {/* Gemini API Key */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300">Google Gemini API Key</label>
                <span className="text-[11px] text-zinc-500">
                  {hasGemini ? (
                    <span className="text-emerald-400 font-medium">✓ Terhubung</span>
                  ) : (
                    "Gratis via AI Studio"
                  )}
                </span>
              </div>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* OpenAI API Key */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300">OpenAI API Key</label>
                <span className="text-[11px] text-zinc-500">
                  {hasOpenAi ? (
                    <span className="text-emerald-400 font-medium">✓ Terhubung</span>
                  ) : (
                    "Opsional"
                  )}
                </span>
              </div>
              <input
                type="password"
                placeholder="sk-proj-..."
                value={openAiKey}
                onChange={(e) => setOpenAiKey(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Audio & Voiceover */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 pb-5 border-b border-zinc-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Volume2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Voiceover & Audio TTS</h2>
              <p className="text-xs text-zinc-400">
                Konfigurasi suara narasi AI jika Anda tidak ingin merekam suara sendiri.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Pilihan Suara Edge-TTS (Gratis Bawaan)
              </label>
              <select
                value={defaultVoice}
                onChange={(e) => setDefaultVoice(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="id-ID-ArdiNeural">Indonesia - Ardi (Pria Natural & Berwibawa)</option>
                <option value="id-ID-GadisNeural">Indonesia - Gadis (Wanita Ramah & Ceria)</option>
                <option value="en-US-ChristopherNeural">English - Christopher (Male Casual)</option>
                <option value="en-US-JennyNeural">English - Jenny (Female Energetic)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300">ElevenLabs API Key (Opsional Premium)</label>
                <span className="text-[11px] text-zinc-500">
                  {hasElevenLabs ? (
                    <span className="text-emerald-400 font-medium">✓ Terhubung</span>
                  ) : (
                    "Opsional"
                  )}
                </span>
              </div>
              <input
                type="password"
                placeholder="sk_..."
                value={elevenLabsKey}
                onChange={(e) => setElevenLabsKey(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: VPS Security */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 pb-5 border-b border-zinc-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">VPS & Remote Security</h2>
              <p className="text-xs text-zinc-400">
                Lindungi akses studio dengan PIN saat website ini di-host di server VPS publik.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-zinc-300">Admin Access PIN (4-8 Digit)</label>
              <span className="text-[11px] text-zinc-500">
                {hasPin ? (
                  <span className="text-emerald-400 font-medium">✓ PIN Aktif</span>
                ) : (
                  "Belum Diaktifkan"
                )}
              </span>
            </div>
            <input
              type="password"
              maxLength={8}
              placeholder={hasPin ? "•••• Masukkan PIN baru untuk mengubah" : "Kosongkan jika hanya akses localhost"}
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </div>
  );
}
