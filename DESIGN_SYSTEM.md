# SIGAP-PKM Admin Design System

Panduan sistem desain untuk memastikan konsistensi visual dan efisiensi pengembangan di Admin Panel SIGAP-PKM.

## 1. Fondasi Visual

### Palet Warna
Sistem ini menggunakan palet warna yang bersih dan profesional, berbasis pada skala **Zinc** untuk antarmuka netral dan **Indigo** serta **Emerald** untuk penegasan aksi.

| Warna | Variabel CSS | Hex | Pengunaan |
|-------|--------------|-----|-----------|
| **Background** | `--admin-bg` | `#fafafa` | Warna latar belakang halaman utama. |
| **Surface** | `--admin-surface` | `#ffffff` | Warna latar belakang kartu dan modal. |
| **Primary** | `--admin-primary` | `#4f46e5` | Indigo-600. Digunakan untuk aksi utama. |
| **Success** | `--admin-success` | `#10b981` | Emerald-500. Status selesai/berhasil. |
| **Warning** | `--admin-warning` | `#f59e0b` | Amber-500. Status revisi/perhatian. |
| **Danger** | `--admin-danger` | `#ef4444` | Red-500. Aksi destruktif/status ditolak. |
| **Border** | `--admin-border` | `#e2e8f0` | Zinc-200. Garis pemisah komponen. |

### Tipografi
- **Font Family**: Inter, Figtree, system-ui.
- **Ukuran Header**:
  - H1: `24px` (Bold, Tracking Tight)
  - H2: `18px` (Semibold)
- **Ukuran Body**: `14px` (Standar), `12px` (Keterangan/Meta).

### Shadow & Radius
- **Border Radius**: `12px` (XL) untuk kartu utama, `8px` (LG) untuk tombol dan input.
- **Box Shadow**: `shadow-sm` (0 1px 2px 0 rgb(0 0 0 / 0.05)).

---

## 2. Komponen UI Standar

### Tombol (Button)
- **Primary**: Latar belakang solid (Indigo), teks putih. Untuk aksi simpan/buat.
- **Secondary**: Border Zinc-200, latar putih, teks Zinc-700. Untuk aksi batal/kembali.
- **Ghost**: Tanpa border/latar, teks Zinc-500. Untuk aksi navigasi minor.

### Kartu (Card)
Setiap bagian konten harus dibungkus dalam kartu dengan:
- `bg-white`, `rounded-xl`, `border-zinc-200`, `shadow-sm`.
- Padding standar: `p-6`.

### Badge Status
Indikator status harus mengikuti pola:
- **Diproses**: Biru (Light background, dark text).
- **Diterima**: Hijau (Light background, dark text).
- **Revisi**: Oranye (Light background, dark text).
- **Ditolak**: Merah (Light background, dark text).

---

## 3. Tata Letak (Layout)

### Sidebar
- Lebar tetap: `256px` (`w-64`).
- Background: `bg-zinc-900`.
- Text nav: `text-zinc-400`, aktif `text-white bg-zinc-800`.

### Main Content
- Margin kiri: `256px` (Desktop).
- Max width konten: `1400px` (Center auto).
- Padding standar: `p-6` hingga `p-8`.

---

## 4. Panduan Implementasi (React)

Gunakan komponen atomik yang terletak di `@/Components/Admin/UI/` (Segera diimplementasikan) untuk meminimalkan penulisan class Tailwind manual yang berulang.

Contoh struktur kartu:
```tsx
<div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-zinc-200/80 bg-zinc-50/50">
        <h2 className="text-[14px] font-semibold text-zinc-900">Judul Bagian</h2>
    </div>
    <div className="p-6">
        {/* Konten di sini */}
    </div>
</div>
```
