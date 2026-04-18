# 🛠 Panduan Deployment SIGAPPA (Local to VPS)

Dokumen ini adalah instruksi standar untuk AI/Agent dalam mengelola proyek SIGAPPA, mulai dari pengeditan lokal hingga sinkronisasi ke VPS.

## 1. Konfigurasi Arsitektur (DILARANG UBAH)
Proyek ini menggunakan struktur **"Flattened Public"** di VPS untuk kemudahan akses root. Pengaturan berikut harus dipertahankan:

*   **Vite Config (`vite.config.js`)**: 
    `build.outDir` harus tetap `'../build'` (Hasil build harus sejajar dengan folder `sigappa`).
*   **Public Path (`app/Providers/AppServiceProvider.php`)**:
    Laravel dipaksa menggunakan `/var/www/html` sebagai public path via `$this->app->usePublicPath('/var/www/html')` saat berjalan di server.
*   **Literal Environment (`.env`)**:
    Selalu gunakan nilai literal untuk `VITE_APP_NAME="SIGAPPA"` (hindari interpolasi `${APP_NAME}`).

## 2. Alur Kerja Standar (Workflow)

### Tahap 1: Pengeditan & Build Lokal
1.  Lakukan perubahan kode pada file `resources/js/` atau `app/`.
2.  Jika ada perubahan pada file frontend (.tsx, .ts, .css), wajib jalankan build:
    ```powershell
    npm run build
    ```

### Tahap 2: Sinkronisasi ke VPS (SCP)
Gunakan perintah `scp` dari terminal **LOKAL** (bukan di dalam SSH).

**A. Sinkronisasi Tampilan (Folder Build):**
```powershell
scp -P 2244 -r ../build devel@103.175.204.247:/var/www/html/
```

**B. Sinkronisasi Backend (File PHP):**
Kirim file spesifik yang diubah, contoh:
```powershell
scp -P 2244 app/Http/Controllers/LandingController.php devel@103.175.204.247:/var/www/html/sigappa/app/Http/Controllers/LandingController.php
```

### Tahap 3: Eksekusi Remote (SSH)
Jalankan perintah maintenance di server setelah upload:

*   **Update Database (Migrasi):**
    ```bash
    ssh devel@103.175.204.247 -p 2244 "cd /var/www/html/sigappa && php artisan migrate --force"
    ```
*   **Bersihkan Cache:**
    ```bash
    ssh devel@103.175.204.247 -p 2244 "cd /var/www/html/sigappa && php artisan optimize:clear"
    ```

## 3. Informasi Server
*   **IP Server**: `103.175.204.247`
*   **SSH Port**: `2244`
*   **User**: `devel`
*   **Auth**: SSH Key (Tanpa Password)
*   **Root Path**: `/var/www/html/`

---
**Peringatan untuk AI:** Jika terjadi `Permission Denied` saat upload folder build, login via SSH dan rename folder build lama menjadi `build_old`, lalu buat folder `build` baru yang kosong sebelum mengulangi proses `scp`.
