import fs from 'fs';
import path from 'path';

function cleanText(raw) {
  if (!raw) return '';
  return raw
    .replace(/--- PAGE \d+ (ERROR:[^-\n]+)?---/g, ' ')
    .replace(/Komisi Fatwa Majelis Ulama Indonesia/gi, ' ')
    .replace(/FATWA MAJELIS ULAMA INDONESIA/gi, ' ')
    .replace(/HIMPUNAN FATWA MAJELIS ULAMA INDONESIA/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractDecisionSection(text) {
  const decideRegex = /(?:MEMUTUSKAN\s*(?:MENETAPKAN)?|Memfatwakan\s*:|telah mengambil keputusan\s*:|KEPUTUSAN\s*:)/i;
  const match = text.match(decideRegex);
  if (!match) return null;
  const startIdx = match.index + match[0].length;
  // Look for end markers: Rekomendasi, Ditetapkan di, Ketentuan Penutup, etc.
  const endMatch = text.slice(startIdx).match(/(?:Ditetapkan di|Ditetapkan\s*:|Ketiga\s*:|Keempat\s*:|Kelima\s*:|Rekomendasi\s*:)/i);
  const endIdx = endMatch ? startIdx + endMatch.index : startIdx + 2500;
  return text.substring(startIdx, endIdx).trim();
}

const files = fs.readdirSync('pipeline/data/pdf_texts');
console.log(`Checking extraction on sample 25 items...`);

const sampleIds = [
  'fatwa-414', // Zakat youtuber
  'fatwa-409', // Hubungan antarbangsa
  'fatwa-408', // Pencatatan perkawinan beda agama
  'fatwa-407', // Panduan hubungan antarumat beragama
  'fatwa-406', // Panduan akhlak negara
  'fatwa-393', // Panji gumilang
  'fatwa-390', // Palestina Fatwa 83/2023
  'fatwa-389', // Sel HEK 293 Fatwa 56/2023
  'fatwa-380', // Vaksin AstraZeneca Fatwa 14/2021
  'fatwa-377', // Vaksin Sinovac Fatwa 02/2021
  'fatwa-358', // Takbir dan Shalat Idul Fitri saat Covid Fatwa 28/2020
  'fatwa-321', // Vaksin MR Fatwa 33/2018
  'fatwa-308', // Imunisasi Fatwa 04/2016
  'fatwa-282', // Vaksin Meningitis Fatwa 06/2010
  'fatwa-238', // Bunga Bank 2004
  'fatwa-219', // Perkawinan Campuran 1980
  'fatwa-217', // Ahmadiyah Qadiyan 1980
  'fatwa-208', // Pil Anti Haid 1979
  'fatwa-190', // Ibadah Haji Hanya Sekali 1984
  'fatwa-171', // Uang Kripto 2021
  'fatwa-160', // Pinjol 2021
  'fatwa-153', // Perbankan Syariah 2008
  'fatwa-129', // Eksekusi Mati Narkoba 2015
  'fatwa-75',  // Rokok 2009
  'fatwa-68'   // Donor Kornea Mata 1979
];

for (const id of sampleIds) {
  const filePath = path.join('pipeline/data/pdf_texts', `${id}.json`);
  if (!fs.existsSync(filePath)) {
    console.log(`[${id}] File not found`);
    continue;
  }
  const item = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const cleaned = cleanText(item.text);
  const decision = extractDecisionSection(cleaned);
  console.log(`\n========================================`);
  console.log(`ID: ${id} | ${item.nomor} : ${item.judul}`);
  if (decision) {
    console.log(`DECISION EXTRACT (${decision.length} chars):`);
    console.log(decision.substring(0, 400) + '...');
  } else {
    console.log(`NO DECISION HEADER FOUND. First 300 chars:`);
    console.log(cleaned.substring(0, 300) + '...');
  }
}
