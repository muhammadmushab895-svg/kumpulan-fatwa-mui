import React, { useState, useEffect } from 'react';
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
  Minimize2,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  FileCheck2
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
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'pdf'>('ringkasan');

  // Reset tab to 'ringkasan' whenever item changes
  useEffect(() => {
    setActiveTab('ringkasan');
  }, [item?.id]);

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
      {/* Tab Switcher Header (Sangat Rapi & Jelas di HP & Desktop) */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 sm:px-5 py-2 flex items-center justify-between flex-shrink-0 w-full max-w-full">
        {/* Dual Tab Buttons */}
        <div className="flex items-center space-x-1 sm:space-x-2 bg-slate-200/70 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('ringkasan')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ringkasan'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ringkasan Putusan</span>
          </button>

          {item.hasPdf && embedUrl && (
            <button
              onClick={() => setActiveTab('pdf')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'pdf'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Baca Naskah PDF</span>
              <span className="hidden sm:inline text-[10px] px-1 py-0.2 rounded bg-white/20 text-white font-normal">
                Swipe
              </span>
            </button>
          )}
        </div>

        {/* Global Fast Actions */}
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
            <span className="hidden md:inline">
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
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline text-emerald-600">Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Kutip</span>
              </>
            )}
          </button>

          {item.hasPdf && item.pdfUrl && (
            <a
              href={item.pdfUrl}
              download
              className="p-1.5 sm:p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors flex items-center space-x-1 cursor-pointer"
              title="Unduh file PDF resmi"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Unduh</span>
            </a>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 sm:p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
            title={isFullscreen ? 'Keluar layar penuh' : 'Layar penuh'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: RINGKASAN PUTUSAN SECARA UTUH (FULL SCREEN HEIGHT) */}
      {/* ======================================================== */}
      {activeTab === 'ringkasan' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50 w-full max-w-full">
          {/* Metadata Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${getCategoryColor(
                  item.kategori
                )}`}
              >
                {item.kategori}
              </span>
              {item.tahun && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Tahun {item.tahun}
                </span>
              )}
              <span className="text-xs text-slate-500 font-medium">
                Era {item.era}
              </span>
            </div>

            <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 leading-snug break-words">
              {item.judul}
            </h2>

            {/* Quick Metadata Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
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

            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 pt-1">
                <span className="text-[11px] text-slate-400 font-medium">Kata Kunci:</span>
                {item.tags.map(t => (
                  <span
                    key={t}
                    className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 🌟 TOMBOL UTAMA BACA PDF (PROMINENT CALL TO ACTION) 🌟 */}
          {item.hasPdf && embedUrl ? (
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-2xl p-4 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Naskah Asli Terverifikasi
                  </span>
                </div>
                <p className="text-sm font-semibold text-white">
                  Ingin membaca lembaran surat keputusan asli bertanda tangan?
                </p>
                <p className="text-xs text-emerald-200/80">
                  Dilengkapi pembaca PDF modern yang bisa digeser (swipe) kiri dan kanan.
                </p>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={() => setActiveTab('pdf')}
                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4 stroke-[2.5]" />
                  <span>Baca PDF Online</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                <a
                  href={item.pdfUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Buka PDF di tab baru"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                Dokumen keputusan ini tercatat resmi dalam naskah kompilasi cetak <strong>"Himpunan Fatwa MUI"</strong>.
              </span>
            </div>
          )}

          {/* 🌟 KARTU RINGKASAN PUTUSAN FATWA SECARA UTUH 🌟 */}
          <div className="space-y-2">
            <RingkasanCard
              ringkasan={item.ringkasan}
            />
          </div>

          {/* Tombol Baca PDF di Bagian Bawah juga agar mudah dijangkau setelah membaca ringkasan */}
          {item.hasPdf && embedUrl && (
            <div className="pt-2 text-center">
              <button
                onClick={() => setActiveTab('pdf')}
                className="w-full py-3 bg-white hover:bg-slate-50 border-2 border-emerald-600 text-emerald-800 font-bold text-xs rounded-2xl transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-emerald-600 stroke-[2.2]" />
                <span>Buka & Geser Lembaran PDF Asli Sekarang</span>
                <ArrowRight className="w-4 h-4 text-emerald-600 stroke-[2.2]" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: PEMBACA PDF ONLINE SWIPE (FULL SCREEN HEIGHT)   */}
      {/* ======================================================== */}
      {activeTab === 'pdf' && (
        <div className="flex-1 relative bg-slate-900 flex flex-col overflow-hidden w-full max-w-full h-full">
          {item.hasPdf && embedUrl ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden w-full max-w-full">
              {/* Back to Summary Bar (Khusus saat di mode PDF agar mudah balik ke ringkasan) */}
              <div className="bg-slate-950 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-xs text-white">
                <button
                  onClick={() => setActiveTab('ringkasan')}
                  className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer active:scale-95 text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Lihat Ringkasan Putusan</span>
                </button>

                <div className="flex items-center space-x-2">
                  <a
                    href={item.pdfUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1"
                  >
                    <span>Tab Baru</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Elegant PDF Reader Full Height */}
              <div className="flex-1 overflow-hidden w-full max-w-full">
                <ElegantPdfReader
                  pdfUrl={embedUrl}
                  title={item.judul}
                  originalPdfUrl={item.pdfUrl!}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-300 bg-slate-900 w-full max-w-full">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1.5">
                Naskah Kompilasi Fisik
              </h4>
              <p className="text-xs text-slate-300 max-w-xs mb-4 leading-relaxed">
                Dokumen keputusan ini diterbitkan dalam buku jilid resmi{' '}
                <strong className="text-white">"Himpunan Fatwa MUI"</strong>.
              </p>
              <button
                onClick={() => setActiveTab('ringkasan')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-sm cursor-pointer"
              >
                Kembali ke Ringkasan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
