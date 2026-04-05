# Rencana Eksekusi Refactoring UI/UX SIGAP-PKM

Berdasarkan kesepakatan pada `DESIGN_SYSTEM.md` (menggunakan warna Poltekpar Makassar `#046bd2`, `#163260`, `#e3b96a` dan font **Plus Jakarta Sans**), berikut adalah rencana implementasi komprehensif untuk merombak seluruh basis kode *frontend* agar seragam 100%.

> [!IMPORTANT]
> **User Review Required**
> Ini adalah cetak biru perubahan sistem yang akan menyentuh seluruh sistem Anda (Publik, Panel User, dan Panel Admin). Berikan persetujuan Anda sebelum saya mengeksekusi ini satu per satu.

---

## Tahap 1: Fondasi Sistem Desain (Base Configuration)

Semua halaman akan menarik instruksi dari fondasi ini, jadi tahap ini sangat krusial.

#### [MODIFY] `tailwind.config.js`
- Menambahkan *custom colors* (poltekpar-primary, poltekpar-navy, poltekpar-gold).
- Mengubah `sans` font family default menjadi *Plus Jakarta Sans*.

#### [MODIFY] `resources/css/app.css`
- Membersihkan variabel lawas (`--primary-color`, dll) dan gaya-gaya spesifik elemen (`.landing-map-stat-card`, rupa-rupa form) yang berantakan.
- Menyematkan import Google Fonts untuk "Plus Jakarta Sans".

#### [MODIFY] `resources/views/app.blade.php`
- Memastikan font dimuat secara global melalui tag `<link>` di bagian head.

---

## Tahap 2: Komponen Publik & Peta Sebaran

Area ini adalah wajah utama aplikasi. Karena desain lama cenderung penuh dan sesak, kita akan merampingkannya menjadi kartu *glassmorphism* modern.

#### [MODIFY] `resources/js/Pages/LandingPage.tsx`
- Mengganti gaya *layer* menjadi kartu terapung (`rounded-xl shadow-xl`).
- Teks menggunakan warna *Navy* untuk wibawa institusi.

#### [MODIFY] `resources/js/Pages/MapDashboard.tsx`
- Merombak UI Widget Pencarian di sisi kiri agar melayang di atas peta.
- Panel Detail *Marker* dirapikan, mengganti font tebal yang kaku dengan hierarki Plus Jakarta Sans yang ramah baca.

#### [MODIFY] `resources/js/Components/Navbar.tsx` & `Header.tsx`
- Menambahkan batas halus di bawah (`border-b border-slate-200 shadow-sm`), indikator halaman aktif berwarna emas, dan konsistensi tombol *Login*.

---

## Tahap 3: Halaman Pengguna (Dosen & Masyarakat/Instansi)

Saat *user* melakukan input pengajuan PKM maupun testimoni, form harus terasa elegan seperti Google Form modern, bukan sekadar tabel data kaku.

#### [MODIFY] `resources/js/Pages/Auth/Pengajuan.tsx`
- Melapis *background* abu-abu terang (`bg-slate-50`), dan mengurung form pengajuan di dalam kanvas kartu putih (`bg-white rounded-xl shadow-sm`).
- Memisahkan seleksi "Pengajuan Dosen" dan "Instansi" melalui *Tabs* bergaya elegan.

#### [MODIFY] `resources/js/Components/DosenSubmissionCard.tsx` & `MasyarakatSubmissionCard.tsx`
- Mengimplementasikan input standar sesuai rujukan `DESIGN_SYSTEM.md` (`rounded-md`, `border-slate-300`, `focus:ring-poltekpar-primary`).
- Mengganti styling tombol "Simpan Pengajuan" menjadi *Primary Button* standar.

---

## Tahap 4: Halaman Autentikasi (Gateway Panel)

Halaman ketika *User* & *Admin* masuk ke sistem.

#### [MODIFY] `resources/js/Pages/Auth/LoginDosen.tsx`, `LoginMasyarakat.tsx`, `Register.tsx`
- Menggantikan *gradient banner* lama yang bertabrakan dengan logo kampus.
- Menyederhanakan form login menjadi kartu di tengah yang *clean*, mengacu ke desain TailAdmin minimalis.

---

## Tahap 5: Area Panel Admin (Dashboard, Detail, Master Data)

Panel Admin sudah mulai berubah minggu lalu, namun belum utuh menggunakan standar `DESIGN_SYSTEM.md`. 

#### [MODIFY] `resources/js/Pages/Admin/Dashboard.tsx`
- Menyeragamkan warna kartu metrik (`bg-white shadow-sm border-slate-200 rounded-xl`).
- Mempertebal pemisah header dari tabel (Typography).

#### [MODIFY] `resources/js/Pages/Admin/Pengajuan/Detail.tsx` (serta Admin Panel lainnya)
- Memastikan status "Disetujui" (Hijau), "Proses" (Kuning), "Ditolak" (Merah) menggunakan palet *Emerald*, *Amber*, *Rose* murni dari Tailwind.
- Tombol aksi diverifikasi/diubah menggunakan struktur *outline* atau solid yang rapi.

---

## ❓ Open Questions

Apakah rencana pembagian ini dirasa sudah mencakup semua elemen yang ingin Anda seragamkan dengan desain web resmi Poltekpar Makassar? 

Jika **Setuju**, maka saya akan langsung masuk ke pengerjaan **Tahap 1** saat ini juga. Harap konfirmasi.
