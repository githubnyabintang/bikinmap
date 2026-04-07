import React, { useRef, useState, useMemo, ChangeEvent, FormEvent } from 'react';
import { useForm, router } from '@inertiajs/react';
import ActionFeedbackDialog from './ActionFeedbackDialog';
import MapLocationPicker from './MapLocationPicker';
import DocumentationGallery from './DocumentationGallery';
import TestimonialSidebarDisplay from './TestimonialSidebarDisplay';
import type { PkmData } from '@/types';

interface Submission {
    id: number;
    kode_unik?: string;
    judul: string;
    ringkasan: string;
    tanggal: string;
    status: string;
    catatan?: string;
    instansi_mitra?: string;
    no_telepon?: string;
    provinsi?: string;
    kota_kabupaten?: string;
    kecamatan?: string;
    kelurahan_desa?: string;
    alamat_lengkap?: string;
    proposal?: string;
    surat_permohonan?: string;
    rab?: string;
    sumber_dana?: string;
    total_anggaran?: number;
    tgl_mulai?: string;
    tgl_selesai?: string;
    jenis_pkm?: string;
    nama_pengusul?: string;
    email_pengusul?: string;
    kebutuhan?: string;
}

interface MasyarakatSubmissionCardProps {
    submissionStatus?: string;
    latestSubmission?: Submission | null;
    pkmStatusData?: PkmData | null;
    pkmListData?: PkmData[];
    submissionHistory?: Submission[];
    onSubmitted?: (submission: Submission) => void;
    onUpdateSubmissionStatus?: (status: string) => void;
    hideInlineStatusPanel?: boolean;
    hideMainTabNav?: boolean;
    onlyShowStatus?: boolean;
}

const createSubmittedLabel = (): string =>
    new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date());

const getSubmissionStatusStyle = (status: string) => {
    const styles: Record<string, { label: string; icon: string; bg: string; color: string }> = {
        diproses: { label: 'Diproses', icon: 'fa-clock', bg: '#dbeafe', color: '#1E4A8C' },
        ditangguhkan: { label: 'Revisi', icon: 'fa-file-pen', bg: '#fef3c7', color: '#b45309' },
        ditolak: { label: 'Ditolak', icon: 'fa-circle-xmark', bg: '#fee2e2', color: '#b91c1c' },
        diterima: { label: 'Diterima', icon: 'fa-circle-check', bg: '#dcfce7', color: '#15803d' },
        berlangsung: { label: 'Berlangsung', icon: 'fa-person-walking', bg: '#fef3c7', color: '#b45309' },
        selesai: { label: 'Selesai', icon: 'fa-flag-checkered', bg: '#dcfce7', color: '#15803d' },
        direvisi: { label: 'Direvisi', icon: 'fa-file-pen', bg: '#fff7ed', color: '#ea580c' },
        belum_diajukan: { label: 'Belum Diajukan', icon: 'fa-file-circle-plus', bg: '#f1f5f9', color: '#64748b' },
    };
    return styles[status] || styles.belum_diajukan;
};

interface FormData {
    name: string;
    institution: string;
    email: string;
    whatsapp: string;
    needs: string;
    provinsi: string;
    kota_kabupaten: string;
    kecamatan: string;
    kelurahan_desa: string;
    alamat_lengkap: string;
    latitude: number | null;
    longitude: number | null;
    tgl_mulai: string | null;
    tgl_selesai: string | null;
    is_tahun_saja: boolean;
    surat_permohonan: string;
    surat_proposal: string;
    link_tambahan: { name: string; url: string }[];
}

interface EvaluasiFormData {
    nama: string;
    asal_instansi: string;
    no_telp: string;
    q1: number;
    q2: number;
    q3: number;
    q4: number;
    q5: number;
    masukan: string;
}

const EVALUATION_QUESTIONS = [
    'Website SIGAPPA mudah diakses dan memiliki navigasi yang jelas.',
    'Informasi yang tersedia lengkap, akurat, dan mudah dipahami.',
    'Fitur peta SIGAPPA membantu memahami sebaran kegiatan PKM.',
    'Proses pengajuan layanan PKM melalui SIGAPPA mudah dilakukan.',
    'Secara keseluruhan, saya puas terhadap layanan SIGAPPA.',
];

const getEvaluationLabel = (value: number): string => {
    if (value === 0) return 'Pilih rating...';

    return ['(1) Sangat Tidak Setuju', '(2) Tidak Setuju', '(3) Cukup Setuju', '(4) Setuju', '(5) Sangat Setuju'][value - 1];
};

