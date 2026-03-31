<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Pegawai;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLogin()
    {
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            if (Auth::user()->role === 'admin') {
                return redirect()->intended('/admin');
            }

            return redirect()->intended('/');
        }

        return back()->withErrors([
            'email' => 'Email atau kata sandi yang Anda masukkan salah.',
        ])->onlyInput('email');
    }

    public function showRegister()
    {
        return Inertia::render('Auth/Register');
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'nip' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $role = 'masyarakat';
        $pegawaiId = null;

        // Hanya berikan role dosen jika:
        // 1. NIP diisi
        // 2. NIP ditemukan di tabel pegawai
        // 3. Pegawai tersebut BELUM terhubung ke user manapun (belum diklaim)
        if ($request->filled('nip')) {
            $pegawai = Pegawai::where('nip', $request->nip)
                ->whereNull('id_user') // ← cegah duplikasi klaim NIP
                ->first();

            if ($pegawai) {
                $role = 'dosen';
                $pegawaiId = $pegawai->id_pegawai;
            }
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $role,
        ]);

        // Hubungkan user ke record pegawai jika berhasil diverifikasi
        if ($role === 'dosen' && $pegawaiId) {
            Pegawai::where('id_pegawai', $pegawaiId)->update(['id_user' => $user->id_user]);
        }

        Auth::login($user);

        return redirect('/');
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
