import { prisma } from "@/lib/db";

export interface ScriptGenerationParams {
  brandName: string;
  productDescription: string;
  targetAudience?: string;
  tone?: string;
  targetDurationSec?: number;
}

export interface GeneratedScriptResult {
  hooks: string[];
  selectedHookIndex: number;
  hookText: string;
  problemText: string;
  solutionText: string;
  demoText: string;
  ctaText: string;
  fullScript: string;
}

// Built-in offline fallback script generator (high-converting UGC templates)
export function generateOfflineScript(params: ScriptGenerationParams): GeneratedScriptResult {
  const brand = params.brandName || "Produk Ini";
  const desc = params.productDescription || "solusi terbaik untuk kebutuhan harian Anda";
  const audience = params.targetAudience || "teman-teman semua";
  const tone = params.tone || "casual";

  let hooks: string[];

  if (tone === "hard-sell") {
    hooks = [
      `Stop scroll dulu! Promo terbesar ${brand} resmi dimulai hari ini!`,
      `Khusus buat ${audience}, diskon ${brand} cuma berlaku sampai jam 12 malam!`,
      `Jangan sampai nyesel kehabisan stok ${brand} yang lagi viral ini!`,
      `Ini alasan kenapa ribuan orang langsung borong ${brand} minggu ini!`,
      `Kalau kalian belum checkout ${brand}, tonton ini sampai habis!`,
    ];
  } else if (tone === "emotional") {
    hooks = [
      `Jujur, gue hampir nyerah nyari solusi buat masalah ini... sampai akhirnya nemu ${brand}.`,
      `Buat ${audience} yang lagi ngerasain capeknya masalah ini, gue ada kabar baik.`,
      `Ternyata selama ini kita cuma salah pilih produk, dan ${brand} ngebuka mata gue.`,
      `Satu hal yang gue harap udah gue tahu dari dulu tentang ${brand}.`,
      `Nggak nyangka hal sesederhana ini bisa ngerubah rutinitas gue sepenuhnya.`,
    ];
  } else {
    // casual & energetic default
    hooks = [
      `Jangan pernah beli ${brand} sebelum kalian tahu rahasia ini!`,
      `Gue nemu life hack buat ${audience} yang beneran ngubah rutinitas gue!`,
      `Ternyata selama ini cara kita pakai produk kayak gini itu salah besar!`,
      `Kalian yang masih bingung nyari solusi, wajib banget intip ${brand} ini.`,
      `Is it actually worth the hype? Jujur review ${brand} setelah pemakaian intensif!`,
    ];
  }

  const selectedHook = hooks[0];
  const problem = `Kalian pasti pernah kan ngerasain ribetnya saat menghadapi masalah ini? Apalagi buat ${audience}, rasanya bikin frustasi dan buang-buang waktu banget tiap hari.`;
  const solution = `Nah akhirnya gue nemuin ${brand}! ${desc}. Beneran langsung jadi game changer buat gue.`;
  const demo = `Lihat deh, penggunaannya super gampang dan hasilnya langsung kelihatan. Nggak perlu ribet, tekstur dan formulanya bener-bener nyaman banget!`;
  const cta = `Buat kalian yang mau cobain juga, langsung cek keranjang kuning atau link di bio sekarang mumpung stoknya masih ada!`;

  const fullScript = `${selectedHook} ${problem} ${solution} ${demo} ${cta}`;

  return {
    hooks,
    selectedHookIndex: 0,
    hookText: selectedHook,
    problemText: problem,
    solutionText: solution,
    demoText: demo,
    ctaText: cta,
    fullScript,
  };
}

// Generate script using AI (Gemini or OpenAI) with graceful fallback
export async function generateAiScript(params: ScriptGenerationParams): Promise<GeneratedScriptResult> {
  const settings = await prisma.appSetting.findUnique({
    where: { id: "global_settings" },
  });

  const geminiKey = settings?.geminiApiKey || process.env.GEMINI_API_KEY;
  const openAiKey = settings?.openAiApiKey || process.env.OPENAI_API_KEY;

  const prompt = `Anda adalah seorang Creative Director dan Copywriter UGC (User Generated Content) video ads profesional untuk TikTok, Instagram Reels, dan YouTube Shorts.
Tugas Anda adalah membuat naskah video UGC persuasif, natural, dan berkonversi tinggi berdasarkan data produk berikut:
- Nama Brand/Produk: ${params.brandName}
- Deskripsi & USP: ${params.productDescription}
- Target Audiens: ${params.targetAudience || "Umum"}
- Nada Bicara / Tone: ${params.tone || "casual energetic"}
- Target Durasi: ${params.targetDurationSec || 30} detik

Hasilkan output HANYA dalam format JSON valid tanpa format markdown atau teks pengantar dengan struktur persis seperti berikut:
{
  "hooks": [
    "Opsi Hook 1 (Curiosity/Question)",
    "Opsi Hook 2 (Negative hook)",
    "Opsi Hook 3 (Proof / Before After)",
    "Opsi Hook 4 (Relatable frustration)",
    "Opsi Hook 5 (Life hack / secret revelation)"
  ],
  "hookText": "Pilih salah satu hook terbaik di atas",
  "problemText": "Deskripsi masalah yang dihadapi audiens secara emosional dan relevan (3-7 detik)",
  "solutionText": "Pengenalan brand/produk sebagai jawaban nyata atas masalah tersebut",
  "demoText": "Penjelasan cara pakai / manfaat langsung produk saat digunakan",
  "ctaText": "Call to action yang jelas, mendesak, dan mengarahkan ke keranjang kuning / link bio"
}`;

  // Try Gemini if available
  if (geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.7,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return {
            hooks: parsed.hooks || [parsed.hookText],
            selectedHookIndex: 0,
            hookText: parsed.hookText || parsed.hooks[0],
            problemText: parsed.problemText || "",
            solutionText: parsed.solutionText || "",
            demoText: parsed.demoText || "",
            ctaText: parsed.ctaText || "",
            fullScript: `${parsed.hookText || parsed.hooks[0]} ${parsed.problemText} ${parsed.solutionText} ${parsed.demoText} ${parsed.ctaText}`.trim(),
          };
        }
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back to heuristics:", err);
    }
  }

  // Try OpenAI if available
  if (openAiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: "You are an expert UGC video scriptwriter. Output strictly JSON.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return {
            hooks: parsed.hooks || [parsed.hookText],
            selectedHookIndex: 0,
            hookText: parsed.hookText || parsed.hooks[0],
            problemText: parsed.problemText || "",
            solutionText: parsed.solutionText || "",
            demoText: parsed.demoText || "",
            ctaText: parsed.ctaText || "",
            fullScript: `${parsed.hookText || parsed.hooks[0]} ${parsed.problemText} ${parsed.solutionText} ${parsed.demoText} ${parsed.ctaText}`.trim(),
          };
        }
      }
    } catch (err) {
      console.warn("OpenAI API call failed, falling back to heuristics:", err);
    }
  }

  // Return offline template fallback if no API key or network error
  return generateOfflineScript(params);
}
