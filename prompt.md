# Spesifikasi Toko

Buatkan web toko online bernama **Trunch Store** (domain: trunch.store). Data produk awal (nama, kategori, harga normal, diskon, harga setelah diskon, deskripsi, spesifikasi bahan, tabel ukuran, link checkout lynk.id, dan UUID produk lynk.id) di-*seed* dari `detail.md` ke database, lalu selanjutnya dikelola lewat halaman admin. Seluruh foto produk diambil dari folder gambar di workspace ini — cocokkan nama file dengan nama produknya. Stack: web app dengan sisi server (backend wajib ada karena harus menerima webhook), Firebase Authentication (Google Sign-In) + Firestore untuk data user, produk, dan order, serta peta open source (Leaflet + OpenStreetMap, geocoding via Nominatim) — **jangan pakai Google Maps API**.

**Aturan bisnis penting yang berlaku di seluruh aplikasi:**
- **TIDAK ada fitur keranjang belanja.** Satu checkout = satu produk, satu ukuran, qty 1. Jangan buat halaman/ikon keranjang di mana pun.
- **Gratis ongkir ke seluruh Indonesia.** Tidak ada perhitungan ongkir, tidak ada pilihan kurir di sisi customer, dan nominal yang dibayar selalu sama dengan harga produk setelah diskon.
- **Sistem Pre-Order maksimal 30 hari** terhitung sejak pembayaran dikonfirmasi, mencakup proses jahit + pengiriman.

**Total ada 4 halaman:**

1. **Homepage** — urutan section dari atas ke bawah: hero section singkat, carousel ulasan pelanggan, langsung daftar produk (katalog grid), section Terms & Conditions, lalu footer. Isi utama T&C: PO maksimal 30 hari (jahit + kirim), gratis ongkir seluruh Indonesia, dan ketentuan pembatalan/penukaran. Di header paling kanan ada tombol **Login**; jika user sudah login, tombol berubah menjadi tombol **Client** dengan badge angka berisi jumlah barang yang sedang diproses (semua order milik user itu yang statusnya belum `done`).

2. **Halaman Detail Produk** — muncul saat salah satu katalog di homepage diklik. Isinya galeri foto produk, deskripsi lengkap, spesifikasi, tabel ukuran, pilihan ukuran (S/M/L/XL), form **"Note"** (catatan bebas untuk penjahit), dan tombol **Checkout**. Wajib login dan profil sudah lengkap sebelum bisa checkout.

   Alur saat tombol Checkout ditekan:
   - **Cek order pending dulu.** Jika user sudah punya order berstatus `pending` untuk **produk yang sama** (apa pun ukurannya), tampilkan popup: *"Order kamu sebelumnya masih pending nih, mau dilanjutkan?"* dengan dua tombol — **"Lanjutkan"** (batalkan checkout yang baru, langsung buka link checkout milik order pending yang lama) dan **"Tidak"** (hapus order pending yang lama, lalu buat order baru sesuai pilihan sekarang). Aturan ini menjamin **satu user hanya boleh punya satu order pending per produk**, sehingga tidak pernah ada dua order pending untuk produk sama dengan ukuran berbeda.
   - Setelah itu backend membuat/menggunakan record order berstatus `pending` berisi userId, email akun, produk, `lynkProductUuid`, ukuran, note, alamat terpilih, dan harga.
   - Terakhir, buka **window/popup Chrome baru** menuju link checkout lynk.id milik produk tersebut. Sebelum popup terbuka, tampilkan catatan yang jelas: *"Pastikan email yang kamu isi di halaman pembayaran sama dengan email akun kamu di www.trunch.store. Jika mengalami kendala, hubungi +62 851-7994-2243."* Teks yang sama ditampilkan lagi di halaman Client pada order berstatus pending.

