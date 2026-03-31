<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Pengajuan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PengajuanUserController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
<<<<<<< Updated upstream
            'id_jenis_pkm' => 'required|exists:jenis_pkm,id_jenis_pkm',
            'provinsi' => 'required|string|max:255',
            'kota_kabupaten' => 'required|string|max:255',
            'kecamatan' => 'nullable|string|max:255',
            'kelurahan_desa' => 'nullable|string|max:255',
            'alamat_lengkap' => 'nullable|string|max:1000',
            'judul_kegiatan' => 'required|string|max:255',
            'kebutuhan' => 'nullable|string',
            'instansi_mitra' => 'nullable|string|max:255',
            'sumber_dana' => 'nullable|string|max:255',
            'total_anggaran' => 'nullable|numeric|min:0',
            'tgl_mulai' => 'nullable|date',
            'tgl_selesai' => 'nullable|date|after_or_equal:tgl_mulai',
            'proposal' => 'required|url|max:2048',
            'surat_permohonan' => 'required|url|max:2048',
            'rab' => 'nullable|url|max:2048',
        ]);

=======
            'judul_kegiatan'    => 'required|string|max:255',
            'nama_dosen'        => 'required|string|max:255',
            'kebutuhan'         => 'nullable|string|max:2000',
            'instansi_mitra'    => 'nullable|string|max:255',
            'lokasi'            => 'nullable|string|max:1000',
            'sumber_dana'       => 'nullable|string|max:255',
            'total_anggaran'    => 'nullable|numeric|min:0',
            'tgl_mulai'         => 'nullable|date',
            'tgl_selesai'       => 'nullable|date|after_or_equal:tgl_mulai',
            'proposal'          => 'nullable|file|mimes:pdf|max:10240',
            'no_telepon'        => 'nullable|string|max:20',
            'dosen_terlibat'    => 'nullable|array',
            'dosen_terlibat.*'  => 'string|max:255',
            'staff_terlibat'    => 'nullable|array',
            'staff_terlibat.*'  => 'string|max:255',
            'mahasiswa_terlibat'   => 'nullable|array',
            'mahasiswa_terlibat.*' => 'string|max:255',
        ]);

        $defaultJenisPkm = JenisPkm::first();

        $proposalPath = null;
        if ($request->hasFile('proposal')) {
            $proposalPath = $request->file('proposal')->store('uploads/proposals', 'public');
        }

        $suratPermohonanPath = null;
        if ($request->hasFile('surat_permohonan')) {
            $suratPermohonanPath = $request->file('surat_permohonan')->store('uploads/surat', 'public');
        }

        $alamatLengkap = $request->lokasi ?? '';
        $provinsi = $request->provinsi ?? '';
        $kotaKabupaten = $request->kota_kabupaten ?? '';

        // Try to extract provinsi/kota from lokasi if not provided
        if (! $provinsi && $alamatLengkap) {
            $parts = array_map('trim', explode(',', $alamatLengkap));
            $provinsi = end($parts) ?: '-';
            $kotaKabupaten = $parts[count($parts) - 2] ?? '-';
        }

        if (! $provinsi) {
            $provinsi = '-';
        }
        if (! $kotaKabupaten) {
            $kotaKabupaten = '-';
        }

        $pengajuan = Pengajuan::create([
            'id_user'          => Auth::id(),
            'id_jenis_pkm'     => $request->id_jenis_pkm ?? $defaultJenisPkm?->id_jenis_pkm ?? 1,
            'provinsi'         => $provinsi,
            'kota_kabupaten'   => $kotaKabupaten,
            'alamat_lengkap'   => $alamatLengkap,
            'judul_kegiatan'   => $request->judul_kegiatan,
            'kebutuhan'        => $request->kebutuhan ?? '', // deskripsi kebutuhan kegiatan, bukan nama dosen
            'instansi_mitra'   => $request->instansi_mitra ?? '',
            'no_telepon'       => $request->no_telepon ?? '',
            'sumber_dana'      => $request->sumber_dana ?? '',
            'total_anggaran'   => $request->total_anggaran ?? 0,
            'tgl_mulai'        => $request->tgl_mulai,
            'tgl_selesai'      => $request->tgl_selesai,
            'proposal'         => $proposalPath ?? ($request->proposal_url ?? ''),
            'surat_permohonan' => $suratPermohonanPath ?? ($request->surat_permohonan_url ?? ''),
            'rab'              => $request->rab ?? '',
            'status_pengajuan' => 'diproses',
        ]);

        // Dosen pengusul utama dimasukkan ke tim sebagai Ketua (dari field nama_dosen)
        $teamMembers = [];
        $namaDosen = trim($request->nama_dosen ?? '');
        if ($namaDosen !== '') {
            $teamMembers[] = ['nama_mahasiswa' => $namaDosen, 'peran_tim' => 'Ketua/Dosen Pengusul'];
        }

        if ($request->has('dosen_terlibat') && is_array($request->dosen_terlibat)) {
            foreach ($request->dosen_terlibat as $name) {
                if (!empty(trim($name))) {
                    $teamMembers[] = ['nama_mahasiswa' => $name, 'peran_tim' => 'Dosen'];
                }
            }
        }
        if ($request->has('staff_terlibat') && is_array($request->staff_terlibat)) {
            foreach ($request->staff_terlibat as $name) {
                if (!empty(trim($name))) {
                    $teamMembers[] = ['nama_mahasiswa' => $name, 'peran_tim' => 'Staff'];
                }
            }
        }
        if ($request->has('mahasiswa_terlibat') && is_array($request->mahasiswa_terlibat)) {
            foreach ($request->mahasiswa_terlibat as $name) {
                if (!empty(trim($name))) {
                    $teamMembers[] = ['nama_mahasiswa' => $name, 'peran_tim' => 'Mahasiswa'];
                }
            }
        }

        if (count($teamMembers) > 0) {
            $now = now();
            // Tambahkan id_pengajuan dan timestamps sebelum bulk insert
            $rows = array_map(fn ($m) => array_merge($m, [
                'id_pengajuan' => $pengajuan->id_pengajuan,
                'created_at'   => $now,
                'updated_at'   => $now,
            ]), $teamMembers);
            TimKegiatan::insert($rows);
        }

        return redirect('/')
            ->with('success', 'Pengajuan PKM berhasil dikirim! Silakan tunggu konfirmasi dari admin.');
    }

    private function storeMasyarakat(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'institution' => 'required|string|max:255',
            'needs' => 'required|string',
            'location' => 'required|string|max:1000',
            'email' => 'required|email|max:255',
            'whatsapp' => 'required|string|max:20',
            'request_letter' => 'nullable|file|mimes:pdf|max:10240',
        ]);

        $defaultJenisPkm = JenisPkm::first();

        $suratPermohonanPath = null;
        if ($request->hasFile('request_letter')) {
            $suratPermohonanPath = $request->file('request_letter')->store('uploads/surat', 'public');
        }

        $alamatLengkap = $request->location ?? '';
        $provinsi = $request->provinsi ?? '';
        $kotaKabupaten = $request->kota_kabupaten ?? '';

        if (! $provinsi && $alamatLengkap) {
            $parts = array_map('trim', explode(',', $alamatLengkap));
            $provinsi = end($parts) ?: '-';
            $kotaKabupaten = $parts[count($parts) - 2] ?? '-';
        }

        if (! $provinsi) {
            $provinsi = '-';
        }
        if (! $kotaKabupaten) {
            $kotaKabupaten = '-';
        }

>>>>>>> Stashed changes
        Pengajuan::create([
            'id_user' => Auth::id(),
            'id_jenis_pkm' => $request->id_jenis_pkm,
            'provinsi' => $request->provinsi,
            'kota_kabupaten' => $request->kota_kabupaten,
            'kecamatan' => $request->kecamatan,
            'kelurahan_desa' => $request->kelurahan_desa,
            'alamat_lengkap' => $request->alamat_lengkap,
            'judul_kegiatan' => $request->judul_kegiatan,
            'kebutuhan' => $request->kebutuhan,
            'instansi_mitra' => $request->instansi_mitra,
            'sumber_dana' => $request->sumber_dana,
            'total_anggaran' => $request->total_anggaran ?? 0,
            'tgl_mulai' => $request->tgl_mulai,
            'tgl_selesai' => $request->tgl_selesai,
            'proposal' => $request->proposal,
            'surat_permohonan' => $request->surat_permohonan,
            'rab' => $request->rab,
            'status_pengajuan' => 'diproses',
        ]);

        return redirect('/')
            ->with('success', 'Pengajuan PKM berhasil dikirim! Silakan tunggu konfirmasi dari admin.');
    }
}
