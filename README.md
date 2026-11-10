# Repositori & Aplikasi Kumpulan Fatwa MUI (1975 – Sekarang)

Aplikasi web modern, responsif, dan berkinerja tinggi untuk menelusuri, membaca, dan mengunduh seluruh fatwa **Komisi Fatwa Majelis Ulama Indonesia (MUI)** dari awal berdirinya hingga saat ini secara online dengan cepat tanpa jeda (*zero latency search* & *fast streaming PDF viewer*).

---

## 📊 Statistik Koleksi Dokumen

* **Total Fatwa Terindeks:** **427 Fatwa Resmi**
* **Rentang Tahun:** **1976 hingga 2026** (Lengkap 5 Dekade)
* **Status Naskah PDF:** **417 Fatwa** (97.7%) memiliki file PDF otentik langsung yang dapat dibaca dan diunduh online. Sisanya terdokumentasi dalam naskah himpunan buku fisik resmi.
* **Klasifikasi Kategori:**
  * **Hasil Ijtima Ulama Komisi Fatwa:** 150 keputusan
  * **Sosial Kemasyarakatan & Budaya:** 99 fatwa
  * **POM & Iptek (Pangan, Obat-obatan, Kosmetika, Teknologi):** 88 fatwa
  * **Ibadah:** 66 fatwa
  * **Aqidah & Pemikiran Keagamaan:** 18 fatwa
  * **Buku & Kompilasi Lima Dekade:** 6 karya
* **Sebaran Era:**
  * Era 2020-an: 110 dokumen
  * Era 2010-an: 155 dokumen
  * Era 2000-an: 98 dokumen
  * Era 1990-an: 17 dokumen
  * Era 1980-an: 32 dokumen
  * Era 1970-an: 15 dokumen (mulai dari fatwa pertama tahun 1976)

---

## ⚡ Fitur Utama Aplikasi

1. **Pencarian Kilat (< 5 ms):**
   * Cari berdasarkan kata kunci judul, topik (misal: *vaksin*, *kripto*, *shalat jumat*, *halal*, *perbankan*), nomor surat keputusan, maupun tahun.
2. **Filter Terpadu:**
   * Filter per tema/kategori dengan indikator jumlah dokumen *real-time*.
   * Filter per era dekade (1970-an hingga 2020-an).
   * Pengurutan: Tahun terbaru, terlama, nomor fatwa, atau abjad judul.
3. **Viewer PDF Online Cepat:**
   * Mendukung *fast streaming byte range* langsung ke dokumen PDF resmi.
   * Mode alternatif (Google Viewer fallback) jika browser mengalami kendala menampilkan PDF internal.
   * Tombol Buka Tab Baru, Unduh PDF Langsung, dan Layar Penuh (Fullscreen).
4. **Fitur Kutip & Bookmark (Tersimpan):**
   * Tombol **Kutip** untuk langsung menyalin format sitasi standar karya ilmiah / artikel.
   * Fitur **Simpan / Bookmark** yang tersimpan otomatis di browser (localStorage).
5. **Responsif & Mobile Friendly:**
   * Di laptop/desktop: Tampilan *split screen* (daftar di kiri, PDF di kanan).
   * Di HP/tablet: Tampilan daftar nyaman dengan modal viewer layar penuh.

---

## 🚀 Cara Menjalankan Aplikasi

Pastikan Node.js (versi 18+) sudah terpasang di komputer Anda.

### 1. Masuk ke folder web dan jalankan dev server
```bash
cd web
npm run dev
```
Aplikasi akan langsung berjalan di `http://localhost:5173`.

### 2. Membangun untuk Production (Deploy)
```bash
cd web
npm run build
```
Hasil build ada di folder `web/dist` dan siap di-upload ke Vercel, Cloudflare Pages, Netlify, atau web hosting mana saja.

---

## 🔄 Pembaruan Data Otomatis (Pipeline)

Jika MUI menerbitkan fatwa-fatwa baru di kemudian hari, Anda cukup menjalankan skrip pipeline berikut untuk memperbarui katalog secara otomatis:

```bash
cd pipeline
# 1. Ambil data terbaru dari portal resmi MUI
node scrape_fatwamui.mjs

# 2. Bersihkan dan susun indeks metadata & tags
node enrich_catalog.mjs

# 3. Salin katalog terbaru ke web
copy data\fatwa_catalog.json ..\web\src\data\fatwa_catalog.json
```

---

## 📁 Struktur Direktori

```
fatwa-mui-app/
├── pipeline/
│   ├── scrape_fatwamui.mjs       # Scraper arsip Komisi Fatwa MUI
│   ├── enrich_catalog.mjs        # Pembersih teks, normalisasi kategori, & tagger
│   └── data/
│       ├── fatwamui_scraped.json # Data mentah scraping
│       └── fatwa_catalog.json    # Katalog terstruktur lengkap 427 fatwa
├── web/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx        # Navigasi & statistik
│   │   │   ├── SearchBar.tsx     # Pencarian & filter tema/era
│   │   │   ├── FatwaCard.tsx     # Kartu ringkasan fatwa
│   │   │   └── DocumentViewer.tsx# Viewer PDF online & alat kutipan
│   │   ├── data/
│   │   │   └── fatwa_catalog.json
│   │   ├── types/
│   │   │   └── fatwa.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── vite.config.ts            # Konfigurasi Vite & proxy PDF streaming
│   └── package.json
└── README.md
```
