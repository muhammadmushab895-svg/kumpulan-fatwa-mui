import fs from 'fs';
import path from 'path';

// Load catalog
const catalogPath = path.resolve('pipeline/data/fatwa_catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
const textDir = path.resolve('pipeline/data/pdf_texts');

console.log(`Starting thorough audit across all ${catalog.length} fatwas...`);

// Curated verified rulings for critical fatwas and scanned/special documents
const SPECIAL_AUDIT = {
  // Scanned documents or complex multi-faceted rulings
  'fatwa-419': { // 2/MUNASXI/MUI/2025 Pajak Berkeadilan
    statusHukum: 'Mubah (Boleh) Demi Kemaslahatan / Wajib Adil',
    badgeColor: 'emerald',
    intiPutusan: 'Pajak pada dasarnya boleh (mubah) dipungut oleh negara untuk membiayai kemaslahatan umum, namun wajib berkeadilan, tidak membebani rakyat kecil, dan bebas dari korupsi serta penyelewengan.',
    ketentuanPokok: [
      'Negara berhak memungut pajak jika kas negara tidak mencukupi untuk pembiayaan kebutuhan pokok rakyat (kemaslahatan ammah).',
      'Pemungutan pajak harus memenuhi prinsip keadilan (proporsional), tidak zalim, dan transparan dalam alokasinya.',
      'Rakyat berpenghasilan rendah dan miskin wajib dibebaskan dari pungutan pajak yang memberatkan.',
      'Penyalahgunaan, pemborosan, dan korupsi dana pajak hukumnya haram mutlak.'
    ],
    landasan: 'Tasharruf al-imam \'alar-ra\'iyyah manuuthun bil-mashlahah (Kebijakan pemerintah harus berorientasi pada kemaslahatan rakyat)'
  },
  'fatwa-235': { // Fatwa 38/2023 Wanita Menjadi Khatib Shalat Jumat
    statusHukum: 'Haram & Shalat Jumat Tidak Sah',
    badgeColor: 'rose',
    intiPutusan: 'Wanita menjadi khatib dalam rangkaian shalat Jumat bagi jamaah laki-laki hukumnya haram dan shalat Jumat tersebut tidak sah menurut kesepakatan empat mazhab.',
    ketentuanPokok: [
      'Khatib shalat Jumat dengan jamaah laki-laki disyaratkan harus seorang laki-laki muslim (dzukuroh).',
      'Khotbah Jumat yang disampaikan oleh wanita bagi jamaah laki-laki tidak sah dan tidak menggugurkan kewajiban shalat Jumat.',
      'Jamaah laki-laki yang mengikuti shalat Jumat berkhatibkan wanita wajib mengulang shalatnya dengan shalat Zhuhur.'
    ],
    landasan: 'Ijma\' Ulama Mazhab Arba\'ah & Sunnah Mutawatirah'
  },
  'fatwa-236': { // Fatwa 21/2023 Mushaf Tidak Layak Guna
    statusHukum: 'Boleh Dibakar / Dikubur Secara Terhormat',
    badgeColor: 'emerald',
    intiPutusan: 'Mushaf Al-Qur\'an yang sudah rusak dan tidak layak dibaca boleh ditangani dengan cara dibakar secara terhormat atau dikubur di tempat yang suci demi menjaga kemuliaan firman Allah.',
    ketentuanPokok: [
      'Tindakan pemusnahan mushaf rusak harus diniatkan semata-mata untuk menjaga kehormatan kalamullah (li shiyanatihi).',
      'Pembakaran dilakukan secara tuntas hingga menjadi abu, atau dikubur di tempat yang aman dari injakan kaki manusia.',
      'Dilarang keras membuang mushaf ke tempat sampah atau membiarkannya berserakan.'
    ],
    landasan: 'Atsar Khalifah Utsman bin Affan RA saat membakar mushaf selain Mushaf Imam'
  },
  'fatwa-237': { // Fatwa 34/2023 Kurban Saat LSD dan PPR
    statusHukum: 'Sah untuk Gejala Ringan, Tidak Sah untuk Gejala Berat',
    badgeColor: 'amber',
    intiPutusan: 'Hewan yang terjangkit Lumpy Skin Disease (LSD) atau Peste des Petits Ruminants (PPR) dengan gejala ringan sah dijadikan hewan kurban, sedangkan yang bergejala berat tidak sah.',
    ketentuanPokok: [
      'Gejala ringan (benjolan kecil tidak pecah, nafsu makan baik, tidak kurus) sah dan mencukupi syarat kurban.',
      'Gejala berat (benjolan bernanah/pecah, pincang, kurus parah hingga hilang sumsum) tidak sah dijadikan kurban.',
      'Hewan bergejala berat yang sembuh setelah hari Tasyrik berstatus sedekah biasa, bukan hewan kurban.'
    ],
    landasan: 'Arba\'atun la tujzi\'u fid-dhahaya: al-arja\' al-bayyinu dhal\'uha, wal-maridhah al-bayyinu maradhuha...'
  },
  'fatwa-97': { // Fatwa 32/2022 Kurban Saat PMK
    statusHukum: 'Sah untuk Gejala Ringan, Tidak Sah untuk Gejala Berat',
    badgeColor: 'amber',
    intiPutusan: 'Hewan kurban yang terinfeksi Penyakit Mulut dan Kuku (PMK) bergejala klinis ringan sah dikurbankan, namun jika bergejala berat (kuku lepas, lumpuh, kurus ekstrem) maka tidak sah.',
    ketentuanPokok: [
      'Gejala ringan (lepuh ringan pada bibir/lidah, tidak pincang, tidak kurus ekstrem) sah sebagai kurban.',
      'Gejala berat (kuku melepuh hingga terlepas, tidak bisa berjalan, kurus drastis) tidak sah.',
      'Pemerintah dan panitia kurban wajib menjamin protokol biosecurity dan pemotongan higienis.'
    ],
    landasan: 'Hadis Nabi SAW tentang 4 cacat hewan yang membatalkan keabsahan kurban'
  },
  'fatwa-425': { // 5/MUNAS XI/MUI/2025 Rekening Dormant
    statusHukum: 'Hak Milik Tetap Sah / Haram Dihanguskan',
    badgeColor: 'emerald',
    intiPutusan: 'Saldo dana pada rekening pasif (dormant) adalah hak milik sah nasabah atau ahli warisnya, haram dialihkan atau dihanguskan sepihak oleh lembaga perbankan.',
    ketentuanPokok: [
      'Bank wajib melindungi simpanan nasabah dan mempermudah prosedur pengaktifan kembali.',
      'Biaya administrasi rekening dormant tidak boleh menggerus saldo pokok hingga habis.',
      'Bila nasabah wafat tanpa ahli waris, pengalihan dana harus melalui penetapan Baitul Mal untuk kemaslahatan umum.'
    ],
    landasan: 'Hurmatul malil muslim (Keharaman mengambil harta seorang muslim tanpa kerelaannya)'
  },
  'fatwa-426': { // 102/2025 ZIS untuk Jaminan Sosial
    statusHukum: 'Boleh (Mubah) untuk Mustahik Miskin',
    badgeColor: 'emerald',
    intiPutusan: 'Pemanfaatan dana zakat, infak, dan sedekah untuk pembayaran iuran jaminan sosial ketenagakerjaan bagi pekerja rentan dan fakir miskin dibolehkan (mubah).',
    ketentuanPokok: [
      'Penerima bantuan iuran wajib memenuhi kriteria asnaf fakir atau miskin yang rentan kehilangan nafkah.',
      'Menghindarkan pekerja rentan dan keluarganya jatuh ke dalam kemiskinan ekstrem bila terjadi kecelakaan kerja atau kematian.',
      'Pengelolaan harus transparan dan akuntabel oleh amil zakat resmi.'
    ],
    landasan: 'Maqashid Syariah: Hifzhun Nafs wa Hifzhul Mal'
  },
  'fatwa-427': { // Fatwa 73/2026 ZIS untuk Iuran JKN
    statusHukum: 'Boleh (Mubah) bagi Mustahik',
    badgeColor: 'emerald',
    intiPutusan: 'Penyaluran dana ZIS dalam bentuk pembayaran iuran kepesertaan program Jaminan Kesehatan Nasional (JKN/BPJS) bagi fakir miskin hukumnya mubah dan dianjurkan demi jaminan akses kesehatan.',
    ketentuanPokok: [
      'Diperuntukkan khusus bagi mustahik fakir miskin yang menunggak atau belum terdaftar PBI.',
      'Merupakan bentuk bantuan pemenuhan hajat dasar kesehatan (ikhtiar pengobatan).',
      'Penyaluran dilakukan melalui koordinasi amil zakat resmi dengan BPJS Kesehatan.'
    ],
    landasan: 'Ad-Dharuratu Tuqaddaru bi Qadariha & Maslahah Ammah'
  },
  'fatwa-395': {
    statusHukum: 'Katalog Kodifikasi Resmi',
    badgeColor: 'blue',
    intiPutusan: 'Buku kompilasi monograf perjalanan dan perkembangan fatwa MUI serta perannya dalam dinamika kemaslahatan bangsa.',
    ketentuanPokok: ['Dokumentasi metodologi penetapan fatwa Komisi Fatwa MUI.', 'Referensi ilmiah fatwa nusantara.'],
    landasan: 'Tadwin al-ahkam'
  },
  'fatwa-396': {
    statusHukum: 'Katalog Kodifikasi Resmi',
    badgeColor: 'purple',
    intiPutusan: 'Himpunan keputusan konsensus Ijtima Ulama Komisi Fatwa se-Indonesia mengenai problematika keagamaan kontemporer.',
    ketentuanPokok: ['Rujukan ijtihad jama\'i para ulama fatwa se-Indonesia.', 'Panduan hukum syariah dan kebangsaan.'],
    landasan: 'Al-Ijma\' wa al-Ittifaq'
  },
  'fatwa-422': {
    statusHukum: 'Katalog Kodifikasi Resmi',
    badgeColor: 'blue',
    intiPutusan: 'Buku rekam jejak lima dekade (50 tahun) Komisi Fatwa MUI dan biografi para ulama berpengaruh di balik setiap penetapan fatwa.',
    ketentuanPokok: ['Biografi ulama perumus fatwa sejak 1975 hingga sekarang.', 'Dokumentasi sejarah hukum Islam Indonesia.'],
    landasan: 'Tadwin at-Turats'
  },
  'fatwa-415': {
    statusHukum: 'Prosiding Konferensi Fatwa',
    badgeColor: 'blue',
    intiPutusan: 'Prosiding resmi Konferensi Internasional Fatwa Ke-8 (IACFS 8 2024) mengenai respons fatwa terhadap isu-isu global.',
    ketentuanPokok: ['Kumpulan riset ilmiah fiqh internasional.', 'Pedoman transformasi hukum Islam kontemporer.'],
    landasan: 'Al-Bahth al-Ilmi'
  }
};

export { SPECIAL_AUDIT };
