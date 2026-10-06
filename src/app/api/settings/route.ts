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
          talkingAvatarProvider: "did",
        },
      });
    }

    return NextResponse.json({
      aiProviderPreference: settings.aiProviderPreference,
      talkingAvatarProvider: settings.talkingAvatarProvider,
      hasGeminiKey: Boolean(settings.geminiApiKey || process.env.GEMINI_API_KEY),
      hasOpenAiKey: Boolean(settings.openAiApiKey || process.env.OPENAI_API_KEY),
      hasElevenLabsKey: Boolean(settings.elevenLabsApiKey || process.env.ELEVENLABS_API_KEY),
      hasDIdKey: Boolean(settings.dIdApiKey || process.env.DID_API_KEY),
      hasReplicateToken: Boolean(settings.replicateApiToken || process.env.REPLICATE_API_TOKEN),
      defaultTtsVoice: settings.defaultTtsVoice,
      hasAdminPin: Boolean(settings.adminPin),
      // Mask keys
      geminiApiKey: settings.geminiApiKey ? "••••••••" + settings.geminiApiKey.slice(-4) : "",
      openAiApiKey: settings.openAiApiKey ? "••••••••" + settings.openAiApiKey.slice(-4) : "",
      elevenLabsApiKey: settings.elevenLabsApiKey ? "••••••••" + settings.elevenLabsApiKey.slice(-4) : "",
      dIdApiKey: settings.dIdApiKey ? "••••••••" + settings.dIdApiKey.slice(-4) : "",
      replicateApiToken: settings.replicateApiToken ? "••••••••" + settings.replicateApiToken.slice(-4) : "",
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
      talkingAvatarProvider,
      geminiApiKey,
      openAiApiKey,
      elevenLabsApiKey,
      dIdApiKey,
      replicateApiToken,
      defaultTtsVoice,
      adminPin,
    } = body;

    const updateData: Record<string, unknown> = {
      aiProviderPreference: aiProviderPreference ?? "gemini",
      talkingAvatarProvider: talkingAvatarProvider ?? "did",
      defaultTtsVoice: defaultTtsVoice ?? "id-ID-ArdiNeural",
    };

    if (geminiApiKey !== undefined && !geminiApiKey.startsWith("••••")) {
      updateData.geminiApiKey = geminiApiKey.trim() || null;
    }
    if (openAiApiKey !== undefined && !openAiApiKey.startsWith("••••")) {
      updateData.openAiApiKey = openAiApiKey.trim() || null;
    }
    if (elevenLabsApiKey !== undefined && !elevenLabsApiKey.startsWith("••••")) {
      updateData.elevenLabsApiKey = elevenLabsApiKey.trim() || null;
    }
    if (dIdApiKey !== undefined && !dIdApiKey.startsWith("••••")) {
      updateData.dIdApiKey = dIdApiKey.trim() || null;
    }
    if (replicateApiToken !== undefined && !replicateApiToken.startsWith("••••")) {
      updateData.replicateApiToken = replicateApiToken.trim() || null;
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
      talkingAvatarProvider: updated.talkingAvatarProvider,
      hasDIdKey: Boolean(updated.dIdApiKey),
      hasReplicateToken: Boolean(updated.replicateApiToken),
      hasGeminiKey: Boolean(updated.geminiApiKey),
    });
  } catch (error) {
    console.error("Failed to save settings:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
