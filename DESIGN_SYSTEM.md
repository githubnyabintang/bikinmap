# Sitem Desain SIGAP-PKM (Poltekpar Makassar)

Dokumen ini adalah *"Single Source of Truth"* untuk seluruh standardisasi UI/UX aplikasi SIGAP-PKM. Desain ini mengikuti identitas visual resmi **Politeknik Pariwisata Makassar** seperti yang ada di website utama kampus.

Karakteristik desain aplikasi SIGAP-PKM adalah: **Profesional, Akademis, Modern (Glassmorphism Halus), & Ramah Pengguna**.

---

## 🎨 1. Palet Warna (Color System)

Seluruh warna utama dalam aplikasi wajib merujuk pada variabel Tailwind (atau CSS Hex) berikut. Dilarang keras menggunakan warna *hardcoded* yang melenceng dari standar ini.

### 🔷 Primary (Utama Poltekpar)
Biru utama digunakan untuk aksi (tombol, link), elemen fokus/hover, dan identitas brand.
*   **Base (Primary)**: `#046bd2` (Biru terang resmi Poltekpar) -> di-mapping di Tailwind sebagai `bg-primary` atau `bg-blue-600`.
*   **Hover/Active**: `#045cb4` (Satu tingkat lebih gelap untuk efek hover).
*   **Poltekpar Navy**: `#163260` atau `#124888`. Biru Dongker untuk Heading Utama, navbar, atau elemen yang butuh nuansa sangat resmi/klasik.

### 🌟 Accent (Aksen Poltekpar)
Kuning Emas untuk menyorot status penting, progress, atau kursor seleksi interaktif (identik dengan corak Bugis).
*   **Gold**: `#e3b96a` atau `amber-500` (`#f59e0b`).
*   **Gold Hover**: `#eac449` (Lebih terang).

### ⚪ Neutral & Surface (Netral & Latar Belakang)
Background selalu bersih, untuk menonjolkan konten utama.
*   **Latar Halaman Publik/Peta**: `bg-slate-50` (`#f8fafc`) atau putih `bg-white`.
*   **Latar Input/Form**: `bg-white` dengan border `border-slate-200`.
*   **Teks Utama (Body)**: `text-slate-700` (`#334155`). Nyaman di mata, tidak terlalu hitam pekat.
*   **Teks Judul (Heading)**: `text-slate-900` (`#0f172a`) atau `text-poltekpar-navy` (`#163260`).

### 🚦 Semantik (Status / Feedback)
Digunakan secara spesifik untuk badge status, notifikasi, dan action alert.
*   **Success (Selesai/Diverifikasi)**: `bg-emerald-500` / `text-emerald-700` dengan border `border-emerald-200` + latar `bg-emerald-50`.
*   **Warning (Proses/Revisi)**: `bg-amber-500` / `text-amber-700` dengan border `border-amber-200` + latar `bg-amber-50`.
*   **Danger (Ditolak/Error)**: `bg-rose-500` / `text-rose-700` dengan border `border-rose-200` + latar `bg-rose-50`.
*   **Info (Draft/Netral)**: Menggunakan warna Primary (`#046bd2`) atau `slate-500`.

---

## 🔤 2. Tipografi (Typography)

Seluruh aplikasi SIGAP-PKM menggunakan **Plus Jakarta Sans** layaknya web Poltekpar, karena tingkat keterbacaan yang tinggi dan nuansa administratif modern.

1.  **H1 (Mega Header)**: `text-3xl font-extrabold tracking-tight` (Digunakan di judul Peta / Landing Page).
2.  **H2 (Header Halaman)**: `text-2xl font-bold` (Digunakan di Judul Halaman Admin, atau Judul Form).
3.  **H3 (Card Title)**: `text-lg font-semibold` (Untuk header di dalam card / modal).
4.  **Body (Teks Paragraf)**: `text-sm font-normal leading-relaxed` (Tabel, Deskripsi).
5.  **Label Form**: `text-sm font-medium text-slate-700 mb-1`.

---

## 📦 3. Bentuk Dasar & Estetika (Shape & Elevation)

### Rounded Corners (Sudut Melengkung)
Platform SIGAP-PKM kini sepenuhnya beralih dari bentuk kaku persegi menjadi bentuk organik modern.
*   **Card / Modal Utama**: `rounded-xl` (12px). Ini standar emas modern.
*   **Tabel / Dropdown / Gambar**: `rounded-lg` (8px).
*   **Input Form / Tombol**: `rounded-md` (6px) agar ruang klik terasa solid namun tidak terlalu bulat.
*   **Pill / Badges**: `rounded-full` (Membulat penuh di sudut kiri kanan).

