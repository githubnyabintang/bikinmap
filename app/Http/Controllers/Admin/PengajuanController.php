<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Aktivitas;
use App\Models\Pegawai;
use App\Models\Pengajuan;
use App\Models\TimKegiatan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PengajuanController extends Controller
{
    public function index(Request $request)
    {
        $listPengajuan = Pengajuan::with(['user', 'jenisPkm'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('judul_kegiatan', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status_pengajuan', $status);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Pengajuan/Index', [
            'listPengajuan' => $listPengajuan,
            'filters' => [
                'search' => $request->search ?? '',
                'status' => $request->status ?? '',
            ],
        ]);
    }

    public function show(int $id)
    {
        $pengajuan = Pengajuan::with([
            'user',
            'jenisPkm',
            'timKegiatan.pegawai',
            'aktivitas',
            'arsip',
        ])->findOrFail($id);

        $listPegawai = Pegawai::orderBy('nama_pegawai')
            ->get(['id_pegawai', 'nama_pegawai', 'nip']);

        return Inertia::render('Admin/Pengajuan/Detail', [
            'pengajuan' => $pengajuan,
            'listPegawai' => $listPegawai,
        ]);
    }

    public function updateStatus(Request $request, int $id)
    {
        $request->validate([
            'status_pengajuan' => 'required|in:diproses,direvisi,diterima,ditolak,selesai',
            'catatan_admin' => 'nullable|string|max:1000',
        ]);

        $pengajuan = Pengajuan::findOrFail($id);
        $statusLama = $pengajuan->status_pengajuan;
        $statusBaru = $request->status_pengajuan;

        $pengajuan->status_pengajuan = $statusBaru;
        $pengajuan->catatan_admin = $request->catatan_admin;
        $pengajuan->save();

        if ($statusBaru === 'diterima' && $statusLama !== 'diterima') {
            $aktivitasSudahAda = Aktivitas::where('id_pengajuan', $id)->exists();
            if (! $aktivitasSudahAda) {
                Aktivitas::create([
                    'id_pengajuan' => $pengajuan->id_pengajuan,
                    'status_pelaksanaan' => 'berjalan',
                ]);
            }
        }

        return redirect()->back()->with('success', 'Status pengajuan berhasil diperbarui.');
    }

    public function storeTim(Request $request, int $id)
    {
        $request->validate([
            'id_pegawai' => 'nullable|exists:pegawai,id_pegawai',
            'nama_mahasiswa' => 'nullable|string|max:255',
            'peran_tim' => 'required|string|max:100',
        ]);

        $pengajuan = Pengajuan::findOrFail($id);

        TimKegiatan::create([
            'id_pengajuan' => $pengajuan->id_pengajuan,
            'id_pegawai' => $request->id_pegawai,
            'nama_mahasiswa' => $request->nama_mahasiswa,
            'peran_tim' => $request->peran_tim,
        ]);

        return redirect()->back()->with('success', 'Anggota tim berhasil ditambahkan.');
    }

    public function destroyTim(int $pengajuanId, int $timId)
    {
        $tim = TimKegiatan::where('id_pengajuan', $pengajuanId)
            ->where('id_tim', $timId)
            ->firstOrFail();

        $tim->delete();

        return redirect()->back()->with('success', 'Anggota tim berhasil dihapus.');
    }

    public function updateLokasi(Request $request, int $id)
    {
        $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        $pengajuan = Pengajuan::findOrFail($id);

        if ($pengajuan->status_pengajuan !== 'diterima') {
            return redirect()->back()->with('error', 'Koordinat hanya dapat diubah untuk pengajuan yang sudah diterima.');
        }

        $pengajuan->update([
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ]);

        return redirect()->back()->with('success', 'Koordinat lokasi berhasil diperbarui.');
    }

    public function export(Request $request)
    {
        $query = Pengajuan::with(['user', 'jenisPkm'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('judul_kegiatan', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status_pengajuan', $status);
            })
            ->latest();

        $filename = 'pengajuan_'.now()->format('Y-m-d_His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($query) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF)); // UTF-8 BOM

            fputcsv($file, ['ID', 'Judul Kegiatan', 'Pengaju', 'Jenis PKM', 'Lokasi', 'Status', 'Total Anggaran', 'Tanggal Mulai', 'Tanggal Selesai', 'Dibuat']);

            $query->chunk(100, function ($items) use ($file) {
                foreach ($items as $p) {
                    fputcsv($file, [
                        $p->id_pengajuan,
                        $p->judul_kegiatan,
                        $p->user->name ?? '-',
                        $p->jenisPkm->nama_jenis ?? '-',
                        $p->provinsi ? "{$p->kota_kabupaten}, {$p->provinsi}" : '-',
                        $p->status_pengajuan,
                        $p->total_anggaran,
                        $p->tgl_mulai,
                        $p->tgl_selesai,
                        $p->created_at?->format('Y-m-d H:i'),
                    ]);
                }
            });

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
