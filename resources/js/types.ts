/**
 * PkmData — sesuai dengan response dari routes/web.php (landing) dan DashboardController.
 * Field ini di-mapping langsung dari model Pengajuan.
 */
export interface PkmData {
    id: number | null;
    nama: string;
    tahun: number;
    status: 'selesai' | 'berlangsung' | string;
    deskripsi: string;
    thumbnail: string | null;
    provinsi: string;
    kabupaten: string;
    kecamatan: string;
    desa: string;
    lat: number;
    lng: number;
}

/** Digunakan oleh Admin/Dashboard untuk peta dengan info tambahan jenis PKM */
export interface PkmMapData extends Omit<PkmData, 'deskripsi' | 'thumbnail'> {
    jenis_nama: string;
    warna_icon: string;
}

