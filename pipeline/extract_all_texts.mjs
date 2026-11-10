import fs from 'fs';
import path from 'path';

const outDir = path.resolve('pipeline/data/pdf_texts');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function main() {
  const pdfjsLib = await import('../web/node_modules/pdfjs-dist/legacy/build/pdf.mjs');
  const catalogPath = path.resolve('pipeline/data/fatwa_catalog.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

  console.log(`Loaded ${catalog.length} items from catalog.`);

  let pending = [];
  for (const item of catalog) {
    const outFile = path.join(outDir, `${item.id}.json`);
    if (!fs.existsSync(outFile) && item.pdfUrl && item.pdfUrl !== '#' && item.pdfUrl.startsWith('http')) {
      pending.push(item);
    }
  }

  console.log(`Found ${pending.length} pending PDFs to extract text from.`);

  let completed = 0;
  let failed = 0;
  const CONCURRENCY = 6;

  async function worker(items) {
    for (const item of items) {
      const outFile = path.join(outDir, `${item.id}.json`);
      try {
        const resp = await fetch(item.pdfUrl, {
          signal: AbortSignal.timeout(20000),
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
        }
        const arrayBuf = await resp.arrayBuffer();
        const doc = await pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuf),
          useSystemFonts: true
        }).promise;

        let fullText = '';
        for (let p = 1; p <= doc.numPages; p++) {
          try {
            const page = await doc.getPage(p);
            const content = await page.getTextContent();
            const pageStr = content.items.map(it => it.str).join(' ');
            fullText += `\n--- PAGE ${p} ---\n` + pageStr;
          } catch (pageErr) {
            fullText += `\n--- PAGE ${p} ERROR: ${pageErr.message} ---\n`;
          }
        }

        fs.writeFileSync(outFile, JSON.stringify({
          id: item.id,
          nomor: item.nomor,
          judul: item.judul,
          pdfUrl: item.pdfUrl,
          numPages: doc.numPages,
          text: fullText
        }, null, 2), 'utf-8');

        completed++;
        if (completed % 10 === 0 || completed === pending.length) {
          console.log(`[Progress] Extracted ${completed}/${pending.length} PDFs (failed: ${failed})`);
        }
      } catch (err) {
        failed++;
        console.error(`[Error] ID ${item.id} (${item.nomor}): ${err.message}`);
        // Write placeholder so we know it had an issue
        fs.writeFileSync(outFile, JSON.stringify({
          id: item.id,
          nomor: item.nomor,
          judul: item.judul,
          pdfUrl: item.pdfUrl,
          error: err.message,
          numPages: 0,
          text: ''
        }, null, 2), 'utf-8');
      }
    }
  }

  // Partition pending into chunks for workers
  const chunks = Array.from({ length: CONCURRENCY }, () => []);
  pending.forEach((item, idx) => {
    chunks[idx % CONCURRENCY].push(item);
  });

  await Promise.all(chunks.map(chunk => worker(chunk)));

  console.log(`Extraction complete! Total completed: ${completed}, failed: ${failed}`);
}

main().catch(err => {
  console.error('Fatal extractor error:', err);
  process.exit(1);
});
