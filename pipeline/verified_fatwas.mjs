import fs from 'fs';
import path from 'path';

// Complete dictionary of specific verified rulings for critical, controversial, classical, and scanned items
const VERIFIED_FATWAS = {
  // --- VAKSIN & OBAT ---
  'fatwa-380': { // Fatwa 14/2021 AstraZeneca
    statusHukum: 'Haram (Tripsin Babi), Dibolehkan karena Darurat',
    badgeColor: 'amber',
    intiPutusan: 'Vaksin Covid-19 produk AstraZeneca hukumnya haram karena dalam proses produksinya memanfaatkan tripsin babi, namun saat ini dibolehkan (mubah) digunakan karena hajah syar\'iyyah (kondisi mendesak) yang menduduki kedudukan darurat akibat keterbatasan vaksin suci.',
    ketentuanPokok: [
      'Hukum asal haram karena memanfaatkan unsur tripsin babi pada tahapan penyiapan bibit vaksin.',
      'Penggunaannya saat ini dibolehkan (mubah) karena ada kebutuhan mendesak dan ketersediaan vaksin halal belum mencukupi herd immunity.',
      'Kebolehan penggunaan gugur jika alasan kedaruratan hilang atau vaksin halal telah mencukupi.',
      'Pemerintah wajib terus mengikhtiarkan ketersediaan vaksin yang halal dan suci.'
    ],
    landasan: 'Al-Hajatu Tanzilu Manzilata Ad-Dharurah & Ad-Dharuratu Tubihul Mahzhurat'
  },
  'fatwa-377': { // Fatwa 02/2021 Sinovac
    statusHukum: 'Halal & Suci',
    badgeColor: 'emerald',
    intiPutusan: 'Vaksin Covid-19 produksi Sinovac Life Sciences Co. Ltd. China dan PT Bio Farma (Persero) hukumnya suci dan halal untuk digunakan oleh umat Islam.',
    ketentuanPokok: [
      'Proses produksi tidak memanfaatkan babi atau bagian tubuh manusia (intifa\').',
      'Tidak terkontaminasi najis dan menggunakan media kultur yang suci.',
      'Umat Islam dianjurkan berpartisipasi dalam program vaksinasi demi ikhtiar hifzhun nafs (menjaga keselamatan jiwa).'
    ],
    landasan: 'Hifzhun Nafs & Al-Ashlu fil Asy-ya\'i at-Thaharah'
  },
  'fatwa-389': { // Fatwa 56/2023 Sel HEK 293
    statusHukum: 'Mubah (Boleh) Menggunakan Sel HEK 293',
    badgeColor: 'emerald',
    intiPutusan: 'Penggunaan sel HEK 293 untuk produksi vaksin, obat, dan produk biologi lainnya hukumnya mubah (boleh) karena sel tersebut telah bermutasi menjadi sel triploid rekayasa in-vitro dan tidak lagi dikategorikan sebagai bagian tubuh manusia.',
    ketentuanPokok: [
      'Pada dasarnya memanfaatkan organ/bagian tubuh manusia untuk obat hukumnya haram (hurmatul insan).',
      'Penggunaan jaringan organ ginjal fetus abortus spontan pada tahapan isolasi awal untuk riset adalah mubah.',
      'Sel HEK 293 hasil kultur in-vitro lebih dari 293 kali bukan termasuk organ tubuh manusia, sehingga halal/mubah digunakan.',
      'Produsen obat dan vaksin tetap wajib memprioritaskan sertifikasi halal.'
    ],
    landasan: 'Istihalah & Hurmatul Insan'
  },
  'fatwa-321': { // Fatwa 33/2018 Vaksin MR (Serum Institute of India)
    statusHukum: 'Haram (Unsur Babi), Dibolehkan karena Darurat',
    badgeColor: 'amber',
    intiPutusan: 'Penggunaan vaksin MR (Measles Rubella) produk SII hukumnya haram karena memanfaatkan bahan asal babi pada proses produksinya, namun saat ini dibolehkan (mubah) karena kondisi darurat syar\'iyyah belum ada vaksin halal alternatif.',
    ketentuanPokok: [
      'Hukum asal haram karena proses produksi bersinggungan dengan bahan dari babi.',
      'Penggunaannya saat ini mubah karena ketiadaan vaksin alternatif yang halal dan suci serta adanya bahaya fatal jika tidak diimunisasi.',
      'Kebolehan gugur jika ditemukan vaksin MR yang halal dan suci.',
      'Pemerintah wajib menjamin ketersediaan vaksin halal untuk masa mendatang.'
    ],
    landasan: 'Ad-Dharuratu Tubihul Mahzhurat & La Dharara wa La Dhirara'
  },
  'fatwa-308': { // Fatwa 04/2016 Imunisasi
    statusHukum: 'Mubah (Boleh) / Wajib jika Mengancam Jiwa',
    badgeColor: 'emerald',
    intiPutusan: 'Imunisasi pada dasarnya dibolehkan (mubah) sebagai ikhtiar pengobatan preventif demi menjaga kesehatan jasmani. Imunisasi menjadi wajib jika seseorang yang tidak diimunisasi berisiko tertular penyakit menular berbahaya yang mengancam jiwa atau kecacatan.',
    ketentuanPokok: [
      'Vaksin yang digunakan harus suci dan halal.',
      'Penggunaan vaksin berbahan najis/haram dibolehkan hanya jika dalam kondisi darurat dan belum ada vaksin halal pengganti.',
      'Pemerintah wajib menyediakan vaksin yang suci dan halal bagi masyarakat.'
    ],
    landasan: 'Hifzhun Nafs & Tadawi (Berobat)'
  },
  'fatwa-282': { // Fatwa 06/2010 Vaksin Meningitis Haji
    statusHukum: 'Menveo Halal, Mencevax Haram',
    badgeColor: 'amber',
    intiPutusan: 'Vaksin Meningitis Menveo produksi Novartis dinyatakan halal dan suci untuk jemaah haji/umrah, sedangkan vaksin Mencevax produksi GlaxoSmithKline berstatus haram karena proses produksinya bersentuhan dengan enzim babi.',
    ketentuanPokok: [
      'Vaksin Menveo (Novartis) suci dan halal serta bebas dari unsur babi.',
      'Vaksin Mencevax (GSK) haram karena memanfaatkan enzim babi pada media fermentasi.',
      'Pemerintah RI wajib hanya memfasilitasi dan menggunakan vaksin meningitis yang halal bagi calon jemaah haji dan umrah.'
    ],
    landasan: 'Al-Ijtinab \'an an-Najasat'
  },
  'fatwa-279': { // Fatwa 05/2009 Vaksin Meningitis
    statusHukum: 'Vaksin Berunsur Babi Haram',
    badgeColor: 'rose',
    intiPutusan: 'Vaksin meningitis yang dalam proses pembuatannya bersentuhan dengan bahan asal babi hukumnya haram digunakan oleh jemaah haji atau umrah, kecuali tidak ada alternatif vaksin suci dan dalam kondisi darurat yang mengancam jiwa.',
    ketentuanPokok: [
      'Penggunaan unsur babi dalam proses produksi obat/vaksin menjadikannya haram.',
      'Pemerintah wajib mencari dan mendatangkan vaksin meningitis yang halal.',
      'Jemaah haji berhak mendapatkan perlindungan vaksin yang terjamin kehalalannya.'
    ],
    landasan: 'Innama harrama \'alaikumul maitata wad-dama wa lahman khinzir'
  },
  'fatwa-350': { // Fatwa 48/2021 Vaksin Pfizer
    statusHukum: 'Halal & Suci / Boleh Digunakan',
    badgeColor: 'emerald',
    intiPutusan: 'Vaksin Covid-19 produksi Pfizer dan BioNTech hukumnya halal dan suci serta boleh digunakan untuk program vaksinasi nasional.',
    ketentuanPokok: [
      'Proses produksi menggunakan platform mRNA sintetik tanpa memanfaatkan unsur babi atau organ manusia.',
      'Bahan baku dan media pertumbuhannya suci dan bebas dari kontaminasi najis.',
      'Mendukung percepatan terwujudnya kekebalan kelompok nasional.'
    ],
    landasan: 'Al-Ashlu fil Asy-ya\'i al-Ibahah'
  },
  'fatwa-355': { // Fatwa 23/2021 Tes Swab Saat Puasa
    statusHukum: 'Boleh (Mubah) & Tidak Membatalkan Puasa',
    badgeColor: 'emerald',
    intiPutusan: 'Pelaksanaan tes swab (antigen maupun PCR) melalui hidung (nasofaring) atau tenggorokan (orofaring) untuk deteksi Covid-19 saat berpuasa hukumnya mubah (boleh) dan tidak membatalkan puasa.',
    ketentuanPokok: [
      'Pengambilan sampel usap lendir tidak memasukkan benda berupa nutrisi atau cairan ke dalam organ pencernaan.',
      'Umat Islam yang sedang berpuasa diperbolehkan melakukan swab test demi kemaslahatan diagnosis medis.',
      'Tenaga medis diimbau melakukan pemeriksaan secara hati-hati agar tidak melukai rongga hidung atau tenggorokan.'
    ],
    landasan: 'Ash-Shaumu mimma dakhala laisa mimma kharaja'
  },
  'fatwa-356': { // Fatwa 13/2021 Vaksinasi Saat Puasa
    statusHukum: 'Boleh (Mubah) & Tidak Membatalkan Puasa',
    badgeColor: 'emerald',
    intiPutusan: 'Penyuntikan vaksin Covid-19 secara intramuskular (ke dalam otot) bagi orang yang sedang berpuasa hukumnya boleh (mubah) dan tidak membatalkan ibadah puasa.',
    ketentuanPokok: [
      'Suntik vaksin intramuskular tidak melalui saluran terbuka makanan (jauf) dan bukan merupakan makanan/minuman yang mengenyangkan.',
      'Vaksinasi dapat dilanjutkan pada siang hari selama kondisi fisik penerima memungkinkan dan tidak menimbulkan bahaya.',
      'Jika penerima vaksin merasa lemah, vaksinasi dapat dijadwalkan pada malam hari setelah berbuka.'
    ],
    landasan: 'Tashilul Ibadah wa Hifzhun Nafs'
  },

  // --- PALESTINA & KEBANGSAAN ---
  'fatwa-390': { // Fatwa 83/2023 Perjuangan Palestina
    statusHukum: 'Wajib Bela Palestina / Haram Agresi & Produk Terafiliasi Israel',
    badgeColor: 'rose',
    intiPutusan: 'Mendukung perjuangan kemerdekaan Palestina hukumnya wajib (termasuk penyaluran ZIS), sedangkan mendukung agresi Israel atau bertransaksi dengan produk yang terafiliasi dengan penjajahan zionis hukumnya haram.',
    ketentuanPokok: [
      'Mendukung kemerdekaan Palestina atas agresi zionis Israel hukumnya wajib bagi setiap muslim.',
      'Distribusi dana zakat, infak, dan sedekah dibolehkan dialihkan untuk bantuan kemanusiaan dan perjuangan Palestina.',
      'Mendukung agresi Israel baik secara langsung maupun tidak langsung hukumnya haram.',
      'Umat Islam diimbau semaksimal mungkin menghindari penggunaan dan pembelian produk-produk yang terafiliasi dengan Israel.'
    ],
    landasan: 'Ukhuwah Islamiyah & Larangan Mu\'awanah \'alal Itstmi wal \'Udwan'
  },

  // --- KEUANGAN, PERBANKAN & MUAMALAH ---
  'fatwa-238': { // Fatwa 1/2004 Bunga Bank
    statusHukum: 'Haram (Riba Mutlak)',
    badgeColor: 'rose',
    intiPutusan: 'Praktik pembungaan uang (interest) pada lembaga keuangan konvensional (bank, asuransi, pegadaian, dll.) telah memenuhi kriteria riba nasi\'ah dan hukumnya haram mutlak.',
    ketentuanPokok: [
      'Setiap tambahan atas pokok hutang yang dipersyaratkan di muka adalah riba nasiah yang diharamkan syariat.',
      'Bagi wilayah yang telah memiliki kantor perbankan syariah, tidak dibolehkan bertransaksi pada bank konvensional yang memakai sistem bunga.',
      'Bagi wilayah yang belum ada kantor bank syariah, diperbolehkan membuka rekening konvensional hanya sebatas kebutuhan darurat (hajat syar\'iyyah).',
      'Umat Islam wajib mengalihkan dananya ke lembaga keuangan syariah.'
    ],
    landasan: 'Wa ahallallahu al-bai\'a wa harrama ar-riba (QS. Al-Baqarah: 275)'
  },
  'fatwa-171': { // Uang Kripto (Ijtima Ulama VII 2021)
    statusHukum: 'Haram sebagai Alat Tukar / Boleh Komoditas jika Ber-Underlying',
    badgeColor: 'amber',
    intiPutusan: 'Mata uang kripto (cryptocurrency) haram digunakan sebagai alat transaksi pembayaran karena bertentangan dengan UU Mata Uang dan mengandung gharar, maysir, serta dharar; aset digital kripto sebagai komoditas investasi hanya sah diperdagangkan jika memiliki underlying asset riil.',
    ketentuanPokok: [
      'Cryptocurrency haram sebagai mata uang/alat tukar karena bukan alat bayar yang sah menurut regulasi NKRI.',
      'Cryptocurrency yang mengandung gharar (ketidakpastian ekstrem) dan spekulasi liar haram diperjualbelikan.',
      'Aset kripto sebagai komoditas sil\'ah (aset digital) boleh diperdagangkan hanya bila memiliki underlying fisik/proyek riil dan legal secara regulasi Bappebti.'
    ],
    landasan: 'Naha Rasulullahi SAW \'an bai\'il gharar'
  },
  'fatwa-160': { // Pinjaman Online / Pinjol (Ijtima Ulama VII 2021)
    statusHukum: 'Haram Pinjol Ribawi / Halal Pinjol Syariah Berizin',
    badgeColor: 'rose',
    intiPutusan: 'Layanan pinjaman online yang menetapkan bunga tambahan, denda berlipat, atau penagihan dengan ancaman/teror hukumnya haram mutlak; penyelenggaraan fintech pembiayaan online berbasis syariah dan berizin resmi OJK hukumnya halal/mubah.',
    ketentuanPokok: [
      'Pinjol berbunga dan rentenir digital terkategori riba dan haram bagi kreditur maupun debitur.',
      'Penyebaran data pribadi dan intimidasi dalam penagihan hutang pinjol hukumnya haram.',
      'Penyedia platform peer-to-peer financing syariah wajib menerapkan akad syar\'i (murabahah, ijarah, qardh) tanpa bunga.'
    ],
    landasan: 'Kullu qardin jarra manfa\'atan fa huwa riba'
  },
  'fatwa-414': { // 04/Ijtima VIII/2024 Zakat Youtuber & Selebgram
    statusHukum: 'Wajib Zakat Penghasilan (2.5%) jika Capai Nishab',
    badgeColor: 'indigo',
    intiPutusan: 'Youtuber, selebgram, dan pelaku ekonomi kreatif digital lainnya wajib mengeluarkan zakat penghasilan sebesar 2.5% apabila kontennya halal dan penghasilannya mencapai nishab senilai 85 gram emas.',
    ketentuanPokok: [
      'Objek usaha (konten yang diproduksi) wajib tidak bertentangan dengan ketentuan syariah.',
      'Nishab zakat setara 85 gram emas per tahun, dikeluarkan 2.5% (tahun qamariyah) atau 2.57% (tahun syamsiyah).',
      'Zakat dapat ditunaikan seketika saat menerima pencairan penghasilan (zakat profesi).',
      'Penghasilan dari konten haram (pornografi, judi online, hoaks) tidak dapat disucikan dengan zakat, melainkan seluruhnya harus diserahkan untuk kemaslahatan umum.'
    ],
    landasan: 'Khudz min amwalihim shadaqatan tuthohhiruhum wa tuzakkihim biha'
  },
  'fatwa-413': { // 05/Ijtima VIII/2024 Zakat Al-Mustaghallat
    statusHukum: 'Wajib Zakat Hasil Aset Produktif (Zakat al-Mustaghallat)',
    badgeColor: 'indigo',
    intiPutusan: 'Aset produktif yang disewakan atau menghasilkan keuntungan (seperti gedung perkantoran, indekos, pabrik, armada transportasi, ruko) wajib dizakati dari pendapatan bersihnya saat mencapai nishab.',
    ketentuanPokok: [
      'Zakat tidak dikenakan pada fisik aset/gedung, melainkan pada hasil bersih (yield/rental income) yang diperoleh.',
      'Nishab setara 85 gram emas dengan kadar zakat 2.5% dari keuntungan bersih tahunan.',
      'Mendorong optimalisasi potensi filantropi Islam dari sektor kepemilikan aset kapital modern.'
    ],
    landasan: 'Kewajiban Zakat Maal & Qiyas terhadap Zakat Pertanian/Penghasilan'
  },
  'fatwa-408': { // 16/Ijtima VIII/2024 Pencatatan Nikah Beda Agama
    statusHukum: 'Haram & Ditolak Pencatatannya oleh Pengadilan',
    badgeColor: 'rose',
    intiPutusan: 'Mendukung putusan Mahkamah Konstitusi No. 24/PUU-XX/2022 dan SEMA No. 2/2023 bahwa perkawinan yang dicatat harus perkawinan yang sah menurut agama; pengadilan dilarang mengabulkan permohonan pencatatan perkawinan beda agama karena perkawinan tersebut haram dan tidak sah.',
    ketentuanPokok: [
      'Perkawinan beda agama hukumnya haram dan tidak sah menurut syariat Islam dan UU No. 1 Tahun 1974.',
      'Pencatatan perkawinan yang tidak sah menurut agama tidak boleh dilakukan oleh pegawai pencatat nikah maupun kantor catatan sipil.',
      'Para hakim di pengadilan dihimbau agar tidak mengabulkan permohonan penetapan pencatatan nikah beda agama.',
      'Mendesak revisi pasal 35 huruf a UU Adminduk agar selaras dengan ketetapan hukum perkawinan nasional.'
    ],
    landasan: 'La tanfidhul ahkam allati tukhalifus syari\'ah & UU No. 1/1974'
  },
  'fatwa-407': { // 02/Ijtima VIII/2024 Panduan Hubungan Antarumat Beragama & Salam Lintas Agama
    statusHukum: 'Haram Salam Doa Agama Lain / Wajib Toleransi Murni',
    badgeColor: 'rose',
    intiPutusan: 'Mengucapkan salam lintas agama yang memuat doa khusus ritual agama lain oleh umat Islam hukumnya haram; dalam forum majemuk umat Islam dibolehkan mengucapkan salam Islam "Assalamu\'alaikum" atau salam nasional kebangsaan.',
    ketentuanPokok: [
      'Islam menghormati pemeluk agama lain dan menjamin kebebasan beribadah dengan prinsip lakum dinukum waliyadin.',
      'Umat Islam dilarang mengolok-olok atau menghina simbol dan ritual agama lain.',
      'Pengucapan salam dalam Islam adalah doa ibadah ubudiyah yang tidak boleh dicampuradukkan dengan doa agama lain.',
      'Toleransi beragama sejati adalah menghormati perbedaan keyakinan tanpa harus melakukan sinkretisme atau asimilasi teologis.'
    ],
    landasan: 'Lakum dinukum wa liya din & La tasubbu alladzina yad\'una min dunillah'
  },
  'fatwa-409': { // 01/Ijtima VIII/2024 Hubungan Antarbangsa
    statusHukum: 'Pedoman Hubungan Internasional / Wajib Patuhi Piagam Sah',
    badgeColor: 'purple',
    intiPutusan: 'Ketetapan fikih diplomasi antarbangsa; negara muslim wajib mematuhi kesepakatan internasional (al-mitsaq al-alami) di PBB sepanjang tidak bertentangan dengan syariat Islam dan martabat kedaulatan bangsa.',
    ketentuanPokok: [
      'Konsep negara-bangsa (nation-state) telah diakui sejak Piagam Madinah.',
      'Perjanjian internasional yang disepakati bersama wajib ditaati sesuai prinsip al-muslimuna \'ala syuruthihim.',
      'Negara wajib menolak klausul konvensi internasional yang bertentangan dengan norma agama dan konstitusi.'
    ],
    landasan: 'Al-Muslimuna \'ala syuruthihim illa syarthan ahalla haraman aw harrama halalan'
  },
  'fatwa-219': { // Perkawinan Campuran (Munas II 1980)
    statusHukum: 'Haram Mutlak & Tidak Sah',
    badgeColor: 'rose',
    intiPutusan: 'Perkawinan wanita muslimah dengan laki-laki non-muslim adalah haram hukumnya dan tidak sah; seorang laki-laki muslim juga diharamkan mengawini wanita bukan muslim (termasuk non-muslim kontemporer) karena mafsadatnya jauh lebih besar daripada maslahatnya.',
    ketentuanPokok: [
      'Wanita muslimah haram menikah dengan laki-laki kafir/non-muslim manapun.',
      'Laki-laki muslim diharamkan menikahi wanita bukan muslim demi menjaga akidah keluarga dan keturunan.',
      'Pernikahan beda agama yang dilakukan tidak sah di hadapan syariat Islam.'
    ],
    landasan: 'Wa la tankihul musyrikati hatta yu\'minn (QS. Al-Baqarah: 221)'
  },
  'fatwa-217': { // Kodok (Munas 1984)
    statusHukum: 'Haram Dimakan / Mubah Dibudidayakan',
    badgeColor: 'amber',
    intiPutusan: 'Memakan daging kodok mengikuti pendapat Mazhab Syafi\'i adalah tidak halal (haram), namun membudidayakan kodok hanya untuk diambil manfaatnya (seperti pakan hewan atau ekspor non-pangan) dan bukan untuk dimakan tidak bertentangan dengan ajaran Islam (mubah).',
    ketentuanPokok: [
      'Daging kodok haram dimakan menurut Jumhur Ulama mazhab Syafi\'i.',
      'Budidaya kodok untuk tujuan kemanfaatan ekonomi non-konsumsi dibolehkan.',
      'Menghormati adanya khilafiyah mazhab Maliki yang membolehkannya.'
    ],
    landasan: 'Larangan Rasulullah SAW membunuh katak/kodok (HR. Abu Dawud)'
  },
  'fatwa-208': { // Pil Anti Haid (1979)
    statusHukum: 'Mubah untuk Haji / Makruh untuk Puasa',
    badgeColor: 'emerald',
    intiPutusan: 'Penggunaan pil anti haid bagi wanita muslimah untuk kesempatan menunaikan ibadah haji hukumnya mubah (boleh); untuk mencukupi puasa Ramadhan sebulan penuh hukumnya makruh, kecuali bagi wanita yang sangat sulit mengqadha puasanya maka mubah.',
    ketentuanPokok: [
      'Mubah digunakan untuk memastikan kelancaran tawaf dan rukun haji.',
      'Makruh digunakan semata-mata agar tidak qadha puasa Ramadhan, karena haid adalah fitrah.',
      'Haram jika penggunaan pil anti haid dimaksudkan untuk tujuan melanggar syariat atau merusak kesuburan permanen.'
    ],
    landasan: 'Hifzhut Tanaasul & Keringanan Menjalankan Rukun Haji'
  },
  'fatwa-190': { // Nikah Sirri / Nikah di Bawah Tangan (2008)
    statusHukum: 'Sah Menurut Syariat, Haram Jika Menelantarkan Hak',
    badgeColor: 'amber',
    intiPutusan: 'Nikah di bawah tangan (nikah siri) hukumnya sah secara syariat bila memenuhi rukun dan syarat, namun menjadi haram jika mengakibatkan mudarat atau penelantaran hak-hak istri dan anak; umat Islam wajib mencatatkan perkawinan di KUA/Catatan Sipil.',
    ketentuanPokok: [
      'Pernikahan sah secara agama bila ada wali, dua saksi adil, ijab kabul, dan mahar.',
      'Pencatatan resmi di KUA hukumnya wajib demi melindungi kepastian hukum (hifzh an-nasl wal mal).',
      'Nikah siri yang menimbulkan penelantaran nafkah dan sengketa waris dihukumi berdosa/haram.'
    ],
    landasan: 'Sadduz Dzari\'ah & Tasharruf al-wali manuuthun bil mashlahah'
  },
  'fatwa-75': { // Shalat Berjamaah & Saf Berjarak saat Pandemi (Fatwa 31/2020)
    statusHukum: 'Sah & Dibolehkan demi Mencegah Wabah',
    badgeColor: 'blue',
    intiPutusan: 'Perenggangan saf dalam shalat berjamaah dan penggunaan masker saat shalat untuk mencegah penularan wabah Covid-19 hukumnya boleh (mubah) dan shalatnya tetap sah.',
    ketentuanPokok: [
      'Merapatkan saf merupakan kesempurnaan shalat berjamaah, bukan rukun shalat.',
      'Shalat dengan saf berjarak karena uzur kesehatan/wabah hukumnya sah dan tidak makruh.',
      'Setelah wabah mereda, umat Islam wajib kembali meluruskan dan merapatkan saf shalat.'
    ],
    landasan: 'Ad-Dharuratu Tubihul Mahzhurat & Al-Masyaqqatu Tajlibut Taisir'
  },
  'fatwa-68': { // Daging Bulus (Fatwa 51/2019)
    statusHukum: 'Halal Dikonsumsi',
    badgeColor: 'emerald',
    intiPutusan: 'Bulus (labi-labi/kura-kura air tawar berpunggung lunak) adalah hewan air dan bukan hewan yang hidup di dua alam (amfibi), sehingga dagingnya halal dikonsumsi sepanjang disembelih secara syar\'i.',
    ketentuanPokok: [
      'Bulus bernapas dengan paru-paru dan struktur khusus di air, tidak dapat hidup mandiri di daratan secara permanen.',
      'Dihukumi sebagai hewan air yang suci dan halal dikonsumsi.',
      'Wajib disembelih secara syar\'i dengan memutus saluran napas dan makanan.'
    ],
    landasan: 'Uhillat lakum shaadul bahri wa tha\'aamuhu mataa\'an lakum'
  },
  'fatwa-358': { // Shalat Idul Fitri saat Pandemi (Fatwa 28/2020)
    statusHukum: 'Sunnah Muakkadah / Boleh di Rumah',
    badgeColor: 'blue',
    intiPutusan: 'Shalat Idul Fitri hukumnya sunnah muakkadah; pada masa pandemi di kawasan yang penularannya belum terkendali, shalat Idul Fitri boleh dilaksanakan berjamaah di rumah bersama keluarga atau sendiri (munfarid).',
    ketentuanPokok: [
      'Shalat Idul Fitri adalah syiar Islam yang sangat dianjurkan bagi setiap muslim.',
      'Di kawasan aman terkendali, disunnahkan berjamaah di masjid atau lapangan terbuka dengan protokol kesehatan.',
      'Di kawasan berisiko tinggi, shalat Idul Fitri dilaksanakan di rumah tanpa kehilangan pahala sunnahnya.',
      'Khatib shalat Id di rumah dapat menyampaikan khutbah singkat atau cukup shalat tanpa khutbah jika munfarid.'
    ],
    landasan: 'Yuridullahu bikumul yusra wa la yuridu bikumul \'usr'
  },
  'fatwa-393': { // Panji Gumilang / Al-Zaytun (Fatwa 47/2023)
    statusHukum: 'Penyimpangan Akidah / Penodaan Agama',
    badgeColor: 'rose',
    intiPutusan: 'Ajaran keagamaan yang diajarkan oleh Panji Gumilang di Mahad Al-Zaytun (seperti menafsirkan Al-Qur\'an secara sembarangan, merubah tata cara shalat berjarak non-syar\'i, dan mencampur saf laki-laki perempuan sejajar) merupakan penyimpangan akidah dan penodaan agama Islam.',
    ketentuanPokok: [
      'Penafsiran Al-Qur\'an tanpa kaidah tafsir muktabar bertentangan dengan ajaran Islam.',
      'Mendesak aparat penegak hukum menindak tegas tindak pidana penistaan agama sesuai UU.',
      'Pemerintah dan Kemenag wajib mengambil alih pembinaan para santri Al-Zaytun agar kembali ke akidah Ahlussunnah.'
    ],
    landasan: 'Hifzhud Din & Larangan Mengikuti Hawa Nafsu dalam Menafsirkan Agama'
  },
  'fatwa-326': { // Ahmadiyah (Fatwa II/2005)
    statusHukum: 'Aliran Sesat & Menyesatkan (Di Luar Islam)',
    badgeColor: 'rose',
    intiPutusan: 'Menegaskan kembali Fatwa Munas II 1980 bahwa aliran Ahmadiyah (baik Qadiyan maupun Lahore) adalah aliran di luar Islam, sesat dan menyesatkan, karena meyakini adanya nabi setelah Nabi Muhammad SAW.',
    ketentuanPokok: [
      'Nabi Muhammad SAW adalah penutup para nabi dan rasul (Khatamun Nabiyyin).',
      'Siapapun yang meyakini adanya wahyu kenabian setelah Nabi Muhammad SAW berstatus murtad dan keluar dari Islam.',
      'Pemerintah wajib membubarkan dan melarang penyebaran ajaran Ahmadiyah di seluruh Indonesia.',
      'Pengikut Ahmadiyah diserukan bertobat dan kembali ke ajaran Islam yang benar.'
    ],
    landasan: 'Ma kaana Muhammadun aba ahadin min rijalikum wa lakin Rasullallah wa Khataman Nabiyyin'
  },
  'fatwa-327': { // Sipilis - Sekularisme, Pluralisme, Liberalisme (Fatwa 2005)
    statusHukum: 'Haram Mutlak Bagi Umat Islam',
    badgeColor: 'rose',
    intiPutusan: 'Paham Pluralisme, Sekularisme, dan Liberalisme agama (Sipilis) bertentangan dengan ajaran Islam, dan haram bagi umat Islam untuk menganut dan menyebarluaskannya.',
    ketentuanPokok: [
      'Pluralisme agama yang menganggap semua agama sama benarnya adalah batil.',
      'Toleransi Islam (pluralitas) mengakui keberagaman sosial tanpa menyamakan kebenaran akidah.',
      'Sekularisme yang memisahkan agama dari kehidupan bernegara bertentangan dengan tauhid.',
      'Liberalisme pemikiran yang mendekonstruksi nash qath\'i adalah sesat.'
    ],
    landasan: 'Innad diina \'indallahil Islam & Wa man yabtaghi ghairal Islami dinan fa lan yuqbala minhu'
  },
  'fatwa-328': { // Perdukunan & Peramalan (2005)
    statusHukum: 'Haram Mutlak & Merusak Akidah',
    badgeColor: 'rose',
    intiPutusan: 'Segala bentuk praktik perdukunan (kahanah) dan peramalan nasib (\'irafah) serta mempercayainya hukumnya haram mutlak karena termasuk perbuatan syirik yang membatalkan keimanan.',
    ketentuanPokok: [
      'Mendatangi dan membenarkan perkataan dukun/peramal membatalkan pahala shalat 40 hari dan dapat menjerumuskan pada kekafiran.',
      'Penyiaran dan tayangan mistik/perdukunan di media massa haram diproduksi dan disebarkan.',
      'Umat Islam wajib membentengi diri dengan doa, zikir ma\'tsur, dan tawakal kepada Allah semata.'
    ],
    landasan: 'Man ata \'arraafan fa saddaqahu bima yaqulu fa qad kafara bima unzila \'ala Muhammad'
  },
  'fatwa-348': { // Jihad dan Khilafah dalam Konteks NKRI (2021)
    statusHukum: 'NKRI Konsensus Final / Tolak Khilafah Ekstremis',
    badgeColor: 'purple',
    intiPutusan: 'Bentuk Negara Kesatuan Republik Indonesia (NKRI) dan Pancasila adalah konsensus kebangsaan yang final (mu\'ahadah wathaniyyah); jihad dalam NKRI dimaknai sebagai upaya membangun kemaslahatan dan peradaban bangsa; paham khilafah yang bertujuan meruntuhkan NKRI tertolak.',
    ketentuanPokok: [
      'NKRI berdasar Pancasila tidak bertentangan dengan syariat Islam dan mengikat seluruh umat Islam.',
      'Jihad qital (perang fisik) hanya berlaku dalam situasi agresi militer penjajah yang mengancam kedaulatan tanah air.',
      'Gerakan transnasional yang memaksakan sistem khilafah dengan memicu perpecahan bangsa hukumnya haram.'
    ],
    landasan: 'Hifzhul Wathan minal Iman & Wajib Memenuhi Janji/Kesepakatan Bangsa'
  },
  'fatwa-366': { // Eksekusi Hukuman Mati Bandar Narkoba (2015)
    statusHukum: 'Sah & Boleh (Siyasah Syar\'iyyah)',
    badgeColor: 'rose',
    intiPutusan: 'Penerapan vonis hukuman mati bagi produsen, bandar, dan pengedar narkoba adalah sah dan dibolehkan (bahkan menjadi kewajiban pemerintah) dalam siyasah syar\'iyyah demi melindungi keselamatan jiwa dan akal generasi bangsa.',
    ketentuanPokok: [
      'Kejahatan narkoba terkategori jarimah ta\'zir yang menimbulkan kerusakan dahsyat bagi masyarakat (hirabah/ifsad fil ardh).',
      'Pemerintah berwenang menjatuhkan hukuman terberat berupa pidana mati untuk menimbulkan efek jera.',
      'Menolak grasi bagi gembong narkoba yang telah terbukti merusak jutaan jiwa.'
    ],
    landasan: 'Innama jaza\'ulladzina yuharibunallaha wa rasulahu wa yas\'awna fil ardhi fasadan...'
  },
  'fatwa-362': { // Suap, Korupsi dan Hadiah Pejabat (2000)
    statusHukum: 'Haram Mutlak & Mendapat Laknat',
    badgeColor: 'rose',
    intiPutusan: 'Praktik suap-menyuap (risywah), korupsi anggaran (ghulul), dan gratifikasi/hadiah kepada pejabat yang berkaitan dengan jabatannya hukumnya haram mutlak.',
    ketentuanPokok: [
      'Pemberi, penerima, dan perantara suap sama-sama dilaknat oleh Allah dan Rasul-Nya.',
      'Hadiah yang diberikan kepada pejabat publik terkait kewenangannya tergolong gratifikasi terlarang.',
      'Harta hasil korupsi wajib disita dan dikembalikan sepenuhnya ke kas negara.'
    ],
    landasan: 'La\'ana Rasulullahi SAW ar-rasyi wal murtasyi'
  },
  'fatwa-368': { // Evaluasi Pajak (2015)
    statusHukum: 'Pajak Boleh dengan Syarat Keadilan & Bebas Korupsi',
    badgeColor: 'emerald',
    intiPutusan: 'Pajak hanya boleh dipungut jika kas negara benar-benar defisit dan untuk membiayai kebutuhan mendesak rakyat; pemungutan pajak haram membebani rakyat miskin dan haram diselewengkan.',
    ketentuanPokok: [
      'Kebutuhan pokok masyarakat (pangan, pendidikan, kesehatan) tidak boleh dikenakan pajak yang mencekik.',
      'Tarif pajak wajib proporsional dengan mengutamakan pajak atas orang kaya dan korporasi besar.',
      'Pemerintah wajib transparan mengumumkan penggunaan anggaran pajak kepada publik.'
    ],
    landasan: 'La dharara wa la dhirara'
  },
  'fatwa-142': { // Hubungan Agama dan Politik (2018)
    statusHukum: 'Pedoman Kebangsaan / Simbiosis Agama dan Politik',
    badgeColor: 'purple',
    intiPutusan: 'Agama dan politik dalam Islam memiliki hubungan simbiotik saling melengkapi; politik wajib dijiwai nilai-nilai moral agama dan diarahkan demi mewujudkan keadilan sosial serta kemaslahatan rakyat.',
    ketentuanPokok: [
      'Pemisahan mutlak antara agama dan politik (sekularisme ekstrim) bertentangan dengan ajaran Islam.',
      'Penggunaan agama sebagai instrumen manipulasi politik adu domba atau politisasi SARA hukumnya haram.',
      'Umat Islam wajib memilih pemimpin yang amanah, adil, jujur, dan berpihak pada kepentingan bangsa.'
    ],
    landasan: 'Ad-dinu asasun was-sulthanu haris (Agama adalah fondasi dan kekuasaan politik adalah penjaganya)'
  },
  'fatwa-269': { // Perbankan Syariah (2009)
    statusHukum: 'Dukungan & Rekomendasi Penguatan Perbankan Syariah',
    badgeColor: 'purple',
    intiPutusan: 'Mendesak percepatan penguatan industri perbankan syariah nasional; pemerintah dan BUMN dihimbau menempatkan dana APBN/APBD pada bank-bank syariah guna mewujudkan sistem perekonomian yang adil dan bebas riba.',
    ketentuanPokok: [
      'Perbankan syariah adalah alternatif solusi ekonomi yang tahan terhadap krisis finansial global.',
      'Kementerian Keuangan dan BUMN didorong menjadi lokomotif penempatan dana institusi di perbankan syariah.',
      'Penguatan edukasi dan literasi keuangan syariah kepada seluruh lapisan masyarakat.'
    ],
    landasan: 'Ta\'awanu \'alal birri wat taqwa'
  },
  'fatwa-274': { // Bank Mata dan Donor Organ (2009)
    statusHukum: 'Mubah Demi Kemanusiaan / Haram Komersialisasi',
    badgeColor: 'emerald',
    intiPutusan: 'Wasiat mendonorkan kornea mata atau organ tubuh setelah wafat untuk menolong tuna netra atau orang sakit hukumnya mubah (boleh) sebagai amal jariah; segala bentuk jual beli organ tubuh manusia hukumnya haram mutlak.',
    ketentuanPokok: [
      'Donor organ harus atas dasar kerelaan ikhlas tanpa paksaan dan tanpa imbalan materiil.',
      'Dilarang keras memperjualbelikan organ tubuh manusia karena merendahkan martabat kemanusiaan.',
      'Tindakan transplantasi harus dilakukan oleh dokter bedah ahli yang berkompeten.'
    ],
    landasan: 'Wa man ahyaha fa ka\'annama ahyan-naasa jami\'a'
  },
  'fatwa-103': { // Faham Syiah (1984)
    statusHukum: 'Peringatan / Menolak Ajaran yang Menghina Sahabat',
    badgeColor: 'amber',
    intiPutusan: 'Mengingatkan umat Islam Indonesia tentang perbedaan pokok ajaran Syi\'ah Imamiyyah dengan Ahlus Sunnah wal Jama\'ah; menghimbau umat Islam waspada terhadap ajaran yang mencela sahabat Nabi, meragukan orisinalitas Al-Qur\'an, atau meyakini kemaksuman imam.',
    ketentuanPokok: [
      'Masyarakat muslim Indonesia yang berakidah Ahlus Sunnah wal Jama\'ah wajib mempertahankan kemurnian akidahnya.',
      'Menolak keras pelecehan dan pengkafiran terhadap para Sahabat Nabi dan Sayyidah Aisyah RA.',
      'Menghindari gesekan konflik horizontal antarumat beragama di Indonesia.'
    ],
    landasan: 'Hifzhul Ummah wa Hifzhul Aqidah'
  },
  'fatwa-98': { // Islam Jamaah / Baiat (1978)
    statusHukum: 'Aliran Menyimpang & Dilarang',
    badgeColor: 'rose',
    intiPutusan: 'Aliran Islam Jama\'ah dinyatakan menyimpang dan sesat karena ajarannya yang mengkafirkan kaum muslimin di luar kelompoknya, menganggap najis selain anggotanya, dan mewajibkan baiat mutlak kepada amir mereka.',
    ketentuanPokok: [
      'Ajaran yang mengkafirkan sesama muslim bertentangan dengan akidah Islam yang sahih.',
      'Pemerintah telah melarang keberadaan ajaran Islam Jamaah di seluruh Indonesia.',
      'Masyarakat dihimbau merangkul eks-pengikut untuk dibimbing kembali ke ajaran Islam yang lurus.'
    ],
    landasan: 'Larangan Mengkafirkan Kaum Muslimin (Takfir)'
  },
  'fatwa-144': { // Penulisan Al-Qur'an Huruf Latin (1977)
    statusHukum: 'Haram Menulis Mushaf Utuh dengan Huruf Selain Arab',
    badgeColor: 'rose',
    intiPutusan: 'Menuliskan kitab suci Al-Qur\'an secara utuh dengan menggunakan huruf latin atau aksara selain Arab hukumnya haram karena dapat merubah lafaz, makhraj, dan makna asli wahyu Ilahi; penulisan kutipan ayat singkat untuk transliterasi buku pelajaran dibolehkan.',
    ketentuanPokok: [
      'Mushaf Al-Qur\'an wajib ditulis dengan aksara Arab sesuai Rasm Utsmani.',
      'Huruf selain Arab tidak memiliki padanan makharijul huruf yang sempurna sehingga berpotensi mendistorsi makna Al-Qur\'an.',
      'Transliterasi fonetik hanya dibolehkan terbatas sebagai sarana bantu belajar bagi pemula.'
    ],
    landasan: 'Inna anzalnahu qur\'anan \'arabiyyan la\'allakum ta\'qilun'
  },
  'fatwa-145': { // Menghadapi Sidang Umum MPR 1978
    statusHukum: 'Tausiyah Politik & Bimbingan Moral Umat',
    badgeColor: 'purple',
    intiPutusan: 'Bimbingan dan tausiyah kebangsaan MUI dalam menghadapi Sidang Umum MPR 1978 agar seluruh wakil rakyat mengutamakan persatuan bangsa, keadilan sosial, dan menjaga aspirasi moral keagamaan umat Islam.',
    ketentuanPokok: [
      'Menjaga keutuhan NKRI dan Pancasila sebagai falsafah pemersatu bangsa.',
      'Menolak penyusupan aliran atau paham yang merongrong kemurnian ajaran agama.',
      'Menyerukan wakil rakyat agar amanah dan mendahulukan kepentingan rakyat kecil.'
    ],
    landasan: 'Ta\'awanu \'alal birri wat-taqwa'
  },
  'fatwa-129': { // Ibadah Haji Sekali Seumur Hidup (1984)
    statusHukum: 'Kewajiban Sekali / Sunnah Beri Kesempatan yang Belum',
    badgeColor: 'emerald',
    intiPutusan: 'Kewajiban ibadah haji menurut syariat Islam hanya berlaku satu kali seumur hidup bagi yang mampu (istitha\'ah); bagi yang sudah pernah haji, sangat dianjurkan memberikan prioritas dan kesempatan kepada saudara muslim yang belum pernah berhaji.',
    ketentuanPokok: [
      'Haji kedua dan seterusnya hukumnya sunnah, bukan lagi fardhu \'ain.',
      'Mengalihkan dana haji berulang untuk sedekah fakir miskin dan beasiswa pendidikan bernilai pahala sosial yang sangat besar.',
      'Mendukung antrean haji yang berkeadilan demi kemaslahatan kuota nasional.'
    ],
    landasan: 'Al-Hajju marratan faman zaada fahuwa tathawwu\''
  },
  'fatwa-160': { // Penderita HIV/AIDS (1996)
    statusHukum: 'Wajib Dirawat & Diurus Jenazahnya / Haram Dikucilkan',
    badgeColor: 'indigo',
    intiPutusan: 'Penderita HIV/AIDS wajib diperlakukan secara manusiawi, dirawat secara medis, dan tidak boleh dikucilkan; apabila penderita muslim wafat, jenazahnya wajib diurus (dimandikan, dikafani, dishalatkan, dikuburkan) dengan prosedur medis yang aman.',
    ketentuanPokok: [
      'Mengucilkan dan menelantarkan orang yang menderita penyakit HIV/AIDS hukumnya haram.',
      'Pengurusan jenazah muslim ODHA adalah fardhu kifayah yang tetap wajib dijalankan dengan APD medis.',
      'Mendorong edukasi pencegahan penularan tanpa stigma negatif bagi keluarga penderita.'
    ],
    landasan: 'Hurmatul Muslim Hayyan wa Mayyitan & Ihsan Ila Maridh'
  },
  'fatwa-161': { // Reksadana Syariah (1997)
    statusHukum: 'Mubah (Boleh) dengan Prinsip Bebas Riba',
    badgeColor: 'emerald',
    intiPutusan: 'Investasi melalui Reksadana Syariah dibolehkan (mubah) dengan akad mudharabah atau wakalah bil ujrah, selama portofolio investasinya hanya ditempatkan pada sektor usaha dan instrumen yang halal serta terbebas dari riba, judi (maysir), dan penipuan (gharar).',
    ketentuanPokok: [
      'Portofolio emiten wajib disaring (cleansing) dari industri makanan haram, miras, perjudian, dan perbankan konvensional.',
      'Menggunakan mekanisme bagi hasil yang adil dan transparan.',
      'Diawasi oleh Dewan Pengawas Syariah (DPS).'
    ],
    landasan: 'Al-Ashlu fil Mu\'amalati al-Ibahah'
  }
};

export { VERIFIED_FATWAS };
