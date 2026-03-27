import React, { useState, useCallback } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Filter, Download, Search, ChevronRight, Clock, X } from 'lucide-react';

interface Pengajuan {
    id_pengajuan: number;
    judul_kegiatan: string;
    status_pengajuan: string;
    created_at: string;
    user?: { name: string };
    jenis_pkm?: { nama_jenis: string };
    provinsi?: string;
    kota_kabupaten?: string;
}

interface PaginatedData {
    data: Pengajuan[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface IndexProps {
    listPengajuan: PaginatedData;
    filters: { search: string; status: string };
}

const statusBadge: Record<string, { label: string; text: string; bg: string; dot: string }> = {
    diproses: { label: 'Diproses', text: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-400' },
    diterima: { label: 'Diterima', text: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-400' },
    direvisi: { label: 'Revisi', text: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-400' },
    ditolak: { label: 'Ditolak', text: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-400' },
    selesai: { label: 'Selesai', text: 'text-indigo-700', bg: 'bg-indigo-50', dot: 'bg-indigo-400' },
};

const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'diproses', label: 'Diproses' },
    { value: 'direvisi', label: 'Direvisi' },
    { value: 'diterima', label: 'Diterima' },
    { value: 'ditolak', label: 'Ditolak' },
    { value: 'selesai', label: 'Selesai' },
];

const Index: React.FC<IndexProps> = ({ listPengajuan, filters }) => {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const applyFilters = useCallback(() => {
        router.get('/admin/pengajuan', {
            search: search || undefined,
            status: status || undefined,
        }, { preserveState: true, replace: true });
    }, [search, status]);

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') applyFilters();
    };

    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus);
        router.get('/admin/pengajuan', {
            search: search || undefined,
            status: newStatus || undefined,
        }, { preserveState: true, replace: true });
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (status) params.set('status', status);
        window.location.href = `/admin/pengajuan/export?${params.toString()}`;
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        router.get('/admin/pengajuan', {}, { preserveState: true, replace: true });
    };

    const hasFilters = search || status;

    return (
        <AdminLayout title="">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-[24px] font-bold text-zinc-900 tracking-tight">Kelola Pengajuan</h1>
                    <p className="text-[14px] text-zinc-500 mt-1">Review dan kelola semua pengajuan proposal kegiatan PKM.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Cari proposal..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            className="bg-white border border-zinc-200 rounded-md py-2 pl-9 pr-4 text-[13px] text-zinc-700 placeholder-zinc-400 focus:ring-2 focus:ring-zinc-200 focus:border-zinc-400 outline-none w-64 shadow-sm transition-all"
                        />
                    </div>
                    <select
                        value={status}
                        onChange={e => handleStatusChange(e.target.value)}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 shadow-sm rounded-md text-[13px] font-medium text-zinc-600 focus:ring-2 focus:ring-zinc-200 focus:border-zinc-400 outline-none cursor-pointer transition-colors"
                    >
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 shadow-sm rounded-md text-[13px] font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                    >
                        <Download size={14} /> Export
                    </button>
                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-1 px-2 py-2 text-zinc-400 hover:text-zinc-600 transition-colors"
                            title="Hapus filter"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="border-b border-zinc-200 bg-zinc-50/50">
                                <th className="py-3 px-6 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 w-12 text-center">ID</th>
                                <th className="py-3 px-6 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Nama Kegiatan</th>
                                <th className="py-3 px-6 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Pengaju</th>
                                <th className="py-3 px-6 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Detail</th>
                                <th className="py-3 px-6 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 text-center">Status</th>
                                <th className="py-3 px-6 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {listPengajuan.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-zinc-400 text-[14px]">
                                        {hasFilters ? 'Tidak ada hasil untuk filter yang dipilih.' : 'Belum ada data pengajuan.'}
                                    </td>
                                </tr>
                            ) : (
                                listPengajuan.data.map((item) => {
                                    const st = statusBadge[item.status_pengajuan] || statusBadge.diproses;
                                    return (
                                        <tr key={item.id_pengajuan} className="hover:bg-zinc-50/50 transition-colors group">
                                            <td className="py-4 px-6 text-center border-r border-zinc-100 bg-zinc-50/30">
                                                <div className="text-[12px] font-mono font-medium text-zinc-500 bg-zinc-100/80 px-2 py-0.5 rounded border border-zinc-200/60 shadow-sm min-w-[40px] text-center inline-block">
                                                    {item.id_pengajuan.toString().padStart(2, '0')}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <Link href={`/admin/pengajuan/${item.id_pengajuan}`} className="text-[14px] font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors leading-snug truncate max-w-[280px] block">
                                                    {item.judul_kegiatan}
                                                </Link>
                                                <div className="text-[12px] text-zinc-400 mt-1 flex items-center gap-1">
                                                    <Clock size={14} className="text-zinc-400" />
                                                    {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-[13px] font-medium text-zinc-700">
                                                    {item.user?.name || '-'}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-[13px] text-zinc-700 font-medium">{item.jenis_pkm?.nama_jenis || '-'}</div>
                                                        <div className="text-[12px] text-zinc-500 mt-1 truncate max-w-[200px]">
                                                    {item.kota_kabupaten ? `${item.kota_kabupaten}, ${item.provinsi}` : 'Lokasi: TBD'}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wider uppercase border ${st.bg} ${st.text} border-zinc-100`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                                                    {st.label}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <Link
                                                    href={`/admin/pengajuan/${item.id_pengajuan}`}
                                                    className="inline-flex items-center justify-center p-2 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors border border-transparent hover:border-zinc-200"
                                                >
                                                    <ChevronRight size={18} />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination footer */}
                {listPengajuan.last_page > 1 && (
                    <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-200 bg-zinc-50/50">
                        <div className="text-[12px] font-medium text-zinc-500">
                            Menampilkan {(listPengajuan.current_page - 1) * listPengajuan.per_page + 1}
                            –{Math.min(listPengajuan.current_page * listPengajuan.per_page, listPengajuan.total)}
                            dari {listPengajuan.total} items
                        </div>
                        <div className="flex items-center gap-1">
                            {listPengajuan.links.map((link, i) => {
                                if (i === 0) {
                                    return (
                                        <button
                                            key={i}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                            className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 text-[13px] transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            ‹
                                        </button>
                                    );
                                }
                                if (i === listPengajuan.links.length - 1) {
                                    return (
                                        <button
                                            key={i}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                            className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 text-[13px] transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            ›
                                        </button>
                                    );
                                }
                                return (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        className={`w-8 h-8 flex items-center justify-center rounded-md text-[13px] font-medium transition-colors shadow-sm focus:outline-none disabled:cursor-not-allowed ${
                                            link.active
                                                ? 'bg-zinc-900 text-white'
                                                : 'border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default Index;
