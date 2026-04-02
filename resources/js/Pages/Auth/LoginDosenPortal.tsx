import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';

// Import Specific Styling for Login
import '../../../css/login.css';

type AuthStep = 'nip-entry' | 'form-expand';
type AuthMode = 'login' | 'register';

export default function LoginDosenPortal(): JSX.Element {
    const [step, setStep] = useState<AuthStep>('nip-entry');
    const [mode, setMode] = useState<AuthMode>('login');
    const [nipStatus, setNipStatus] = useState<{
        status: 'idle' | 'checking' | 'registered' | 'claimable' | 'error';
        message?: string;
    }>({ status: 'idle' });

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        nip: '',
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        remember: false,
    });

    const handleNipCheck = async () => {
        if (data.nip.length < 8) return;

        setNipStatus({ status: 'checking' });
        try {
            const response = await axios.post('/check-nip', { nip: data.nip });
            const result = response.data;

            if (result.status === 'registered') {
                setNipStatus({ status: 'registered', message: result.message });
                setMode('login');
                setData((prev) => ({ ...prev, email: result.email, name: result.name }));
                setStep('form-expand');
            } else if (result.status === 'claimable') {
                setNipStatus({ status: 'claimable', message: result.message });
                setMode('register');
                setData((prev) => ({ ...prev, name: result.name }));
                setStep('form-expand');
            } else {
                setNipStatus({ status: 'error', message: result.message });
                setStep('nip-entry');
            }
        } catch (error) {
            setNipStatus({ status: 'error', message: 'Terjadi kesalahan sistem.' });
        }
    };

    const validateEmailDomain = () => {
        if (!data.email.endsWith('@poltekparmakassar.ac.id')) {
            return false;
        }
        return true;
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmailDomain()) {
            return;
        }

        const endpoint = mode === 'login' ? '/login' : '/register';
        post(endpoint, {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="login-page">
            <Head title="Portal Dosen - P3M Poltekpar Makassar" />

            <div className="login-container">
                <div className="login-card">
                    <div className="login-header login-header-wide">
                        <img
                            src="https://p3m.poltekparmakassar.ac.id/storage/2025/10/cropped-Screenshot_2024-01-15_101923-removebg-preview.png"
                            alt="Logo Poltekpar"
                            className="login-logo"
                        />
                        <div className="login-brand-text login-brand-text-wide">
                            <span className="brand-heading brand-heading-wide">
                                Portal Dosen & Staff SIGAPPA
                            </span>
                            <span className="brand-subheading brand-subheading-wide">Politeknik Pariwisata Makassar</span>
                        </div>
                    </div>

                    <div className="login-body">
                        <div className="role-badge role-badge-dosen">
                            <i className="fa-solid fa-user-tie"></i> Khusus Dosen
                        </div>
                        <h1 className="login-title">Verifikasi Identitas</h1>
                        <p className="login-subtitle">Masukkan NIP Anda untuk melanjutkan akses portal.</p>

                        <form onSubmit={submit}>
                            {/* NIP Input */}
                            <div className="input-group">
                                <label htmlFor="nip">NIP Pegawai</label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        id="nip"
                                        name="nip"
                                        placeholder="Contoh: 19850101XXXXXXXX"
                                        value={data.nip}
                                        onChange={(e) => {
                                            setData('nip', e.target.value);
                                            if (step === 'form-expand') setStep('nip-entry');
                                        }}
                                        disabled={nipStatus.status === 'checking'}
                                        required
                                    />
                                    <i className="fa-solid fa-id-card input-icon"></i>
                                    {data.nip.length >= 8 && step === 'nip-entry' && (
                                        <button
                                            type="button"
                                            onClick={handleNipCheck}
                                            className="absolute right-3 bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            {nipStatus.status === 'checking' ? <i className="fa-solid fa-spinner fa-spin"></i> : 'CEK'}
                                        </button>
                                    )}
                                </div>
                                {nipStatus.message && (
                                    <div className={`nip-check-badge mt-2 ${nipStatus.status === 'error' ? 'error' : ''}`}>
                                        <i className={`fa-solid ${nipStatus.status === 'error' ? 'fa-circle-xmark' : 'fa-circle-check'}`}></i>
                                        {nipStatus.message}
                                    </div>
                                )}
                            </div>

                            {/* Expanded Form Section */}
                            <div className={`expanded-form-container ${step === 'form-expand' ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                                        Informasi Akun {mode === 'register' ? 'Baru' : ''}
                                    </div>

                                    {/* Name Field (Readonly if claimable) */}
                                    <div className="input-group">
                                        <label htmlFor="name">Nama Lengkap</label>
                                        <div className="input-wrapper">
                                            <input
                                                type="text"
                                                id="name"
                                                value={data.name}
                                                readOnly
                                                className="bg-white/50"
                                            />
                                            <i className="fa-solid fa-user input-icon"></i>
                                        </div>
                                    </div>

                                    {/* Email Field */}
                                    <div className="input-group">
                                        <label htmlFor="email">Email Institusi</label>
                                        <div className="input-wrapper">
                                            <input
                                                type="email"
                                                id="email"
                                                placeholder="nama@poltekparmakassar.ac.id"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                readOnly={mode === 'login'}
                                                className={mode === 'login' ? 'bg-white/50' : ''}
                                                required
                                            />
                                            <i className="fa-solid fa-envelope input-icon"></i>
                                        </div>
                                        {mode === 'register' && !data.email.endsWith('@poltekparmakassar.ac.id') && data.email.length > 5 && (
                                            <span className="invalid-feedback">Wajib menggunakan domain @poltekparmakassar.ac.id</span>
                                        )}
                                        {errors.email && <span className="invalid-feedback">{errors.email}</span>}
                                    </div>

                                    {/* Password Field */}
                                    <div className="input-group">
                                        <label htmlFor="password">Kata Sandi</label>
                                        <div className="input-wrapper">
                                            <input
                                                type="password"
                                                id="password"
                                                placeholder="••••••••"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                required
                                            />
                                            <i className="fa-solid fa-lock input-icon"></i>
                                        </div>
                                        {errors.password && <span className="invalid-feedback">{errors.password}</span>}
                                    </div>

                                    {mode === 'register' && (
                                        <div className="input-group">
                                            <label htmlFor="password_confirmation">Konfirmasi Kata Sandi</label>
                                            <div className="input-wrapper">
                                                <input
                                                    type="password"
                                                    id="password_confirmation"
                                                    placeholder="••••••••"
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    required
                                                />
                                                <i className="fa-solid fa-shield-check input-icon"></i>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="btn-login mt-4"
                                        disabled={processing || (mode === 'register' && !data.email.endsWith('@poltekparmakassar.ac.id'))}
                                    >
                                        {processing ? (
                                            <i className="fa-solid fa-spinner fa-spin"></i>
                                        ) : (
                                            mode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun Dosen'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>

                        <div className="login-divider"></div>

                        <div className="register-prompt">
                            Bukan Dosen?
                            <Link href="/login" className="register-link">
                                Kembali ke Login Umum
                            </Link>
                        </div>
                    </div>
                </div>

                <Link href="/" className="back-to-home">
                    <i className="fa-solid fa-arrow-left"></i> Kembali ke Beranda
                </Link>
            </div>
        </div>
    );
}
