import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    let settings = await prisma.appSetting.findUnique({
      where: { id: "global_settings" },
    });

    if (!settings) {
      settings = await prisma.appSetting.create({
        data: {
          id: "global_settings",
          aiProviderPreference: "gemini",
          defaultTtsVoice: "id-ID-ArdiNeural",
        },
      });
    }

    return NextResponse.json({
      aiProviderPreference: settings.aiProviderPreference,
      hasGeminiKey: Boolean(settings.geminiApiKey || process.env.GEMINI_API_KEY),
      hasOpenAiKey: Boolean(settings.openAiApiKey || process.env.OPENAI_API_KEY),
      hasElevenLabsKey: Boolean(settings.elevenLabsApiKey || process.env.ELEVENLABS_API_KEY),
      defaultTtsVoice: settings.defaultTtsVoice,
      hasAdminPin: Boolean(settings.adminPin),
      // Mask keys for safety
      geminiApiKey: settings.geminiApiKey ? "••••••••" + settings.geminiApiKey.slice(-4) : "",
      openAiApiKey: settings.openAiApiKey ? "••••••••" + settings.openAiApiKey.slice(-4) : "",
      elevenLabsApiKey: settings.elevenLabsApiKey ? "••••••••" + settings.elevenLabsApiKey.slice(-4) : "",
    });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      aiProviderPreference,
      geminiApiKey,
      openAiApiKey,
      elevenLabsApiKey,
      defaultTtsVoice,
      adminPin,
    } = body;

    const updateData: Record<string, unknown> = {
      aiProviderPreference: aiProviderPreference ?? "gemini",
      defaultTtsVoice: defaultTtsVoice ?? "id-ID-ArdiNeural",
    };

    // Only update API keys if provided (and not the masked dots)
    if (geminiApiKey !== undefined && !geminiApiKey.startsWith("••••")) {
      updateData.geminiApiKey = geminiApiKey.trim() || null;
    }
    if (openAiApiKey !== undefined && !openAiApiKey.startsWith("••••")) {
      updateData.openAiApiKey = openAiApiKey.trim() || null;
    }
    if (elevenLabsApiKey !== undefined && !elevenLabsApiKey.startsWith("••••")) {
      updateData.elevenLabsApiKey = elevenLabsApiKey.trim() || null;
    }
    if (adminPin !== undefined) {
      updateData.adminPin = adminPin.trim() || null;
    }

    const updated = await prisma.appSetting.upsert({
      where: { id: "global_settings" },
      update: updateData,
      create: {
        id: "global_settings",
        ...updateData,
      },
    });

    return NextResponse.json({
      success: true,
      aiProviderPreference: updated.aiProviderPreference,
      hasGeminiKey: Boolean(updated.geminiApiKey),
      hasOpenAiKey: Boolean(updated.openAiApiKey),
      defaultTtsVoice: updated.defaultTtsVoice,
      hasAdminPin: Boolean(updated.adminPin),
    });
  } catch (error) {
    console.error("Failed to save settings:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
