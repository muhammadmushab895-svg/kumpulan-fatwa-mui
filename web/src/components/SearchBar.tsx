import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import type { CategoryFilter, EraFilter, SortOrder } from '../types/fatwa';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: CategoryFilter;
  setSelectedCategory: (c: CategoryFilter) => void;
  selectedEra: EraFilter;
  setSelectedEra: (e: EraFilter) => void;
  sortOrder: SortOrder;
  setSortOrder: (s: SortOrder) => void;
  categoryCounts: Record<string, number>;
  eraCounts: Record<string, number>;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

const CATEGORIES: CategoryFilter[] = [
  'Semua',
  'Ibadah',
  'POM & Iptek',
  'Sosial & Budaya',
  'Hasil Ijtima Ulama',
  'Aqidah & Pemikiran',
  'Buku & Kompilasi'
];

const ERAS: EraFilter[] = [
  'Semua',
  '2020-an',
  '2010-an',
  '2000-an',
  '1990-an',
  '1980-an',
  '1970-an'
];

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedEra,
  setSelectedEra,
  sortOrder,
  setSortOrder,
  categoryCounts,
  onResetFilters,
  hasActiveFilters
}) => {
  return (
    <div className="bg-white border-b border-slate-200/80 shadow-xs sticky top-[53px] sm:top-[69px] z-20 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3 space-y-2.5 w-full max-w-full">
        {/* Search Input and Sort bar */}
        <div className="flex flex-col sm:flex-row gap-2 w-full max-w-full">
          {/* Search box */}
          <div className="relative flex-1 min-w-0 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari fatwa (vaksin, kripto, shalat, 1980)..."
              className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all placeholder:text-slate-400 text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Era filter & Sort */}
          <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-hidden">
            <select
              value={selectedEra}
              onChange={(e) => setSelectedEra(e.target.value as EraFilter)}
              className="flex-1 sm:flex-none px-2.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 text-slate-700 cursor-pointer min-w-0"
            >
              <option value="Semua">Semua Era (1976-2026)</option>
              {ERAS.filter(e => e !== 'Semua').map(era => (
                <option key={era} value={era}>
                  Era {era}
                </option>
              ))}
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="flex-1 sm:flex-none px-2.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 text-slate-700 cursor-pointer min-w-0"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="title">Judul A-Z</option>
              <option value="number">Nomor</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="px-2 py-1.5 sm:py-2 text-[11px] sm:text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors flex items-center gap-1 flex-shrink-0 cursor-pointer"
                title="Reset semua filter"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills (horizontal scrollable) */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5 text-xs w-full max-w-full scrollbar-none">
          <span className="text-slate-400 font-medium flex items-center gap-1 mr-0.5 flex-shrink-0 text-[11px]">
            <Filter className="w-3 h-3" />
            Tema:
          </span>
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat] || 0;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-full font-medium transition-all whitespace-nowrap flex items-center space-x-1 flex-shrink-0 cursor-pointer text-[11px] sm:text-xs ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
