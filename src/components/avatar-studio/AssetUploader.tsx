"use client";

import { UserCheck, ShoppingBag, Loader2 } from "lucide-react";

interface AssetUploaderProps {
  charPreview: string | null;
  productPreview: string | null;
  uploadingChar: boolean;
  uploadingProduct: boolean;
  onCharUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProductUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AssetUploader({
  charPreview,
  productPreview,
  uploadingChar,
  uploadingProduct,
  onCharUpload,
  onProductUpload,
}: AssetUploaderProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] text-white">
            1
          </span>
          <span>Upload Model Karakter & Produk</span>
        </h2>
        <span className="text-[11px] text-slate-500">2 Foto Aset Utama</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Box 1: Model Char */}
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden group hover:border-slate-400 hover:bg-slate-100/60 transition-colors">
          {charPreview ? (
            <div className="relative h-44 w-full rounded-lg overflow-hidden flex flex-col justify-between">
              <img
                src={charPreview}
                alt="Model Karakter"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[11px] font-semibold text-white bg-slate-900/80 px-2 py-1 rounded">
                  Ganti Foto Model
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 border border-slate-200 mb-3 shadow-xs">
                <UserCheck className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-slate-900">
                Model Char (Wajah / Kreator)
              </span>
              <span className="text-[11px] text-slate-500 mt-1">
                Foto selfie atau model karakter Anda
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={onCharUpload}
            disabled={uploadingChar}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          {uploadingChar && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-xs text-slate-800 gap-1.5 font-semibold">
              <Loader2 className="h-4 w-4 animate-spin text-slate-700" />
              <span>Mengupload...</span>
            </div>
          )}
        </div>

        {/* Box 2: Model Barang */}
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden group hover:border-slate-400 hover:bg-slate-100/60 transition-colors">
          {productPreview ? (
            <div className="relative h-44 w-full rounded-lg overflow-hidden flex flex-col justify-between">
              <img
                src={productPreview}
                alt="Model Barang"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[11px] font-semibold text-white bg-slate-900/80 px-2 py-1 rounded">
                  Ganti Foto Barang
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 border border-slate-200 mb-3 shadow-xs">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-slate-900">
                Model Barang (Foto Produk)
              </span>
              <span className="text-[11px] text-slate-500 mt-1">
                Foto produk affiliate / brand
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={onProductUpload}
            disabled={uploadingProduct}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          {uploadingProduct && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-xs text-slate-800 gap-1.5 font-semibold">
              <Loader2 className="h-4 w-4 animate-spin text-slate-700" />
              <span>Mengupload...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
