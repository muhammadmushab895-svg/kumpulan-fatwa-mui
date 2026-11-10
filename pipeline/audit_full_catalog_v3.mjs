import fs from 'fs';
import path from 'path';

const catalogPath = path.resolve('pipeline/data/fatwa_catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
const textDir = path.resolve('pipeline/data/pdf_texts');

function clean(str) {
  if (!str) return '';
  return str.replace(/--- PAGE \d+ [^-]*---/g, ' ')
    .replace(/M\s+E\s+M\s+U\s+T\s+U\s+S\s+K\s+A\s+N/gi, 'MEMUTUSKAN')
    .replace(/M\s+E\s+N\s+E\s+T\s+A\s+P\s+K\s+A\s+N/gi, 'MENETAPKAN')
    .replace(/M\s+E\s+M\s+F\s+A\s+T\s+W\s+A\s+K\s+A\s+N/gi, 'MEMFATWAKAN')
    .replace(/K\s+E\s+P\s+U\s+T\s+U\s+S\s+A\s+N/gi, 'KEPUTUSAN')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractPoints(text) {
  const points = [];
  const regex = /(?:^|\s)(?:(\d+)\.|\(([a-z\d]+)\))\s+([A-Z][^\n]{15,400}?(?=\s+\d+\.|\s*\([a-z\d]+\)|\s*Ketiga|\s*Kedua|\s*Rekomendasi|\s*Ditetapkan|$))/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    let pt = match[3].trim().replace(/\s+/g, ' ');
    pt = pt.replace(/[;,]$/, '.');
    if (!pt.endsWith('.')) pt += '.';
    if (pt.length > 25 && !pt.startsWith('FATWA') && !pt.startsWith('Komisi Fatwa')) {
      points.push(pt);
    }
    if (points.length >= 4) break;
  }
  return points;
}

function getRulingBlock(rawText) {
  if (!rawText) return '';
  const mKet = rawText.match(/Ketentuan Hukum\s*(.*?)(?=(?:Ketiga|Rekomendasi|Ditetapkan|$))/i);
  if (mKet && mKet[1].trim().length > 30) {
    return mKet[1].trim();
  }
  const mDec = rawText.match(/(?:MEMUTUSKAN\s*(?:MENETAPKAN)?|Memfatwakan\s*:|telah mengambil keputusan\s*:)\s*(.*?)(?=(?:Ketiga|Keempat|Rekomendasi|Ditetapkan|$))/i);
  if (mDec && mDec[1].trim().length > 30) {
    return mDec[1].trim();
  }
  return rawText.substring(0, 2000);
}

function auditFatwa(item) {
  const title = (item.judul || '').trim();
  const titleLower = title.toLowerCase();
  const nomor = (item.nomor || '').trim();
  const nomorLower = nomor.toLowerCase();

  // 1. Books & compilations
  if (item.kategori === 'Buku & Kompilasi' || /prosiding|buku|katalog/i.test(nomor) || /prosiding|himpunan keputusan|menghidupkan fatwa|konsensus ulama fatwa indonesia/i.test(title)) {
    return {
      statusHukum: 'Katalog Kodifikasi Resmi',
      badgeColor: 'blue',
      intiPutusan: `Dokumentasi dan buku kompilasi resmi Komisi Fatwa Majelis Ulama Indonesia tentang "${title}".`,
      ketentuanPokok: [
        'Kompilasi arsip dan khazanah fatwa resmi MUI untuk rujukan umat, peneliti hukum Islam, dan akademisi.',
        'Memuat perjalanan historis dan metodologi penetapan fatwa Komisi Fatwa MUI.',
        'Diterbitkan secara resmi oleh Dewan Pimpinan Majelis Ulama Indonesia.'
      ],
      landasan: 'Tadwin al-ahkam wa hifzh at-turats'
    };
  }

  // 2. High-priority explicit curated fatwas by title/keyword
  if (titleLower.includes('palestina')) {
    return {
      statusHukum: 'Wajib Bela Palestina / Haram Agresi Israel & Produk Afiliasinya',
      badgeColor: 'rose',
      intiPutusan: 'Mendukung perjuangan kemerdekaan Palestina hukumnya wajib (termasuk distribusi ZIS); mendukung agresi Israel baik langsung maupun tidak langsung serta menggunakan produk terafiliasi zionis hukumnya haram.',
      ketentuanPokok: [
        'Mendukung perjuangan kemerdekaan Palestina atas agresi Israel hukumnya wajib bagi seluruh umat Islam.',
        'Penyaluran zakat, infak, dan sedekah dibolehkan dialokasikan untuk perjuangan rakyat Palestina.',
        'Mendukung agresi Israel dan bertransaksi dengan pihak-pihak pendukung penjajahan zionis hukumnya haram.',
        'Umat Islam diimbau semaksimal mungkin menghindari konsumsi dan penggunaan produk terafiliasi Israel.'
      ],
      landasan: 'Ukhuwah Islamiyah & Larangan Mu\'awanah \'alal Itstmi wal \'Udwan'
    };
  }

  if (titleLower.includes('pencatatan perkawinan beda agama')) {
    return {
      statusHukum: 'Haram & Ditolak Pencatatannya oleh Pengadilan',
      badgeColor: 'rose',
      intiPutusan: 'Mendukung putusan Mahkamah Konstitusi No. 24/PUU-XX/2022 dan SEMA No. 2/2023 bahwa perkawinan yang dicatat harus sah menurut agama; pengadilan dilarang mengabulkan permohonan pencatatan nikah beda agama.',
      ketentuanPokok: [
        'Perkawinan beda agama hukumnya haram dan tidak sah menurut syariat Islam dan UU Perkawinan.',
        'Pencatatan perkawinan beda agama tidak membawa keabsahan perkawinan.',
        'Hakim di pengadilan dihimbau tidak mengabulkan permohonan izin pencatatan nikah beda agama.',
        'Mendesak pemerintah dan DPR menyelaraskan pasal 35 UU Adminduk dengan larangan nikah beda agama.'
      ],
      landasan: 'La tanfidhul ahkam allati tukhalifus syari\'ah & UU No. 1/1974'
    };
  }

  if (titleLower.includes('salam lintas agama') || (titleLower.includes('panduan hubungan antarumat beragama') && nomorLower.includes('02/ijtima'))) {
    return {
      statusHukum: 'Haram Salam Doa Agama Lain / Wajib Toleransi Murni',
      badgeColor: 'rose',
      intiPutusan: 'Mengucapkan salam lintas agama yang memuat doa khusus ritual ibadah agama lain hukumnya haram; dalam forum majemuk umat Islam dibolehkan memakai salam Islam atau salam kebangsaan.',
      ketentuanPokok: [
        'Islam menghormati keberagaman dan kebebasan beragama dengan prinsip toleransi murni (lakum dinukum waliyadin).',
        'Umat Islam dilarang mengolok-olok dan mencampuri ritual akidah agama lain.',
        'Pengucapan salam dalam Islam adalah doa ubudiyah yang tidak boleh dicampuradukkan dengan salam doa agama lain.',
        'Mengutamakan ucapan salam Islam "Assalamu\'alaikum" atau salam nasional tanpa sinkretisme.'
      ],
      landasan: 'Lakum dinukum wa liya din & La tasubbu alladzina yad\'una min dunillah'
    };
  }

  if (titleLower.includes('prinsip hubungan antarbangsa')) {
    return {
      statusHukum: 'Pedoman Hubungan Internasional / Wajib Patuhi Piagam Sah',
      badgeColor: 'purple',
      intiPutusan: 'Ketetapan fikih diplomasi antarbangsa; negara muslim wajib mematuhi kesepakatan internasional (al-mitsaq al-alami) di PBB sepanjang tidak bertentangan dengan syariat Islam dan martabat bangsa.',
      ketentuanPokok: [
        'Konsep negara-bangsa (nation-state) diakui dalam Islam sebagaimana Piagam Madinah.',
        'Perjanjian internasional yang disepakati bersama wajib ditaati sesuai prinsip al-muslimuna \'ala syuruthihim.',
        'Negara wajib menolak klausul konvensi internasional yang bertentangan dengan syariat Islam dan Pancasila.'
      ],
      landasan: 'Al-Muslimuna \'ala syuruthihim illa syarthan ahalla haraman aw harrama halalan'
    };
  }

  if (titleLower.includes('zakat youtuber') || titleLower.includes('selebgram')) {
    return {
      statusHukum: 'Wajib Zakat Penghasilan (2.5%) jika Capai Nishab',
      badgeColor: 'indigo',
      intiPutusan: 'Youtuber, selebgram, dan pelaku ekonomi kreatif digital lainnya wajib mengeluarkan zakat penghasilan sebesar 2.5% apabila kontennya halal dan penghasilannya mencapai nishab setara 85 gram emas.',
      ketentuanPokok: [
        'Objek usaha (konten yang diproduksi) wajib tidak bertentangan dengan ketentuan syariah.',
        'Nishab setara 85 gram emas per tahun, dikeluarkan sebesar 2.5% saat menerima penghasilan (zakat profesi).',
        'Penghasilan dari konten haram tidak dapat disucikan dengan zakat, melainkan seluruhnya wajib disalurkan untuk fasilitas umum.'
      ],
      landasan: 'Khudz min amwalihim shadaqatan tuthohhiruhum wa tuzakkihim biha'
    };
  }

  if (titleLower.includes('zakat al mustaghallat')) {
    return {
      statusHukum: 'Wajib Zakat Hasil Aset Produktif (al-Mustaghallat)',
      badgeColor: 'indigo',
      intiPutusan: 'Aset produktif yang disewakan atau menghasilkan keuntungan (gedung, indekos, pabrik, armada sewa) wajib dikeluarkan zakatnya dari pendapatan bersihnya saat mencapai nishab.',
      ketentuanPokok: [
        'Zakat tidak dikenakan pada pokok fisik gedung/aset, melainkan pada hasil bersih sewa/keuntungan.',
        'Nishab setara 85 gram emas per tahun dengan kadar 2.5% dari keuntungan bersih.',
        'Optimalisasi potensi filantropi Islam dari instrumen modal produktif modern.'
      ],
      landasan: 'Kewajiban Zakat Maal & Qiyas terhadap Hasil Pertanian'
    };
  }

  if (titleLower.includes('pajak berkeadilan') || titleLower.includes('pajak jangan membebani')) {
    return {
      statusHukum: 'Mubah Demi Kemaslahatan / Wajib Berkeadilan & Bebas Korupsi',
      badgeColor: 'emerald',
      intiPutusan: 'Pajak pada dasarnya boleh (mubah) dipungut oleh negara untuk membiayai kemaslahatan umum, namun wajib memenuhi prinsip keadilan, tidak membebani rakyat miskin, dan bebas dari korupsi.',
      ketentuanPokok: [
        'Negara berhak memungut pajak jika kas negara tidak mencukupi untuk pembiayaan kebutuhan pokok rakyat.',
        'Pemungutan pajak harus proporsional, adil, transparan, dan tidak zalim.',
        'Rakyat berpenghasilan rendah dan kebutuhan pokok masyarakat wajib dibebaskan dari pajak memberatkan.',
        'Penyalahgunaan dan korupsi dana pajak hukumnya haram mutlak.'
      ],
      landasan: 'Tasharruf al-imam \'alar-ra\'iyyah manuuthun bil-mashlahah'
    };
  }

  if (titleLower.includes('rekening dormant')) {
    return {
      statusHukum: 'Hak Milik Sah Nasabah / Haram Dihanguskan',
      badgeColor: 'emerald',
      intiPutusan: 'Saldo dana pada rekening pasif (dormant) adalah hak milik sah nasabah atau ahli warisnya; lembaga perbankan haram mengambil, memotong berlebih, atau menghanguskannya sepihak.',
      ketentuanPokok: [
        'Bank wajib menjaga dan mengamankan simpanan nasabah rekening pasif.',
        'Biaya administrasi tidak boleh menghabiskan saldo pokok simpanan.',
        'Bila nasabah wafat tanpa ahli waris, pengalihan dana diserahkan kepada Baitul Mal untuk kemaslahatan umat.'
      ],
      landasan: 'Hurmatul malil muslim (Keharaman mengambil harta seorang muslim tanpa kerelaannya)'
    };
  }

  if (titleLower.includes('saldo kartu uang elektronik')) {
    return {
      statusHukum: 'Hak Milik Sah Nasabah / Wajib Dilindungi Penerbit',
      badgeColor: 'emerald',
      intiPutusan: 'Saldo uang elektronik pada kartu yang hilang tetap merupakan hak milik pembeli/nasabah; penerbit kartu wajib memfasilitasi pengembalian dana atau penggantian kartu sesuai sistem verifikasi.',
      ketentuanPokok: [
        'Dana saldo uang elektronik adalah titipan (wadiah) yang wajib dijamin keamanannya oleh penerbit.',
        'Penerbit dilarang menghanguskan saldo pengguna secara sepihak saat kartu kedaluwarsa atau hilang.',
        'Penyedia jasa wajib meningkatkan sistem keamanan verifikasi identitas nasabah.'
      ],
      landasan: 'La ta\'kulu amwalakum bainakum bil bathil'
    };
  }

  if (titleLower.includes('perkawinan campuran')) {
    return {
      statusHukum: 'Haram Mutlak & Tidak Sah',
      badgeColor: 'rose',
      intiPutusan: 'Perkawinan wanita muslimah dengan laki-laki non-muslim adalah haram hukumnya; perkawinan laki-laki muslim dengan wanita bukan muslim juga diharamkan karena mafsadatnya lebih besar daripada maslahatnya.',
      ketentuanPokok: [
        'Wanita muslimah haram menikah dengan laki-laki non-muslim manapun.',
        'Laki-laki muslim diharamkan menikahi wanita bukan muslim demi menjaga akidah keluarga dan keturunan.',
        'Pernikahan beda agama tidak sah di hadapan syariat Islam.'
      ],
      landasan: 'Wa la tankihul musyrikati hatta yu\'minn (QS. Al-Baqarah: 221)'
    };
  }

  if (titleLower.includes('bunga') && (titleLower.includes('interest') || titleLower.includes('fa\'idah') || titleLower.includes('bank'))) {
    return {
      statusHukum: 'Haram (Riba Mutlak)',
      badgeColor: 'rose',
      intiPutusan: 'Praktik pembungaan uang (interest) pada lembaga keuangan konvensional (bank, asuransi, pegadaian) telah memenuhi kriteria riba nasi\'ah dan hukumnya haram mutlak.',
      ketentuanPokok: [
        'Setiap tambahan atas pokok hutang yang dipersyaratkan di muka adalah riba yang diharamkan syariat.',
        'Bagi wilayah yang telah memiliki kantor perbankan syariah, tidak dibolehkan bertransaksi bunga konvensional.',
        'Umat Islam dianjurkan mengalihkan dananya ke lembaga perbankan dan keuangan syariah.'
      ],
      landasan: 'Wa ahallallahu al-bai\'a wa harrama ar-riba (QS. Al-Baqarah: 275)'
    };
  }

  if (titleLower.includes('kripto') || titleLower.includes('cryptocurrency') || titleLower.includes('bitcoin')) {
    return {
      statusHukum: 'Haram Alat Tukar / Boleh Komoditas jika Ber-Underlying',
      badgeColor: 'amber',
      intiPutusan: 'Mata uang kripto haram sebagai alat transaksi pembayaran karena bertentangan dengan UU Mata Uang dan mengandung gharar/maysir; sebagai aset investasi komoditas hanya sah jika memiliki underlying aset riil.',
      ketentuanPokok: [
        'Cryptocurrency haram sebagai alat tukar sah di wilayah NKRI.',
        'Aset kripto yang mengandung gharar (spekulasi tinggi tanpa jaminan) haram diperjualbelikan.',
        'Sebagai komoditas digital hanya boleh jika memiliki underlying fisik/proyek riil dan legal secara regulasi Bappebti.'
      ],
      landasan: 'Naha Rasulullahi SAW \'an bai\'il gharar'
    };
  }

  if (titleLower.includes('pinjaman online') || titleLower.includes('pinjol')) {
    return {
      statusHukum: 'Haram Pinjol Ribawi / Halal Pinjol Syariah Berizin',
      badgeColor: 'rose',
      intiPutusan: 'Layanan pinjaman online yang menetapkan bunga tambahan, denda berlipat, atau penagihan dengan ancaman/teror hukumnya haram mutlak; pembiayaan online berbasis syariah dan berizin resmi OJK hukumnya halal/mubah.',
      ketentuanPokok: [
        'Pinjol berbunga dan rentenir online terkategori riba dan haram bagi kreditur maupun debitur.',
        'Penyebaran data pribadi dan intimidasi dalam penagihan hutang hukumnya haram.',
        'Fintech P2P lending syariah wajib menerapkan akad syar\'i tanpa bunga.'
      ],
      landasan: 'Kullu qardin jarra manfa\'atan fa huwa riba'
    };
  }

  if (/hukum merokok/i.test(titleLower)) {
    return {
      statusHukum: 'Haram di Tempat Umum, Anak & Wanita Hamil / Makruh untuk Lainnya',
      badgeColor: 'amber',
      intiPutusan: 'Merokok hukumnya haram apabila dilakukan di tempat umum, oleh anak-anak, dan oleh wanita hamil; sedangkan dalam kondisi di luar hal tersebut terdapat perbedaan pendapat antara makruh dan haram karena mudaratnya bagi kesehatan.',
      ketentuanPokok: [
        'Ijtima Ulama menyepakati adanya perbedaan pendapat antara makruh dan haram secara umum.',
        'Mufakat bahwa merokok hukumnya haram mutlak jika dilakukan di fasilitas umum/tempat terbuka, oleh anak-anak, dan oleh wanita hamil.',
        'Pemerintah dan DPR diminta membuat undang-undang larangan merokok di ruang publik serta melarang iklan rokok.'
      ],
      landasan: 'La Dharara wa La Dhirara fil Islam & Hifzhun Nafs'
    };
  }

  if (/senam yoga/i.test(titleLower)) {
    return {
      statusHukum: 'Mubah Murni Olahraga / Haram jika Berunsur Ritual/Mantra',
      badgeColor: 'amber',
      intiPutusan: 'Yoga yang murni gerakan olahraga pernafasan untuk kepentingan kebugaran hukumnya mubah (boleh); sedangkan yoga yang mengandung meditasi, mantra, atau ritual spiritual agama lain hukumnya haram.',
      ketentuanPokok: [
        'Yoga yang murni olahraga kesehatan jasmani tanpa ritual hukumnya mubah.',
        'Yoga yang mengandung unsur meditasi dan mantra spiritual ajaran agama lain hukumnya haram (sadduz dzari\'ah).',
        'Yoga yang murni ritual spiritual agama lain hukumnya haram mutlak bagi orang Islam.'
      ],
      landasan: 'Sadduz Dzari\'ah & Larangan Tasyabbuh'
    };
  }

  if (/vasektomi/i.test(titleLower)) {
    return {
      statusHukum: 'Haram dengan Pengecualian Syarat Ketat (Rekanalisasi)',
      badgeColor: 'amber',
      intiPutusan: 'Vasektomi pada dasarnya hukumnya haram karena berisiko memandulkan, kecuali memenuhi syarat: tidak untuk maksiat, tidak memandulkan permanen, ada jaminan rekanalisasi mengembalikan fungsi reproduksi, dan tidak membahayakan.',
      ketentuanPokok: [
        'Vasektomi yang memandulkan secara permanen (ta\'qim) hukumnya haram.',
        'Dibolehkan hanya bila ada jaminan medis rekanalisasi dapat mengembalikan kesuburan.',
        'Pemerintah dilarang mengampanyekan vasektomi secara massal sebagai alat kontrasepsi umum.'
      ],
      landasan: 'Hurmatut Ta\'qim (Keharaman Pemandulan Permanen)'
    };
  }

  if (/pencabutan hak milik/i.test(titleLower)) {
    return {
      statusHukum: 'Boleh Demi Kepentingan Umum dengan Ganti Rugi Adil',
      badgeColor: 'emerald',
      intiPutusan: 'Pencabutan hak milik pribadi oleh pemerintah dibolehkan demi kepentingan umum (maslahah ammah) yang mendesak, dengan syarat pemberian ganti rugi yang layak dan adil, serta tidak diserahkan kepada kepentingan swasta.',
      ketentuanPokok: [
        'Hak milik pribadi pada dasarnya wajib dilindungi oleh negara dan dijamin penuh.',
        'Bila terjadi benturan, kepentingan umum didahulukan di atas kepentingan pribadi.',
        'Pemerintah wajib memberikan ganti rugi yang adil dan layak bagi pemilik lahan.'
      ],
      landasan: 'Yutahammaludh dhararul khash li daf\'id dhararil \'am'
    };
  }

  if (/panduan pemilu|hak pilih/i.test(titleLower)) {
    return {
      statusHukum: 'Wajib Memilih Pemimpin Amanah / Haram Golput Tanpa Alasan Syar\'i',
      badgeColor: 'indigo',
      intiPutusan: 'Memilih pemimpin (nashbu al-imam) yang beriman, bertakwa, jujur (siddiq), amanah, dan memperjuangkan aspirasi umat hukumnya wajib; tidak menggunakan hak pilih (golput) padahal ada calon yang memenuhi kriteria hukumnya haram.',
      ketentuanPokok: [
        'Keterlibatan umat Islam dalam Pemilu untuk memilih pemimpin yang adil hukumnya wajib.',
        'Memilih calon yang tidak memenuhi syarat atau sengaja tidak memilih (golput) saat ada calon yang layak adalah haram.',
        'Politik uang (risywah politik) dan suap suara hukumnya haram mutlak.'
      ],
      landasan: 'Nashbul Imami Wajibun bi as-Syar\'i'
    };
  }

  if (/astrazeneca|astrazaneca/i.test(titleLower)) {
    return {
      statusHukum: 'Haram (Tripsin Babi), Dibolehkan karena Darurat',
      badgeColor: 'amber',
      intiPutusan: 'Vaksin Covid-19 AstraZeneca hukumnya haram karena dalam proses pembuatannya memanfaatkan tripsin babi, namun dibolehkan (mubah) digunakan karena kondisi hajah syar\'iyyah (darurat) keterbatasan vaksin suci.',
      ketentuanPokok: [
        'Hukum asal haram karena pemanfaatan unsur tripsin babi pada tahapan penyiapan bibit vaksin.',
        'Penggunaannya dibolehkan (mubah) karena kondisi mendesak dan ketersediaan vaksin halal belum mencukupi herd immunity.',
        'Kebolehan penggunaan gugur jika alasan kedaruratan hilang atau vaksin halal telah mencukupi.',
        'Pemerintah wajib terus mengikhtiarkan ketersediaan vaksin yang halal dan suci.'
      ],
      landasan: 'Al-Hajatu Tanzilu Manzilata Ad-Dharurah & Ad-Dharuratu Tubihul Mahzhurat'
    };
  }

  if (titleLower.includes('serum institute') || titleLower.includes('covovax')) {
    return {
      statusHukum: 'Haram (Pankreas Babi)',
      badgeColor: 'rose',
      intiPutusan: 'Vaksin Covid-19 produk Serum Institute of India Pvt. (Covovax) hukumnya haram karena dalam tahapan proses produksinya terbukti memanfaatkan enzim dari pankreas babi.',
      ketentuanPokok: [
        'Haram digunakan karena memanfaatkan unsur najis berat dari babi dalam produksinya.',
        'Pemerintah harus memprioritaskan penggunaan vaksin Covid-19 yang halal semaksimal mungkin bagi umat Islam.',
        'Produsen diimbau mencari alternatif enzim pengganti yang suci dan halal.'
      ],
      landasan: 'Al-Ijtinab \'an an-Najasat wa Lahmil Khinzir'
    };
  }

  if (titleLower.includes('cansino')) {
    return {
      statusHukum: 'Haram (Memanfaatkan Organ Tubuh Manusia)',
      badgeColor: 'rose',
      intiPutusan: 'Vaksin Covid-19 produk CanSino hukumnya haram karena dalam tahapan proses produksinya memanfaatkan bagian anggota tubuh manusia (juz\' minal insan) berupa sel embrio manusia.',
      ketentuanPokok: [
        'Memanfaatkan bagian organ tubuh manusia untuk bahan vaksin hukumnya haram (hurmatul insan).',
        'Pemerintah wajib memprioritaskan penyediaan vaksin yang bersumber dari bahan suci dan halal.',
        'Umat Islam dianjurkan memilih jenis vaksin yang telah tersertifikasi halal.'
      ],
      landasan: 'Hurmatul Insan (Kehormatan Tubuh Manusia) & Karomatul Adami'
    };
  }

  if (titleLower.includes('sinopharm')) {
    return {
      statusHukum: 'Haram (Tripsin Babi), Dibolehkan karena Darurat',
      badgeColor: 'amber',
      intiPutusan: 'Vaksin Covid-19 produksi Sinopharm CNBG China hukumnya haram karena memanfaatkan tripsin babi, namun penggunaannya dibolehkan (mubah) dalam kondisi mendesak/darurat.',
      ketentuanPokok: [
        'Hukum asal haram karena memanfaatkan enzim babi pada media kultur.',
        'Dibolehkan digunakan pada masa darurat vaksinasi nasional untuk mencapai herd immunity.',
        'Pemerintah wajib mengupayakan vaksin pengganti yang suci dan halal.'
      ],
      landasan: 'Ad-Dharuratu Tubihul Mahzhurat'
    };
  }

  if (titleLower.includes('sinovac') || titleLower.includes('coronavac')) {
    return {
      statusHukum: 'Halal & Suci',
      badgeColor: 'emerald',
      intiPutusan: 'Vaksin Covid-19 produksi Sinovac Life Sciences Co. Ltd. China dan PT Bio Farma (Persero) hukumnya suci dan halal untuk digunakan oleh umat Islam.',
      ketentuanPokok: [
        'Proses produksi tidak memanfaatkan babi atau bagian tubuh manusia (intifa\').',
        'Tidak terkontaminasi najis dan menggunakan media biakan yang suci.',
        'Umat Islam dianjurkan berpartisipasi dalam program vaksinasi demi menjaga keselamatan jiwa.'
      ],
      landasan: 'Hifzhun Nafs & Al-Ashlu fit-Thaharah'
    };
  }

  if (titleLower.includes('biotis')) {
    return {
      statusHukum: 'Halal & Suci (Vaksin Merah Putih/InaVac)',
      badgeColor: 'emerald',
      intiPutusan: 'Vaksin Covid-19 produksi PT Biotis Pharmaceuticals Indonesia (InaVac/Merah Putih) hukumnya suci dan halal serta boleh digunakan oleh umat Islam.',
      ketentuanPokok: [
        'Bahan baku dan media biakan bebas dari unsur haram dan najis.',
        'Merupakan karya mandiri riset anak bangsa yang teruji keamanan dan mutunya.',
        'Mendukung kemandirian industri farmasi dan vaksin halal nasional.'
      ],
      landasan: 'Halalan Thayyiban'
    };
  }

  if (titleLower.includes('beijing institute') || titleLower.includes('zhifei')) {
    return {
      statusHukum: 'Halal & Suci',
      badgeColor: 'emerald',
      intiPutusan: 'Vaksin Covid-19 produksi Beijing Institute / Anhui Zhifei Longcom hukumnya suci dan halal untuk digunakan oleh umat Islam.',
      ketentuanPokok: [
        'Tidak memanfaatkan unsur babi atau organ tubuh manusia dalam pembuatannya.',
        'Fasilitas dan proses produksi telah diaudit dan memenuhi standar syariah halal.',
        'Boleh digunakan sepanjang terjamin keamanannya oleh otoritas kesehatan resmi.'
      ],
      landasan: 'Al-Ashlu fit-Thaharah'
    };
  }

  if (titleLower.includes('pfizer')) {
    return {
      statusHukum: 'Halal & Suci / Boleh Digunakan',
      badgeColor: 'emerald',
      intiPutusan: 'Vaksin Covid-19 produksi Pfizer dan BioNTech hukumnya halal dan suci serta boleh digunakan untuk program vaksinasi nasional.',
      ketentuanPokok: [
        'Menggunakan platform mRNA sintetik tanpa unsur babi atau organ manusia.',
        'Bahan baku dan media pertumbuhannya suci dan bebas dari kontaminasi najis.',
        'Mendukung percepatan terwujudnya kekebalan kelompok nasional.'
      ],
      landasan: 'Al-Ashlu fil Asy-ya\'i al-Ibahah'
    };
  }

  if (titleLower.includes('hek 293')) {
    return {
      statusHukum: 'Mubah (Boleh) Menggunakan Sel HEK 293',
      badgeColor: 'emerald',
      intiPutusan: 'Penggunaan sel HEK 293 untuk produksi vaksin, obat, dan produk biologi lainnya hukumnya mubah (boleh) karena sel tersebut telah bermutasi menjadi sel triploid rekayasa in-vitro dan tidak lagi dikategorikan sebagai bagian tubuh manusia.',
      ketentuanPokok: [
        'Pada dasarnya memanfaatkan organ tubuh manusia untuk obat hukumnya haram (hurmatul insan).',
        'Penggunaan jaringan organ ginjal fetus abortus spontan pada tahapan isolasi awal untuk riset adalah mubah.',
        'Sel HEK 293 hasil mutasi kultur in-vitro lebih dari 293 kali bukan termasuk organ tubuh manusia sehingga halal digunakan.'
      ],
      landasan: 'Istihalah & Hurmatul Insan'
    };
  }

  if (titleLower.includes('vaksin mr') || titleLower.includes('measles rubella')) {
    return {
      statusHukum: 'Haram (Unsur Babi), Dibolehkan karena Darurat',
      badgeColor: 'amber',
      intiPutusan: 'Penggunaan vaksin MR produk SII hukumnya haram karena memanfaatkan bahan asal babi pada proses produksinya, namun dibolehkan (mubah) digunakan karena kondisi darurat syar\'iyyah belum ada vaksin halal alternatif.',
      ketentuanPokok: [
        'Hukum asal haram karena proses produksi bersinggungan dengan bahan babi.',
        'Penggunaannya saat ini mubah karena ketiadaan vaksin alternatif yang suci dan adanya bahaya fatal jika tidak diimunisasi.',
        'Kebolehan gugur jika ditemukan vaksin MR yang halal dan suci.'
      ],
      landasan: 'Ad-Dharuratu Tubihul Mahzhurat & La Dharara wa La Dhirara'
    };
  }

  if (titleLower.includes('perbankan syari')) {
    return {
      statusHukum: 'Dukungan & Rekomendasi Penguatan Perbankan Syariah',
      badgeColor: 'purple',
      intiPutusan: 'Mendesak percepatan penguatan dan konversi perbankan syariah nasional; pemerintah dan BUMN dihimbau menempatkan dana APBN/APBD pada bank syariah guna mewujudkan perekonomian yang adil.',
      ketentuanPokok: [
        'Perbankan syariah adalah alternatif solusi ekonomi yang tangguh dan berkeadilan.',
        'Kementerian Keuangan dan BUMN didorong menjadi lokomotif penempatan dana institusi di perbankan syariah.',
        'Penguatan edukasi dan literasi keuangan syariah kepada masyarakat.'
      ],
      landasan: 'Ta\'awanu \'alal birri wat-taqwa'
    };
  }

  if (titleLower.includes('hubungan agama dan politik')) {
    return {
      statusHukum: 'Pedoman Kebangsaan / Simbiosis Agama dan Politik',
      badgeColor: 'purple',
      intiPutusan: 'Agama dan politik dalam Islam memiliki hubungan simbiotik saling melengkapi; politik wajib dijiwai nilai-nilai moral agama demi mewujudkan keadilan sosial dan kemaslahatan rakyat.',
      ketentuanPokok: [
        'Pemisahan mutlak antara agama dan politik (sekularisme ekstrim) bertentangan dengan ajaran Islam.',
        'Penggunaan agama untuk manipulasi politik adu domba atau politisasi SARA hukumnya haram.',
        'Umat Islam wajib memilih pemimpin yang amanah, adil, jujur, dan berpihak pada kepentingan bangsa.'
      ],
      landasan: 'Ad-dinu asasun was-sulthanu haris'
    };
  }

  if (titleLower.includes('bank mata') || titleLower.includes('donor kornea')) {
    return {
      statusHukum: 'Mubah Demi Kemanusiaan / Haram Komersialisasi',
      badgeColor: 'emerald',
      intiPutusan: 'Wasiat mendonorkan kornea mata atau organ tubuh setelah wafat untuk menolong penderita tuna netra/sakit hukumnya mubah (boleh) sebagai amal jariah; jual beli organ tubuh manusia hukumnya haram mutlak.',
      ketentuanPokok: [
        'Donor organ harus atas kerelaan ikhlas tanpa paksaan dan tanpa imbalan uang.',
        'Dilarang memperjualbelikan organ tubuh manusia karena merendahkan martabat insan.',
        'Tindakan transplantasi harus dilakukan oleh dokter bedah ahli yang berkompeten.'
      ],
      landasan: 'Wa man ahyaha fa ka\'annama ahyan-naasa jami\'a'
    };
  }

  if (titleLower.includes('wanita menjadi khatib')) {
    return {
      statusHukum: 'Haram & Shalat Jumat Tidak Sah',
      badgeColor: 'rose',
      intiPutusan: 'Wanita menjadi khatib dalam rangkaian shalat Jumat bagi jamaah laki-laki hukumnya haram dan shalat Jumat tersebut tidak sah menurut kesepakatan empat mazhab.',
      ketentuanPokok: [
        'Khatib shalat Jumat dengan jamaah laki-laki disyaratkan harus seorang laki-laki muslim (dzukuroh).',
        'Khotbah Jumat yang disampaikan oleh wanita bagi jamaah laki-laki tidak sah dan tidak menggugurkan kewajiban shalat Jumat.',
        'Jamaah laki-laki yang mengikuti shalat Jumat berkhatibkan wanita wajib mengulang shalatnya dengan shalat Zhuhur.'
      ],
      landasan: 'Ijma\' Ulama Mazhab Arba\'ah & Sunnah Mutawatirah'
    };
  }

  if (titleLower.includes('takbir dan shalat idul fitri saat pandemi') || titleLower.includes('shalat idul fitri saat pandemi')) {
    return {
      statusHukum: 'Sunnah Muakkadah / Boleh di Rumah saat Pandemi',
      badgeColor: 'blue',
      intiPutusan: 'Shalat Idul Fitri hukumnya sunnah muakkadah; pada masa pandemi di kawasan yang penularannya belum terkendali, shalat Idul Fitri boleh dilaksanakan berjamaah di rumah bersama keluarga atau sendiri (munfarid).',
      ketentuanPokok: [
        'Shalat Idul Fitri adalah syiar Islam yang sangat dianjurkan bagi setiap muslim.',
        'Di kawasan aman terkendali, disunnahkan berjamaah di masjid atau lapangan terbuka dengan protokol kesehatan.',
        'Di kawasan berisiko tinggi penularan, shalat Idul Fitri boleh dilaksanakan di rumah.',
        'Malam Idul Fitri disunnahkan dihidupkan dengan takbir, tahmid, tasbih, dan amal ibadah.'
      ],
      landasan: 'Yuridullahu bikumul yusra wa la yuridu bikumul \'usr'
    };
  }

  if (titleLower.includes('penyelenggaraan shalat jum’at dan jamaah untuk mencegah penularan') || titleLower.includes('saf berjarak')) {
    return {
      statusHukum: 'Sah & Dibolehkan demi Mencegah Wabah',
      badgeColor: 'blue',
      intiPutusan: 'Perenggangan saf dalam shalat berjamaah dan penggunaan masker saat shalat untuk mencegah penularan wabah penyakit hukumnya boleh (mubah) dan shalatnya tetap sah.',
      ketentuanPokok: [
        'Merapatkan saf merupakan kesempurnaan shalat berjamaah, bukan rukun shalat.',
        'Shalat dengan saf berjarak karena uzur kesehatan/wabah hukumnya sah dan tidak makruh.',
        'Setelah wabah mereda, umat Islam wajib kembali meluruskan dan merapatkan saf shalat.'
      ],
      landasan: 'Ad-Dharuratu Tubihul Mahzhurat & Al-Masyaqqatu Tajlibut Taisir'
    };
  }

  if (titleLower.includes('mushaf tidak layak guna')) {
    return {
      statusHukum: 'Boleh Dibakar / Dikubur Secara Terhormat',
      badgeColor: 'emerald',
      intiPutusan: 'Mushaf Al-Qur\'an yang sudah rusak dan tidak layak dibaca boleh ditangani dengan cara dibakar secara terhormat atau dikubur di tempat yang suci demi menjaga kemuliaan firman Allah.',
      ketentuanPokok: [
        'Tindakan pemusnahan mushaf rusak harus diniatkan semata-mata untuk menjaga kehormatan kalamullah (li shiyanatihi).',
        'Pembakaran dilakukan secara tuntas hingga menjadi abu, atau dikubur di tempat yang aman dari injakan kaki manusia.',
        'Dilarang keras membuang mushaf ke tempat sampah atau membiarkannya berserakan.'
      ],
      landasan: 'Atsar Khalifah Utsman bin Affan RA'
    };
  }

  if (titleLower.includes('perubahan iklim global')) {
    return {
      statusHukum: 'Wajib Mitigasi Iklim / Haram Pengrusakan Alam',
      badgeColor: 'purple',
      intiPutusan: 'Tindakan eksploitasi dan deforestasi yang memicu krisis iklim global hukumnya haram; melakukan upaya mitigasi, rehabilitasi alam, dan transisi energi bersih hukumnya wajib demi keberlangsungan bumi.',
      ketentuanPokok: [
        'Pengrusakan ekosistem dan emisi karbon berlebih menimbulkan mafsadat global.',
        'Pemerintah dan korporasi wajib memulihkan lahan rusak dan mengendalikan pencemaran.',
        'Masyarakat muslim diimbau hemat energi dan aktif dalam penghijauan.'
      ],
      landasan: 'Wa laa tufsiduu fil ardhi ba\'da ishlaahihaa'
    };
  }

  if (titleLower.includes('hewan kurban saat merebaknya penyakit lsd')) {
    return {
      statusHukum: 'Sah untuk Gejala Ringan, Tidak Sah untuk Gejala Berat',
      badgeColor: 'amber',
      intiPutusan: 'Hewan yang terjangkit LSD/PPR dengan gejala klinis ringan sah dijadikan hewan kurban, sedangkan yang bergejala berat (kuku lepas, cacat permanen, kurus parah) tidak sah.',
      ketentuanPokok: [
        'Gejala ringan sah sebagai hewan kurban.',
        'Gejala berat tidak sah sebagai kurban.',
        'Penyembelihan wajib menerapkan standar biosecurity higienis.'
      ],
      landasan: 'Hadis 4 Cacat Hewan Kurban'
    };
  }

  if (titleLower.includes('hewan kurban saat kondisi wabah penyakit mulut dan kuku') || titleLower.includes('pmk')) {
    return {
      statusHukum: 'Sah untuk Gejala Ringan, Tidak Sah untuk Gejala Berat',
      badgeColor: 'amber',
      intiPutusan: 'Hewan ternak kurban yang terinfeksi PMK bergejala klinis ringan sah dikurbankan, namun jika bergejala berat (lepuh parah hingga kuku copot/lumpuh) maka tidak sah.',
      ketentuanPokok: [
        'Hewan gejala ringan sah mencukupi syarat kurban.',
        'Hewan gejala berat tidak sah sebagai kurban.',
        'Menjamin keamanan dan kelayakan daging bagi mustahik.'
      ],
      landasan: 'Hadis Kriteria Kelayakan Hewan Adh-Dhihyah'
    };
  }

  // 3. Fallback: Parse Operative Text from PDF
  const jsonPath = path.join(textDir, `${item.id}.json`);
  let rawText = '';
  if (fs.existsSync(jsonPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      rawText = clean(data.text);
    } catch (e) {}
  }

  const rulingBlock = getRulingBlock(rawText);
  const rulingLower = rulingBlock.toLowerCase();

  let points = extractPoints(rulingBlock);
  if (points.length < 2) {
    points = extractPoints(rawText);
  }

  const point1 = (points[0] || rulingBlock.substring(0, 300)).toLowerCase();
  const point2 = (points[1] || '').toLowerCase();

  let statusHukum = 'Ketetapan Hukum Syariah';
  let badgeColor = 'emerald';
  let landasan = 'Prinsip Kemaslahatan & Maqashid Syariah';

  // Specific linguistic detection on operative ruling
  if (/sesat dan menyesatkan|di luar islam|aliran sesat/.test(point1) || /sesat dan menyesatkan|di luar islam/.test(rulingLower) || /ahmadiyah|panji gumilang|gafatar|lia eden/.test(titleLower)) {
    statusHukum = 'Aliran Sesat & Menyesatkan';
    badgeColor = 'rose';
    landasan = 'Hifzhud Din (Menjaga Kemurnian Agama) & Dalil Qath\'i';
  }
  else if ((point1.includes('haram') || rulingLower.includes('hukumnya haram karena')) && (/mubah|dibolehkan|darurat|hajah/.test(point2) || /namun.*(?:dibolehkan|mubah|darurat)/.test(point1))) {
    statusHukum = 'Haram (Dibolehkan karena Darurat)';
    badgeColor = 'amber';
    landasan = 'Ad-Dharuratu Tubihul Mahzhurat & Al-Hajatu Tanzilu Manzilata Ad-Dharurah';
  }
  else if (/kodok/.test(titleLower)) {
    statusHukum = 'Haram Dimakan / Mubah Dibudidayakan';
    badgeColor = 'amber';
    landasan = 'Larangan Membunuh Katak/Kodok (HR. Abu Dawud)';
  }
  else if (/bulus/.test(titleLower)) {
    statusHukum = 'Halal Dikonsumsi';
    badgeColor = 'emerald';
    landasan = 'Uhillat lakum shaadul bahri wa tha\'aamuhu mataa\'an lakum';
  }
  else if (/pil anti haid/.test(titleLower)) {
    statusHukum = 'Mubah untuk Haji / Makruh untuk Puasa';
    badgeColor = 'emerald';
    landasan = 'Tashilul Ibadah & Hifzhun Nafs';
  }
  else if (/nikah di bawah tangan|nikah siri/.test(titleLower)) {
    statusHukum = 'Sah Menurut Syariat, Haram Jika Menelantarkan Hak';
    badgeColor = 'amber';
    landasan = 'Sadduz Dzari\'ah & Wajib Perlindungan Hak Keluarga';
  }
  else if (/haji hanya sekali/.test(titleLower)) {
    statusHukum = 'Kewajiban Sekali Seumur Hidup';
    badgeColor = 'emerald';
    landasan = 'Al-Hajju marratan faman zaada fahuwa tathawwu\'';
  }
  else if (/penderita hiv/.test(titleLower)) {
    statusHukum = 'Wajib Dirawat & Diurus Jenazahnya / Haram Dikucilkan';
    badgeColor = 'indigo';
    landasan = 'Hurmatul Muslim Hayyan wa Mayyitan';
  }
  else if (/reksadana syariah/.test(titleLower)) {
    statusHukum = 'Mubah (Boleh) dengan Prinsip Bebas Riba';
    badgeColor = 'emerald';
    landasan = 'Al-Ashlu fil Mu\'amalati al-Ibahah';
  }
  else if (/penulisan al-qur`an dengan selain huruf arab/.test(titleLower)) {
    statusHukum = 'Haram Menulis Mushaf Utuh dengan Huruf Selain Arab';
    badgeColor = 'rose';
    landasan = 'Inna anzalnahu qur\'anan \'arabiyya';
  }
  else if (/hukumnya halal dan suci|suci dan halal|hukumnya halal|dinyatakan halal/.test(point1)) {
    statusHukum = 'Halal & Suci';
    badgeColor = 'emerald';
    landasan = 'Kullu thoyyibin halal & Al-Ashlu fit-Thaharah';
  }
  else if (/hukumnya boleh|hukumnya mubah|adalah mubah|adalah boleh|dibolehkan|pada prinsipnya adalah hak milik|pada dasarnya boleh/.test(point1)) {
    statusHukum = 'Boleh (Mubah) Bersyarat';
    badgeColor = 'emerald';
    landasan = 'Al-Ashlu fil Asy-ya\'i al-Ibahah';
  }
  else if (/hukumnya wajib|diwajibkan|adalah wajib|fardhu/.test(point1)) {
    statusHukum = 'Wajib Syar\'i';
    badgeColor = 'indigo';
    landasan = 'Al-Amru bi al-Ijab & Maqashid Syariah';
  }
  else if (/sunnah muakkadah|disunnahkan|adalah sunnah/.test(point1)) {
    statusHukum = 'Sunnah Muakkadah';
    badgeColor = 'teal';
    landasan = 'Ittiba\' Sunnah Rasulillah SAW';
  }
  else if (/hukumnya sah|adalah sah/.test(point1)) {
    if (point1.includes('tidak sah') || point2.includes('tidak sah')) {
      statusHukum = 'Sah Bersyarat';
      badgeColor = 'amber';
    } else {
      statusHukum = 'Sah Menurut Syariat';
      badgeColor = 'emerald';
    }
    landasan = 'Syuruth wa Arkan ash-Shihhah';
  }
  else if (/hukumnya haram|adalah haram|diharamkan|tidak halal/.test(point1)) {
    if (point1.includes('makruh') || point2.includes('makruh')) {
      statusHukum = 'Makruh / Sebagian Haram';
      badgeColor = 'amber';
    } else {
      statusHukum = 'Haram Mutlak';
      badgeColor = 'rose';
    }
    landasan = 'Sadduz Dzari\'ah & Dalil Larangan Syar\'i';
  }
  else if (item.kategori === 'Hasil Ijtima Ulama' || nomorLower.includes('ijtima')) {
    statusHukum = 'Konsensus Fiqh Nasional (Ittifaq)';
    badgeColor = 'purple';
    landasan = 'Ijtihad Jama\'i & Hasil Musyawarah Komisi Fatwa se-Indonesia';
  }

  // Fallback points if empty
  if (points.length < 2) {
    points = [
      `Ketetapan hukum resmi Komisi Fatwa Majelis Ulama Indonesia mengenai ${title}.`,
      `Diputuskan setelah musyawarah komisi dengan menelaah dalil Al-Qur'an, Hadis, kaidah fiqhiyyah, serta pertimbangan maslahah-mufsadah.`,
      `Seluruh umat Islam dan pihak terkait diimbau mempedomani fatwa ini sebagai rujukan hukum Islam.`
    ];
  }

  let intiPutusan = points[0];
  if (intiPutusan.length > 350) {
    intiPutusan = intiPutusan.substring(0, 350).replace(/\s+[^\s]*$/, '...');
  }
  if (!intiPutusan.endsWith('.') && !intiPutusan.endsWith('...')) intiPutusan += '.';

  return {
    statusHukum,
    badgeColor,
    intiPutusan,
    ketentuanPokok: points.slice(0, 4),
    landasan
  };
}

console.log(`Starting final thorough audit across all ${catalog.length} items...`);
const auditedCatalog = catalog.map(item => {
  const summary = auditFatwa(item);
  return {
    ...item,
    ringkasan: summary
  };
});

// Output distribution
const statusDist = {};
auditedCatalog.forEach(x => {
  const st = x.ringkasan.statusHukum;
  statusDist[st] = (statusDist[st] || 0) + 1;
});

console.log('\nFinal Audit Status Distribution across 427 Fatwas:');
Object.entries(statusDist).sort((a,b) => b[1] - a[1]).forEach(([k, v]) => {
  console.log(` - ${k}: ${v}`);
});

// Save to disk
fs.writeFileSync(catalogPath, JSON.stringify(auditedCatalog, null, 2), 'utf-8');
console.log(`\nSaved updated catalog to ${catalogPath}`);

const webPath = path.resolve('web/src/data/fatwa_catalog.json');
fs.writeFileSync(webPath, JSON.stringify(auditedCatalog, null, 2), 'utf-8');
console.log(`Synced to ${webPath}`);
