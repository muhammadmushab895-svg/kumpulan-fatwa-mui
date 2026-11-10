import fs from 'fs';
import path from 'path';

function decodeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeCategory(rawTema) {
  const t = rawTema.trim();
  if (/HASIL IJTIMA/i.test(t)) return 'Hasil Ijtima Ulama';
  if (/POM/i.test(t)) return 'POM & Iptek';
  if (/Aqidah|Aliran/i.test(t)) return 'Aqidah & Pemikiran';
  if (/Ibadah/i.test(t)) return 'Ibadah';
  if (/Sosial/i.test(t)) return 'Sosial & Budaya';
  if (/Buku/i.test(t)) return 'Buku & Kompilasi';
  return 'Lainnya';
}

function extractKeywords(title, category, noStr) {
  const lower = (title + ' ' + category + ' ' + noStr).toLowerCase();
  const tags = new Set();

  const rules = [
    { tag: 'Vaksin & Imunisasi', rx: /vaksin|imunisasi|pfizer|sinovac|astrazeneca|meningitis|campak|rubella/ },
    { tag: 'Halal & Pangan', rx: /halal|pangan|makanan|minuman|alkohol|bir|mikroba|ragi|gelatin|hewan|sembelih|daging/ },
    { tag: 'Medis & Kesehatan', rx: /medis|kesehatan|organ|donor|transplantasi|covid|corona|aborsi|kontrasepsi|kb|haid/ },
    { tag: 'Shalat & Ibadah', rx: /shalat|salat|jumat|musafir|kiblat|masjid|ramadhan|puasa|syawal|tarawih|idul/ },
    { tag: 'Haji & Zakat', rx: /haji|umrah|zakat|infak|sedekah|zis|qurban|kurban/ },
    { tag: 'Keluarga & Pernikahan', rx: /nikah|kawin|cerai|keluarga|waris|beda agama/ },
    { tag: 'Sosial & Politik', rx: /mpr|pemilu|negara|pancasila|sosial|korupsi|dana desa|pajak|lingkungan|sampah/ },
    { tag: 'Muamalah & Ekonomi Syariah', rx: /uang|elektronik|asuransi|jiwa|bunga|bank|zakat fitrah|rekening/ },
    { tag: 'Aqidah & Ajaran', rx: /aliran|sesat|jamaah|baiat|quran|tafsir|panji gumilang|ahmadiyah/ },
    { tag: 'Iptek & Digital', rx: /internet|digital|kartu|uang elektronik|teknologi|kripto|medsos|hoaks/ }
  ];

  for (const r of rules) {
    if (r.rx.test(lower)) {
      tags.add(r.tag);
    }
  }

  return Array.from(tags);
}

function main() {
  const rawPath = path.resolve('data/fatwamui_scraped.json');
  if (!fs.existsSync(rawPath)) {
    console.error('File not found:', rawPath);
    process.exit(1);
  }

  const rawList = JSON.parse(fs.readFileSync(rawPath, 'utf-8'));
  console.log(`Processing ${rawList.length} items...`);

  const enriched = rawList.map((item, idx) => {
    const judul = decodeHtml(item.judul);
    const nomor = decodeHtml(item.nomor);
    const kategori = normalizeCategory(item.tema);
    const tanggal = decodeHtml(item.tanggal);
    
    let tahun = item.tahun;
    if (!tahun) {
      const match = (tanggal + ' ' + nomor).match(/\b(19\d\d|20\d\d)\b/);
      if (match) tahun = parseInt(match[1], 10);
    }

    // Determine Era
    let era = 'Lainnya';
    if (tahun) {
      if (tahun < 1980) era = '1970-an';
      else if (tahun < 1990) era = '1980-an';
      else if (tahun < 2000) era = '1990-an';
      else if (tahun < 2010) era = '2000-an';
      else if (tahun < 2020) era = '2010-an';
      else era = '2020-an';
    }

    const tags = extractKeywords(judul, kategori, nomor);

    let pdfUrl = item.pdfUrl;
    let hasPdf = true;
    if (!pdfUrl || pdfUrl === '#' || !pdfUrl.startsWith('http')) {
      hasPdf = false;
      pdfUrl = null;
    }

    return {
      id: item.id || `fatwa-${idx + 1}`,
      no: item.no,
      judul,
      nomor,
      kategori,
      tanggal,
      tahun,
      era,
      tags,
      hasPdf,
      pdfUrl,
      source: item.source
    };
  });

  // Sort by year descending (newest first), then by no
  enriched.sort((a, b) => {
    const yearA = a.tahun || 0;
    const yearB = b.tahun || 0;
    if (yearB !== yearA) return yearB - yearA;
    return b.no - a.no;
  });

  const outPath = path.resolve('data/fatwa_catalog.json');
  fs.writeFileSync(outPath, JSON.stringify(enriched, null, 2), 'utf-8');
  console.log(`Enriched catalog saved to ${outPath}`);

  // Summary statistics
  const byKategori = {};
  const byEra = {};
  let withPdfCount = 0;

  enriched.forEach(e => {
    byKategori[e.kategori] = (byKategori[e.kategori] || 0) + 1;
    byEra[e.era] = (byEra[e.era] || 0) + 1;
    if (e.hasPdf) withPdfCount++;
  });

  console.log('\n--- Kategori ---');
  console.table(byKategori);

  console.log('\n--- Era Dekade ---');
  console.table(byEra);

  console.log(`\nTotal Dokumen: ${enriched.length}`);
  console.log(`Dengan Direct PDF File: ${withPdfCount} (${((withPdfCount / enriched.length) * 100).toFixed(1)}%)`);
}

main();
