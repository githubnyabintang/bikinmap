import React, { useEffect, useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    FileText,
    CheckCircle,
    Clock,
    Activity,
    TrendingUp
} from 'lucide-react';
import { MapContainer, Marker, TileLayer, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LandingCharts from '../../Components/LandingCharts';
import MapLegend from '../../Components/MapLegend';
import { createPkmMarkerIcon } from '../../data/pkmMapVisuals';
import { PkmData } from '../../types';
import '../../../css/landing.css';

// Leaflet Setup
if (typeof window !== 'undefined' && L && L.Icon && L.Icon.Default) {
    (L.Icon.Default.prototype as any)._getIconUrl = undefined;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
        iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
        shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
    });
}

function MapSizeInvalidator({ watchKey }: { watchKey: string }): null {
    const map = useMap();
    useEffect(() => {
        const runInvalidate = () => { map.invalidateSize(); };
        const timeoutId = window.setTimeout(runInvalidate, 200);
        return () => window.clearTimeout(timeoutId);
    }, [map, watchKey]);
    return null;
}

const MapSummaryOverlay: React.FC<{ total: number; selesai: number; berlangsung: number }> = ({ total, selesai, berlangsung }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="absolute bottom-8 left-8 z-[1000] flex items-end gap-3 pointer-events-none">
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-10 h-10 mb-1 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 flex items-center justify-center text-slate-500 hover:text-poltekpar-primary hover:scale-105 active:scale-95 transition-all outline-none z-10 pointer-events-auto"
            >
                <i className={`fa-solid ${isCollapsed ? 'fa-chart-pie' : 'fa-chevron-left'} transition-transform duration-300`}></i>
            </button>

            <div className={`flex items-end gap-3 transition-all duration-500 ease-in-out origin-bottom-left ${isCollapsed ? 'opacity-0 scale-0 -translate-x-10 translate-y-6 pointer-events-none absolute left-12 bottom-0' : 'opacity-100 scale-100 translate-x-0 translate-y-0 relative'}`}>
                {/* Legend Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-1 shadow-2xl border border-white/40 whitespace-nowrap pointer-events-auto">
                    <MapLegend className="bg-transparent border-none shadow-none" compact />
                </div>

                {/* Summary Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 shadow-2xl border border-white/40 flex items-center gap-5 whitespace-nowrap mb-1 pointer-events-auto">
                    <div className="flex items-center gap-2 px-1">
                        <div className="w-8 h-8 bg-gradient-to-br from-poltekpar-primary/20 to-poltekpar-primary/5 rounded-lg flex items-center justify-center text-poltekpar-primary shadow-sm">
                            <i className="fa-solid fa-layer-group text-[10px]"></i>
                        </div>
                        <div>
                            <div className="text-base font-black text-slate-900 leading-none">{total}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Total PKM</div>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-slate-200/50"></div>

                    <div className="flex items-center gap-2 px-1">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-lg flex items-center justify-center text-green-600 shadow-sm">
                            <i className="fa-solid fa-circle-check text-[10px]"></i>
                        </div>
                        <div>
                            <div className="text-base font-black text-slate-900 leading-none">{selesai}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Selesai</div>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-slate-200/50"></div>

                    <div className="flex items-center gap-2 px-1">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg flex items-center justify-center text-amber-600 shadow-sm">
                            <i className="fa-solid fa-clock text-[10px]"></i>
                        </div>
                        <div>
                            <div className="text-base font-black text-slate-900 leading-none">{berlangsung}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Berlangsung</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface DashboardProps {
    stats: {
        totalPengajuan: number;
        pengajuanDiproses: number;
        pengajuanDiterima: number;
        pengajuanDitolak: number;
        totalPegawai: number;
        totalAktivitas: number;
    };
    recentPengajuan: any[];
    pkmMapData: any[];
    pieChartData: any[];
    barChartData: any;
}

const Dashboard: React.FC<DashboardProps> = ({
    stats = { totalPengajuan: 0, pengajuanDiproses: 0, pengajuanDiterima: 0, pengajuanDitolak: 0, totalPegawai: 0, totalAktivitas: 0 },
    pkmMapData = [],
    recentPengajuan = [],
    pieChartData = [],
    barChartData = null,
}) => {
    const [isMounted, setIsMounted] = useState(false);
    const [sidebarPkm, setSidebarPkm] = useState<any>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return <AdminLayout title="Overview"><div className="h-screen bg-white animate-pulse rounded-xl" /></AdminLayout>;

    const statCards = [
        { label: 'Total Pengajuan', value: stats.totalPengajuan, icon: FileText, color: 'text-poltekpar-primary', bg: 'bg-poltekpar-primary/10', iconBg: 'bg-poltekpar-primary', trend: 'Sistem Terpusat' },
        { label: 'Menunggu Review', value: stats.pengajuanDiproses, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', iconBg: 'bg-amber-500', trend: 'Perlu tindakan segera' },
        { label: 'Diterima', value: stats.pengajuanDiterima, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', iconBg: 'bg-emerald-500', trend: 'Sudah dipublikasi' },
        { label: 'Aktivitas PKM', value: stats.totalAktivitas, icon: Activity, color: 'text-poltekpar-navy', bg: 'bg-poltekpar-navy/10', iconBg: 'bg-poltekpar-navy', trend: 'Kegiatan berlangsung' },
    ];

    // Map pkmMapData to PkmData format
    const pkmData: PkmData[] = pkmMapData.map((pkm: any) => ({
        id: pkm.id,
        nama: pkm.nama,
        tahun: pkm.tahun,
        status: pkm.status,
        deskripsi: '',
        thumbnail: null,
        provinsi: pkm.provinsi || '',
        kabupaten: pkm.kabupaten || '',
        kecamatan: pkm.kecamatan || '',
        desa: pkm.desa || '',
        lat: pkm.lat,
        lng: pkm.lng,
    }));

    const totalPkm = pkmData.length;
    const totalSelesai = pkmData.filter(item => item.status === 'selesai').length;
    const totalBerlangsung = pkmData.filter(item => item.status === 'berlangsung').length;

    return (
        <AdminLayout title="System Overview">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {statCards.map((card, i) => (
                    <div key={i} className="group bg-white p-7 rounded-[32px] border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-poltekpar-primary/5 transition-all duration-300 flex flex-col relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-32 h-32 ${card.bg} rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-500`}></div>
                        <div className="flex items-center justify-between relative z-10 mb-6">
                            <div className={`w-14 h-14 rounded-2xl ${card.iconBg} text-white flex items-center justify-center shadow-lg shadow-inherit`}>
                                <card.icon size={24} />
                            </div>
                            <div className="text-right">
                                <h3 className="text-[32px] font-black text-slate-900 leading-none tracking-tight">{card.value}</h3>
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[14px] font-extrabold text-slate-500 mb-1 uppercase tracking-widest">{card.label}</p>
                            <p className={`text-[11px] font-bold ${card.color} opacity-80 flex items-center gap-1`}>
                                <TrendingUp size={12} />
                                {card.trend}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Combined Map + Dashboard Card — SAMA PERSIS dengan user */}
            <div className="bg-white rounded-[48px] shadow-2xl shadow-poltekpar-navy/5 border border-slate-100 overflow-hidden mb-8 p-6">
                {/* Dashboard Evaluasi PKM Header */}
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-slate-900">
                        Dashboard Evaluasi <span className="text-poltekpar-primary">PKM</span>
                    </h2>
                </div>

                {/* Map Section */}
                <div className="relative w-full h-[115vh] overflow-hidden z-10">
                    <MapContainer
                        center={[-2.5, 118]}
                        zoom={5}
                        className="w-full h-full"
                        zoomControl={true}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                        {pkmData.map((pkm) => (
                            <Marker
                                key={pkm.id}
                                position={[parseFloat(String(pkm.lat)), parseFloat(String(pkm.lng))]}
                                icon={createPkmMarkerIcon(pkm)}
                                eventHandlers={{ click: () => setSidebarPkm(pkm) }}
                            />
                        ))}
                        <MapSizeInvalidator watchKey="admin-map" />
                    </MapContainer>

                    {/* Summary & Legend Overlay */}
                    <MapSummaryOverlay total={totalPkm} selesai={totalSelesai} berlangsung={totalBerlangsung} />

                    {/* Sidebar PKM Detail — same as user */}
                    <div className={`pk-detail-sidebar absolute top-8 bottom-8 right-8 w-[400px] max-w-[calc(100%-64px)] bg-white/95 backdrop-blur-xl rounded-[40px] shadow-2xl z-[1100] p-8 overflow-y-auto transition-transform duration-700 border border-white/60 ${!sidebarPkm ? 'translate-x-[120%]' : 'translate-x-0'}`}>
                        {sidebarPkm && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="flex items-center justify-between">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${sidebarPkm.status === 'berlangsung' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{sidebarPkm.status}</span>
                                    <button onClick={() => setSidebarPkm(null)} className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"><i className="fa-solid fa-xmark"></i></button>
                                </div>
                                <div className="aspect-video rounded-[32px] overflow-hidden shadow-xl border border-slate-100 bg-slate-50 group">
                                    {sidebarPkm.thumbnail ? (
                                        <img src={sidebarPkm.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-200"><i className="fa-solid fa-mountain-sun text-5xl"></i></div>
                                    )}
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">{sidebarPkm.nama}</h3>
                                    <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100">
                                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ringkasan Kegiatan</span>
                                        <p className="text-sm font-bold text-slate-600 leading-relaxed text-justify">{sidebarPkm.deskripsi || '-'}</p>
                                    </div>
                                    <div className="flex flex-col gap-3 text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                                        <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-poltekpar-primary/10 text-poltekpar-primary flex items-center justify-center"><i className="fa-solid fa-location-dot"></i></div> {sidebarPkm.desa}, {sidebarPkm.kecamatan}, {sidebarPkm.kabupaten}, {sidebarPkm.provinsi}</div>
                                        <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-poltekpar-primary/10 text-poltekpar-primary flex items-center justify-center"><i className="fa-solid fa-calendar"></i></div> Tahun {sidebarPkm.tahun}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dashboard Evaluasi PKM Charts */}
                <div className="border-t border-slate-100">
                    <LandingCharts pkmData={pkmData} />
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
