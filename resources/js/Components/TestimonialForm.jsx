import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useForm } from '@inertiajs/react';
import Toast from './Toast';
import '../../css/masyarakat-form.css'; // Consistent styling with GeneralSubmissionForm

export default function TestimonialForm({ onClose }) {
    const { data, setData, post, processing: inertiaProcessing, errors, setError, clearErrors, reset } = useForm({
        nama: '',
        jabatan: '',
        rating: 0,
        ulasan: '',
    });

    const [mockProcessing, setMockProcessing] = useState(false);
    const [toast, setToast] = useState({ show: false, type: 'success', title: '', message: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();

        let hasErrors = false;
        if (!data.nama) { setError('nama', 'Nama wajib diisi'); hasErrors = true; }
        if (!data.jabatan) { setError('jabatan', 'Jabatan / Peran wajib diisi'); hasErrors = true; }
        if (data.rating === 0) { setError('rating', 'Silakan pilih rating (1-5 Bintang)'); hasErrors = true; }
        if (!data.ulasan) { setError('ulasan', 'Ulasan testimoni wajib diisi'); hasErrors = true; }

        if (hasErrors) {
            setToast({ show: true, type: 'error', title: 'Validasi Gagal', message: 'Harap lengkapi semua field yang diwajibkan.' });
            return;
        }

        setMockProcessing(true);
        setTimeout(() => {
            setMockProcessing(false);
            setToast({ show: true, type: 'success', title: 'Berhasil', message: 'Testimoni Anda berhasil dikirim.' });
            setTimeout(() => {
                reset();
                onClose();
            }, 3000);
        }, 1500);
    };

    const isProcessing = inertiaProcessing || mockProcessing;

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
                        if (i > data.rating) e.currentTarget.style.color = '#fbbf24';
                    }}
                    onMouseLeave={(e) => {
                        if (i > data.rating) e.currentTarget.style.color = '#cbd5e1';
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
                            <div className={`input-wrapper ${errors.nama ? 'error-border' : ''}`}>
                                <i className="fa-solid fa-user input-icon"></i>
                                <input
                                    type="text"
                                    value={data.nama}
                                    onChange={e => setData('nama', e.target.value)}
                                    placeholder="Masukkan Nama Anda"
                                />
                            </div>
                            {errors.nama && <div className="field-error">{errors.nama}</div>}
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
                            <div className={`input-wrapper align-top ${errors.ulasan ? 'error-border' : ''}`}>
                                <i className="fa-solid fa-comment-dots input-icon"></i>
                                <textarea
                                    value={data.ulasan}
                                    onChange={e => setData('ulasan', e.target.value)}
                                    placeholder="Ceritakan pengalaman dan kesan Anda tentang program ini..."
                                    rows="4"
                                ></textarea>
                            </div>
                            {errors.ulasan && <div className="field-error">{errors.ulasan}</div>}
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