### Shadow (Bayangan)
Fokus pada bayangan *soft* (lembut) tapi tegas, bukan bayangan pekat ala desain kuno. Menggunakan standar skala Tailwind.
*   **Hover Button / Card Biasa**: `shadow-sm` (Sangat halus, seakan terangkat sedikit).
*   **Card Form Konten**: `shadow` (Bayangan default).
*   **Dropdown / Menu Mengambang**: `shadow-md` (Jelas terpisah dari background).
*   **Modal Utama / Peta Card Float**: `shadow-xl` (Bayangan lebar dan difus agar fokus user hanya di card tersebut).

*(Tip: Jika latar kartu berwarna putih di atas latar abu-abu terang, gunakan `border border-slate-200 shadow-sm` untuk membatasi ruang visual dengan elegan).*

---

## 🏗️ 4. Spesifikasi Komponen Inti

Semua pembuatan fungsi UI baru **wajib** mengikuti pola kode (class list) berikut:

### 4.1. Tombol (Buttons)
*   **Primary Button (Kirim/Simpan)**: 
    ```html
    class="inline-flex justify-center items-center px-4 py-2 bg-[#046bd2] hover:bg-[#045cb4] text-white text-sm font-medium rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#046bd2]"
    ```
*   **Secondary Button (Batal/Tutup)**:
    ```html
    class="inline-flex justify-center items-center px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200"
    ```
*   **Danger Button (Hapus)**: (Sama dengan Primary, hanya `bg-[#046bd2]` diganti `bg-rose-600` dan hover `hover:bg-rose-700`).

### 4.2. Form Inputs (Input, Select, Textarea)
Setiap field input **selalu** memiliki struktur label, input, dan error state (jika ada).
```html
<div>
  <label class="block text-sm font-medium text-slate-700 mb-1">Nama Kegiatan</label>
  <input type="text" 
    class="w-full rounded-md border-slate-300 shadow-sm focus:border-[#046bd2] focus:ring focus:ring-[#046bd2] focus:ring-opacity-20 text-sm py-2 px-3 transition-colors"
    placeholder="Masukkan nama..."
  />
</div>
```
*(Catatan: Input file `type="file"` menggunakan gaya ringkas, jangan biarkan gaya HTML default yang jelek).*

### 4.3. Alerts & Flash Messages
Alerts merapat ke tepi kanvas (misal: Pojok Kanan Atas `toast`) atau dalam kontainer penuh jika berupa pengumuman statis.
*   **Bentuk Statis HTML (Success)**:
    ```html
    <div class="rounded-lg bg-emerald-50 p-4 border border-emerald-200 mb-4 flex items-start">
      <LucideCheckCircle class="h-5 w-5 text-emerald-500 mt-0.5 mr-3 shrink-0" />
      <div>
        <h3 class="text-sm font-medium text-emerald-800">Berhasil Disimpan</h3>
        <p class="mt-1 flex text-sm text-emerald-700">Data pengajuan PKM telah terkirim.</p>
      </div>
    </div>
    ```

### 4.4. Modal & Dialog
*   **Backdrop**: Hitam transparan `bg-black/50 backdrop-blur-sm z-50 fixed inset-0`.
*   **Panel**: Berada di tengah layar, lebar maksimal (misal `max-w-md` atau `max-w-2xl`).
*   **Panel Style**: `bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden transform transition-all`.
*   **Header Modal**: Memiliki border bawah `border-b border-slate-100 p-4 flex justify-between items-center` dan tombol "X" (Close) warna `text-slate-400 hover:text-slate-600`.

### 4.5. Ikon & Navigasi Peta (Map Floating UI)
*   Ikon hanya gunakan **Lucide React**. Ukuran standar `w-4 h-4` (dalam teks), `w-5 h-5` (standar tombol/list), atau `w-6 h-6` (untuk stat/card icon).
*   *Floating Element* pada peta harus selalu mempunyai `bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200`.

---
**Dokumentasi ini bersifat hidup.** Jika Anda menemukan elemen baru yang membutuhkan standardisasi, tambahkan ke dalam `DESIGN_SYSTEM.md` ini terlebih dahulu sebelum mengimplementasikannya secara sporadis ke seluruh kode.
