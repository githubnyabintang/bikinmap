<?php

namespace App\Http\Controllers;

use App\Models\Aktivitas;
use App\Models\Arsip;
use App\Models\JenisPkm;
use App\Models\Pengajuan;
use App\Models\Testimoni;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LandingController extends Controller
{
    public function index()
    {
        // Peta PKM publik: hanya yang sudah diterima/selesai dan memiliki koordinat
        $pkmData = Pengajuan::with(['aktivitas', 'timKegiatan', 'jenisPkm'])
            ->whereNotNull('latitude')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id_pengajuan,
                'nama' => $p->judul_kegiatan,
                'tahun' => $p->created_at?->year ?? date('Y'),
                'jenis_pkm' => $p->jenisPkm?->nama_jenis ?? '',
                'status' => ($p->status_pengajuan === 'selesai' || $p->aktivitas?->status_pelaksanaan === 'selesai') ? 'selesai' :
                    (in_array($p->status_pengajuan, ['berlangsung', 'diterima']) ? 'berlangsung' :
                        ($p->status_pengajuan === 'belum_diajukan' ? 'belum_mulai' : 'ada_pengajuan')),
                'deskripsi' => $p->kebutuhan ?? '',
                'thumbnail' => $p->aktivitas?->url_thumbnail ?? '',
                'provinsi' => $p->provinsi ?? '',
                'kabupaten' => $p->kota_kabupaten ?? '',
                'kecamatan' => $p->kecamatan ?? '',
                'desa' => $p->kelurahan_desa ?? '',
                'lat' => (float) ($p->latitude ?? 0),
                'lng' => (float) ($p->longitude ?? 0),
                'total_anggaran' => $p->total_anggaran ?? 0,
                'tim_kegiatan' => $p->timKegiatan->map(fn ($t) => [
                    'nama' => $t->pegawai ? $t->pegawai->nama_pegawai : $t->nama_mahasiswa,
                    'peran' => $t->peran_tim,
                ])->toArray(),
            ]);

        // Chart stats: 1 query untuk semua agregat tahun-status
        $allPengajuan = Pengajuan::selectRaw('YEAR(created_at) as year, status_pengajuan, COUNT(*) as total')
            ->whereNotNull('created_at')
            ->groupBy('year', 'status_pengajuan')
            ->get();

        $years = $allPengajuan->pluck('year')->unique()->sort()->values()->toArray();

        // Ringkasan statistik: 1 query untuk total per-status
        $statusCounts = Pengajuan::selectRaw("
            COUNT(*) as total,
            SUM(status_pengajuan = 'diterima') as total_diterima,
            SUM(status_pengajuan = 'selesai')  as total_selesai
        ")->first();

        $chartStats = [
            'years' => $years,
            'selesai' => collect($years)->map(fn ($y) => $allPengajuan->where('year', $y)->where('status_pengajuan', 'selesai')->sum('total'))->toArray(),
            'berlangsung' => collect($years)->map(fn ($y) => $allPengajuan->where('year', $y)->where('status_pengajuan', 'diterima')->sum('total'))->toArray(),
            'total_pengajuan' => (int) ($statusCounts->total ?? 0),
            'total_diterima' => (int) ($statusCounts->total_diterima ?? 0),
            'total_selesai' => (int) ($statusCounts->total_selesai ?? 0),
        ];

        $testimonials = Testimoni::latest()->limit(10)->get();

        // Data user jika sudah login
        $user = null;
        $userPengajuan = collect();
        $listJenisPkm = collect();

        if (Auth::check()) {
            $user = Auth::user();
            $userPengajuan = Pengajuan::with(['jenisPkm'])
                ->where('id_user', $user->id_user)
                ->latest()
                ->get();
            $listJenisPkm = JenisPkm::all();
        }

        return Inertia::render('LandingPage', [
            'pkmData' => $pkmData,
            'user' => $user,
            'userPengajuan' => $userPengajuan,
            'listJenisPkm' => $listJenisPkm,
            'chartStats' => $chartStats,
            'testimonials' => $testimonials,
        ]);
    }

    /**
     * Tampilkan form pengumpulan arsip publik.
     */
    public function showArsipKumpul($kode)
    {
        $pengajuan = Pengajuan::where('id_pengajuan', $kode)->firstOrFail();

        return Inertia::render('Public/PengumpulanArsip', [
            'kode' => $kode,
            'namaKegiatan' => $pengajuan->judul_kegiatan,
        ]);
    }

    /**
     * Simpan arsip publik.
     */
    public function storeArsipKumpul(Request $request, $kode)
    {
        $pengajuan = Pengajuan::where('id_pengajuan', $kode)->firstOrFail();
        $aktivitas = Aktivitas::where('id_pengajuan', $pengajuan->id_pengajuan)->first();

        $request->validate([
            'laporan' => 'required|url|max:2048',
            'dokumentasi' => 'required|url|max:2048',
            'dokumen_lainnya' => 'nullable|array|max:5',
            'dokumen_lainnya.*' => 'url|max:2048',
        ]);

        $commonData = [
            'id_pengajuan' => $pengajuan->id_pengajuan,
            'id_aktivitas' => $aktivitas?->id_aktivitas,
            'keterangan' => 'Dikumpulkan via form publik',
        ];

        Arsip::create(array_merge($commonData, [
            'nama_dokumen' => 'Laporan Akhir',
            'jenis_arsip' => 'laporan_akhir',
            'url_dokumen' => $request->laporan,
        ]));

        Arsip::create(array_merge($commonData, [
            'nama_dokumen' => 'Dokumentasi Kegiatan',
            'jenis_arsip' => 'foto_kegiatan',
            'url_dokumen' => $request->dokumentasi,
        ]));

        foreach (($request->dokumen_lainnya ?? []) as $link) {
            if (! empty($link)) {
                Arsip::create(array_merge($commonData, [
                    'nama_dokumen' => 'Dokumen Tambahan',
                    'jenis_arsip' => 'dokumen_lain',
                    'url_dokumen' => $link,
                ]));
            }
        }

        return redirect()->back()->with('success', 'Arsip berhasil dikumpulkan.');
    }

    /**
     * Tampilkan form testimoni publik.
     */
    public function showTestimoni($kode)
    {
        $pengajuan = Pengajuan::where('id_pengajuan', $kode)->firstOrFail();

        return Inertia::render('Public/Testimoni', [
            'kode' => $kode,
            'namaKegiatan' => $pengajuan->judul_kegiatan,
        ]);
    }

    /**
     * Simpan testimoni publik.
     */
    public function storeTestimoni(Request $request, $kode)
    {
        $pengajuan = Pengajuan::where('id_pengajuan', $kode)->firstOrFail();
        $aktivitas = Aktivitas::where('id_pengajuan', $pengajuan->id_pengajuan)->first();

        $request->validate([
            'nama_pemberi' => 'required|string|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'pesan_ulasan' => 'nullable|string|max:2000',
        ]);

        Testimoni::create([
            'id_aktivitas' => $aktivitas?->id_aktivitas,
            'nama_pemberi' => $request->nama_pemberi,
            'rating' => $request->rating,
            'pesan_ulasan' => $request->pesan_ulasan,
        ]);

        return redirect()->back()->with('success', 'Testimoni berhasil dikirim.');
    }

    /**
     * Store general public testimony (not tied to specific activity).
     */
    public function storePublicTestimoni(Request $request)
    {
        $request->validate([
            'nama_pemberi' => 'required|string|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'pesan_ulasan' => 'nullable|string|max:2000',
        ]);

        Testimoni::create([
            'id_aktivitas' => null,
            'nama_pemberi' => $request->nama_pemberi,
            'rating' => $request->rating,
            'pesan_ulasan' => $request->pesan_ulasan,
        ]);

        return redirect()->back()->with('success', 'Testimoni berhasil dikirim.');
    }
}
