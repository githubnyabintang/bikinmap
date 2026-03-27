export interface PkmData {
    id: number | null;
    nama: string;
    tahun: number;
    status: string;
    deskripsi: string;
    thumbnail: string | null;
    laporan: string;
    dokumentasi: string;
    provinsi: string;
    kabupaten: string;
    kecamatan: string;
    desa: string;
    lat: number | string;
    lng: number | string;
}
