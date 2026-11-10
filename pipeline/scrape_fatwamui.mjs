import fs from 'fs';
import path from 'path';

async function main() {
  console.log('Fetching https://fatwamui.com/data-fatwa ...');
  const res = await fetch('https://fatwamui.com/data-fatwa');
  const html = await res.text();
  console.log('HTML fetched, length:', html.length);

  const rowRegex = /<tr>\s*<td>(\d+)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>\s*<a href="([^"]+)"/g;
  
  const items = [];
  let match;
  while ((match = rowRegex.exec(html)) !== null) {
    const no = parseInt(match[1], 10);
    const judul = match[2].trim().replace(/\s+/g, ' ');
    const tema = match[3].trim().replace(/\s+/g, ' ');
    const nomor = match[4].trim().replace(/\s+/g, ' ');
    const tanggal = match[5].trim().replace(/\s+/g, ' ');
    const rawPdf = match[6].trim().replace(/&#039;/g, "'").replace(/&amp;/g, '&');

    // Extract year from tanggal or nomor if possible
    let tahun = null;
    const yearMatch = tanggal.match(/\b(19\d\d|20\d\d)\b/) || nomor.match(/\b(19\d\d|20\d\d)\b/);
    if (yearMatch) {
      tahun = parseInt(yearMatch[1], 10);
    }

    items.push({
      id: `fatwa-${no}`,
      no,
      judul,
      tema,
      nomor,
      tanggal,
      tahun,
      pdfUrl: rawPdf,
      source: 'fatwamui.com'
    });
  }

  console.log(`Successfully parsed ${items.length} fatwa entries.`);

  const themes = {};
  const years = {};
  items.forEach(item => {
    themes[item.tema] = (themes[item.tema] || 0) + 1;
    if (item.tahun) {
      years[item.tahun] = (years[item.tahun] || 0) + 1;
    } else {
      years['Unknown'] = (years['Unknown'] || 0) + 1;
    }
  });

  console.log('\n--- Kategori / Tema Fatwa ---');
  console.table(themes);

  console.log('\n--- Sebaran Tahun ---');
  console.log(Object.keys(years).sort().map(y => `${y}: ${years[y]}`).join(', '));

  const dataDir = path.resolve('data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const outputPath = path.join(dataDir, 'fatwamui_scraped.json');
  fs.writeFileSync(outputPath, JSON.stringify(items, null, 2), 'utf-8');
  console.log(`\nSaved dataset to ${outputPath}`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
