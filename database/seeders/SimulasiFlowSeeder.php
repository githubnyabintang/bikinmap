<?php

namespace Database\Seeders;

use App\Models\Aktivitas;
use App\Models\Arsip;
use App\Models\JenisPkm;
use App\Models\Pegawai;
use App\Models\Pengajuan;
use App\Models\TimKegiatan;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SimulasiFlowSeeder extends Seeder
{
    public function run()
    {
        // 1. Ambil atau Buat User Dosen/Pemohon
        $user = User::firstOrCreate(
            ['email' => 'dosen@poltekpar.ac.id'],
            [
                'name' => 'Dr. Andi Pemohon',
                'password' => Hash::make('password'),
                'role' => 'dosen',
            ]
        );

        // 2. Ambil Master Data
        $jenisPkm = JenisPkm::firstOrCreate(['nama_jenis' => 'Pemberdayaan Masyarakat']);

        $userPegawai1 = User::firstOrCreate(
            ['email' => 'bsantoso@poltekpar.ac.id'],
            ['name' => 'Budi Santoso, S.ST., M.Par', 'password' => Hash::make('password'), 'role' => 'admin']
        );
        $pegawai1 = Pegawai::firstOrCreate(['nip' => '198001012005011001'], ['id_user' => $userPegawai1->id_user, 'nama_pegawai' => 'Budi Santoso, S.ST., M.Par']);

        $userPegawai2 = User::firstOrCreate(
            ['email' => 'saminah@poltekpar.ac.id'],
            ['name' => 'Dr. Siti Aminah', 'password' => Hash::make('password'), 'role' => 'admin']
        );
        $pegawai2 = Pegawai::firstOrCreate(['nip' => '198502022010012002'], ['id_user' => $userPegawai2->id_user, 'nama_pegawai' => 'Dr. Siti Aminah']);

        // 3. Buat Data Simulasi (Siklus Pengajuan)

        // Simulasi 1: Baru Diajukan (Diproses)
        Pengajuan::create([
            'id_user' => $user->id_user,
            'id_jenis_pkm' => $jenisPkm->id_jenis_pkm,
            'provinsi' => 'Sulawesi Selatan',
            'kota_kabupaten' => 'Makassar',
            'kecamatan' => 'Tamalanrea',
            'kelurahan_desa' => 'Bira',
            'alamat_lengkap' => 'Jl. Poros Bira, Kompleks BTN Bira Blok A No. 12',
            'latitude' => -5.1350000,
            'longitude' => 119.4950000,
            'judul_kegiatan' => 'Pendampingan Desa Wisata Rammang-Rammang (Diproses)',
            'instansi_mitra' => 'Kelompok Sadar Wisata',
            'sumber_dana' => 'DIPA Poltekpar',
            'total_anggaran' => 15000000,
            'kebutuhan' => 'Pelatihan CHSE untuk pengelola homestay lokal.',
            'status_pengajuan' => 'diproses',
            'tgl_mulai' => now()->addDays(14)->format('Y-m-d'),
            'tgl_selesai' => now()->addDays(20)->format('Y-m-d'),
            'proposal' => 'https://p3m.poltekparmakassar.ac.id/sample/proposal-1.pdf',
            'surat_permohonan' => 'https://p3m.poltekparmakassar.ac.id/sample/surat-1.pdf',
            'rab' => 'https://p3m.poltekparmakassar.ac.id/sample/rab-1.pdf',
        ]);

        // Simulasi 2: Direvisi
        Pengajuan::create([
            'id_user' => $user->id_user,
            'id_jenis_pkm' => $jenisPkm->id_jenis_pkm,
            'provinsi' => 'Sulawesi Selatan',
            'kota_kabupaten' => 'Makassar',
            'kecamatan' => 'Tamalanrea',
            'kelurahan_desa' => 'Tamalanrea Indah',
            'alamat_lengkap' => 'Jl. Perintis Kemerdekaan KM 9, Gedung A',
            'judul_kegiatan' => 'Pengembangan Digital Marketing Desa (Direvisi)',
            'instansi_mitra' => 'BUMDes Barania',
            'sumber_dana' => 'Mandiri',
            'total_anggaran' => 5000000,
            'kebutuhan' => 'Pelatihan TikTok dan IG Ads.',
            'status_pengajuan' => 'direvisi',
            'catatan_admin' => 'RAB kurang detail. Mohon rincikan biaya transportasi.',
            'tgl_mulai' => now()->addDays(30)->format('Y-m-d'),
            'tgl_selesai' => now()->addDays(35)->format('Y-m-d'),
            'proposal' => 'https://p3m.poltekparmakassar.ac.id/sample/proposal-rev.pdf',
        ]);

        // Simulasi 3: Ditolak
        Pengajuan::create([
            'id_user' => $user->id_user,
            'id_jenis_pkm' => $jenisPkm->id_jenis_pkm,
            'provinsi' => 'Sulawesi Selatan',
            'kota_kabupaten' => 'Maros',
            'kecamatan' => 'Bantimurung',
            'kelurahan_desa' => 'Kalabbirang',
            'alamat_lengkap' => 'Desa Kalabbirang, Kec. Bantimurung, Kab. Maros',
            'judul_kegiatan' => 'Riset Perilaku Wisatawan (Ditolak)',
            'instansi_mitra' => '-',
            'sumber_dana' => 'Lainnya',
            'total_anggaran' => 20000000,
            'kebutuhan' => 'Bukan PKM, tapi murni riset dosen.',
            'status_pengajuan' => 'ditolak',
            'catatan_admin' => 'Maaf, ini masuk ranah Penelitian (P3M), bukan ranah Pengabdian Masyarakat (PKM). Arahkan proposal ke skema P3M.',
            'tgl_mulai' => now()->format('Y-m-d'),
            'tgl_selesai' => now()->format('Y-m-d'),
        ]);

        // Simulasi 4: Diterima (Punya Tim & Aktivitas Berjalan)
        $diterima = Pengajuan::create([
            'id_user' => $user->id_user,
            'id_jenis_pkm' => $jenisPkm->id_jenis_pkm,
            'provinsi' => 'Sulawesi Selatan',
            'kota_kabupaten' => 'Makassar',
            'kecamatan' => 'Ujung Pandang',
            'kelurahan_desa' => 'Lae-Lae',
            'alamat_lengkap' => 'Pulau Lae-Lae, Kel. Lae-Lae, Kec. Ujung Pandang',
            'latitude' => -5.1280000,
            'longitude' => 119.4080000,
            'judul_kegiatan' => 'Sertifikasi Tour Guide Lokal (Diterima)',
            'instansi_mitra' => 'HPI Makassar',
            'sumber_dana' => 'DIPA Poltekpar',
            'total_anggaran' => 25000000,
            'kebutuhan' => 'Sertifikasi kompetensi untuk 20 orang.',
            'status_pengajuan' => 'diterima',
            'catatan_admin' => 'Proposal disetujui. Silakan lanjut ke pelaksanaan.',
            'tgl_mulai' => now()->subDays(5)->format('Y-m-d'),
            'tgl_selesai' => now()->addDays(5)->format('Y-m-d'),
            'proposal' => 'https://p3m.poltekparmakassar.ac.id/sample/proposal-fix.pdf',
            'rab' => 'https://p3m.poltekparmakassar.ac.id/sample/rab-fix.pdf',
        ]);

        TimKegiatan::create(['id_pengajuan' => $diterima->id_pengajuan, 'id_pegawai' => $pegawai1->id_pegawai, 'peran_tim' => 'Ketua']);
        TimKegiatan::create(['id_pengajuan' => $diterima->id_pengajuan, 'nama_mahasiswa' => 'Aldo', 'peran_tim' => 'Anggota (Mhs)']);
        Aktivitas::create(['id_pengajuan' => $diterima->id_pengajuan, 'status_pelaksanaan' => 'berjalan', 'catatan_pelaksanaan' => 'Persiapan materi modul.']);

        // Simulasi 5: Selesai (Punya Tim, Aktivitas, Arsip)
        $selesai = Pengajuan::create([
            'id_user' => $user->id_user,
            'id_jenis_pkm' => $jenisPkm->id_jenis_pkm,
            'provinsi' => 'Sulawesi Selatan',
            'kota_kabupaten' => 'Makassar',
            'kecamatan' => 'Biringkanaya',
            'kelurahan_desa' => 'Sudiang',
            'alamat_lengkap' => 'Jl. Pendidikan No. 45, Kel. Sudiang',
            'latitude' => -5.0870000,
            'longitude' => 119.5170000,
            'judul_kegiatan' => 'Penyuluhan Sapta Pesona (Selesai)',
            'instansi_mitra' => 'Dinas Pariwisata',
            'sumber_dana' => 'DIPA Poltekpar',
            'total_anggaran' => 10000000,
            'kebutuhan' => 'Kampanye sadar wisata.',
            'status_pengajuan' => 'selesai',
            'tgl_mulai' => now()->subDays(60)->format('Y-m-d'),
            'tgl_selesai' => now()->subDays(55)->format('Y-m-d'),
            'proposal' => 'https://p3m.poltekparmakassar.ac.id/sample/proposal-final.pdf',
            'surat_permohonan' => 'https://p3m.poltekparmakassar.ac.id/sample/surat-final.pdf',
        ]);

        TimKegiatan::create(['id_pengajuan' => $selesai->id_pengajuan, 'id_pegawai' => $pegawai2->id_pegawai, 'peran_tim' => 'Ketua']);
        Aktivitas::create(['id_pengajuan' => $selesai->id_pengajuan, 'status_pelaksanaan' => 'selesai', 'catatan_pelaksanaan' => 'Semua rangkaian acara tuntas.']);
        Arsip::create(['id_pengajuan' => $selesai->id_pengajuan, 'nama_dokumen' => 'Laporan Akhir (LPJ)', 'jenis_arsip' => 'Laporan', 'url_dokumen' => '#lpj']);
        Arsip::create(['id_pengajuan' => $selesai->id_pengajuan, 'nama_dokumen' => 'Sertifikat & Dokumentasi', 'jenis_arsip' => 'Sertifikat', 'url_dokumen' => '#foto']);
    }
}
