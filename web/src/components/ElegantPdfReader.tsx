import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  BookOpen,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

interface ElegantPdfReaderProps {
  pdfUrl: string;
  title: string;
  originalPdfUrl?: string;
}

export const ElegantPdfReader: React.FC<ElegantPdfReaderProps> = ({
  pdfUrl,
  title
}) => {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(() => (typeof window !== 'undefined' && window.innerWidth < 640 ? 0.95 : 1.25));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | 'none'>('none');
  const [viewMode, setViewMode] = useState<'reader' | 'native'>('reader');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  // Touch Swipe tracking
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Load PDF Document
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setLoadError(null);
    setCurrentPage(1);

    const loadDoc = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          withCredentials: false
        });

        const doc = await loadingTask.promise;
        if (!isCancelled) {
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.warn('PDF.js loading issue:', err);
        if (!isCancelled) {
          setLoadError(err.message || 'Gagal memuat dokumen PDF via canvas');
          setIsLoading(false);
        }
      }
    };

    loadDoc();

    return () => {
      isCancelled = true;
    };
  }, [pdfUrl]);

  // Render Page to Canvas
  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDoc) return;

      try {
        const page = await pdfDoc.getPage(pageNum);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // Cancel previous render task if still in progress
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const dpr = window.devicePixelRatio || 1;
        
        // Auto fit width calculation
        let effectiveScale = scale;
        if (stageRef.current) {
          const stageW = stageRef.current.clientWidth;
          const isMobile = window.innerWidth < 640;
          const padding = isMobile ? 24 : 64;
          const maxAllowedWidth = Math.max(stageW - padding, 260);
          
          const rawViewport = page.getViewport({ scale: 1 });
          if (rawViewport.width * scale > maxAllowedWidth && isMobile) {
            effectiveScale = maxAllowedWidth / rawViewport.width;
          }
        }

        const viewport = page.getViewport({ scale: effectiveScale });

        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        canvas.style.maxWidth = '100%';

        context.setTransform(dpr, 0, 0, dpr, 0, 0);

        const renderContext: any = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;
        await task.promise;
      } catch (err: any) {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Render error:', err);
        }
      }
    },
    [pdfDoc, scale]
  );

  useEffect(() => {
    if (pdfDoc && viewMode === 'reader') {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale, viewMode, renderPage]);

  // Handle window resize to re-render responsive canvas
  useEffect(() => {
    let timeoutId: any;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (pdfDoc && viewMode === 'reader') {
          renderPage(currentPage);
        }
      }, 200);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [pdfDoc, viewMode, renderPage, currentPage]);

  // Navigation handlers
  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setSlideDirection('left');
      setCurrentPage((prev) => prev + 1);
      setTimeout(() => setSlideDirection('none'), 300);
    }
  }, [currentPage, totalPages]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      setSlideDirection('right');
      setCurrentPage((prev) => prev - 1);
      setTimeout(() => setSlideDirection('none'), 300);
    }
  }, [currentPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'reader') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrevPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextPage, goToPrevPage, viewMode]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 40;

    if (distance > minSwipeDistance) {
      // Swiped Left -> Next page
      goToNextPage();
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Previous page
      goToPrevPage();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.2));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.6));

  if (loadError || viewMode === 'native') {
    return (
      <div className="flex-1 flex flex-col bg-slate-900 text-white h-full w-full max-w-full overflow-hidden">
        <div className="bg-slate-950 px-3 sm:px-4 py-2 flex items-center justify-between text-xs border-b border-slate-800 w-full max-w-full">
          <div className="flex items-center space-x-2 truncate">
            <span className="text-slate-400 hidden xs:inline">Mode:</span>
            <span className="font-semibold text-emerald-400 text-[11px] sm:text-xs truncate">Viewer Browser</span>
          </div>
          <button
            onClick={() => {
              setLoadError(null);
              setViewMode('reader');
            }}
            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 rounded text-white font-medium transition-colors flex items-center gap-1 cursor-pointer text-[11px] flex-shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Mode Swipe</span>
          </button>
        </div>
        <iframe
          src={pdfUrl}
          title={title}
          className="w-full flex-1 border-none bg-slate-800 max-w-full"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden relative w-full max-w-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top E-Reader Control Bar */}
      <div className="bg-slate-900/95 backdrop-blur border-b border-slate-800 px-2.5 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between z-20 text-xs w-full max-w-full">
        {/* Left: Mode badge & Book title */}
        <div className="flex items-center space-x-1.5 truncate max-w-[140px] sm:max-w-xs min-w-0">
          <span className="px-1.5 sm:px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 flex-shrink-0">
            <BookOpen className="w-3 h-3" />
            Reader
          </span>
          <span className="text-slate-300 font-medium truncate text-[11px] hidden sm:inline">
            {title}
          </span>
        </div>

        {/* Center: Page Navigation (Previous, Counter, Next) */}
        <div className="flex items-center space-x-1 sm:space-x-2 bg-slate-800/90 px-2 sm:px-3 py-1 rounded-xl border border-slate-700 shadow-inner flex-shrink-0">
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1 || isLoading}
            className="p-1 rounded hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <span className="text-[11px] sm:text-xs font-semibold text-emerald-400 font-mono px-1">
            {isLoading ? '...' : `${currentPage} / ${totalPages}`}
          </span>

          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages || isLoading}
            className="p-1 rounded hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
            title="Halaman Berikutnya"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Right: Zoom & Mode Options */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 flex-shrink-0">
          <div className="flex items-center space-x-0.5 sm:space-x-1 bg-slate-800 px-1.5 sm:px-2 py-1 rounded-lg border border-slate-700">
            <button
              onClick={zoomOut}
              disabled={scale <= 0.6}
              className="p-0.5 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
              title="Perkecil"
            >
              <ZoomOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-300 px-0.5 sm:px-1">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              disabled={scale >= 2.2}
              className="p-0.5 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
              title="Perbesar"
            >
              <ZoomIn className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setViewMode('native')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300 text-[10px] sm:text-[11px] transition-colors cursor-pointer"
            title="Buka dalam mode viewer standar"
          >
            PDF Asli
          </button>
        </div>
      </div>

      {/* Main Reading Stage (Swipe Canvas Area) */}
      <div
        ref={stageRef}
        className="flex-1 overflow-x-hidden overflow-y-auto flex items-center justify-center p-2 sm:p-6 relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 w-full max-w-full"
      >
        {/* Left Floating Swipe Button */}
        <button
          onClick={goToPrevPage}
          disabled={currentPage <= 1 || isLoading}
          className="absolute left-1 sm:left-4 z-10 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white shadow-xl border border-slate-700/80 flex items-center justify-center transition-all duration-200 disabled:opacity-0 disabled:pointer-events-none hover:scale-110 cursor-pointer"
          title="Geser / Halaman Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
        </button>

        {/* Right Floating Swipe Button */}
        <button
          onClick={goToNextPage}
          disabled={currentPage >= totalPages || isLoading}
          className="absolute right-1 sm:right-4 z-10 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white shadow-xl border border-slate-700/80 flex items-center justify-center transition-all duration-200 disabled:opacity-0 disabled:pointer-events-none hover:scale-110 cursor-pointer"
          title="Geser / Halaman Berikutnya"
        >
          <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
        </button>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-xs z-30">
            <div className="w-8 h-8 sm:w-10 sm:h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2 sm:mb-3"></div>
            <p className="text-[11px] sm:text-xs text-slate-300 font-medium">Memuat halaman...</p>
          </div>
        )}

        {/* Interactive Canvas Page with Book Shadow */}
        <div
          className={`transition-transform duration-200 ease-out flex justify-center items-center max-w-full overflow-hidden ${
            slideDirection === 'left'
              ? '-translate-x-4 opacity-80'
              : slideDirection === 'right'
              ? 'translate-x-4 opacity-80'
              : 'translate-x-0 opacity-100'
          }`}
        >
          <div className="relative p-0.5 sm:p-1 bg-white rounded-md sm:rounded-lg shadow-2xl ring-1 ring-black/20 max-w-full overflow-hidden">
            <canvas
              ref={canvasRef}
              className="rounded shadow-inner max-w-full h-auto block bg-white"
            />
          </div>
        </div>
      </div>

      {/* Bottom Swipe Hint / Page Scrubber Bar */}
      <div className="bg-slate-900/90 border-t border-slate-800/80 px-3 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 z-20 w-full max-w-full overflow-hidden">
        <div className="flex items-center space-x-1.5 truncate pr-2">
          <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
            <ArrowLeft className="w-3 h-3" /> Geser Kiri / Kanan atau tombol panah keyboard <ArrowRight className="w-3 h-3" />
          </span>
          <span className="sm:hidden text-slate-400 truncate">
            Swipe layar untuk ganti halaman
          </span>
        </div>

        {/* Quick Page Jump Slider / Scrubber */}
        {totalPages > 1 && (
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono">Hal. {currentPage}</span>
            <input
              type="range"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => setCurrentPage(parseInt(e.target.value, 10))}
              className="w-16 sm:w-32 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono">{totalPages}</span>
          </div>
        )}
      </div>
    </div>
  );
};
