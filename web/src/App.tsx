import React, { useState, useMemo, useEffect } from 'react';
import rawData from './data/fatwa_catalog.json';
import type { FatwaItem, CategoryFilter, EraFilter, SortOrder } from './types/fatwa';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { FatwaCard } from './components/FatwaCard';
import { DocumentViewer } from './components/DocumentViewer';
import { AlertCircle, X, ChevronLeft } from 'lucide-react';

export const App: React.FC = () => {
  const allFatwa = useMemo<FatwaItem[]>(() => rawData as FatwaItem[], []);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('Semua');
  const [selectedEra, setSelectedEra] = useState<EraFilter>('Semua');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  // Selection & Mobile view
  const [selectedId, setSelectedId] = useState<string | null>(allFatwa[0]?.id || null);
  const [isMobileViewerOpen, setIsMobileViewerOpen] = useState(false);

  // Bookmarks saved in localStorage
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fatwa_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('fatwa_bookmarks', JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Failed to save bookmarks to localStorage', e);
    }
  }, [bookmarks]);

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarks(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allFatwa.filter(item => {
      // Bookmark filter
      if (showBookmarksOnly && !bookmarks.includes(item.id)) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'Semua' && item.kategori !== selectedCategory) {
        return false;
      }

      // Era filter
      if (selectedEra !== 'Semua' && item.era !== selectedEra) {
        return false;
      }

      // Text search
      if (q) {
        const titleMatch = item.judul.toLowerCase().includes(q);
        const numberMatch = item.nomor.toLowerCase().includes(q);
        const dateMatch = item.tanggal.toLowerCase().includes(q);
        const yearMatch = item.tahun?.toString().includes(q);
        const tagMatch = item.tags.some(t => t.toLowerCase().includes(q));
        const categoryMatch = item.kategori.toLowerCase().includes(q);

        if (!titleMatch && !numberMatch && !dateMatch && !yearMatch && !tagMatch && !categoryMatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortOrder === 'newest') {
        const yearDiff = (b.tahun || 0) - (a.tahun || 0);
        if (yearDiff !== 0) return yearDiff;
        return b.no - a.no;
      }
      if (sortOrder === 'oldest') {
        const yearDiff = (a.tahun || 0) - (b.tahun || 0);
        if (yearDiff !== 0) return yearDiff;
        return a.no - b.no;
      }
      if (sortOrder === 'title') {
        return a.judul.localeCompare(b.judul);
      }
      if (sortOrder === 'number') {
        return a.nomor.localeCompare(b.nomor);
      }
      return 0;
    });
  }, [allFatwa, searchQuery, selectedCategory, selectedEra, sortOrder, showBookmarksOnly, bookmarks]);

  // Make sure selected item is valid or defaults to first in list
  useEffect(() => {
    if (filteredItems.length > 0) {
      const exists = filteredItems.some(i => i.id === selectedId);
      if (!exists) {
        setSelectedId(filteredItems[0].id);
      }
    } else {
      setSelectedId(null);
    }
  }, [filteredItems, selectedId]);

  const selectedItem = useMemo(() => {
    return allFatwa.find(i => i.id === selectedId) || null;
  }, [allFatwa, selectedId]);

  // Compute category counts for current non-category filters
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Semua: 0 };
    allFatwa.forEach(item => {
      if (showBookmarksOnly && !bookmarks.includes(item.id)) return;
      if (selectedEra !== 'Semua' && item.era !== selectedEra) return;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matches = 
          item.judul.toLowerCase().includes(q) ||
          item.nomor.toLowerCase().includes(q) ||
          item.tags.some(t => t.toLowerCase().includes(q)) ||
          item.tahun?.toString().includes(q);
        if (!matches) return;
      }

      counts['Semua'] = (counts['Semua'] || 0) + 1;
      counts[item.kategori] = (counts[item.kategori] || 0) + 1;
    });
    return counts;
  }, [allFatwa, showBookmarksOnly, bookmarks, selectedEra, searchQuery]);

  const eraCounts = useMemo(() => {
    const counts: Record<string, number> = { Semua: allFatwa.length };
    allFatwa.forEach(item => {
      counts[item.era] = (counts[item.era] || 0) + 1;
    });
    return counts;
  }, [allFatwa]);

  const hasActiveFilters = 
    searchQuery.trim() !== '' ||
    selectedCategory !== 'Semua' ||
    selectedEra !== 'Semua' ||
    sortOrder !== 'newest' ||
    showBookmarksOnly;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Semua');
    setSelectedEra('Semua');
    setSortOrder('newest');
    setShowBookmarksOnly(false);
  };

  const handleSelectFatwa = (id: string) => {
    setSelectedId(id);
    setIsMobileViewerOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans w-full max-w-full overflow-x-hidden">
      {/* Top Header with PWA Install Button */}
      <Header
        totalFatwa={allFatwa.length}
        filteredCount={filteredItems.length}
        bookmarkedCount={bookmarks.length}
        showBookmarksOnly={showBookmarksOnly}
        onToggleBookmarks={() => setShowBookmarksOnly(prev => !prev)}
      />

      {/* Sticky Search & Filter Toolbar */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedEra={selectedEra}
        setSelectedEra={setSelectedEra}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        categoryCounts={categoryCounts}
        eraCounts={eraCounts}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 overflow-x-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 lg:h-[calc(100vh-175px)] min-h-[500px] w-full max-w-full">
          {/* Left Column: Fatwa List */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden w-full max-w-full h-[650px] lg:h-full">
            {/* List Header Count */}
            <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium truncate">
                Menampilkan <strong className="text-slate-800">{filteredItems.length}</strong> dari {allFatwa.length} fatwa
              </span>
              {showBookmarksOnly && (
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex-shrink-0">
                  Tersimpan
                </span>
              )}
            </div>

            {/* Scrollable Fatwa Cards */}
            <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2.5 w-full max-w-full">
              {filteredItems.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-1">
                    Tidak Ditemukan Fatwa
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
                    Tidak ada fatwa yang cocok dengan pencarian atau filter yang dipilih.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                filteredItems.map(item => (
                  <FatwaCard
                    key={item.id}
                    item={item}
                    isSelected={selectedId === item.id}
                    isBookmarked={bookmarks.includes(item.id)}
                    onSelect={() => handleSelectFatwa(item.id)}
                    onToggleBookmark={(e) => toggleBookmark(item.id, e)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right Column: PDF Viewer Desktop */}
          <div className="hidden lg:flex lg:col-span-7 xl:col-span-8 flex-col h-full w-full max-w-full overflow-hidden">
            <DocumentViewer
              item={selectedItem}
              isBookmarked={selectedItem ? bookmarks.includes(selectedItem.id) : false}
              onToggleBookmark={() => selectedItem && toggleBookmark(selectedItem.id)}
            />
          </div>
        </div>
      </main>

      {/* Mobile Modal Viewer - Zero horizontal overflow */}
      {isMobileViewerOpen && selectedItem && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950 flex flex-col w-full h-full max-w-full overflow-hidden">
          {/* Mobile Top App Bar */}
          <div className="flex items-center justify-between bg-emerald-950 text-white px-3 py-2.5 border-b border-emerald-800/80 shadow-md flex-shrink-0 w-full max-w-full">
            <button
              onClick={() => setIsMobileViewerOpen(false)}
              className="flex items-center space-x-1 px-2 py-1 rounded-xl bg-emerald-900/80 text-emerald-200 text-xs font-medium cursor-pointer active:scale-95 flex-shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Daftar</span>
            </button>

            <span className="text-xs font-bold text-white truncate max-w-[200px] px-2 text-center">
              {selectedItem.judul}
            </span>

            <button
              onClick={() => setIsMobileViewerOpen(false)}
              className="p-1 rounded-xl bg-emerald-900/80 text-emerald-200 hover:text-white flex-shrink-0 cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Viewer Body */}
          <div className="flex-1 bg-white overflow-hidden flex flex-col w-full max-w-full">
            <DocumentViewer
              item={selectedItem}
              isBookmarked={bookmarks.includes(selectedItem.id)}
              onToggleBookmark={() => toggleBookmark(selectedItem.id)}
              onCloseMobile={() => setIsMobileViewerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
