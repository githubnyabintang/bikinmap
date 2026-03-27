import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useForm } from '@inertiajs/react';
import Toast from './Toast';
import '../../css/masyarakat-form.css'; // Consistent styling with GeneralSubmissionForm

interface TestimonialFormProps {
    onClose: () => void;
}

interface ToastState {
    show: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
}

export default function TestimonialForm({ onClose }: TestimonialFormProps) {
    const { data, setData, post, processing: inertiaProcessing, errors, setError, clearErrors, reset } = useForm({
        nama_pemberi: '',
        jabatan: '',
        rating: 0,
        pesan_ulasan: '',
    });

    const [toast, setToast] = useState<ToastState>({ show: false, type: 'success', title: '', message: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();

        let hasErrors = false;
        if (!data.nama_pemberi) { setError('nama_pemberi', 'Nama wajib diisi'); hasErrors = true; }
        if (!data.jabatan) { setError('jabatan', 'Jabatan / Peran wajib diisi'); hasErrors = true; }
        if (data.rating === 0) { setError('rating', 'Silakan pilih rating (1-5 Bintang)'); hasErrors = true; }
        if (!data.pesan_ulasan) { setError('pesan_ulasan', 'Ulasan testimoni wajib diisi'); hasErrors = true; }

        if (hasErrors) {
            setToast({ show: true, type: 'error', title: 'Validasi Gagal', message: 'Harap lengkapi semua field yang diwajibkan.' });
            return;
        }

        post('/testimoni/public', {
            onSuccess: () => {
                setToast({ show: true, type: 'success', title: 'Berhasil', message: 'Testimoni Anda berhasil dikirim.' });
                setTimeout(() => { reset(); onClose(); }, 2000);
            },
            onError: () => {
                setToast({ show: true, type: 'error', title: 'Gagal', message: 'Gagal mengirim testimoni. Silakan coba lagi.' });
            },
        });
    };

    const isProcessing = inertiaProcessing;

    const renderInteractiveStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <button
                    key={i}
                    type="button"
                    onClick={() => setData('rating', i)}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        fontSize: '32px',
                        color: i <= data.rating ? '#f59e0b' : '#cbd5e1', // Golden for active, slate for inactive
                        transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        outline: 'none',
                        transform: i <= data.rating ? 'scale(1.1)' : 'scale(1)',
                    }}
                    onMouseEnter={(e) => {
                        const target = e.currentTarget;
                        if (i > data.rating) target.style.color = '#fbbf24';
                    }}
                    onMouseLeave={(e) => {
                        const target = e.currentTarget;
                        if (i > data.rating) target.style.color = '#cbd5e1';
                    }}
                >
                    <i className={`fa-solid fa-star`}></i>
                </button>
            );
        }
        return <div style={{ display: 'flex', gap: '6px', margin: '8px 0', justifyContent: 'center' }}>{stars}</div>;
    };

    return ReactDOM.createPortal(
        <div className="masyarakat-form-overlay">
            <div className="masyarakat-form-backdrop" onClick={onClose}></div>
            <div className="masyarakat-form-modal" style={{ maxWidth: '520px' }}>
                <div className="masyarakat-form-header">
                    <h2>Tulis Testimoni</h2>
                    <p>Bagikan pengalaman Anda tentang program pengabdian ini.</p>
                    <button type="button" onClick={onClose} className="masyarakat-form-close">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="masyarakat-form-body">
                    <form onSubmit={handleSubmit} className="custom-submission-form">

                        <div className="form-group">
                            <label>Nama Lengkap <span className="required">*</span></label>
                            <div className={`input-wrapper ${errors.nama_pemberi ? 'error-border' : ''}`}>
                                <i className="fa-solid fa-user input-icon"></i>
                                <input
                                    type="text"
                                    value={data.nama_pemberi}
                                    onChange={e => setData('nama_pemberi', e.target.value)}
                                    placeholder="Masukkan Nama Anda"
                                />
                            </div>
                            {errors.nama_pemberi && <div className="field-error">{errors.nama_pemberi}</div>}
                        </div>

                        <div className="form-group">
                            <label>Jabatan / Peran <span className="required">*</span></label>
                            <div className={`input-wrapper ${errors.jabatan ? 'error-border' : ''}`}>
                                <i className="fa-solid fa-id-card input-icon"></i>
                                <input
                                    type="text"
                                    value={data.jabatan}
                                    onChange={e => setData('jabatan', e.target.value)}
                                    placeholder="Cth: Anggota UMKM, Kepala Desa, Dosen..."
                                />
                            </div>
                            {errors.jabatan && <div className="field-error">{errors.jabatan}</div>}
                        </div>

                        <div className="form-group" style={{ textAlign: 'center' }}>
                            <label>Penilaian (Rating) <span className="required">*</span></label>
                            {renderInteractiveStars()}
                            {errors.rating && <div className="field-error" style={{ justifyContent: 'center' }}>{errors.rating}</div>}
                        </div>

                        <div className="form-group">
                            <label>Ulasan / Pesan <span className="required">*</span></label>
                            <div className={`input-wrapper align-top ${errors.pesan_ulasan ? 'error-border' : ''}`}>
                                <i className="fa-solid fa-comment-dots input-icon"></i>
                                <textarea
                                    value={data.pesan_ulasan}
                                    onChange={e => setData('pesan_ulasan', e.target.value)}
                                    placeholder="Ceritakan pengalaman dan kesan Anda tentang program ini..."
                                    rows={4}
                                ></textarea>
                            </div>
                            {errors.pesan_ulasan && <div className="field-error">{errors.pesan_ulasan}</div>}
                        </div>

                        <div className="form-actions" style={{ borderTop: 'none', paddingTop: '10px' }}>
                            <button type="button" className="btn-form-cancel" onClick={onClose} disabled={isProcessing}>Batal</button>
                            <button type="submit" className={`btn-form-submit ${isProcessing ? 'btn-loading' : ''}`} disabled={isProcessing}>
                                {isProcessing ? (
                                    <><i className="fa-solid fa-spinner fa-spin"></i> Memproses...</>
                                ) : (
                                    <><i className="fa-solid fa-paper-plane"></i> Kirim Testimoni</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <Toast
                show={toast.show}
                type={toast.type}
                title={toast.title}
                message={toast.message}
                onClose={() => setToast({ ...toast, show: false })}
            />
        </div>,
        document.body
    );
}

