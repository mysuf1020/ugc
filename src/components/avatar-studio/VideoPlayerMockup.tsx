"use client";

import { ShoppingBag, UserCheck, Volume2, Download, Film } from "lucide-react";
import { AspectRatioType } from "./FormatAndProductConfig";

interface VideoPlayerMockupProps {
  generatedVideoUrl: string | null;
  generatedAudioUrl: string | null;
  charPreview: string | null;
  productPreview: string | null;
  hookHeadline: string;
  scriptText: string;
  targetDurationSec: number;
  aspectRatio: AspectRatioType;
  onPreviewFlowVideo: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function VideoPlayerMockup({
  generatedVideoUrl,
  generatedAudioUrl,
  charPreview,
  productPreview,
  hookHeadline,
  scriptText,
  targetDurationSec,
  aspectRatio,
  onPreviewFlowVideo,
}: VideoPlayerMockupProps) {
  const frameAspectClass =
    aspectRatio === "9:16"
      ? "aspect-[9/16] max-w-[340px]"
      : aspectRatio === "16:9"
      ? "aspect-[16/9] max-w-[500px]"
      : aspectRatio === "1:1"
      ? "aspect-square max-w-[360px]"
      : "aspect-[4/5] max-w-[350px]";

  return (
    <div className="lg:col-span-5 flex flex-col items-center space-y-4">
      {/* Format Badge Indicator */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Format: {aspectRatio}</span>
        <span>·</span>
        <span>Durasi: {targetDurationSec}s</span>
      </div>

      <div
        className={`relative w-full overflow-hidden rounded-[32px] border-[6px] border-slate-200 bg-slate-100 shadow-xl ring-1 ring-slate-300/80 transition-all duration-300 ${frameAspectClass}`}
      >
        {generatedVideoUrl ? (
          <video
            src={generatedVideoUrl}
            controls
            autoPlay
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex flex-col justify-between p-4 relative bg-slate-50">
            {/* Dynamic Island / Notch */}
            <div className="flex flex-col items-center gap-2 pt-1">
              <div className="h-3.5 w-20 rounded-full bg-slate-200/80" />
              <div className="rounded-full bg-slate-900 px-3 py-0.5 text-center text-[10px] font-bold text-white shadow-sm tracking-wide">
                {hookHeadline}
              </div>
            </div>

            {/* Preview Mockup Canvas */}
            <div className="flex-1 flex flex-col justify-center items-center my-3 space-y-2">
              <div className="w-full h-full flex flex-col gap-2">
                {/* Upper: Product */}
                <div className="flex-1 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-xs relative">
                  {productPreview ? (
                    <img
                      src={productPreview}
                      alt="Produk"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-center p-2">
                      <ShoppingBag className="h-5 w-5 text-slate-300 mb-1" />
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Model Barang (Produk)
                      </span>
                    </div>
                  )}
                </div>
                {/* Lower: Character */}
                <div className="flex-1 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-xs relative">
                  {charPreview ? (
                    <img
                      src={charPreview}
                      alt="Model Char"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-center p-2">
                      <UserCheck className="h-5 w-5 text-slate-300 mb-1" />
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Model Char (Karakter)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Subtitle Caption Overlay */}
            <div className="z-10 rounded-2xl bg-white/95 px-3 py-2 text-center backdrop-blur border border-slate-200 shadow-sm">
              <p className="text-[10px] font-semibold text-slate-800 line-clamp-2 leading-relaxed">
                &ldquo;{scriptText || `Suara narasi VO (${targetDurationSec}s) akan diputar di sini...`}&rdquo;
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Audio Player and Download Section */}
      <div className="flex flex-col gap-2 w-full max-w-[340px]">
        {generatedAudioUrl && (
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                <Volume2 className="h-3.5 w-3.5 text-slate-600" />
                <span>File Audio Voiceover (VO)</span>
              </span>
              <a
                href={generatedAudioUrl}
                download={`voiceover_${targetDurationSec}s.mp3`}
                className="text-[10px] font-bold text-slate-900 hover:underline"
              >
                Download MP3
              </a>
            </div>
            <audio src={generatedAudioUrl} controls className="w-full h-8" />
          </div>
        )}

        {generatedVideoUrl && (
          <a
            href={generatedVideoUrl}
            download={`ugc_video_${aspectRatio.replace(":", "x")}_${targetDurationSec}s.mp4`}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Download Video MP4 ({aspectRatio})</span>
          </a>
        )}

        <label className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-xs cursor-pointer">
          <Film className="h-3.5 w-3.5 text-slate-600" />
          <span>Preview Video dari Google Flow (MP4)</span>
          <input
            type="file"
            accept="video/*"
            onChange={onPreviewFlowVideo}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}
