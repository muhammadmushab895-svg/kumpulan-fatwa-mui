import React from 'react';
import type { FatwaItem } from '../types/fatwa';
import { Bookmark, FileText, Calendar, AlertCircle, Scale } from 'lucide-react';

interface FatwaCardProps {
  item: FatwaItem;
  isSelected: boolean;
  isBookmarked: boolean;
  onSelect: () => void;
  onToggleBookmark: (e: React.MouseEvent) => void;
}

export const getCategoryColor = (kategori: string) => {
  switch (kategori) {
    case 'Ibadah':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    case 'POM & Iptek':
      return 'bg-amber-50 text-amber-700 border-amber-200/80';
    case 'Sosial & Budaya':
      return 'bg-blue-50 text-blue-700 border-blue-200/80';
    case 'Hasil Ijtima Ulama':
      return 'bg-purple-50 text-purple-700 border-purple-200/80';
    case 'Aqidah & Pemikiran':
      return 'bg-rose-50 text-rose-700 border-rose-200/80';
    case 'Buku & Kompilasi':
      return 'bg-slate-100 text-slate-700 border-slate-300';
    default:
      return 'bg-teal-50 text-teal-700 border-teal-200/80';
  }
};

const getStatusBadgeStyle = (badgeColor?: string) => {
  switch (badgeColor) {
    case 'rose':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'amber':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'purple':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'blue':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'emerald':
    default:
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  }
};

export const FatwaCard: React.FC<FatwaCardProps> = ({
  item,
  isSelected,
  isBookmarked,
  onSelect,
  onToggleBookmark
}) => {
  const catColor = getCategoryColor(item.kategori);
  const statusStyle = getStatusBadgeStyle(item.ringkasan?.badgeColor);

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-2xl border transition-all duration-150 cursor-pointer text-left relative group ${
        isSelected
          ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
          : 'bg-white hover:bg-slate-50/80 border-slate-200/90 hover:border-slate-300 shadow-xs'
      }`}
    >
      {/* Top row: Category, Year, Status Putusan Badge, Bookmark */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
          <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${catColor}`}
          >
            {item.kategori}
          </span>
          {item.tahun && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {item.tahun}
            </span>
          )}
          {item.ringkasan?.statusHukum && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${statusStyle}`}
            >
              <Scale className="w-2.5 h-2.5" />
              {item.ringkasan.statusHukum.split('/')[0].trim()}
            </span>
          )}
        </div>

        <button
          onClick={onToggleBookmark}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isBookmarked
              ? 'text-amber-500 hover:text-amber-600 bg-amber-50'
              : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
          }`}
          title={isBookmarked ? 'Hapus dari tersimpan' : 'Simpan fatwa ini'}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
        </button>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug mb-1.5 line-clamp-2">
        {item.judul}
      </h3>

      {/* Fatwa Number & Date */}
      <div className="space-y-1 text-xs text-slate-500 mb-2.5">
        <div className="flex items-center space-x-1 font-mono text-[11px] text-slate-600 line-clamp-1">
          <FileText className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
          <span className="truncate">{item.nomor}</span>
        </div>
        <div className="flex items-center space-x-1 text-[11px] text-slate-400">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{item.tanggal}</span>
        </div>
      </div>

      {/* Tags & PDF indicator */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
        <div className="flex items-center space-x-1 flex-wrap gap-1">
          {item.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
            >
              #{tag}
            </span>
          ))}
          {item.tags.length > 2 && (
            <span className="text-[10px] text-slate-400">
              +{item.tags.length - 2}
            </span>
          )}
        </div>

        <div>
          {item.hasPdf ? (
            <span className="inline-flex items-center text-emerald-700 font-medium text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
              PDF Online
            </span>
          ) : (
            <span className="inline-flex items-center text-amber-700 text-[10px] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
              <AlertCircle className="w-3 h-3 mr-0.5" />
              Naskah Cetak
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
