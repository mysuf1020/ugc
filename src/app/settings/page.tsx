"use client";

import { useEffect, useState } from "react";
import { Key, Shield, Volume2, Sparkles, CheckCircle2, AlertCircle, Save, Loader2, UserCheck } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [aiPreference, setAiPreference] = useState("gemini");
  const [talkingProvider, setTalkingProvider] = useState("did");
  const [geminiKey, setGeminiKey] = useState("");
  const [openAiKey, setOpenAiKey] = useState("");
  const [elevenLabsKey, setElevenLabsKey] = useState("");
  const [dIdKey, setDIdKey] = useState("");
  const [replicateToken, setReplicateToken] = useState("");
  const [defaultVoice, setDefaultVoice] = useState("id-ID-ArdiNeural");
  const [adminPin, setAdminPin] = useState("");

  const [hasGemini, setHasGemini] = useState(false);
  const [hasOpenAi, setHasOpenAi] = useState(false);
  const [hasElevenLabs, setHasElevenLabs] = useState(false);
  const [hasDId, setHasDId] = useState(false);
  const [hasReplicate, setHasReplicate] = useState(false);
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
        setTalkingProvider(data.talkingAvatarProvider || "did");
        setGeminiKey(data.geminiApiKey || "");
        setOpenAiKey(data.openAiApiKey || "");
        setElevenLabsKey(data.elevenLabsApiKey || "");
        setDIdKey(data.dIdApiKey || "");
        setReplicateToken(data.replicateApiToken || "");
        setDefaultVoice(data.defaultTtsVoice || "id-ID-ArdiNeural");
        setHasGemini(data.hasGeminiKey);
        setHasOpenAi(data.hasOpenAiKey);
        setHasElevenLabs(data.hasElevenLabsKey);
        setHasDId(data.hasDIdKey);
        setHasReplicate(data.hasReplicateToken);
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
          talkingAvatarProvider: talkingProvider,
          geminiApiKey: geminiKey,
          openAiApiKey: openAiKey,
          elevenLabsApiKey: elevenLabsKey,
          dIdApiKey: dIdKey,
          replicateApiToken: replicateToken,
          defaultTtsVoice: defaultVoice,
          adminPin: adminPin,
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Pengaturan berhasil disimpan!" });
        await fetchSettings();
      } else {
        setMessage({ type: "error", text: "Gagal menyimpan pengaturan." });
      }
    } catch {
      setMessage({ type: "error", text: "Terjadi gangguan jaringan." });
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
          Kelola kunci API Talking Avatar (D-ID / Replicate), AI scriptwriting, dan proteksi server studio.
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
        {/* Section: AI Lip-Sync Talking Avatar Engine */}
        <div className="rounded-2xl border border-indigo-500/30 bg-zinc-900/70 p-6 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-3 pb-5 border-b border-zinc-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">AI Talking Avatar Engine (Foto Wajah Berbicara)</h2>
              <p className="text-xs text-zinc-400">
                Pilih provider yang menganimasikan foto wajah Anda agar berbicara menjelaskan brand. Jika belum disetel, studio menggunakan mode visual animator bawaan.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {/* Preferred Avatar Provider */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Provider Lip-Sync Utama
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() => setTalkingProvider("did")}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                    talkingProvider === "did"
                      ? "border-indigo-500 bg-indigo-500/15 text-white shadow-sm shadow-indigo-500/10"
                      : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <span>D-ID API (Direkomendasikan)</span>
                  {hasDId && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => setTalkingProvider("replicate")}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                    talkingProvider === "replicate"
                      ? "border-indigo-500 bg-indigo-500/15 text-white shadow-sm shadow-indigo-500/10"
                      : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <span>Replicate (SadTalker)</span>
                  {hasReplicate && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
                </button>
              </div>
            </div>

            {/* D-ID API Key */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300">D-ID API Key</label>
                <span className="text-[11px] text-zinc-500">
                  {hasDId ? (
                    <span className="text-emerald-400 font-medium">✓ Terhubung</span>
                  ) : (
                    "Dapat diperoleh dari studio.d-id.com"
                  )}
                </span>
              </div>
              <input
                type="password"
                placeholder="Format: Basic cXl4Z... atau your_api_key"
                value={dIdKey}
                onChange={(e) => setDIdKey(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Replicate Token */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300">Replicate API Token</label>
                <span className="text-[11px] text-zinc-500">
                  {hasReplicate ? (
                    <span className="text-emerald-400 font-medium">✓ Terhubung</span>
                  ) : (
                    "r8_..."
                  )}
                </span>
              </div>
              <input
                type="password"
                placeholder="r8_..."
                value={replicateToken}
                onChange={(e) => setReplicateToken(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section: Scriptwriting AI */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 pb-5 border-b border-zinc-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">AI Scriptwriting & Hooks</h2>
              <p className="text-xs text-zinc-400">
                Membuat naskah video persuasif tentang produk brand yang akan diucapkan avatar.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300">Google Gemini API Key</label>
                <span className="text-[11px] text-zinc-500">
                  {hasGemini ? <span className="text-emerald-400 font-medium">✓ Terhubung</span> : "Gratis via AI Studio"}
                </span>
              </div>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300">OpenAI API Key (Opsional)</label>
                <span className="text-[11px] text-zinc-500">
                  {hasOpenAi ? <span className="text-emerald-400 font-medium">✓ Terhubung</span> : "sk-..."}
                </span>
              </div>
              <input
                type="password"
                placeholder="sk-..."
                value={openAiKey}
                onChange={(e) => setOpenAiKey(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section: Voiceover & VPS Security */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Voice */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 pb-4 border-b border-zinc-800 mb-4">
              <Volume2 className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Suara Narasi Bawaan</h2>
            </div>
            <select
              value={defaultVoice}
              onChange={(e) => setDefaultVoice(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
            >
              <option value="id-ID-ArdiNeural">Indonesia - Ardi (Pria Natural & Mantap)</option>
              <option value="id-ID-GadisNeural">Indonesia - Gadis (Wanita Ramah & Ceria)</option>
              <option value="en-US-ChristopherNeural">English - Christopher (Male Casual)</option>
              <option value="en-US-JennyNeural">English - Jenny (Female Energetic)</option>
            </select>
          </div>

          {/* VPS Security PIN */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 pb-4 border-b border-zinc-800 mb-4">
              <Shield className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white">PIN Akses VPS</h2>
            </div>
            <input
              type="password"
              maxLength={8}
              placeholder={hasPin ? "•••• Masukkan PIN baru" : "Kosongkan jika lokal"}
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </div>
  );
}
