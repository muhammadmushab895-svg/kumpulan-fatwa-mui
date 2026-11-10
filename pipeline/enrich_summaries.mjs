import fs from 'fs';
import path from 'path';

function determineSummary(item) {
  const title = item.judul.toLowerCase();
  const nomor = (item.nomor || '').toLowerCase();
  const kat = item.kategori;

  let statusHukum = 'Ketetapan Syariah';
  let badgeColor = 'emerald';
  let intiPutusan = '';
  let ketentuanPokok = [];
  let landasan = 'Prinsip Kemaslahatan & Maqashid Syariah';

  // 1. VAKSIN & IMUNISASI
  if (/vaksin|imunisasi|meningitis|pfizer|sinovac|astrazeneca|rubella|campak/.test(title)) {
    if (/haram|najis/.test(title)) {
      statusHukum = 'Haram dengan Pengecualian Darurat';
      badgeColor = 'rose';
      intiPutusan = 'Penggunaan vaksin yang mengandung unsur najis pada dasarnya haram, namun diperbolehkan (mubah) dalam kondisi darurat medis atau hajat syar\'iyyah apabila belum ditemukan vaksin yang suci dan halal.';
      ketentuanPokok = [
        'Ketiadaan vaksin pengganti yang suci dan berkhasiat sebanding.',
        'Keterangan dokter/ahli kompeten bahwa penyakit tersebut mengancam jiwa atau cacat permanen.',
        'Pemerintah wajib mengupayakan ketersediaan vaksin yang halal dan suci.'
      ];
      landasan = 'Ad-Dharuratu Tubihul Mahzhurat (Kondisi darurat membolehkan hal terlarang)';
    } else {
      statusHukum = 'Boleh (Mubah) / Halal';
      badgeColor = 'emerald';
      intiPutusan = 'Penggunaan vaksin dinyatakan suci dan halal atau mubah (boleh) untuk perlindungan kesehatan dan kekebalan tubuh masyarakat dari wabah penyakit berbahaya.';
      ketentuanPokok = [
        'Bahan baku dan proses produksi telah diverifikasi bebas dari najis berat (mughalladhah).',
        'Imunisasi merupakan bagian dari ikhtiar menjaga kelangsungan hidup (hifzh an-nafs).',
        'Umat Islam dianjurkan berpartisipasi demi terbentuknya kekebalan kelompok (herd immunity).'
      ];
      landasan = 'Hifzhun Nafs (Kewajiban menjaga keselamatan jiwa)';
    }
  }
  // 2. MAKANAN / MINUMAN / POM / PENYEMBELIHAN
  else if (/alkohol|khamr|bir|arak/.test(title)) {
    statusHukum = 'Haram';
    badgeColor = 'rose';
    intiPutusan = 'Minuman beralkohol (khamr) dan produk turunan industri minuman keras berstatus haram mutlak untuk dikonsumsi maupun diperjualbelikan.';
    ketentuanPokok = [
      'Segala jenis minuman yang memabukkan terkategori khamr dan dihukumi haram sedikit maupun banyak.',
      'Sisa pengolahan bir (brewer yeast) tidak boleh digunakan langsung kecuali telah disucikan sesuai standar syar\'i.',
      'Dilarang memfasilitasi peredaran minuman beralkohol di tempat umum.'
    ];
    landasan = 'Kullu muskirin khamrun wa kullu khamrin haram';
  }
  else if (/sembelih|mekanis|hewan|daging|ayam|unggas/.test(title)) {
    statusHukum = 'Halal Bersyarat';
    badgeColor = 'emerald';
    intiPutusan = 'Penyembelihan hewan (termasuk secara mekanis/mesin modern) dinyatakan sah dan halal dikonsumsi apabila memenuhi rukun dan syarat penyembelihan syar\'i.';
    ketentuanPokok = [
      'Penyembelih harus seorang muslim yang berakal dan membaca basmalah.',
      'Alat penyembelih harus tajam dan memutus saluran nafas (halqum), saluran makan (mari\'), dan dua urat leher (wadajain).',
      'Pingsan sebelum sembelih (stunning) hanya dibolehkan jika tidak mematikan hewan sebelum disembelih.'
    ];
    landasan = 'Innallaha kataba al-ihsana \'ala kulli syai\'in fa idza dzabahtum fa ahsinudz-dzibhah';
  }
  else if (/mikroba|ragi|gelatin|flavor|perisa|pewarna|pangan|kosmetika|obat/.test(title) || kat === 'POM & Iptek') {
    statusHukum = 'Halal / Mubah dengan Standar Syariah';
    badgeColor = 'emerald';
    intiPutusan = 'Penggunaan bahan pangan, kosmetika, dan obat-obatan dibolehkan (halal) selama bahan asal dan media pertumbuhannya suci serta bebas dari kontaminasi najis.';
    ketentuanPokok = [
      'Media pertumbuhan mikroba tidak boleh bersumber atau terkontaminasi najis hewani yang diharamkan.',
      'Wajib melalui audit kehalalan oleh lembaga pemeriksa halal terakreditasi.',
      'Memberikan rasa aman dan kepastian hukum bagi konsumen muslim.'
    ];
    landasan = 'Al-ashlu fil asy-ya\'i al-ibahah hatta yadulla ad-dalilu \'ala tahrimiha';
  }
  // 3. IBADAH (SHALAT, PUASA, RAMADHAN, ZIS, HAJI)
  else if (/shalat|salat|jumat|musafir|kiblat|masjid|tarawih/.test(title)) {
    statusHukum = 'Pedoman Fiqh & Keringanan (Rukhsah)';
    badgeColor = 'blue';
    intiPutusan = 'Memberikan ketetapan tata cara pelaksanaan ibadah shalat sesuai tuntunan syariat, termasuk keringanan (rukhsah) bagi musafir, petugas darurat, atau kondisi khusus.';
    ketentuanPokok = [
      'Musafir yang memenuhi syarat safar berhak mendapatkan keringanan jamak dan qashar serta penggantian shalat Jumat jika di atas kapal/kendaraan.',
      'Penetapan arah kiblat dapat menggunakan perhitungan astronomis (hisab falakiyah) yang akurat.',
      'Shalat berjamaah di masa darurat mengikuti protokol kemaslahatan tanpa mengubah esensi rukun shalat.'
    ];
    landasan = 'Yuridullahu bikumul yusra wa la yuridu bikumul \'usr';
  }
  else if (/zakat|infak|sedekah|zis|qurban|kurban/.test(title)) {
    statusHukum = 'Boleh (Mubah) / Rekomendasi Syariah';
    badgeColor = 'emerald';
    intiPutusan = 'Penyaluran dan pengelolaan ZIS untuk program jaminan sosial, perlindungan tenaga kerja, dan kesehatan masyarakat miskin dibolehkan demi kemaslahatan asnaf.';
    ketentuanPokok = [
      'Penerima manfaat harus termasuk ke dalam 8 asnaf penerima zakat (terutama fakir dan miskin).',
      'Penyaluran dalam bentuk iuran perlindungan sosial memberikan manfaat berkelanjutan bagi mustahik.',
      'Lembaga pengelola wajib menjaga amanah, transparansi, dan akuntabilitas syariah.'
    ];
    landasan = 'Innamash shadaqatu lil fuqara\'i wal masakin...';
  }
  else if (/haji|umrah|daftar haji|usia dini/.test(title)) {
    statusHukum = 'Boleh (Mubah) dengan Aturan Prioritas';
    badgeColor = 'emerald';
    intiPutusan = 'Ketetapan mengenai tata cara pendaftaran, pembiayaan, dan pelaksanaan rukun haji sesuai kemampuan (istitha\'ah) finansial, fisik, dan administrasi.';
    ketentuanPokok = [
      'Pendaftaran haji sejak usia dini dibolehkan sebagai ikhtiar persiapan dengan tetap memprioritaskan calon lansia yang belum pernah haji.',
      'Dana setoran awal calon jamaah wajib dikelola pada instrumen keuangan syariah yang bebas riba.',
      'Kewajiban haji berlaku satu kali seumur hidup bagi yang istitha\'ah.'
    ];
    landasan = 'Wa lillahi \'alan-nasi hijjul baiti manistatha\'a ilaihi sabila';
  }
  else if (/ramadan|ramadhan|syawal|idul|hilal|rukyah|hisab/.test(title)) {
    statusHukum = 'Ketetapan Ibadah Bersama';
    badgeColor = 'purple';
    intiPutusan = 'Panduan penetapan awal bulan hijriyah (Ramadan, Syawal, Dzulhijjah) melalui integrasi metode hisab imkanur rukyah dan sidang isbat pemerintah.';
    ketentuanPokok = [
      'Menghimbau umat Islam mengikuti penetapan resmi Sidang Isbat Kementerian Agama bersama MUI.',
      'Mengedepankan ukhuwah islamiyah dan saling menghormati atas potensi perbedaan kriteria derajat hilal.',
      'Mengoptimalkan amalan ibadah, zakat fitrah, dan kegiatan sosial selama bulan suci.'
    ];
    landasan = 'Shumu li ru\'yatihi wa afthiru li ru\'yatihi';
  }
  // 4. AQIDAH & ALIRAN SESAT / PEMIKIRAN
  else if (/aliran|sesat|jamaah|baiat|panji gumilang|ahmadiyah|lia eden|syiah/.test(title) || kat === 'Aqidah & Pemikiran') {
    statusHukum = 'Menyimpang / Terlarang';
    badgeColor = 'rose';
    intiPutusan = 'Ajaran atau aliran keagamaan yang mengingkari rukun iman, rukun Islam, atau mendistorsi penafsiran Al-Qur\'an dan Sunnah secara batil dinyatakan menyimpang dan sesat.';
    ketentuanPokok = [
      'Masyarakat muslim diwajibkan membentengi akidah keluarga dari pengaruh doktrin aliran menyimpang.',
      'Aparat penegak hukum dihimbau bertindak tegas terhadap penodaan agama sesuai perundang-undangan.',
      'Mengedepankan langkah dakwah persuasif dan konseling bagi pengikut agar kembali ke ajaran Ahlus Sunnah wal Jama\'ah.'
    ];
    landasan = 'Waqul ja\'al haqqu wa zahaqal bathil innal bathila kana zahuqa';
  }
  // 5. EKONOMI, KEUANGAN & DIGITAL
  else if (/uang elektronik|kartu|rekening dormant|uang hilang|saldo/.test(title)) {
    statusHukum = 'Boleh (Mubah) / Hak Milik Dilindungi';
    badgeColor = 'emerald';
    intiPutusan = 'Dana saldo pada kartu uang elektronik atau rekening dormant tetap merupakan hak milik nasabah yang sah dan wajib dijaga oleh pihak penerbit/bank.';
    ketentuanPokok = [
      'Saldo uang elektronik yang hilang atau kedaluwarsa tidak boleh dihanguskan secara sepihak oleh penyedia jasa.',
      'Rekening pasif (dormant) harus dikelola secara hati-hati dan dikembalikan kepada pemilik sah atau ahli warisnya.',
      'Penyedia jasa keuangan syariah wajib mengedepankan prinsip keadilan dan transparansi akad wadiah/qardh.'
    ];
    landasan = 'La ta\'kulu amwalakum bainakum bil bathil';
  }
  else if (/kripto|bitcoin|mata uang kripto/.test(title)) {
    statusHukum = 'Haram Alat Tukar / Boleh Sil\'ah Bersyarat';
    badgeColor = 'amber';
    intiPutusan = 'Mata uang kripto (cryptocurrency) haram digunakan sebagai alat pembayaran resmi, namun aset digital dapat diperdagangkan jika memiliki underlying asset yang jelas dan terbebas dari spekulasi liar.';
    ketentuanPokok = [
      'Tidak sah sebagai alat bayar sah di wilayah NKRI karena bertentangan dengan UU Mata Uang.',
      'Mengandung unsur gharar (ketidakpastian tinggi), maysir (judi), dan fluktuasi ekstrem tanpa jaminan fisik.',
      'Sebagai komoditas investasi, hanya dibolehkan jika memiliki wujud fisik/proyek riil dan regulasi pemerintah.'
    ];
    landasan = 'Naha Rasulullahi SAW \'an bai\'il gharar';
  }
  else if (/bunga|bank|riba|pinjaman|bunga bank/.test(title)) {
    statusHukum = 'Haram (Riba)';
    badgeColor = 'rose';
    intiPutusan = 'Bunga (interest) yang dikenakan dalam transaksi perbankan, pinjaman, dan lembaga keuangan konvensional dihukumi sebagai riba yang diharamkan syariat.';
    ketentuanPokok = [
      'Setiap tambahan atas pokok hutang yang disyaratkan di awal termasuk kategori riba nasiah.',
      'Umat Islam dianjurkan beralih dan bertransaksi menggunakan layanan perbankan dan lembaga keuangan syariah.',
      'Pengembangan ekonomi umat wajib dibangun atas dasar akad bagi hasil (mudharabah/musyarakah) dan jual beli yang adil.'
    ];
    landasan = 'Wa ahallallahul bai\'a wa harramar riba';
  }
  // 6. SOSIAL, POLITIK & LINGKUNGAN HIDUP
  else if (/sampah|lingkungan|sungai|danau|laut|hutan/.test(title)) {
    statusHukum = 'Wajib Melestarikan / Haram Merusak';
    badgeColor = 'purple';
    intiPutusan = 'Menjaga kebersihan dan kelestarian alam hukumnya wajib, sedangkan membuang sampah sembarangan dan mencemari ekosistem sungai/laut dihukumi haram.';
    ketentuanPokok = [
      'Tindakan mencemari lingkungan menimbulkan mafsadat (kerusakan) luas bagi kelangsungan ekosistem.',
      'Pemerintah dan korporasi wajib menyediakan fasilitas daur ulang dan penegakan hukum bagi perusak alam.',
      'Pengelolaan sampah berbasis masyarakat bernilai ibadah dan sedekah jariyah.'
    ];
    landasan = 'Wa la tufssidu fil ardhi ba\'da ishlahiha';
  }
  else if (/korupsi|dana desa|pajak|suap|politik uang/.test(title)) {
    statusHukum = 'Haram Mutlak';
    badgeColor = 'rose';
    intiPutusan = 'Penyalahgunaan kewenangan publik, korupsi anggaran (termasuk dana desa), suap menyuap (risywah), dan politik uang hukumnya haram mutlak.';
    ketentuanPokok = [
      'Dana publik dan bantuan sosial merupakan amanah umat yang wajib dipertanggungjawabkan di dunia dan akhirat.',
      'Pemberi, penerima, dan perantara suap politik sama-sama mendapatkan laknat syariat.',
      'Masyarakat wajib mengawasi tata kelola anggaran negara secara transparan dan berkeadilan.'
    ];
    landasan = 'La\'ana Rasulullahi SAW ar-rasyi wal murtasyi';
  }
  else if (/narkotika|narkoba|ganja|miras/.test(title)) {
    statusHukum = 'Haram Mutlak';
    badgeColor = 'rose';
    intiPutusan = 'Penyalahgunaan, peredaran gelap, dan konsumsi zat narkotika, psikotropika, dan zat adiktif terlarang adalah haram mutlak.';
    ketentuanPokok = [
      'Narkotika merusak akal sehat, menghancurkan masa depan generasi muda, dan menimbulkan kejahatan sosial.',
      'Penggunaan terbatas dalam dunia medis hanya dibolehkan atas resep dokter ahli dan pengawasan ketat.',
      'Mendukung hukuman maksimal bagi para bandar dan pengedar narkotika.'
    ];
    landasan = 'Wa la tulqu bi aidikum ilat-tahlukah';
  }
  else if (/rokok|merokok/.test(title)) {
    statusHukum = 'Haram di Tempat Umum / Anak / Hamil';
    badgeColor = 'amber';
    intiPutusan = 'Merokok di tempat umum, di dekat anak-anak, dan bagi wanita hamil dihukumi haram, serta makruh untuk kondisi lainnya karena mudarat bagi kesehatan.';
    ketentuanPokok = [
      'Asap rokok terbukti membahayakan kesehatan perokok aktif dan perokok pasif di sekitarnya.',
      'Pengeluaran belanja rokok termasuk kategori pemborosan (tabdzir) yang tercela.',
      'Mendorong penyediaan kawasan tanpa rokok dan edukasi gaya hidup sehat.'
    ];
    landasan = 'La dharara wa la dhirara fil Islam';
  }
  else if (/donor|organ|transplantasi|otopsi|bedah/.test(title)) {
    statusHukum = 'Boleh (Mubah) Bersyarat';
    badgeColor = 'emerald';
    intiPutusan = 'Donor organ tubuh (seperti kornea mata atau ginjal) setelah wafat atau saat hidup dibolehkan demi kemanusiaan dan menyelamatkan nyawa, tanpa komersialisasi.';
    ketentuanPokok = [
      'Harus atas kerelaan ikhlas dari pendonor atau ahli waris dan tidak boleh diperjualbelikan.',
      'Tidak membahayakan keselamatan nyawa donor yang masih hidup.',
      'Tindakan bedah transplantasi wajib dilakukan oleh tim medis yang ahli dan teruji.'
    ];
    landasan = 'Wa man ahyaha fa ka annama ahyan-nasa jami\'a';
  }
  // 7. HASIL IJTIMA ULAMA
  else if (kat === 'Hasil Ijtima Ulama' || /ijtima|munas/.test(title) || /ijtima/i.test(nomor)) {
    statusHukum = 'Konsensus Fiqh Nasional (Ittifaq)';
    badgeColor = 'purple';
    intiPutusan = 'Keputusan mufakat hasil musyawarah para ulama Komisi Fatwa se-Indonesia mengenai panduan hukum keagamaan dan kemaslahatan kebangsaan terkini.';
    ketentuanPokok = [
      'Merupakan rujukan ijtihad kolektif (ijtihad jama\'i) atas problematika hukum kontemporer.',
      'Menjadi pedoman bagi umat Islam, ormas keagamaan, serta rekomendasi kebijakan bagi pembuat regulasi.',
      'Menjunjung tinggi prinsip moderasi beragama (wasathiyah) dan persatuan bangsa.'
    ];
    landasan = 'Amruhum syura bainahum (Musyawarah antar ulama)';
  }
  // 8. BUKU / KOMPILASI
  else if (kat === 'Buku & Kompilasi') {
    statusHukum = 'Katalog Kodifikasi Resmi';
    badgeColor = 'blue';
    intiPutusan = 'Karya monograf resmi yang mengkodifikasi perjalanan fatwa, dinamisasi hukum Islam, dan biografi para ulama Komisi Fatwa MUI sepanjang lima dekade.';
    ketentuanPokok = [
      'Memuat sejarah dan metodologi penetapan fatwa Komisi Fatwa sejak tahun 1975.',
      'Dokumentasi komprehensif bagi peneliti hukum Islam, akademisi, dan masyarakat luas.',
      'Diterbitkan secara resmi oleh Majelis Ulama Indonesia sebagai khazanah fatwa nusantara.'
    ];
    landasan = 'Tadwin al-ahkam wa hifzh at-turats';
  }
  // 9. DEFAULT / GENERAL FALLBACK
  else {
    statusHukum = 'Ketetapan Hukum Syariah';
    badgeColor = 'emerald';
    intiPutusan = `Ketetapan hukum resmi Komisi Fatwa MUI mengenai "${item.judul}" guna memberikan kepastian hukum Islam dan bimbingan moral bagi umat.`;
    ketentuanPokok = [
      'Ditetapkan setelah melalui telaah dalil syar\'i (Al-Qur\'an, Hadis, Ijma\', Qiyas) dan pandangan para ulama mazhab.',
      'Mempertimbangkan masukan dari para pakar ahli dan kondisi faktual masyarakat.',
      'Wajib dijadikan pedoman perilaku dan pengambilan keputusan bagi kaum muslimin.'
    ];
    landasan = 'Fastabiqul khairat wa ta\'awanu \'alal birri wat-taqwa';
  }

  return {
    statusHukum,
    badgeColor,
    intiPutusan,
    ketentuanPokok,
    landasan
  };
}

function main() {
  const catalogPath = path.resolve('data/fatwa_catalog.json');
  if (!fs.existsSync(catalogPath)) {
    console.error('Catalog not found:', catalogPath);
    process.exit(1);
  }

  const items = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
  console.log(`Enriching ${items.length} fatwa items with Ringkasan Putusan...`);

  const enriched = items.map(item => {
    const ringkasan = determineSummary(item);
    return {
      ...item,
      ringkasan
    };
  });

  fs.writeFileSync(catalogPath, JSON.stringify(enriched, null, 2), 'utf-8');
  console.log(`Saved enriched catalog with summaries to ${catalogPath}`);

  // Also copy directly to web/src/data/fatwa_catalog.json
  const webDataPath = path.resolve('../web/src/data/fatwa_catalog.json');
  fs.writeFileSync(webDataPath, JSON.stringify(enriched, null, 2), 'utf-8');
  console.log(`Updated ${webDataPath}`);
}

main();
