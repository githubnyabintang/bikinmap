import React, { useRef, useState, useMemo, ChangeEvent, FormEvent } from 'react';
import { useForm, router } from '@inertiajs/react';
import ActionFeedbackDialog from './ActionFeedbackDialog';
import DocumentationGallery from './DocumentationGallery';
import TestimonialSidebarDisplay from './TestimonialSidebarDisplay';
import type { PkmData } from '@/types';

interface Submission {
    id: number;
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
    tim_kegiatan?: { nama: string; peran: string }[];
}

interface DosenSubmissionCardProps {
    onSubmitted?: (submission: Submission) => void;
    submissionStatus?: string;
    onUpdateSubmissionStatus?: (status: string) => void;
    pkmStatusData?: PkmData | null;
    pkmListData?: PkmData[];
    submissionHistory?: Submission[];
    hideMainTabNav?: boolean;
    onlyShowStatus?: boolean;
}

interface RabItem {
    nama_item: string;
    jumlah: number;
    harga: number;
    total: number;
}

interface FormData {
    nama_ketua: string;
    instansi: string;
    email: string;
    whatsapp: string;
    judul_kegiatan: string;
    provinsi: string;
    kota_kabupaten: string;
    kecamatan: string;
    kelurahan_desa: string;
    alamat_lengkap: string;
    
    tim_dosen: string[];
    tim_staff: string[];
    tim_mahasiswa: string[];
    
    rab_items: RabItem[];
    
    dana_perguruan_tinggi: number;
    dana_pemerintah: number;
    dana_lembaga_dalam: number;
    dana_lembaga_luar: number;
    
    surat_permohonan: string;
    surat_proposal: string;
    link_tambahan: string[];
}

const createSubmittedLabel = (): string => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date());
const getPkmStatusLabel = (status: string): string => status === 'berlangsung' ? 'Berlangsung' : 'Selesai';

const getSubmissionStatusStyle = (status: string) => {
    const styles: Record<string, { label: string; icon: string; bg: string; color: string }> = {
        diproses: { label: 'Diproses', icon: 'fa-clock', bg: '#dbeafe', color: '#1E4A8C' },
        ditangguhkan: { label: 'Revisi', icon: 'fa-file-pen', bg: '#fef3c7', color: '#b45309' },
        ditolak: { label: 'Ditolak', icon: 'fa-circle-xmark', bg: '#fee2e2', color: '#b91c1c' },
        diterima: { label: 'Diterima', icon: 'fa-circle-check', bg: '#dcfce7', color: '#15803d' },
        berlangsung: { label: 'Berlangsung', icon: 'fa-person-walking', bg: '#fef3c7', color: '#b45309' },
        selesai: { label: 'Selesai', icon: 'fa-flag-checkered', bg: '#dcfce7', color: '#15803d' },
        belum_diajukan: { label: 'Belum Diajukan', icon: 'fa-file-circle-plus', bg: '#f1f5f9', color: '#64748b' },
    };
    return styles[status] || styles.belum_diajukan;
};