export default function MasyarakatSubmissionCard({
    submissionStatus = 'belum_diajukan',
    latestSubmission = null,
    pkmStatusData = null,
    pkmListData = [],
    submissionHistory = [],
    onSubmitted,
    onUpdateSubmissionStatus,
    hideInlineStatusPanel = false,
    hideMainTabNav = false,
    onlyShowStatus = false,
}: MasyarakatSubmissionCardProps) {
    const [mainTab, setMainTab] = useState('pengajuan');
    const [expandedHubSections, setExpandedHubSections] = useState({ kegiatan: false, riwayat: false });
    const [selectedDetail, setSelectedDetail] = useState<Submission | null>(null);
    const [isMockSubmitting, setIsMockSubmitting] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [evaluasiSubmitting, setEvaluasiSubmitting] = useState(false);
    const [evaluasiForm, setEvaluasiForm] = useState<EvaluasiFormData>({
        nama: '',
        asal_instansi: '',
        no_telp: '',
        q1: 0,
        q2: 0,
        q3: 0,
        q4: 0,
        q5: 0,
        masukan: '',
    });
    const [feedbackDialog, setFeedbackDialog] = useState<{ show: boolean; type: 'success' | 'error'; title: string; message: string }>({ show: false, type: 'success', title: '', message: '' });
    const [sortOption, setSortOption] = useState<'default' | 'status' | 'waktu_terbaru' | 'waktu_terlama'>('default');
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

    const sortedHistory = useMemo(() => {
        let history = [...submissionHistory];
        switch (sortOption) {
            case 'default':
                history.sort((a, b) => {
                    const isAPri = a.status === 'direvisi' || a.status === 'diproses';
                    const isBPri = b.status === 'direvisi' || b.status === 'diproses';
                    if (isAPri && !isBPri) return -1;
                    if (!isAPri && isBPri) return 1;
                    const diff = new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
                    return isNaN(diff) ? 0 : diff;
                });
                break;
            case 'status':
                history.sort((a, b) => a.status.localeCompare(b.status));
                break;
            case 'waktu_terbaru':
                history.sort((a, b) => {
                    const diff = new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
                    return isNaN(diff) ? 0 : diff;
                });
                break;
            case 'waktu_terlama':
                history.sort((a, b) => {
                    const diff = new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
                    return isNaN(diff) ? 0 : diff;
                });
                break;
        }
        return history;
    }, [submissionHistory, sortOption]);

    const { data, setData, errors, setError, clearErrors, reset } = useForm<FormData>({
        name: '',
        institution: '',
        email: '',
        whatsapp: '',
        needs: '',
        provinsi: '',
        kota_kabupaten: '',
        kecamatan: '',
        kelurahan_desa: '',
        alamat_lengkap: '',
        latitude: null,
        longitude: null,
        tgl_mulai: null,
        tgl_selesai: null,
        is_tahun_saja: false,
        surat_permohonan: '',
        surat_proposal: '',
        link_tambahan: [{ name: '', url: '' }],
    });

    const [filePermohonan, setFilePermohonan] = useState<File | null>(null);
    const [fileProposal, setFileProposal] = useState<File | null>(null);

    const handleAddLink = () => setData('link_tambahan', [...data.link_tambahan, { name: '', url: '' }]);
    const handleRemoveLink = (index: number) => setData('link_tambahan', data.link_tambahan.filter((_, i) => i !== index));
    const handleLinkChange = (index: number, field: 'name' | 'url', value: string) => {
        const updated = [...data.link_tambahan];
        updated[index] = { ...updated[index], [field]: value };
        setData('link_tambahan', updated);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!data.name.trim() || !data.institution.trim() || !data.needs.trim() || !filePermohonan) {
            setFeedbackDialog({ show: true, type: 'error', title: 'Form Belum Lengkap', message: 'Mohon lengkapi data identitas, kebutuhan, dan surat permohonan.' });
            return;
        }

        setEvaluasiForm({
            nama: data.name,
            asal_instansi: data.institution,
            no_telp: data.whatsapp,
            q1: 0,
            q2: 0,
            q3: 0,
            q4: 0,
            q5: 0,
            masukan: '',
        });
        setShowFeedbackModal(true);
    };

    const handleEvaluasiFieldChange = (field: keyof EvaluasiFormData, value: string | number) => {
        setEvaluasiForm(prev => ({ ...prev, [field]: value }));
    };

    const handleFinalSubmit = async () => {
        if (!evaluasiForm.nama.trim() || !evaluasiForm.no_telp.trim()) {
            setFeedbackDialog({ show: true, type: 'error', title: 'Evaluasi Belum Lengkap', message: 'Nama dan nomor telepon pada evaluasi wajib diisi.' });
            return;
        }

        if ([evaluasiForm.q1, evaluasiForm.q2, evaluasiForm.q3, evaluasiForm.q4, evaluasiForm.q5].some(value => value === 0)) {
            setFeedbackDialog({ show: true, type: 'error', title: 'Evaluasi Belum Lengkap', message: 'Mohon isi seluruh penilaian bintang pada evaluasi aplikasi.' });
            return;
        }

        setEvaluasiSubmitting(true);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const evaluasiResponse = await fetch('/evaluasi-sistem', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(evaluasiForm),
            });

            if (!evaluasiResponse.ok) {
                throw new Error('Evaluasi aplikasi gagal disimpan.');
            }
        } catch (error) {
            setEvaluasiSubmitting(false);
            setFeedbackDialog({ show: true, type: 'error', title: 'Gagal Menyimpan Evaluasi', message: 'Evaluasi aplikasi belum berhasil dikirim. Pengajuan belum disimpan.' });
            return;
        }

        setShowFeedbackModal(false);
        setIsMockSubmitting(true);

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('institution', data.institution);
        formData.append('email', data.email);
        formData.append('whatsapp', data.whatsapp);
        formData.append('needs', data.needs);
        formData.append('provinsi', data.provinsi);
        formData.append('kota_kabupaten', data.kota_kabupaten);
        formData.append('kecamatan', data.kecamatan);
        formData.append('kelurahan_desa', data.kelurahan_desa);
        formData.append('alamat_lengkap', data.alamat_lengkap);
        if (data.latitude) formData.append('latitude', data.latitude.toString());
        if (data.longitude) formData.append('longitude', data.longitude.toString());
        if (data.tgl_mulai) formData.append('tgl_mulai', data.tgl_mulai);
        if (data.tgl_selesai) formData.append('tgl_selesai', data.tgl_selesai);
        formData.append('is_tahun_saja', data.is_tahun_saja ? '1' : '0');
        if (filePermohonan) formData.append('surat_permohonan', filePermohonan);
        if (fileProposal) formData.append('surat_proposal', fileProposal);
        formData.append('link_tambahan', JSON.stringify(data.link_tambahan.filter(v => v.url.trim() !== '')));

        router.post('/pengajuan', formData as any, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setIsMockSubmitting(false);
                setEvaluasiSubmitting(false);
                onSubmitted?.({
                    id: Date.now(),
                    judul: `Pengajuan PKM ${data.institution}`,
                    ringkasan: data.needs,
                    tanggal: createSubmittedLabel(),
                    status: 'diproses'
                });
                onUpdateSubmissionStatus?.('diproses');
                setEvaluasiForm({ nama: '', asal_instansi: '', no_telp: '', q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, masukan: '' });
                setFeedbackDialog({ show: true, type: 'success', title: 'Pengajuan Berhasil', message: 'Pengajuan Anda telah dikirim. Mengarahkan ke halaman status...' });
                setTimeout(() => {
                    reset();
                    setFilePermohonan(null);
                    setFileProposal(null);
                    router.visit('/cek-status');
                }, 1800);
            },
            onError: () => {
                setIsMockSubmitting(false);
                setEvaluasiSubmitting(false);
                setFeedbackDialog({ show: true, type: 'error', title: 'Gagal Mengirim', message: 'Terjadi kesalahan saat mengirim pengajuan.' });
            },
        });
    };

    const renderDetailModal = () => {
        if (!selectedDetail) return null;
        const style = getSubmissionStatusStyle(selectedDetail.status);

        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="absolute inset-0" onClick={() => setSelectedDetail(null)}></div>
                <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-poltekpar-primary text-white flex items-center justify-center shadow-md">
                                <i className="fa-solid fa-file-contract text-lg"></i>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 line-clamp-1">{selectedDetail.judul}</h3>
                                <p className="text-[11px] text-slate-500 font-medium">{selectedDetail.tanggal}</p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedDetail(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 transition-colors">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                        <div className="flex flex-col items-center p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Status Pengajuan</span>
                            <div className="px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-sm" style={{ backgroundColor: style.bg, color: style.color }}>
                                <i className={`fa-solid ${style.icon}`}></i>
                                {style.label}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                {/* Section 1: Identitas Pengusul */}
                                <section>
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Identitas Pengusul</h4>
                                    <div className="space-y-2 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100/60">
                                        <p className="flex flex-col gap-1"><span className="text-slate-500 text-xs">Nama Lengkap / Perwakilan</span> <span className="text-slate-900 font-semibold">{selectedDetail.nama_pengusul || '-'}</span></p>
                                        <p className="flex flex-col gap-1"><span className="text-slate-500 text-xs">Nama Instansi / Organisasi</span> <span className="text-slate-900 font-semibold">{selectedDetail.instansi_mitra || '-'}</span></p>
                                        <p className="flex flex-col gap-1"><span className="text-slate-500 text-xs">Email</span> <span className="text-slate-900 font-semibold">{selectedDetail.email_pengusul || '-'}</span></p>
                                        <p className="flex flex-col gap-1"><span className="text-slate-500 text-xs">WhatsApp</span> <span className="text-slate-900 font-semibold">{selectedDetail.no_telepon || '-'}</span></p>
                                    </div>
                                </section>

                                {/* Section 2: Kebutuhan PKM */}
                                <section>
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Kebutuhan PKM</h4>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-700 leading-relaxed italic">
                                        "{selectedDetail.kebutuhan || selectedDetail.ringkasan || '-'}"
                                    </div>
                                </section>
                            </div>

                            <div className="space-y-6">
                                {/* Section 3: Lokasi PKM */}
                                <section>
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Lokasi PKM</h4>
                                    <div className="space-y-2 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100/60">
                                        <p className="flex justify-between items-center"><span className="text-slate-500">Provinsi</span> <span className="text-slate-900 font-semibold text-right">{selectedDetail.provinsi || '-'}</span></p>
                                        <p className="flex justify-between items-center"><span className="text-slate-500">Kota / Kabupaten</span> <span className="text-slate-900 font-semibold text-right">{selectedDetail.kota_kabupaten || '-'}</span></p>
                                        <p className="flex justify-between items-center"><span className="text-slate-500">Kecamatan</span> <span className="text-slate-900 font-semibold text-right">{selectedDetail.kecamatan || '-'}</span></p>
                                        <p className="flex justify-between items-center"><span className="text-slate-500">Kelurahan / Desa</span> <span className="text-slate-900 font-semibold text-right">{selectedDetail.kelurahan_desa || '-'}</span></p>
                                        <div className="pt-2 mt-2 border-t border-slate-200">
                                            <span className="text-slate-500 text-xs block mb-1">Alamat Lengkap</span>
                                            <span className="text-slate-900 font-semibold">{selectedDetail.alamat_lengkap || '-'}</span>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 4: Tautan Dokumen */}
                                <section>
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tautan Dokumen</h4>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/60 flex flex-col gap-3">
                                        <div className="flex flex-wrap gap-2">
                                            {selectedDetail.surat_permohonan ? <a href={selectedDetail.surat_permohonan} target="_blank" className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg transition-colors border border-slate-200 shadow-sm"><i className="fa-solid fa-file-contract mr-1.5 text-poltekpar-primary"></i>SURAT PERMOHONAN</a> : <span className="text-xs text-slate-400 flex items-center gap-1.5"><i className="fa-solid fa-triangle-exclamation"></i> Surat Permohonan Kosong</span>}
                                            {selectedDetail.proposal && <a href={selectedDetail.proposal} target="_blank" className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg transition-colors border border-slate-200 shadow-sm"><i className="fa-solid fa-file-pdf mr-1.5 text-poltekpar-primary"></i>PROPOSAL</a>}
                                        </div>
                                        {selectedDetail.rab && (
                                            <div className="space-y-2 pt-2 border-t border-slate-200">
                                                {(() => {
                                                    try {
                                                        const arr = JSON.parse(selectedDetail.rab);
                                                        if (Array.isArray(arr)) {
                                                            return arr.map((item, i) => (
                                                                <p key={i} className="text-[12px] bg-white p-2 rounded-lg border border-slate-100">
                                                                    <span className="text-slate-500 font-bold text-[10px] uppercase block mb-0.5">{item.name || `Tautan Tambahan ${i + 1}`}: </span>
                                                                    <a href={item.url} target="_blank" className="text-poltekpar-primary font-medium hover:underline break-all">{item.url}</a>
                                                                </p>
                                                            ));
                                                        }
                                                    } catch(e) {}
                                                    
                                                    return selectedDetail.rab.split(',').map((link, i) => {
                                                        const url = link.trim();
                                                        if (!url) return null;
                                                        return (
                                                            <p key={i} className="text-[12px] bg-white p-2 rounded-lg border border-slate-100">
                                                                <span className="text-slate-500 font-bold text-[10px] uppercase block mb-0.5">Tautan Tambahan {i + 1}: </span>
                                                                <a href={url} target="_blank" className="text-poltekpar-primary font-medium hover:underline break-all">{url}</a>
                                                            </p>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        </div>

                        {selectedDetail.catatan && (
                            <section>
                                <h4 className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <i className="fa-solid fa-comment-dots"></i> Catatan Admin
                                </h4>
                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                    <p className="text-sm text-amber-800 italic leading-relaxed">{selectedDetail.catatan}</p>
                                </div>
                            </section>
                        )}
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap justify-end gap-3">
                        {selectedDetail.status === 'selesai' && (
                            <a target="_blank" rel="noopener noreferrer" href={`/testimoni/${selectedDetail.kode_unik || selectedDetail.id}`} className="px-6 py-2 bg-emerald-500 text-white text-sm font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-sm flex items-center gap-2">
                                <i className="fa-solid fa-comment-dots"></i> Isi Testimoni PKM
                            </a>
                        )}
                        <button onClick={() => setSelectedDetail(null)} className="px-6 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">Tutup</button>
                    </div>
                </div>
            </div>
        );
    };

    if (onlyShowStatus) {
        return (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-6">
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <h3 className="text-sm font-bold text-slate-900 border-l-4 border-poltekpar-primary pl-3">Daftar Riwayat Pengajuan</h3>
                        <div className="relative">
                            <button 
                                onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                                className="flex bg-white hover:bg-slate-50 transition-colors border border-slate-200 rounded-xl items-center shadow-sm overflow-hidden group w-full sm:w-[220px]"
                            >
                                <div className="pl-3.5 pr-1.5 py-2 text-slate-400 group-hover:text-poltekpar-primary transition-colors flex items-center justify-center">
                                    <i className="fa-solid fa-filter text-xs"></i>
                                </div>
                                <div className="flex-1 text-left py-2 pl-1.5 text-[11px] font-bold text-slate-700 truncate">
                                    {sortOption === 'default' ? 'Prioritas (Revisi & Diproses)' : 
                                     sortOption === 'status' ? 'Berdasarkan Status' : 
                                     sortOption === 'waktu_terbaru' ? 'Waktu (Terbaru)' : 'Waktu (Terlama)'}
                                </div>
                                <div className={`pr-3.5 text-slate-400 transition-transform ${isSortMenuOpen ? 'rotate-180' : ''}`}>
                                    <i className="fa-solid fa-chevron-down text-[10px]"></i>
                                </div>
                            </button>

                            {isSortMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsSortMenuOpen(false)}></div>
                                    <div className="absolute top-11 right-0 w-full sm:w-[220px] bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <button onClick={() => { setSortOption('default'); setIsSortMenuOpen(false); }} className={`w-full text-left px-4 py-2.5 text-[11px] font-bold transition-colors ${sortOption === 'default' ? 'bg-poltekpar-primary/10 text-poltekpar-primary' : 'text-slate-600 hover:bg-slate-50'}`}><i className="fa-solid fa-star text-amber-400 mr-2 opacity-70"></i>Prioritas (Revisi & Diproses)</button>
                                        <button onClick={() => { setSortOption('status'); setIsSortMenuOpen(false); }} className={`w-full text-left px-4 py-2.5 text-[11px] font-bold transition-colors border-t border-slate-50 ${sortOption === 'status' ? 'bg-poltekpar-primary/10 text-poltekpar-primary' : 'text-slate-600 hover:bg-slate-50'}`}><i className="fa-solid fa-list-check text-indigo-400 mr-2 opacity-70"></i>Berdasarkan Status</button>
                                        <button onClick={() => { setSortOption('waktu_terbaru'); setIsSortMenuOpen(false); }} className={`w-full text-left px-4 py-2.5 text-[11px] font-bold transition-colors border-t border-slate-50 ${sortOption === 'waktu_terbaru' ? 'bg-poltekpar-primary/10 text-poltekpar-primary' : 'text-slate-600 hover:bg-slate-50'}`}><i className="fa-regular fa-clock text-sky-400 mr-2 opacity-70"></i>Waktu (Terbaru)</button>
                                        <button onClick={() => { setSortOption('waktu_terlama'); setIsSortMenuOpen(false); }} className={`w-full text-left px-4 py-2.5 text-[11px] font-bold transition-colors border-t border-slate-50 ${sortOption === 'waktu_terlama' ? 'bg-poltekpar-primary/10 text-poltekpar-primary' : 'text-slate-600 hover:bg-slate-50'}`}><i className="fa-solid fa-clock-rotate-left text-slate-400 mr-2 opacity-70"></i>Waktu (Terlama)</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Nama Pengajuan</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Tanggal</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sortedHistory.length > 0 ? (
                                    sortedHistory.map(item => {
                                        const style = getSubmissionStatusStyle(item.status);
                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <strong className="text-[14px] font-bold text-slate-900 block group-hover:text-poltekpar-primary transition-colors">{item.judul}</strong>
                                                    <span className="text-[11px] text-slate-400 font-medium line-clamp-1">{item.ringkasan}</span>
                                                </td>
                                                <td className="px-6 py-5 text-[13px] text-slate-600 font-medium whitespace-nowrap">{item.tanggal}</td>
                                                <td className="px-6 py-5">
                                                    <div className="flex justify-center">
                                                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 shadow-sm" style={{ backgroundColor: style.bg, color: style.color }}>
                                                            <i className={`fa-solid ${style.icon} text-[9px]`}></i>{style.label}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <button type="button" className="px-4 py-1.5 bg-slate-100 hover:bg-poltekpar-primary hover:text-white text-slate-600 text-[11px] font-bold rounded-lg transition-all" onClick={() => setSelectedDetail(item)}>DETAIL</button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm font-bold italic">
                                            <div className="flex flex-col items-center gap-3">
                                                <i className="fa-solid fa-folder-open text-4xl text-slate-200"></i>
                                                Belum ada riwayat pengajuan.
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <ActionFeedbackDialog show={feedbackDialog.show} type={feedbackDialog.type} title={feedbackDialog.title} message={feedbackDialog.message} onClose={() => setFeedbackDialog({ ...feedbackDialog, show: false })} />
                {renderDetailModal()}
            </div>
        );
    }

    const renderSubmissionTab = () => (
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
            <section className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><i className="fa-solid fa-id-card text-poltekpar-primary"></i>Identitas Pengusul</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Nama Lengkap / Perwakilan <span className="text-red-500">*</span></label><input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-poltekpar-primary focus:ring-2 focus:ring-blue-100" placeholder="Masukkan nama" required /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Nama Instansi / Organisasi <span className="text-red-500">*</span></label><input type="text" value={data.institution} onChange={e => setData('institution', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-poltekpar-primary" placeholder="Nama instansi" required /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Email <span className="text-red-500">*</span></label><input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-poltekpar-primary" placeholder="email@contoh.com" required /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">WhatsApp <span className="text-red-500">*</span></label><input type="tel" value={data.whatsapp} onChange={e => setData('whatsapp', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-poltekpar-primary" placeholder="0812..." required /></div>
                </div>
            </section>

            <section className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><i className="fa-solid fa-handshake-angle text-poltekpar-primary"></i>Kebutuhan PKM</h3>
                <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Deskripsi Kebutuhan / Permintaan <span className="text-red-500">*</span></label><textarea value={data.needs} onChange={e => setData('needs', e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-poltekpar-primary resize-none" placeholder="Jelaskan kebutuhan pengabdian..." required /></div>
            </section>

            <section className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><i className="fa-solid fa-map-location-dot text-poltekpar-primary"></i>Lokasi PKM</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Provinsi <span className="text-red-500">*</span></label><input type="text" value={data.provinsi} onChange={e => setData('provinsi', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-poltekpar-primary" placeholder="Provinsi" required /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Kota / Kabupaten <span className="text-red-500">*</span></label><input type="text" value={data.kota_kabupaten} onChange={e => setData('kota_kabupaten', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-poltekpar-primary" placeholder="Kota/Kabupaten" required /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Kecamatan</label><input type="text" value={data.kecamatan} onChange={e => setData('kecamatan', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-poltekpar-primary" placeholder="Kecamatan" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Kelurahan / Desa</label><input type="text" value={data.kelurahan_desa} onChange={e => setData('kelurahan_desa', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-poltekpar-primary" placeholder="Kelurahan/Desa" /></div>
                    <div className="md:col-span-2 space-y-1.5"><label className="text-xs font-semibold text-slate-700">Alamat Lengkap</label><textarea value={data.alamat_lengkap} onChange={e => setData('alamat_lengkap', e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-poltekpar-primary resize-none" placeholder="Detail alamat..." /></div>
                </div>
                <div className="space-y-1.5 mt-4">
                    <label className="text-xs font-semibold text-slate-700">Tandai Lokasi di Peta (Koordinat)</label>
                    <p className="text-[10px] text-slate-500 mb-2">Geser peta atau klik untuk menandai lokasi spesifik agar mempermudah tim survei.</p>
                    <MapLocationPicker
                        latitude={data.latitude}
                        longitude={data.longitude}
                        onChange={(lat, lng, address) => {
                            const newData: any = { latitude: lat, longitude: lng };
                            if (address) {
                                if (address.state || address.province) newData.provinsi = address.state || address.province;
                                if (address.city || address.town || address.county) newData.kota_kabupaten = address.city || address.town || address.county;
                                if (address.suburb || address.village) newData.kecamatan = address.suburb || address.village;
                                if (address.neighbourhood || address.residential || address.hamlet) newData.kelurahan_desa = address.neighbourhood || address.residential || address.hamlet;
                            }
                            // In inertia, calling setData with object assigns the keys
                            Object.entries(newData).forEach(([key, val]) => setData(key as any, val as any));
                        }}
                    />
                    {data.latitude && data.longitude ? (
                        <p className="text-[10px] text-slate-500 mt-1 font-mono">Lat: {data.latitude.toFixed(6)}, Lng: {data.longitude.toFixed(6)}</p>
                    ) : data.kelurahan_desa ? (
                        <p className="text-[10px] text-red-500 mt-1 font-bold animate-pulse flex items-center gap-1">
                            <i className="fa-solid fa-triangle-exclamation"></i>
                            Nama desa terisi namun titik peta belum ditandai. Mohon tandai di peta!
                        </p>
                    ) : null}
                </div>
            </section>

            <section className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><i className="fa-solid fa-link text-poltekpar-primary"></i>Tautan Dokumen</h3>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-700">Surat Permohonan <span className="text-red-500">*</span></label>
                            <a href="/template/surat_permohonan" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-poltekpar-primary hover:underline flex items-center gap-1.5"><i className="fa-solid fa-download"></i> Download Template Surat Permohonan</a>
                        </div>
                        <input type="file" accept=".pdf" onChange={e => setFilePermohonan(e.target.files?.[0] || null)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-poltekpar-primary file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-poltekpar-primary/10 file:text-poltekpar-primary" required />
                        {filePermohonan && filePermohonan.type === 'application/pdf' && (
                            <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden h-64 bg-slate-50 relative shadow-inner">
                                <span className="absolute top-2 right-2 text-[10px] font-bold bg-slate-800 text-white px-2 py-1 rounded-md opacity-50 z-10">Preview</span>
                                <object data={URL.createObjectURL(filePermohonan)} type="application/pdf" className="w-full h-full relative z-20">
                                    <div className="flex items-center justify-center h-full text-xs text-slate-400">Browser tidak mendukung preview PDF secara instan.</div>
                                </object>
                            </div>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-700">Proposal (Opsional)</label>
                            <a href="/template/proposal" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-poltekpar-primary hover:underline flex items-center gap-1.5"><i className="fa-solid fa-download"></i> Download Template Proposal</a>
                        </div>
                        <input type="file" accept=".pdf" onChange={e => setFileProposal(e.target.files?.[0] || null)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-poltekpar-primary file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-poltekpar-primary/10 file:text-poltekpar-primary" />
                        {fileProposal && fileProposal.type === 'application/pdf' && (
                            <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden h-64 bg-slate-50 relative shadow-inner">
                                <span className="absolute top-2 right-2 text-[10px] font-bold bg-slate-800 text-white px-2 py-1 rounded-md opacity-50 z-10">Preview</span>
                                <object data={URL.createObjectURL(fileProposal)} type="application/pdf" className="w-full h-full relative z-20">
                                    <div className="flex items-center justify-center h-full text-xs text-slate-400">Browser tidak mendukung preview PDF.</div>
                                </object>
                            </div>
                        )}
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-slate-700">Link Tambahan</label>
                        {data.link_tambahan.map((l, i) => (
                            <div key={i} className="flex gap-2">
                                <input type="text" value={l.name} onChange={e => handleLinkChange(i, 'name', e.target.value)} className="w-1/3 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-poltekpar-primary" placeholder="Nama Tautan" />
                                <input type="url" value={l.url} onChange={e => handleLinkChange(i, 'url', e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-poltekpar-primary" placeholder="Link lainnya..." />
                                {data.link_tambahan.length > 1 && <button type="button" onClick={() => handleRemoveLink(i)} className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg bg-red-50 text-red-500"><i className="fa-solid fa-trash-can"></i></button>}
                            </div>
                        ))}
                        <button type="button" onClick={handleAddLink} className="text-xs font-bold text-poltekpar-primary hover:underline flex items-center gap-1.5"><i className="fa-solid fa-plus-circle"></i>Tambah Tautan Lagi</button>
                    </div>
                </div>
            </section>

            <button type="submit" disabled={isMockSubmitting} className="w-full py-3.5 bg-poltekpar-primary hover:bg-poltekpar-navy text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                {isMockSubmitting ? <><i className="fa-solid fa-spinner fa-spin"></i>Mengirim...</> : <><i className="fa-solid fa-paper-plane"></i>Kirim Pengajuan</>}
            </button>
        </form>
    );

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-poltekpar-primary to-poltekpar-navy flex items-center justify-center text-white shadow-md"><i className="fa-solid fa-file-signature text-lg"></i></div>
                <div><h3 className="text-base font-bold text-slate-900">Akses Pengajuan PKM</h3><p className="text-sm text-slate-500 mt-0.5">Formulir pengajuan untuk masyarakat</p></div>
            </div>
            {!hideMainTabNav && (
                <div className="flex border-b border-slate-100">
                    <button type="button" onClick={() => setMainTab('pengajuan')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${mainTab === 'pengajuan' ? 'text-poltekpar-primary border-b-2 border-poltekpar-primary' : 'text-slate-500 hover:text-slate-700'}`}>Pengajuan</button>
                    <button type="button" onClick={() => setMainTab('arsip')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${mainTab === 'arsip' ? 'text-poltekpar-primary border-b-2 border-poltekpar-primary' : 'text-slate-500 hover:text-slate-700'}`}>Arsip</button>
                </div>
            )}
            {!hideMainTabNav && mainTab === 'arsip' ? null : renderSubmissionTab()}
            <ActionFeedbackDialog show={feedbackDialog.show} type={feedbackDialog.type} title={feedbackDialog.title} message={feedbackDialog.message} onClose={() => setFeedbackDialog({ ...feedbackDialog, show: false })} />
            {renderDetailModal()}
            
            {/* Modal Evaluasi Aplikasi Sebelum Submit */}
            {showFeedbackModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                        <div className="bg-poltekpar-navy text-white px-8 py-7 text-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse-slow"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5 backdrop-blur-sm">
                                    <i className="fa-solid fa-comment-dots text-2xl"></i>
                                </div>
                                <h3 className="text-2xl font-black mb-2 tracking-tight">Evaluasi Sistem SIGAPPA</h3>
                                <p className="text-white/80 text-sm max-w-2xl mx-auto font-medium">Sebelum pengajuan dikirim, mohon isi evaluasi aplikasi berikut terlebih dahulu.</p>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 overflow-y-auto space-y-8">
                            <div className="space-y-5">
                                <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
                                    <h4 className="text-lg font-black text-slate-800 uppercase tracking-wide">1. Data Responden</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 block mb-2">Nama Lengkap <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={evaluasiForm.nama}
                                            onChange={e => handleEvaluasiFieldChange('nama', e.target.value)}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-poltekpar-primary focus:bg-white transition-all font-medium"
                                            placeholder="Cth: John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 block mb-2">No. Telepon / WA <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={evaluasiForm.no_telp}
                                            onChange={e => handleEvaluasiFieldChange('no_telp', e.target.value)}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-poltekpar-primary focus:bg-white transition-all font-medium"
                                            placeholder="Cth: 08123456789"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 block mb-2">Asal Instansi (Opsional)</label>
                                    <input
                                        type="text"
                                        value={evaluasiForm.asal_instansi}
                                        onChange={e => handleEvaluasiFieldChange('asal_instansi', e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-poltekpar-primary focus:bg-white transition-all font-medium"
                                        placeholder="Cth: Universitas XYZ / Desa ABC"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-slate-100 pb-3 gap-2">
                                    <h4 className="text-lg font-black text-slate-800 uppercase tracking-wide">2. Kuesioner Evaluasi</h4>
                                    <span className="text-[11px] font-bold text-poltekpar-primary bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">Bintang 1 - 5</span>
                                </div>

                                {EVALUATION_QUESTIONS.map((question, index) => {
                                    const key = `q${index + 1}` as keyof Pick<EvaluasiFormData, 'q1' | 'q2' | 'q3' | 'q4' | 'q5'>;
                                    const currentValue = evaluasiForm[key];

                                    return (
                                        <div key={key} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:border-poltekpar-primary/30 transition-colors">
                                            <p className="text-[15px] font-bold text-slate-700 leading-relaxed mb-4">{index + 1}. {question}</p>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map((value) => (
                                                        <button
                                                            key={value}
                                                            type="button"
                                                            onClick={() => handleEvaluasiFieldChange(key, value)}
                                                            className={`p-3 rounded-xl border-2 transition-all duration-300 ${currentValue >= value ? 'bg-amber-50 border-amber-300 text-amber-500 scale-110 shadow-sm' : 'bg-white border-slate-200 text-slate-300 hover:border-amber-200 hover:text-amber-300'}`}
                                                        >
                                                            <i className={`fa-solid fa-star text-xl ${currentValue >= value ? 'text-amber-400' : ''}`}></i>
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="w-full sm:w-auto sm:ml-4 text-[13px] font-bold text-slate-500 py-1.5 px-3 bg-white rounded-lg border border-slate-100">
                                                    {getEvaluationLabel(currentValue)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
                                    <h4 className="text-lg font-black text-slate-800 uppercase tracking-wide">3. Umpan Balik Tambahan</h4>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 block mb-2">Masukan & Saran Konstruktif (Opsional)</label>
                                    <textarea
                                        rows={4}
                                        value={evaluasiForm.masukan}
                                        onChange={e => handleEvaluasiFieldChange('masukan', e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-poltekpar-primary focus:bg-white transition-all font-medium custom-scrollbar"
                                        placeholder="Silakan tuliskan jika ada hal lain yang ingin disampaikan mengenai sistem ini..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row gap-3">
                            <button 
                                    type="button"
                                onClick={() => setShowFeedbackModal(false)}
                                className="flex-1 py-4 px-6 border border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
                            >
                                BATAL
                            </button>
                            <button 
                                    type="button"
                                onClick={handleFinalSubmit}
                                disabled={evaluasiSubmitting}
                                className={`flex-1 py-4 px-6 font-black rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${evaluasiSubmitting ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-poltekpar-primary text-white shadow-poltekpar-primary/20 hover:shadow-poltekpar-primary/40'}`}
                            >
                                {evaluasiSubmitting ? 'MENYIMPAN EVALUASI...' : 'KIRIM EVALUASI & SUBMIT'} <i className="fa-solid fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
