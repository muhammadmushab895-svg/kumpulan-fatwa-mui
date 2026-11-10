import React from 'react';
import { BookOpen, Bookmark, Download, Smartphone, X, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  totalFatwa: number;
  filteredCount: number;
  bookmarkedCount: number;
  showBookmarksOnly: boolean;
  onToggleBookmarks: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalFatwa,
  bookmarkedCount,
  showBookmarksOnly,
  onToggleBookmarks
}) => {
  const { isInstalled, showIOSModal, setShowIOSModal, promptInstall } = usePWAInstall();

  return (
    <>
      <header className="bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-950 text-white shadow-lg border-b border-emerald-800/60 sticky top-0 z-30 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 w-full max-w-full">
          <div className="flex items-center justify-between gap-2 w-full max-w-full">
            {/* Logo & Title */}
            <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-950/50 flex-shrink-0">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-base sm:text-xl font-bold tracking-tight text-white truncate">
                    Fatwa MUI
                  </h1>
                  <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex-shrink-0">
                    Komisi Fatwa
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-emerald-200/80 font-medium truncate hidden xs:block sm:block">
                  Arsip Resmi {totalFatwa} Fatwa (1976 – 2026)
                </p>
              </div>
            </div>

            {/* Right Buttons: PWA Install & Bookmark */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
              {/* PWA Install Button */}
              {!isInstalled ? (
                <button
                  onClick={promptInstall}
                  className="flex items-center space-x-1 sm:space-x-1.5 text-xs font-bold px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-950/40 border border-amber-300/80 transition-all duration-200 cursor-pointer active:scale-95 animate-pulse"
                  title="Pasang aplikasi di HP atau komputer Anda"
                >
                  <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  <span className="text-[11px] sm:text-xs">Install App</span>
                </button>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-900/60 px-2.5 py-1 rounded-lg border border-emerald-700/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Terpasang
                </span>
              )}

              {/* Bookmark Toggle */}
              <button
                onClick={onToggleBookmarks}
                className={`flex items-center space-x-1 sm:space-x-1.5 text-xs font-semibold px-2 sm:px-3 py-1.5 rounded-xl transition-all duration-200 border cursor-pointer ${
                  showBookmarksOnly
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-950/30'
                    : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border-emerald-700/80'
                }`}
                title="Tampilkan fatwa tersimpan"
              >
                <Bookmark className={`w-3.5 h-3.5 ${showBookmarksOnly ? 'fill-slate-950' : 'text-amber-300'}`} />
                <span className="hidden sm:inline">Tersimpan</span>
                <span className="text-[11px] font-bold">({bookmarkedCount})</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* iOS Safari PWA Install Guidance Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Download className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-2">
              Pasang di iPhone / iPad
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Untuk menginstal aplikasi <strong>Fatwa MUI</strong> di perangkat iOS Anda:
            </p>

            <ol className="text-xs text-slate-700 space-y-2.5 mb-5 pl-1">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Ketuk tombol <strong>Bagikan / Share</strong> (<Share className="w-3.5 h-3.5 inline mx-0.5" />) di bilah bawah Safari.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Gulir ke bawah dan pilih <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Ketuk <strong>Tambah (Add)</strong> di pojok kanan atas. Aplikasi akan langsung tersedia di layar utama HP Anda!
                </span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm cursor-pointer"
            >
              Mengerti, Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};
