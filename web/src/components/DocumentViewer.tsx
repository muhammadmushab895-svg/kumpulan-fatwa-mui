import React, { useState } from 'react';
import type { FatwaItem } from '../types/fatwa';
import { getCategoryColor } from './FatwaCard';
import { RingkasanCard } from './RingkasanCard';
import { ElegantPdfReader } from './ElegantPdfReader';
import {
  ExternalLink,
  Download,
  Share2,
  Bookmark,
  FileText,
  Calendar,
  Check,
  AlertTriangle,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface DocumentViewerProps {
  item: FatwaItem | null;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onCloseMobile?: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  item,
  isBookmarked,
  onToggleBookmark
}) => {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!item) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-300 w-full max-w-full">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
          <FileText className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-semibold text-slate-700 mb-1">
          Pilih Salah Satu Fatwa
        </h3>
        <p className="text-xs max-w-xs text-slate-500">
          Klik salah satu fatwa di daftar sebelah kiri untuk langsung membaca dokumen PDF resmi dan ringkasan putusannya.
        </p>
      </div>
    );
  }

  // Resolve PDF URL
  const getEmbedPdfUrl = () => {
    if (!item.pdfUrl) return null;
    if (item.pdfUrl.startsWith('https://fatwamui.com/storage/')) {
      const relative = item.pdfUrl.replace('https://fatwamui.com/storage/', '');
      return `/pdf-proxy/${relative}`;
    }
    return item.pdfUrl;
  };

  const embedUrl = getEmbedPdfUrl();

  const handleCopyCitation = () => {
    const status = item.ringkasan ? ` [Status: ${item.ringkasan.statusHukum}]` : '';
    const citation = `Fatwa MUI: "${item.judul}" (${item.nomor}, Tanggal: ${item.tanggal})${status}. Sumber: Repositori Komisi Fatwa MUI.`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-200 w-full max-w-full ${
        isFullscreen ? 'fixed inset-0 sm:inset-4 z-50 shadow-2xl rounded-none sm:rounded-2xl' : 'h-full'
      }`}
    >
      {/* Top Header Card & Metadata */}
      <div className="p-3 sm:p-5 border-b border-slate-200 bg-slate-50/70 overflow-y-auto max-h-[48%] flex-shrink-0 w-full max-w-full overflow-x-hidden">
        <div className="flex flex-col gap-2.5 sm:gap-3 w-full max-w-full">
          {/* Action Row */}
          <div className="flex items-center justify-between gap-1.5 flex-wrap w-full max-w-full">
            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getCategoryColor(
                  item.kategori
                )}`}
              >
                {item.kategori}
              </span>
              {item.tahun && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                  {item.tahun}
                </span>
              )}
              <span className="text-[11px] text-slate-500 font-medium">
                Era {item.era}
              </span>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-1.5 flex-shrink-0">
              <button
                onClick={onToggleBookmark}
                className={`p-1.5 sm:p-2 rounded-xl border text-xs font-medium transition-colors flex items-center space-x-1 cursor-pointer ${
                  isBookmarked
                    ? 'bg-amber-50 text-amber-600 border-amber-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title="Tandai fatwa ini"
              >
                <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                <span className="hidden sm:inline">
                  {isBookmarked ? 'Tersimpan' : 'Simpan'}
                </span>
              </button>

              <button
                onClick={handleCopyCitation}
                className="p-1.5 sm:p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors flex items-center space-x-1 cursor-pointer"
                title="Salin kutipan teks resmi"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                    <span className="hidden sm:inline text-emerald-600">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Kutip</span>
                  </>
                )}
              </button>

              {item.hasPdf && item.pdfUrl && (
                <>
                  <a
                    href={item.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 sm:p-2 rounded-xl border border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors flex items-center space-x-1 shadow-xs cursor-pointer"
                    title="Buka file PDF di tab baru"
                  >
                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden md:inline">Tab Baru</span>
                  </a>

                  <a
                    href={item.pdfUrl}
                    download
                    className="p-1.5 sm:p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors flex items-center space-x-1 cursor-pointer"
                    title="Unduh file PDF resmi"
                  >
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden md:inline">Unduh</span>
                  </a>
                </>
              )}

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 sm:p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
                title={isFullscreen ? 'Keluar layar penuh' : 'Layar penuh'}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="w-full max-w-full">
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 leading-snug break-words">
              {item.judul}
            </h2>
          </div>

          {/* Metadata badges row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 w-full max-w-full">
            <div className="flex items-center space-x-2 min-w-0">
              <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Nomor Keputusan
                </span>
                <span className="font-semibold text-slate-800 font-mono text-[11px] select-all block truncate">
                  {item.nomor}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 min-w-0">
              <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Tanggal Penetapan
                </span>
                <span className="font-medium text-slate-800 block truncate">
                  {item.tanggal}
                </span>
              </div>
            </div>
          </div>

          {/* 🌟 RINGKASAN PUTUSAN FATWA CARD 🌟 */}
          <RingkasanCard
            ringkasan={item.ringkasan}
          />
        </div>
      </div>

      {/* PDF E-Reader Swipe Stage */}
      <div className="flex-1 relative bg-slate-900 min-h-[350px] sm:min-h-[420px] flex flex-col overflow-hidden w-full max-w-full">
        {item.hasPdf && embedUrl ? (
          <ElegantPdfReader
            pdfUrl={embedUrl}
            title={item.judul}
            originalPdfUrl={item.pdfUrl!}
          />
        ) : (
          /* When PDF file is not available as single standalone digital PDF */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-300 bg-slate-900 w-full max-w-full">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1.5">
              Naskah Kompilasi Fisik
            </h4>
            <p className="text-xs text-slate-300 max-w-xs mb-4 leading-relaxed">
              Dokumen keputusan ini diterbitkan dalam buku jilid resmi{' '}
              <strong className="text-white">"Himpunan Fatwa MUI"</strong> atau katalog naskah cetak nasional. Ringkasan putusan di atas telah tercatat lengkap dalam repositori.
            </p>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={handleCopyCitation}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors shadow-sm cursor-pointer"
              >
                Salin Rujukan Fatwa
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
