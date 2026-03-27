<?php

use App\Http\Controllers\Admin\AktivitasController;
use App\Http\Controllers\Admin\ArsipController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MasterDataController;
use App\Http\Controllers\Admin\PegawaiController;
use App\Http\Controllers\Admin\PengajuanController;
use App\Http\Controllers\Admin\TestimoniController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\User\PengajuanUserController;
use App\Models\Aktivitas;
use App\Models\JenisPkm;
use App\Models\Pengajuan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $pkmData = Pengajuan::with(['jenisPkm', 'aktivitas'])
        ->whereIn('status_pengajuan', ['diterima', 'selesai'])
        ->whereNotNull('latitude')
        ->get()
        ->map(fn ($p) => [
            'id' => $p->id_pengajuan,
            'nama' => $p->judul_kegiatan,
            'tahun' => $p->created_at?->year ?? date('Y'),
            'status' => $p->aktivitas?->status_pelaksanaan === 'selesai' ? 'selesai' : 'berlangsung',
            'deskripsi' => $p->kebutuhan ?? '',
            'thumbnail' => $p->aktivitas?->url_thumbnail ?? '',
            'provinsi' => $p->provinsi ?? '',
            'kabupaten' => $p->kota_kabupaten ?? '',
            'kecamatan' => $p->kecamatan ?? '',
            'desa' => $p->kelurahan_desa ?? '',
            'lat' => $p->latitude ?? 0,
            'lng' => $p->longitude ?? 0,
        ]);

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

    // Chart statistics — PKM per year and status
    $allPengajuan = Pengajuan::selectRaw('YEAR(created_at) as year, status_pengajuan, COUNT(*) as total')
        ->whereNotNull('created_at')
        ->groupBy('year', 'status_pengajuan')
        ->get();

    $years = $allPengajuan->pluck('year')->unique()->sort()->values()->toArray();
    $chartStats = [
        'years' => $years,
        'selesai' => collect($years)->map(fn ($y) => $allPengajuan->where('year', $y)->where('status_pengajuan', 'selesai')->sum('total'))->toArray(),
        'berlangsung' => collect($years)->map(fn ($y) => $allPengajuan->where('year', $y)->where('status_pengajuan', 'diterima')->sum('total'))->toArray(),
        'total_pengajuan' => Pengajuan::count(),
        'total_diterima' => Pengajuan::where('status_pengajuan', 'diterima')->count(),
        'total_selesai' => Pengajuan::where('status_pengajuan', 'selesai')->count(),
    ];

    // Testimonials
    $testimonials = Testimoni::latest()->limit(10)->get();

    return Inertia::render('LandingPage', [
        'pkmData' => $pkmData,
        'user' => $user,
        'userPengajuan' => $userPengajuan,
        'listJenisPkm' => $listJenisPkm,
        'chartStats' => $chartStats,
        'testimonials' => $testimonials,
    ]);
})->name('landing');

