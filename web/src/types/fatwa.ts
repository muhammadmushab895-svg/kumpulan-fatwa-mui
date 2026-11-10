export interface RingkasanPutusan {
  statusHukum: string;
  badgeColor: 'emerald' | 'rose' | 'amber' | 'blue' | 'purple';
  intiPutusan: string;
  ketentuanPokok: string[];
  landasan: string;
}

export interface FatwaItem {
  id: string;
  no: number;
  judul: string;
  nomor: string;
  kategori: string;
  tanggal: string;
  tahun: number | null;
  era: string;
  tags: string[];
  hasPdf: boolean;
  pdfUrl: string | null;
  source: string;
  ringkasan?: RingkasanPutusan;
}

export type CategoryFilter = 
  | 'Semua' 
  | 'Ibadah' 
  | 'POM & Iptek' 
  | 'Sosial & Budaya' 
  | 'Hasil Ijtima Ulama' 
  | 'Aqidah & Pemikiran' 
  | 'Buku & Kompilasi';

export type EraFilter = 
  | 'Semua' 
  | '2020-an' 
  | '2010-an' 
  | '2000-an' 
  | '1990-an' 
  | '1980-an' 
  | '1970-an';

export type SortOrder = 'newest' | 'oldest' | 'title' | 'number';