3. **Halaman Client** — wajib login Google via Firebase. Setelah login pertama kali, user **wajib** melengkapi profil sebelum bisa checkout: nama, No. WhatsApp (tanpa verifikasi/konfirmasi OTP), dan alamat lengkap dalam form terpisah per field: provinsi, kabupaten/kota, kecamatan, detail alamat, patokan, label alamat (misal "Rumah", "Kantor"), plus pin lokasi di peta open source. User bisa menyimpan lebih dari satu alamat dan memilih alamat default. Isi halaman client: daftar & ringkasan order, status/tracking order (termasuk hitung mundur PO 30 hari), tombol lanjutkan-bayar untuk order pending, pengaturan alamat (tambah/edit/hapus), dan pengaturan profil. **Tanpa menu keranjang.**

4. **Halaman Admin** — hanya bisa diakses lewat route `/admin` (tidak ada link/tombol ke sana dari UI publik), dengan **apprustic@gmail.com** sebagai admin default. Isinya:
   - **Manajemen pesanan:** board **drag and drop** yang digeser ke kanan mengikuti urutan status `pending → order confirm → production → packaging → shipping → delivery → done`. Tiap kartu bisa dibuka untuk melihat detail lengkap: produk, ukuran, note, nama, No. WA, email, alamat lengkap + pin peta, harga, waktu order, dan data pembayaran dari webhook (refId, nominal, waktu bayar).
   - **Manajemen produk (CRUD penuh):** tambah, edit, dan hapus produk. Field yang bisa diatur: nama, kategori, deskripsi, spesifikasi, tabel ukuran, harga normal, persentase diskon (harga akhir dihitung otomatis), upload/urutkan foto, status tayang (aktif/nonaktif), serta dua field integrasi wajib — **link checkout lynk.id** dan **`lynkProductUuid`**. Beri peringatan di form kalau `lynkProductUuid` kosong, karena tanpa itu pembayaran tidak bisa dicocokkan otomatis.
   - **Dashboard analitik lengkap:** total omzet, jumlah order per status, produk terlaris, tren penjualan harian/bulanan, rata-rata nilai order, konversi pending → paid, dan daftar pembayaran yang gagal dicocokkan.

---

## PARAGRAF 2 — Integrasi Checkout & Webhook lynk.id

Order punya **2 sisi**: sisi **trunch.store** yang menyimpan seluruh data pesanan (user, produk, ukuran, note, alamat, status produksi) dan menjadi *source of truth* untuk fulfillment; dan sisi **lynk.id** yang hanya mengurus pembayaran. Karena link checkout lynk.id bersifat statis per produk dan tidak membawa balik ID order kita, satu-satunya cara mengonfirmasi pembayaran adalah **menangkap webhook** dari lynk.id. Di `detail.md` sudah dilampirkan contoh payload webhook asli hasil testing untuk tiap produk — gunakan sebagai acuan struktur data sekaligus fixture untuk unit test.

**Endpoint.** Buat endpoint server-side `POST /api/webhooks/lynk` yang menerima `Content-Type: application/json`. Daftarkan URL ini di dashboard lynk.id; **merchant key baru muncul setelah URL webhook disimpan**, lalu taruh di environment variable `LYNK_MERCHANT_KEY`. Jangan pernah hardcode key di source code.

**Verifikasi signature (sesuai dokumentasi resmi lynk.id).** Signature **bukan** HMAC dari seluruh body. Cara verifikasinya:

```
signatureString   = String(grandTotal) + refId + message_id + LYNK_MERCHANT_KEY
expectedSignature = sha256(signatureString)  // hex, lowercase
valid             = timingSafeEqual(expectedSignature, header["x-lynk-signature"])
```

Di mana `grandTotal` diambil dari `data.message_data.totals.grandTotal`, `refId` dari `data.message_data.refId`, dan `message_id` dari `data.message_id`. Jika tidak valid, balas `401` dan jangan proses apa pun. Dua catatan wajib:
- Karena signature hanya mengunci tiga field itu, **field lain (`customer.email`, `items[].uuid`, `title`, `price`) tidak ikut ditandatangani** — jadi jangan percaya begitu saja: harga dan produk tetap harus divalidasi ulang terhadap data katalog di database kita.
- Pada contoh payload, `grandTotal` bernilai `0` karena dipakai voucher `TESTING`. Buat konversi angka ke string-nya fleksibel (tangani `0`, `"0"`, dan kemungkinan format desimal), dan **log setiap signature mismatch beserta signatureString yang dihitung** supaya formatnya gampang dikalibrasi saat transaksi asli pertama.

