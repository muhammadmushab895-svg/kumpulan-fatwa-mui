import React, { useState } from 'react';
import type { RingkasanPutusan } from '../types/fatwa';
import {
  Scale,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  BookMarked,
  ShieldCheck,
  AlertOctagon,
  HelpCircle,
  FileCheck
} from 'lucide-react';

interface RingkasanCardProps {
  ringkasan?: RingkasanPutusan;
}

export const RingkasanCard: React.FC<RingkasanCardProps> = ({
  ringkasan
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  if (!ringkasan) return null;

  const getStatusBadgeStyle = (badgeColor: string) => {
    switch (badgeColor) {
      case 'rose':
        return {
          container: 'bg-rose-50 border-rose-200/80 text-rose-800',
          badge: 'bg-rose-600 text-white',
          icon: <AlertOctagon className="w-4 h-4 text-rose-600" />
        };
      case 'amber':
        return {
          container: 'bg-amber-50 border-amber-200/80 text-amber-800',
          badge: 'bg-amber-600 text-white',
          icon: <HelpCircle className="w-4 h-4 text-amber-600" />
        };
      case 'purple':
        return {
          container: 'bg-purple-50 border-purple-200/80 text-purple-800',
          badge: 'bg-purple-600 text-white',
          icon: <Scale className="w-4 h-4 text-purple-600" />
        };
      case 'blue':
        return {
          container: 'bg-blue-50 border-blue-200/80 text-blue-800',
          badge: 'bg-blue-600 text-white',
          icon: <FileCheck className="w-4 h-4 text-blue-600" />
        };
      case 'emerald':
      default:
        return {
          container: 'bg-emerald-50/90 border-emerald-200/80 text-emerald-900',
          badge: 'bg-emerald-600 text-white',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />
        };
    }
  };

  const style = getStatusBadgeStyle(ringkasan.badgeColor);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all duration-200 mb-3">
      {/* Header bar of Ringkasan */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200/70 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors"
      >
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center flex-shrink-0 shadow-xs">
            <Scale className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                Ringkasan Putusan Fatwa
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs ${style.badge}`}
              >
                {ringkasan.statusHukum}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Intisari ketetapan hukum syariah resmi Komisi Fatwa
            </p>
          </div>
        </div>

        <button
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          title={isExpanded ? 'Sembunyikan ringkasan' : 'Buka ringkasan'}
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-4 space-y-3 text-xs">
          {/* Inti Putusan Box */}
          <div className={`p-3.5 rounded-xl border ${style.container}`}>
            <div className="flex items-start space-x-2">
              <div className="mt-0.5 flex-shrink-0">{style.icon}</div>
              <div>
                <span className="font-bold block text-[11px] uppercase tracking-wide opacity-80 mb-0.5">
                  Diktum Putusan Pokok:
                </span>
                <p className="text-slate-900 leading-relaxed font-medium">
                  {ringkasan.intiPutusan}
                </p>
              </div>
            </div>
          </div>

          {/* Ketentuan Pokok / Poin Penting */}
          {ringkasan.ketentuanPokok && ringkasan.ketentuanPokok.length > 0 && (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Ketentuan & Syarat Pokok:
              </span>
              <ul className="space-y-1.5 pl-1">
                {ringkasan.ketentuanPokok.map((poin, idx) => (
                  <li
                    key={idx}
                    className="flex items-start space-x-2 text-slate-700 leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                    <span>{poin}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Landasan Syariah / Kaidah Fiqhiyah */}
          {ringkasan.landasan && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-1">
              <span className="font-semibold text-slate-600 flex items-center gap-1">
                <BookMarked className="w-3.5 h-3.5 text-emerald-600" />
                Landasan / Kaidah:
              </span>
              <span className="italic text-slate-700 font-serif">
                "{ringkasan.landasan}"
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
