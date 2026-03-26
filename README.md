# SIGAP-PKM (Admin & Backend System)

Repositori ini berisi kode sumber untuk sistem backend dan administrasi **SIGAP-PKM**. Sistem ini dibangun menggunakan arsitektur monolitik modern dengan Laravel sebagai inti backend dan Inertia.js yang menjembatani *frontend* React.

## Tech Stack Utama (Backend)
- **Framework:** Laravel 12.x
- **Database:** MySQL
- **Bridge:** Inertia.js (Server-side routing)
- **Autentikasi:** Laravel Breeze / Session-based
- **Environment:** PHP 8.4

## ✨ Fitur Utama Frontend (UI/UX & React Components)

Pembaruan besar-besaran pada sisi Frontend menggunakan **React + Inertia.js** dengan pendekatan **Premium Fintech UI Design**:

### 🔐 Autentikasi & Akun
- **Dual Login Pages**: Desain halaman login terpisah untuk **Dosen** dan **Masyarakat** dengan UI modern, split-screen desktop, dan mobile-friendly.
- **Form Verification / Register**: Komponen form dengan validasi global, input OTP simulasi, dan error state handling (Red Border & Error Toast).
- **Role Indicators**: Lencana penunjuk peran pengguna aktif (Dosen/Masyarakat) bergaya dinamis di atas peta (desktop) atau di dalam hamburger menu (mobile).

### 🗺️ Pemetaan (Map Dashboard)
- **Peta Interaktif (Leaflet)**: Peta full-screen (mobile) atau boxed-container (desktop) dengan marker kustom (Kuning: Berlangsung, Hijau: Selesai).
- **Search Widget**: Bar pencarian melayang dengan dropdown hasil auto-complete untuk mencari desa/nama P3M secara instan.
- **Glassmorphism Sidebars**: Panel kiri (Daftar Kegiatan) dan Panel Kanan (Detail Kegiatan) dengan efek *blur* gaya iOS/Fintech.
- **Bottom Sheet Mobile**: Implementasi native-feel *bottom sheet* (swipe-to-dismiss) untuk melihat detail lokasi di layar sentuh perangkat genggam.
- **Extended FAB**: Tombol Floating Action Button (`+`) warna gradasi biru dengan animasi *hover slide-in text* ("Buat Pengajuan").

### 📋 Komponen Form Premium & Interaktif
- **Sistem Validasi Global**: Semua form mengadopsi standar UI yang terpusat (asterisk wajib, border merah untuk field kosong, ikon FontAwesome *prefix* di dalam input).
- **Testimonial Modal (React Portal)**: Form Tulis Testimoni 1-Layar (Overlay penuh) dengan *Interactive Star Rating* (1-5 Bintang). Render bersih melepaskan diri dari CSS sidebar menggunakan `ReactDOM.createPortal`.
- **Dynamic Array Inputs**: Pada form Dosen, input untuk "Personil Terlibat" (Dosen, Mahasiswa, Staff) bersifat dinamis (Bisa ditambah `+` atau dihapus `-` secara instan).
- **Premium File Dropzone**: Drag & drop area untuk mengunggah proposal PDF atau gambar dokumentasi dengan ikon *cloud-arrow-up* / *file-pdf*.
- **Toast Notifications**: Notifikasi pop-up cantik berwarna untuk umpan balik *Success* atau *Error* usai pengiriman form.

---

## 🛠️ Tech Stack

| Teknologi | Keterangan |
|---|---|
| **Laravel** | Backend framework (PHP) |
| **React** | Frontend library (via Inertia.js) |
| **Inertia.js** | SPA bridge antara Laravel & React |
| **Leaflet** | Library peta interaktif |
| **react-leaflet** | React wrapper untuk Leaflet |
| **Vite** | Build tool & bundler |
| **Font Awesome** | Icon library |

---

## Akun Kebutuhan Tes
- **Email:** admin@poltekpar.ac.id
- **Password:** password

## 🚀 Instalasi & Setup

### Prasyarat
- PHP >= 8.4
- Composer
- Node.js & npm (Untuk *compile* *asset* Inertia)
- MySQL Server

## Panduan Instalasi (Development)

1. **Clone repositori** dari cabang `backend`:
   ```bash
   git clone -b backend https://github.com/nearmeoi/sigap-pkm.git
   cd sigap-pkm
   ```

2. **Install dependensi PHP (Backend)**
   ```bash
   composer install
   ```

3. **Install dependensi Node (Frontend/Inertia assets)**
   Bagian ini tetap diperlukan karena Laravel menggunakan Vite untuk me-*render* tampilan panel admin.
   ```bash
   npm install
   ```

4. **Konfigurasi Environment**
   Salin file konfigurasi bawaan Laravel dan sesuaikan pengaturan *database*-nya:
   ```bash
   cp .env.example .env
   ```
   Buka file `.env` dan atur koneksi *database*, misalnya:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=sigap_pkm
   DB_USERNAME=root
   DB_PASSWORD=
   ```

5. **Generate App Key**
   ```bash
   php artisan key:generate
   ```

6. **Migrasi Database & Seeding**
   Jalankan migrasi untuk membangun skema tabel sekaligus mengisi data awal (*dummy data* admin dll):
   ```bash
   php artisan migrate:fresh --seed
   ```

7. **Jalankan Aplikasi**
   Anda membutuhkan dua terminal yang berjalan bersamaan:

   *Terminal 1 (Backend PHP Server):*
   ```bash
   php artisan serve
   ```

   *Terminal 2 (Vite Asset Bundler):*
   ```bash
   npm run dev
   ```

Aplikasi sekarang dapat diakses melalui `http://localhost:8000`.

## � Struktur Folder Penting (Backend Context)
- `app/Models/` — Definisi skema relasi ORM (Pengajuan, Aktivitas, Pegawai, dll).
- `app/Http/Controllers/` — Logika bisnis REST dan *controller* pengatur rute.
- `database/migrations/` — Skema pembangunan *database*.
- `routes/web.php` — Titik masuk *routing* aplikasi utama.
- `resources/js/` — Direktori komponen React untuk panel administratif (dikendalikan via Inertia).

