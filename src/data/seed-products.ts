import { Product } from '@/types';

export const SEED_PRODUCTS: Omit<Product, 'id' | 'createdAt'>[] = [
  {
    name: 'Petal Whispers (Bisikan Kelopak)',
    category: 'Gaun Putih Floral',
    originalPrice: 550000,
    discountPercent: 3,
    price: 533500,
    description: 'Gaun mini manis bergaya princess ini memancarkan nuansa feminin yang anggun dengan warna putih lembut bertabur motif bunga-bunga kecil berwarna merah muda. Dilengkapi dengan kerah doll berenda putih yang cantik serta lengan balon transparan halus, gaun ini memiliki potongan tiered ruffle berlapis-lapis di bagian rok yang memberikan efek mekar dan mengembang sempurna saat dikenakan.',
    specs: {
      color: 'Putih Floral (Picture Color)',
      style: 'Sweet / Princess Dress (A-Line, Kerah Doll, Lengan Gelembung)',
      material: '100% Poliester',
      details: 'Print Motif Bunga, High Waist, Kerah Doll, Pullover',
      softnessnessAndThickness: 'Ketebalan Reguler, Kelembutan Sedang',
      seasonAge: 'Musim Panas (18–24 Tahun)'
    },
    sizeChart: {
      'S': '40 – 45 kg (Tinggi 150 – 168 cm)',
      'M': '45 – 50 kg (Tinggi 150 – 168 cm)',
      'L': '50 – 55 kg (Tinggi 150 – 168 cm)',
      'XL': '55 – 62,5 kg (Tinggi 150 – 168 cm)'
    },
    checkoutUrl: 'http://lynk.id/trunch/d74kovdx5kjv/checkout',
    lynkProductUuid: '6a8c1175728c54d9d6ded0ea-7594-8071039800-1787564405741',
    images: [
      '/images/petal-whispers/1.jpg',
      '/images/petal-whispers/2.webp',
      '/images/petal-whispers/3.webp',
      '/images/petal-whispers/4.webp',
      '/images/petal-whispers/5.webp',
    ],
    isActive: true
  },
  {
    name: 'Lavender Fly (Terbang Ungu)',
    category: 'Gaun Ungu Kupu-kupu',
    originalPrice: 600000,
    discountPercent: 5,
    price: 570000,
    description: 'Gaun panjang manis ala gaya Prancis ini hadir dengan perpaduan warna lavender ungu yang lembut dan dipenuhi cetakan motif kupu-kupu yang beterbangan indah di seluruh bagian kain. Desain suspender skirt bertingkat dengan potongan asymmetric ruffles ini dilengkapi outer selendang renda hitam berlengan panjang transparan, memberikan kesan romantis, misterius, sekaligus sangat elegan untuk acara istimewa.',
    specs: {
      color: 'Ungu',
      style: 'Gaya Prancis, Ins Style, Set 2 Pcs (Gaun Tali / Suspender + Selendang), Model A-Line, High Waist',
      material: '100% Poliester / Bahan Lainnya',
      details: 'Print Bunga & Kupu-kupu, Irregular Waist, Pullover (Sleeveless)',
      softnessnessAndThickness: 'Ketebalan Sedang, Kelembutan Sedang',
      seasonAge: 'Musim Panas (18–24 Tahun)'
    },
    sizeChart: {
      'S': '40 – 45 kg (Tinggi 150 – 168 cm)',
      'M': '45 – 50 kg (Tinggi 150 – 168 cm)',
      'L': '50 – 55 kg (Tinggi 150 – 168 cm)',
      'XL': '55 – 62,5 kg (Tinggi 150 – 168 cm)'
    },
    checkoutUrl: 'http://lynk.id/trunch/436d92xj63yo/checkout',
    lynkProductUuid: '6a8c11af95254ad0e9e7a8d6-6583-3369918954-1787564463377',
    images: [
      '/images/lavender-fly/1.jpg',
      '/images/lavender-fly/2.webp',
      '/images/lavender-fly/3.webp',
      '/images/lavender-fly/4.webp',
    ],
    isActive: true
  },
  {
    name: 'Oriental Raven (Gagak Oriental)',
    category: 'Gaun Hitam Gaya Cheongsam',
    originalPrice: 600000,
    discountPercent: 4,
    price: 576000,
    description: 'Gaun panjang berwawasan New Chinese gaya modern cheongsam ini memadukan nuansa hitam pekat yang klasik dengan aksen panel kain krem beruratif lukisan tinta tradisional pada bagian rok A-line. Dipadukan dengan kerah mandarin unik yang dihiasi aksen ikatan tali serta detail kerutan halus di bagian manset lengan, gaun ini menampilkan siluet langsing yang memancarkan pesona estetik khas timur.',
    specs: {
      color: 'Hitam',
      style: 'Retro, Gaya New Chinese Modifikasi, Model A-Line, Kerah Tegak, Lengan Panjang',
      material: '100% Bahan Lainnya (Kain Tenun)',
      details: 'Sambungan (Splicing), Print Pattern, High Waist, Resleting',
      softnessnessAndThickness: 'Ketebalan Reguler, Kelembutan Sedang',
      seasonAge: 'Musim Gugur / Musim Semi & Panas (18–24 Tahun)'
    },
    sizeChart: {
      'S': '40 – 45 kg (Tinggi 150 – 168 cm)',
      'M': '45 – 50 kg (Tinggi 150 – 168 cm)',
      'L': '50 – 55 kg (Tinggi 150 – 168 cm)',
      'XL': '55 – 62,5 kg (Tinggi 150 – 168 cm)'
    },
    checkoutUrl: 'http://lynk.id/trunch/r5rkp06k4gel/checkout',
    lynkProductUuid: '6a8c13e13e22d48038329b98-2099-3657524020-1787565025953',
    images: [
      '/images/oriental-raven/1.jpg',
      '/images/oriental-raven/2.webp',
      '/images/oriental-raven/3.webp',
      '/images/oriental-raven/4.webp',
      '/images/oriental-raven/5.webp',
    ],
    isActive: true
  },
  {
    name: 'Academy Chic (Gaya Akademi Modis)',
    category: 'Gaun Hitam Gaya Sekolah',
    originalPrice: 550000,
    discountPercent: 2,
    price: 539000,
    description: 'Tampil bergaya preppy ala akademi Eropa, gaun ini dirancang dengan gaya ilusi dua potong (fake two-piece) yang menggabungkan kemeja putih berlengan balon halus dengan outer rompi dan rok panjang hitam. Dilengkapi kancing emas dekoratif serta dasi pita hitam yang rapi di dada, gaun ini memberikan kesan cerdas, modis, dan penuh percaya diri.',
    specs: {
      color: 'Hitam',
      style: 'Gaya Preppy / College Style, Gaya Prancis, Model A-Line / Hip Skirt, Kerah Tali, Lengan Panjang, Pullover',
      material: '100% Poliester / Kain Sintetis',
      details: 'Sambungan (Fake Two-Piece), High Waist, Slim Fit',
      softnessnessAndThickness: 'Ketebalan Reguler, Kelembutan Sedang',
      seasonAge: 'Musim Panas (18–24 Tahun)'
    },
    sizeChart: {
      'S': '40 – 45 kg (Tinggi 150 – 168 cm)',
      'M': '45 – 50 kg (Tinggi 150 – 168 cm)',
      'L': '50 – 55 kg (Tinggi 150 – 168 cm)',
      'XL': '55 – 62,5 kg (Tinggi 150 – 168 cm)'
    },
    checkoutUrl: 'http://lynk.id/trunch/v5gw2yny298g/checkout',
    lynkProductUuid: '6a8c13eae4f30576c3a6430f-7588-3358666915-1787565034381',
    images: [
      '/images/academy-chic/1.jpg',
      '/images/academy-chic/2.webp',
      '/images/academy-chic/3.webp',
      '/images/academy-chic/4.webp',
      '/images/academy-chic/5.webp',
    ],
    isActive: true
  },
  {
    name: 'Coffee Muse (Inspirasi Kopi)',
    category: 'Gaun Cokelat Krem',
    originalPrice: 500000,
    discountPercent: 5,
    price: 475000,
    description: 'Mengusung hangatnya nuansa vintage ala kafe musim gugur, gaun ini memadukan atasan kemeja berlengan panjang berwarna krem dengan apron dress melangsai berwarna cokelat milki-coffee. Keindahan gaun ini semakin lengkap dengan detail sulaman renda putih melingkar di sepanjang kelim bawah rok, menciptakan penampilan santai yang terkesan manis dan artsy.',
    specs: {
      color: 'Khaki / Cokelat Krem',
      style: 'Gaya Hepburn, Prancis Retro, Model A-Line, Kerah Square, Lengan Panjang',
      material: 'Bludru / Poliester',
      details: 'High Waist, Slim Fit, Resleting',
      softnessnessAndThickness: 'Ketebalan Reguler, Kelembutan Sedang',
      seasonAge: 'Musim Gugur & Musim Dingin (18–24 Tahun)'
    },
    sizeChart: {
      'S': '40 – 45 kg (Tinggi 150 – 168 cm)',
      'M': '45 – 50 kg (Tinggi 150 – 168 cm)',
      'L': '50 – 55 kg (Tinggi 150 – 168 cm)',
      'XL': '55 – 62,5 kg (Tinggi 150 – 168 cm)'
    },
    checkoutUrl: 'http://lynk.id/trunch/6qy02v1wyk71/checkout',
    lynkProductUuid: '6a8c13ed999dbaa856f45ac4-1578-4774914847-1787565037987',
    images: [
      '/images/coffee-muse/1.webp',
      '/images/coffee-muse/2.webp',
      '/images/coffee-muse/3.webp',
    ],
    isActive: true
  },
  {
    name: 'Midnight Lace (Renda Tengah Malam)',
    category: 'Gaun Hitam Berenda',
    originalPrice: 500000,
    discountPercent: 3,
    price: 485000,
    description: 'Gaun vintage bergaya Hepburn ini menghadirkan perpaduan bahan beludru hitam pekat yang mewah dengan aksen kemeja lengan panjang berwarna krem berhiaskan pita leher yang anggun. Pinggiran renda putih renda bunga yang kontras di sepanjang bagian bawah rok menambah sentuhan klasik abad pertengahan yang dramatis namun tetap lembut.',
    specs: {
      color: 'Hitam',
      style: 'Gaya Hepburn, Prancis Retro, Model A-Line, Kerah Square, Lengan Panjang',
      material: 'Bludru / Poliester',
      details: 'High Waist, Slim Fit, Resleting',
      softnessnessAndThickness: 'Ketebalan Reguler, Kelembutan Sedang',
      seasonAge: 'Musim Gugur & Musim Dingin (18–24 Tahun)'
    },
    sizeChart: {
      'S': '40 – 45 kg (Tinggi 150 – 168 cm)',
      'M': '45 – 50 kg (Tinggi 150 – 168 cm)',
      'L': '50 – 55 kg (Tinggi 150 – 168 cm)',
      'XL': '55 – 62,5 kg (Tinggi 150 – 168 cm)'
    },
    checkoutUrl: 'http://lynk.id/trunch/213v6mvdvyq4/checkout',
    lynkProductUuid: '6a8c13f6eb73fc5298f2441a-1153-6101962369-1787565046633',
    images: [
      '/images/midnight-lace/1.jpg',
      '/images/midnight-lace/2.webp',
      '/images/midnight-lace/3.webp',
    ],
    isActive: true
  },
  {
    name: 'Matcha Meadow (Padang Rumput Matcha)',
    category: 'Gaun Hijau Floral',
    originalPrice: 550000,
    discountPercent: 4,
    price: 528000,
    description: 'Segar dan menawan bagaikan kebun teh di musim semi, gaun midi ini dibalut warna hijau matcha yang lembut dengan motif dedaunan dan bunga-bunga kecil. Potongan kerah persegi V-neck yang dihiasi aksen kancing mutiara serta lengan puff ramping memberikan tampilan vintage feminin yang mempesona.',
    specs: {
      color: 'Hijau Matcha',
      style: 'French Vintage, Cottagecore, Model A-Line, V-Neck/Kerah Persegi, Lengan Puff',
      material: '100% Chiffon Poliester',
      details: 'Print Floral, Kancing Mutiara, High Waist, Resleting Samping',
      softnessnessAndThickness: 'Ketebalan Ringan/Halus, Kelembutan Tinggi',
      seasonAge: 'Musim Panas (18–24 Tahun)'
    },
    sizeChart: {
      'S': '40 – 45 kg (Tinggi 150 – 168 cm)',
      'M': '45 – 50 kg (Tinggi 150 – 168 cm)',
      'L': '50 – 55 kg (Tinggi 150 – 168 cm)',
      'XL': '55 – 62,5 kg (Tinggi 150 – 168 cm)'
    },
    checkoutUrl: 'http://lynk.id/trunch/matcha-meadow/checkout',
    lynkProductUuid: '6a8c1400matcha-meadow-uuid-178756505000',
    images: [
      '/images/matcha-meadow/1.webp',
      '/images/matcha-meadow/2.webp',
      '/images/matcha-meadow/3.webp',
    ],
    isActive: true
  },
  {
    name: 'Noir Elegance (Keanggunan Hitam)',
    category: 'Gaun Malam Hitam',
    originalPrice: 650000,
    discountPercent: 5,
    price: 617500,
    description: 'Gaun malam hitam klasik dengan potongan A-line dramatis yang menonjolkan keindahan bentuk tubuh. Dibuat dari sutra satin matte berkilau lembut dengan aksen belahan transparan renda brokat halus di bagian bahu dan punggung.',
    specs: {
      color: 'Hitam Jet Black',
      style: 'Evening Dress, Classic Elegance, Model A-Line Full Length',
      material: 'Sutra Satin Premium & Brokat Renda',
      details: 'Renda Transparan Bahu, High Waist, Concealed Back Zipper',
      softnessnessAndThickness: 'Ketebalan Reguler, Kelembutan Sangat Halus',
      seasonAge: 'Semua Musim (18–30 Tahun)'
    },
    sizeChart: {
      'S': '40 – 45 kg (Tinggi 150 – 168 cm)',
      'M': '45 – 50 kg (Tinggi 150 – 168 cm)',
      'L': '50 – 55 kg (Tinggi 150 – 168 cm)',
      'XL': '55 – 62,5 kg (Tinggi 150 – 168 cm)'
    },
    checkoutUrl: 'http://lynk.id/trunch/noir-elegance/checkout',
    lynkProductUuid: '6a8c1405noir-elegance-uuid-178756506000',
    images: [
      '/images/noir-elegance/1.webp',
      '/images/noir-elegance/2.webp',
    ],
    isActive: true
  },
  {
    name: 'Velvet Rouge (Merah Beludru)',
    category: 'Gaun Merah Mewah',
    originalPrice: 680000,
    discountPercent: 5,
    price: 646000,
    description: 'Gaun pesta beludru berwarna merah wine (burgundy) yang mewah dan kaya akan kilau anggun. Potongan kerah sweetheart dipadukan dengan lengan panjang berstruktur mawar brokat, sangat sempurna untuk perayaan malam istimewa.',
    specs: {
      color: 'Merah Wine / Burgundy',
      style: 'Royal Vintage, Sweetheart Neckline, Slim Fit Mermaid A-Line',
      material: 'Beludru Premium Velvet',
      details: 'Sweetheart Neck, Lengan Mawar Brokat, Resleting Belakang',
      softnessnessAndThickness: 'Ketebalan Sedang, Kelembutan Sangat Halus',
      seasonAge: 'Musim Dingin / Pesta (18–30 Tahun)'
    },
    sizeChart: {
      'S': '40 – 45 kg (Tinggi 150 – 168 cm)',
      'M': '45 – 50 kg (Tinggi 150 – 168 cm)',
      'L': '50 – 55 kg (Tinggi 150 – 168 cm)',
      'XL': '55 – 62,5 kg (Tinggi 150 – 168 cm)'
    },
    checkoutUrl: 'http://lynk.id/trunch/velvet-rouge/checkout',
    lynkProductUuid: '6a8c1410velvet-rouge-uuid-178756507000',
    images: [
      '/images/velvet-rouge/1.jpg',
      '/images/velvet-rouge/2.webp',
      '/images/velvet-rouge/3.webp',
    ],
    isActive: true
  }
];
