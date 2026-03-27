import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import '../../../css/login.css';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        nip: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/register', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="login-page">
            <Head title="Daftar Akun - P3M Poltekpar Makassar" />

            <div className="login-container">
                <div className="login-card" style={{ maxWidth: '480px' }}>
                    <div className="login-header">
                        <img
                            src="/logo-poltekpar.png"
                            alt="Logo Poltekpar"
                            className="login-logo"
                        />
                        <div className="login-brand-text">
                            <span className="brand-line">SISTEM INFORMASI</span>
                            <span className="brand-line">PENGABDIAN KEPADA MASYARAKAT</span>
                            <span className="brand-line">POLITEKNIK PARIWISATA MAKASSAR</span>
                        </div>
                    </div>

                    <div className="login-body">
                        <h1 className="login-title">Daftar Akun</h1>
                        <p className="login-subtitle">Bergabunglah dengan sistem informasi PKM</p>

                        <form onSubmit={submit}>
                            <div className="input-group">
                                <label htmlFor="name">Nama Lengkap</label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        placeholder="Nama Lengkap beserta Gelar"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={errors.name ? 'is-invalid' : ''}
                                        autoComplete="name"
                                        required
                                        autoFocus
                                    />
                                    <i className="fa-regular fa-user input-icon"></i>
                                </div>
                                {errors.name && <span className="invalid-feedback">{errors.name}</span>}
                            </div>

                            <div className="input-group">
                                <label htmlFor="email">Alamat Email</label>
                                <div className="input-wrapper">
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="nama@poltekpar.ac.id"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={errors.email ? 'is-invalid' : ''}
                                        autoComplete="email"
                                        required
                                    />
                                    <i className="fa-regular fa-envelope input-icon"></i>
                                </div>
                                {errors.email && <span className="invalid-feedback">{errors.email}</span>}
                            </div>

                            <div className="input-group">
                                <label htmlFor="nip">NIP (opsional)</label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        id="nip"
                                        name="nip"
                                        placeholder="Masukkan NIP jika Anda dosen/pegawai"
                                        value={data.nip}
                                        onChange={(e) => setData('nip', e.target.value)}
                                        className={errors.nip ? 'is-invalid' : ''}
                                        autoComplete="off"
                                    />
                                    <i className="fa-solid fa-id-badge input-icon"></i>
                                </div>
                                <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                                    Isi NIP untuk mendapat akses Dosen. Kosongkan jika masyarakat umum.
                                </span>
                                {errors.nip && <span className="invalid-feedback">{errors.nip}</span>}
                            </div>

                            <div className="input-group">
                                <label htmlFor="password">Kata Sandi</label>
                                <div className="input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        placeholder="Minimal 8 karakter"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={errors.password ? 'is-invalid' : ''}
                                        autoComplete="new-password"
                                        required
                                    />
                                    <i className="fa-solid fa-lock input-icon"></i>
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label="Toggle password visibility"
                                    >
                                        <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                                {errors.password && <span className="invalid-feedback">{errors.password}</span>}
                            </div>

                            <div className="input-group" style={{ marginBottom: '32px' }}>
                                <label htmlFor="password_confirmation">Konfirmasi Kata Sandi</label>
                                <div className="input-wrapper">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        placeholder="Ketik ulang kata sandi"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className={errors.password_confirmation ? 'is-invalid' : ''}
                                        autoComplete="new-password"
                                        required
                                    />
                                    <i className="fa-solid fa-shield-halved input-icon"></i>
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        aria-label="Toggle confirm password visibility"
                                    >
                                        <i className={`fa-regular ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                                {errors.password_confirmation && <span className="invalid-feedback">{errors.password_confirmation}</span>}
                            </div>

                            <button type="submit" className="btn-login" disabled={processing}>
                                {processing ? (
                                    <>Memproses <i className="fa-solid fa-spinner fa-spin"></i></>
                                ) : (
                                    <>Daftar Akun <i className="fa-solid fa-user-plus"></i></>
                                )}
                            </button>
                        </form>

                        <div className="login-divider"></div>

                        <div className="register-prompt">
                            Sudah memiliki akun?
                            <Link href="/login" className="register-link">Masuk di sini</Link>
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