export default function DosenSubmissionCard({
    onSubmitted,
    submissionStatus = 'belum_diajukan',
    onUpdateSubmissionStatus,
    pkmStatusData = null,
    pkmListData = [],
    submissionHistory = [],
    hideMainTabNav = false,
    onlyShowStatus = false,
}: DosenSubmissionCardProps) {
    const [mainTab, setMainTab] = useState('pengajuan');
    const [expandedHubSections, setExpandedHubSections] = useState({ kegiatan: false, riwayat: false });
    const [expandedActivityId, setExpandedActivityId] = useState<number | null>(pkmListData[0]?.id ?? null);
    const [selectedDetail, setSelectedDetail] = useState<Submission | null>(null);
    const [isMockSubmitting, setIsMockSubmitting] = useState(false);
    const [feedbackDialog, setFeedbackDialog] = useState<{ show: boolean; type: 'success' | 'error'; title: string; message: string }>({ show: false, type: 'success', title: '', message: '' });

    const { data, setData, errors, setError, clearErrors, reset } = useForm<FormData>({
        nama_ketua: '',
        instansi: 'Politeknik Pariwisata Makassar',
        email: '',
        whatsapp: '',
        judul_kegiatan: '',
        provinsi: '',
        kota_kabupaten: '',
        kecamatan: '',
        kelurahan_desa: '',
        alamat_lengkap: '',
        tim_dosen: [''],
        tim_staff: [''],
        tim_mahasiswa: [''],
        rab_items: [{ nama_item: '', jumlah: 1, harga: 0, total: 0 }],
        dana_perguruan_tinggi: 0,
        dana_pemerintah: 0,
        dana_lembaga_dalam: 0,
        dana_lembaga_luar: 0,
        surat_permohonan: '',
        surat_proposal: '',
        link_tambahan: [''],
    });

    const handleAddMember = (type: 'tim_dosen' | 'tim_staff' | 'tim_mahasiswa') => setData(type, [...data[type], '']);
    const handleRemoveMember = (type: 'tim_dosen' | 'tim_staff' | 'tim_mahasiswa', idx: number) => setData(type, data[type].filter((_, i) => i !== idx));
    const handleMemberChange = (type: 'tim_dosen' | 'tim_staff' | 'tim_mahasiswa', idx: number, val: string) => {
        const updated = [...data[type]];
        updated[idx] = val;
        setData(type, updated);
    };

    const handleAddRab = () => setData('rab_items', [...data.rab_items, { nama_item: '', jumlah: 1, harga: 0, total: 0 }]);
    const handleRemoveRab = (idx: number) => setData('rab_items', data.rab_items.filter((_, i) => i !== idx));
    const handleRabChange = (idx: number, field: keyof RabItem, val: string | number) => {
        const updated = [...data.rab_items];
        const item = { ...updated[idx], [field]: val };
        if (field === 'jumlah' || field === 'harga') item.total = Number(item.jumlah) * Number(item.harga);
        updated[idx] = item;
        setData('rab_items', updated);
    };

    const handleAddLink = () => setData('link_tambahan', [...data.link_tambahan, '']);
    const handleRemoveLink = (idx: number) => setData('link_tambahan', data.link_tambahan.filter((_, i) => i !== idx));
    const handleLinkChange = (idx: number, val: string) => {
        const updated = [...data.link_tambahan];
        updated[idx] = val;
        setData('link_tambahan', updated);
    };

    const totalRAB = useMemo(() => data.rab_items.reduce((sum, item) => sum + (item.total || 0), 0), [data.rab_items]);
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!data.judul_kegiatan.trim()) {
            setFeedbackDialog({ show: true, type: 'error', title: 'Form Belum Lengkap', message: 'Mohon isi judul kegiatan PKM.' });
            return;
        }
        setIsMockSubmitting(true);

        const payload = {
            judul_kegiatan:     data.judul_kegiatan,
            nama_dosen:         data.nama_ketua,
            instansi_mitra:     data.instansi,
            no_telepon:         data.whatsapp,
            provinsi:           data.provinsi,
            kota_kabupaten:     data.kota_kabupaten,
            kecamatan:          data.kecamatan,
            kelurahan_desa:     data.kelurahan_desa,
            alamat_lengkap:     data.alamat_lengkap,
            dosen_terlibat:     data.tim_dosen.filter(v => v.trim() !== ''),
            staff_terlibat:     data.tim_staff.filter(v => v.trim() !== ''),
            mahasiswa_terlibat: data.tim_mahasiswa.filter(v => v.trim() !== ''),
            sumber_dana:        'Perguruan Tinggi',
            total_anggaran:     totalRAB || 0,
            proposal_url:       data.surat_proposal,
            surat_permohonan_url: data.surat_permohonan,
            rab:                data.link_tambahan.filter(v => v.trim() !== '').join(', '),
        };

        router.post('/pengajuan', payload as any, {
            preserveScroll: true,
            onSuccess: () => {
                setIsMockSubmitting(false);
                onSubmitted?.({
                    id: Date.now(),
                    judul: data.judul_kegiatan,
                    ringkasan: `Lokasi: ${data.kota_kabupaten} • Ketua: ${data.nama_ketua}`,
                    tanggal: createSubmittedLabel(),
                    status: 'diproses',
                });
                onUpdateSubmissionStatus?.('diproses');
                setFeedbackDialog({ show: true, type: 'success', title: 'Pengajuan Berhasil', message: 'Data pengajuan PKM Dosen telah disimpan.' });
                reset();
            },
            onError: () => {
                setIsMockSubmitting(false);
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
                    {/* Modal Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-poltekpar-primary text-white flex items-center justify-center shadow-md">
                                <i className="fa-solid fa-file-invoice text-lg"></i>
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

                    {/* Modal Body */}
                    <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                        <div className="flex flex-col items-center p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Status Pengajuan</span>
                            <div className="px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-sm" style={{ backgroundColor: style.bg, color: style.color }}>
                                <i className={`fa-solid ${style.icon}`}></i>
                                {style.label}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <section>
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Informasi Umum</h4>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="text-slate-500">Kategori:</span> <span className="text-slate-900 font-semibold">{selectedDetail.jenis_pkm || '-'}</span></p>
                                        <p><span className="text-slate-500">Instansi:</span> <span className="text-slate-900 font-semibold">{selectedDetail.instansi_mitra || '-'}</span></p>
                                        <p><span className="text-slate-500">WhatsApp:</span> <span className="text-slate-900 font-semibold">{selectedDetail.no_telepon || '-'}</span></p>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Lokasi PKM</h4>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                                        {selectedDetail.alamat_lengkap && <p className="mb-1">{selectedDetail.alamat_lengkap}</p>}
                                        <p>{[selectedDetail.kelurahan_desa, selectedDetail.kecamatan, selectedDetail.kota_kabupaten, selectedDetail.provinsi].filter(Boolean).join(', ')}</p>
                                    </div>
                                </section>
                            </div>

                            <div className="space-y-4">
                                <section>
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tim Pelaksana</h4>
                                    <div className="space-y-2">
                                        {selectedDetail.tim_kegiatan && selectedDetail.tim_kegiatan.length > 0 ? (
                                            selectedDetail.tim_kegiatan.map((t, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-poltekpar-primary"></div>
                                                    <span className="text-slate-900 font-medium">{t.nama}</span>
                                                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-tighter">({t.peran})</span>
                                                </div>
                                            ))
                                        ) : <p className="text-xs text-slate-400 italic">Data tim belum diatur.</p>}
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Anggaran & Dokumen</h4>
                                    <div className="space-y-3">
                                        <div className="p-2.5 bg-blue-50 rounded-lg flex justify-between items-center border border-blue-100">
                                            <span className="text-[10px] font-bold text-blue-700 uppercase">Total RAB</span>
                                            <span className="text-sm font-black text-poltekpar-primary">Rp {Number(selectedDetail.total_anggaran || 0).toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedDetail.proposal && <a href={selectedDetail.proposal} target="_blank" className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors border border-slate-200"><i className="fa-solid fa-file-pdf mr-1.5"></i>PROPOSAL</a>}
                                            {selectedDetail.surat_permohonan && <a href={selectedDetail.surat_permohonan} target="_blank" className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors border border-slate-200"><i className="fa-solid fa-file-contract mr-1.5"></i>PERMOHONAN</a>}
                                        </div>
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

                    {/* Modal Footer */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button onClick={() => setSelectedDetail(null)} className="px-6 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">Tutup</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderArchiveTab = () => (
        <div className="p-6">
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
                <button type="button" className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors" onClick={() => setExpandedHubSections(p => ({ ...p, kegiatan: !p.kegiatan }))}>
                    <h4 className="text-sm font-bold text-slate-900">Daftar Kegiatan</h4>
                    <i className={`fa-solid fa-chevron-${expandedHubSections.kegiatan ? 'up' : 'down'} text-slate-400`}></i>
                </button>
                {expandedHubSections.kegiatan && (
                    <div className="border-t border-slate-100 divide-y divide-slate-100">
                        {pkmListData.map(a => (
                            <div key={a.id} className="p-4"><strong className="text-sm font-semibold text-slate-900 block">{a.nama}</strong><p className="text-xs text-slate-500">{a.tahun} • {a.kabupaten}</p></div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    if (onlyShowStatus) {
        return (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-6">
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
                                {submissionHistory.length > 0 ? (
                                    submissionHistory.map(item => {
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

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-poltekpar-primary to-poltekpar-navy flex items-center justify-center text-white shadow-md"><i className="fa-solid fa-file-signature text-lg"></i></div>
                <div><h3 className="text-base font-bold text-slate-900">Form Pengajuan PKM Dosen</h3><p className="text-sm text-slate-500 mt-0.5">Silakan lengkapi data usulan pengabdian</p></div>
            </div>
            {!hideMainTabNav && (
                <div className="flex border-b border-slate-100">
                    <button type="button" onClick={() => setMainTab('pengajuan')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${mainTab === 'pengajuan' ? 'text-poltekpar-primary border-b-2 border-poltekpar-primary' : 'text-slate-500 hover:text-slate-700'}`}>Pengajuan</button>
                    <button type="button" onClick={() => setMainTab('arsip')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${mainTab === 'arsip' ? 'text-poltekpar-primary border-b-2 border-poltekpar-primary' : 'text-slate-500 hover:text-slate-700'}`}>Arsip</button>
                </div>
            )}
            {!hideMainTabNav && mainTab === 'arsip' ? renderArchiveTab() : (
                <form onSubmit={handleSubmit}>
                    {renderSubmissionForm()}
                </form>
            )}
            <ActionFeedbackDialog show={feedbackDialog.show} type={feedbackDialog.type} title={feedbackDialog.title} message={feedbackDialog.message} onClose={() => setFeedbackDialog({ ...feedbackDialog, show: false })} />
            {renderDetailModal()}
        </div>
    );
}