// Public testimonial submission (no auth required)
Route::post('/testimoni/public', function (Request $request) {
    $request->validate([
        'nama_pemberi' => 'required|string|max:255',
        'rating' => 'required|integer|min:1|max:5',
        'pesan_ulasan' => 'nullable|string|max:2000',
    ]);

    App\Models\Testimoni::create([
        'id_aktivitas' => Aktivitas::first()?->id_aktivitas ?? 1,
        'nama_pemberi' => $request->nama_pemberi,
        'rating' => $request->rating,
        'pesan_ulasan' => $request->pesan_ulasan,
    ]);

    return redirect()->back()->with('success', 'Testimoni berhasil dikirim.');
})->name('testimoni.public');

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth');
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:auth');

    Route::get('/verify-email', function () {
        return Inertia::render('Auth/VerifyEmail');
    })->name('verification.notice');

    Route::get('/login/dosen', function () {
        $pkmData = Pengajuan::with(['lokasiPkm', 'jenisPkm', 'aktivitas'])
            ->whereIn('status_pengajuan', ['diterima', 'selesai'])
            ->whereHas('lokasiPkm', fn ($q) => $q->whereNotNull('latitude'))
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id_pengajuan,
                'nama' => $p->judul_kegiatan,
                'tahun' => $p->created_at?->year ?? date('Y'),
                'status' => $p->aktivitas?->status_pelaksanaan === 'selesai' ? 'selesai' : 'berlangsung',
                'deskripsi' => $p->kebutuhan ?? '',
                'thumbnail' => $p->aktivitas?->url_thumbnail ?? '',
                'provinsi' => $p->lokasiPkm?->provinsi ?? '',
                'kabupaten' => $p->lokasiPkm?->kota_kabupaten ?? '',
                'kecamatan' => $p->lokasiPkm?->kecamatan ?? '',
                'desa' => $p->lokasiPkm?->kelurahan_desa ?? '',
                'lat' => $p->lokasiPkm?->latitude ?? 0,
                'lng' => $p->lokasiPkm?->longitude ?? 0,
            ]);

        return Inertia::render('Auth/LoginDosen', ['pkmData' => $pkmData]);
    })->name('login.dosen');

    Route::get('/login/masyarakat', function () {
        $pkmData = Pengajuan::with(['lokasiPkm', 'jenisPkm', 'aktivitas'])
            ->whereIn('status_pengajuan', ['diterima', 'selesai'])
            ->whereHas('lokasiPkm', fn ($q) => $q->whereNotNull('latitude'))
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id_pengajuan,
                'nama' => $p->judul_kegiatan,
                'tahun' => $p->created_at?->year ?? date('Y'),
                'status' => $p->aktivitas?->status_pelaksanaan === 'selesai' ? 'selesai' : 'berlangsung',
                'deskripsi' => $p->kebutuhan ?? '',
                'thumbnail' => $p->aktivitas?->url_thumbnail ?? '',
                'provinsi' => $p->lokasiPkm?->provinsi ?? '',
                'kabupaten' => $p->lokasiPkm?->kota_kabupaten ?? '',
                'kecamatan' => $p->lokasiPkm?->kecamatan ?? '',
                'desa' => $p->lokasiPkm?->kelurahan_desa ?? '',
                'lat' => $p->lokasiPkm?->latitude ?? 0,
                'lng' => $p->lokasiPkm?->longitude ?? 0,
            ]);

        return Inertia::render('Auth/LoginMasyarakat', ['pkmData' => $pkmData]);
    })->name('login.masyarakat');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // User pengajuan submission (POST only, form is on landing page)
    Route::post('/pengajuan', [PengajuanUserController::class, 'store'])->name('pengajuan.store');

    Route::prefix('admin')->name('admin.')->middleware('admin')->group(
        function () {
            Route::get('/', fn () => redirect()->route('admin.dashboard'));

            Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

            Route::get('/pengajuan', [PengajuanController::class, 'index'])->name('pengajuan.index');
            Route::get('/pengajuan/export', [PengajuanController::class, 'export'])->name('pengajuan.export');
            Route::get('/pengajuan/{id}', [PengajuanController::class, 'show'])->name('pengajuan.show');
            Route::put('/pengajuan/{id}/status', [PengajuanController::class, 'updateStatus'])->name('pengajuan.update_status');
            Route::post('/pengajuan/{id}/tim', [PengajuanController::class, 'storeTim'])->name('pengajuan.store_tim');
            Route::put('/pengajuan/{id}/lokasi', [PengajuanController::class, 'updateLokasi'])->name('pengajuan.update_lokasi');
            Route::delete('/pengajuan/{pengajuanId}/tim/{timId}', [PengajuanController::class, 'destroyTim'])->name('pengajuan.destroy_tim');

            Route::get('/pegawai', [PegawaiController::class, 'index'])->name('pegawai.index');
            Route::post('/pegawai', [PegawaiController::class, 'store'])->name('pegawai.store');
            Route::post('/pegawai/import', [PegawaiController::class, 'import'])->name('pegawai.import');
            Route::put('/pegawai/{id}', [PegawaiController::class, 'update'])->name('pegawai.update');
            Route::delete('/pegawai/{id}', [PegawaiController::class, 'destroy'])->name('pegawai.destroy');
            Route::get('/users', [UserController::class, 'index'])->name('users.index');
            Route::post('/users', [UserController::class, 'store'])->name('users.store');
            Route::put('/users/{id}', [UserController::class, 'update'])->name('users.update');
            Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('users.destroy');
            Route::get('/aktivitas', [AktivitasController::class, 'index'])->name('aktivitas.index');
            Route::get('/aktivitas/{id}', [AktivitasController::class, 'show'])->name('aktivitas.show');
            Route::put('/aktivitas/{id}', [AktivitasController::class, 'update'])->name('aktivitas.update');
            Route::delete('/aktivitas/{id}', [AktivitasController::class, 'destroy'])->name('aktivitas.destroy');
            Route::get('/testimoni', [TestimoniController::class, 'index'])->name('testimoni.index');
            Route::post('/testimoni', [TestimoniController::class, 'store'])->name('testimoni.store');
            Route::put('/testimoni/{id}', [TestimoniController::class, 'update'])->name('testimoni.update');
            Route::delete('/testimoni/{id}', [TestimoniController::class, 'destroy'])->name('testimoni.destroy');
            Route::get('/master/jenis-pkm', [MasterDataController::class, 'indexJenis'])->name('master.jenis.index');
            Route::post('/master/jenis-pkm', [MasterDataController::class, 'storeJenis'])->name('master.jenis.store');
            Route::put('/master/jenis-pkm/{id}', [MasterDataController::class, 'updateJenis'])->name('master.jenis.update');
            Route::delete('/master/jenis-pkm/{id}', [MasterDataController::class, 'destroyJenis'])->name('master.jenis.destroy');
            Route::get('/arsip', [ArsipController::class, 'index'])->name('arsip.index');
            Route::post('/arsip', [ArsipController::class, 'store'])->name('arsip.store');
            Route::delete('/arsip/{id}', [ArsipController::class, 'destroy'])->name('arsip.destroy');
        }
    );
});
