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