**Field yang diambil.** Proses hanya jika `event == "payment.received"` **dan** `data.message_action == "SUCCESS"` **dan** `data.message_code == "0"`. Dari `data.message_data` ambil: `customer.email`, `customer.name`, `customer.phone`, `refId`, `createdAt`; dari `items[0]`: `uuid` (ID produk lynk.id), `title`, `price`, `qty`; dari `totals`: `totalPrice` dan `grandTotal`. Untuk **validasi nominal bisnis** pakai `totals.totalPrice` atau `items[0].price` (bukan `grandTotal`, yang bisa 0 karena voucher) — tapi untuk **signature tetap wajib `grandTotal`**. Abaikan `shippingAddress` dan `shippingInfo` yang selalu kosong: alamat pengiriman selalu diambil dari profil client di trunch.store, dan ongkir selalu gratis.

**Pencocokan order.** Cocokkan berdasarkan **`items[0].uuid` → `lynkProductUuid` di katalog**, lalu cari order berstatus `pending` milik user dengan email tersebut. **Jangan pernah mencocokkan berdasarkan `title`**, karena judul produk di lynk.id sering diganti untuk keperluan marketing. Berkat aturan "satu order pending per user per produk" di paragraf 1, kombinasi (email + lynkProductUuid) dijamin hanya menghasilkan **maksimal satu** order pending — jadi tidak ada ambiguitas ukuran. Perlakukan email sebagai pencocokan case-insensitive dan trim spasi; jika email di lynk.id ternyata berbeda dari email akun (customer salah isi), jangan gagal diam-diam — lanjut ke penanganan di bawah.

**Jika tidak ketemu.** Simpan payload utuh ke koleksi `unmatched_payments` dengan status `needs_review`, tampilkan di dashboard admin sebagai notifikasi, dan sediakan aksi "cocokkan manual" satu klik ke order pending mana pun. Kirim juga alert (email/WA) ke admin. Kasus paling umum: customer memakai email berbeda saat bayar — makanya nomor bantuan **+62 851-7994-2243** ditampilkan di layar checkout.

**Idempotensi & respons.** Gunakan `refId` sebagai idempotency key dengan unique index; jika `refId` yang sama masuk lagi (retry dari lynk.id), balas `200 OK` tanpa mengubah data apa pun. Tolak juga payload dengan `createdAt` yang terlalu lama (misal > 24 jam) sebagai perlindungan replay. Saat pembayaran berhasil dicocokkan: ubah status order `pending → order confirm`, simpan record pembayaran (refId, nominal, waktu, message_id, raw payload), mulai hitung mundur PO 30 hari, dan badge di header client otomatis bertambah. Selalu balas `200` dengan cepat (proses berat dijalankan setelah respons) supaya lynk.id tidak menganggap webhook gagal, dan log setiap webhook masuk beserta hasil verifikasinya untuk audit.

**Sinkronisasi UI (opsional tapi disarankan).** Popup checkout dibuka dengan `window.open`, jadi halaman produk tahu orderId-nya. Setelah popup tertutup atau setelah beberapa detik, poll status order dari Firestore (atau pakai listener realtime) agar status di halaman Client langsung berubah begitu webhook masuk, tanpa perlu refresh manual.

**Environment variables yang dibutuhkan:** `LYNK_MERCHANT_KEY`, konfigurasi Firebase (`FIREBASE_API_KEY`, `FIREBASE_PROJECT_ID`, service account untuk Admin SDK), `ADMIN_EMAIL=apprustic@gmail.com`, dan `SUPPORT_WA=+6285179944243`. Sertakan file `.env.example`.