import React, { useEffect, useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { 
    FileText, 
    CheckCircle, 
    Clock, 
    AlertCircle, 
    Users, 
    Activity,
    ChevronRight,
    TrendingUp
} from 'lucide-react';
import { MapContainer, Marker, TileLayer, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title as ChartTitle,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    ChartTitle,
    Tooltip,
    Legend,
    Filler
);

// Fix leaflet icons natively
if (typeof window !== 'undefined' && L && L.Icon && L.Icon.Default) {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
        iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
        shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
    });
}

const createCustomIcon = (status: string, color: string) => {
    const markerColor = status === 'berlangsung' ? '#f59e0b' : color;
    return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
            <div class="marker-pin" style="background-color: ${markerColor}">
                <i class="fa-solid fa-hands-holding-child"></i>
            </div>
            <div class="marker-pulse" style="border-color: ${markerColor}"></div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
    });
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
    recentLogs: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ 
    stats = { totalPengajuan: 0, pengajuanDiproses: 0, pengajuanDiterima: 0, pengajuanDitolak: 0, totalPegawai: 0, totalAktivitas: 0 },
    pkmMapData = [], 
    pieChartData = [], 
    barChartData = null, 
    recentLogs = [] 
}) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const timeAgo = (dateString: string) => {
        if (!dateString) return '-';
        try {
            const now = new Date();
            const date = new Date(dateString);
            const diffMs = now.getTime() - date.getTime();
            if (isNaN(diffMs)) return '-';

            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMins < 1) return 'Baru saja';
            if (diffMins < 60) return `${diffMins} menit yang lalu`;
            if (diffHours < 24) return `${diffHours} jam yang lalu`;
            if (diffDays < 7) return `${diffDays} hari yang lalu`;

            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch { return '-'; }
    };

    if (!isMounted) return <AdminLayout title="Overview"><div className="h-screen bg-white animate-pulse rounded-xl" /></AdminLayout>;

    const statCards = [
        { label: 'Total Pengajuan', value: stats.totalPengajuan, icon: FileText, color: 'text-poltekpar-primary', bg: 'bg-poltekpar-primary/10', iconBg: 'bg-poltekpar-primary', trend: '+12% dari bulan lalu' },
        { label: 'Menunggu Review', value: stats.pengajuanDiproses, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', iconBg: 'bg-amber-500', trend: 'Perlu tindakan segera' },
        { label: 'Diterima', value: stats.pengajuanDiterima, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', iconBg: 'bg-emerald-500', trend: 'Sudah dipublikasi' },
        { label: 'Aktivitas PKM', value: stats.totalAktivitas, icon: Activity, color: 'text-poltekpar-navy', bg: 'bg-poltekpar-navy/10', iconBg: 'bg-poltekpar-navy', trend: 'Kegiatan berlangsung' },
    ];

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

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
                {/* Map Section */}
                <div className="xl:col-span-2 bg-white rounded-[32px] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col h-[560px]">
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-white to-slate-50/50">
                        <div>
                            <h2 className="text-[18px] font-black text-slate-900 tracking-tight">Sebaran Lokasi PKM</h2>
                            <p className="text-[13px] font-bold text-slate-400 mt-0.5">Monitoring sebaran geografis kegiatan pengabdian</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="flex items-center gap-1 px-3 py-1.5 bg-poltekpar-primary/10 text-poltekpar-primary rounded-full text-[11px] font-black uppercase tracking-wider">
                                <div className="w-1.5 h-1.5 bg-poltekpar-primary rounded-full animate-pulse"></div>
                                Live Data
                             </div>
                        </div>
                    </div>
                    <div className="flex-1 relative z-0">
                        <MapContainer
                            center={[-1.5, 121]}
                            zoom={5}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={true}
                        >
                            <TileLayer
                                attribution='Map data &copy; <a href="https://www.google.com/maps">Google</a>'
                                url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                            />
                            {pkmMapData.map((pkm: any) => (
                                <Marker
                                    key={`map-admin-${pkm.id}`}
                                    position={[pkm.lat, pkm.lng]}
                                    icon={createCustomIcon(pkm.status, pkm.warna_icon)}
                                >
                                    <Popup className="poltekpar-map-popup">
                                        <div className="min-w-[180px] p-2">
                                            <div className="font-black text-[14px] text-poltekpar-navy mb-1 leading-tight">{pkm.nama}</div>
                                            <div className="text-[12px] font-bold text-slate-400 mb-3">{pkm.jenis_nama}</div>
                                            <div className="flex items-center justify-between">
                                                <div className={`px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest ${pkm.status === 'selesai' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                                                    {pkm.status}
                                                </div>
                                                <div className="text-[11px] font-bold text-poltekpar-primary hover:underline cursor-pointer">Detail</div>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>

                {/* Recent Activity Logs */}
                <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-sm flex flex-col h-[560px] overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/50">
                        <h2 className="text-[18px] font-black text-slate-900 tracking-tight">Log Aktivitas</h2>
                        <p className="text-[13px] font-bold text-slate-400 mt-0.5">Riwayat pembaruan sistem terbaru</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {recentLogs.length > 0 ? recentLogs.map((log: any) => (
                            <div key={log.id} className="flex gap-4 group cursor-pointer">
                                <div className="mt-1 w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-poltekpar-primary group-hover:text-white transition-colors flex-shrink-0">
                                    <Activity size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <span className="text-[14px] font-black text-slate-900 truncate pr-2">{log.title}</span>
                                        <span className="text-[10px] font-black text-slate-400 whitespace-nowrap uppercase tracking-widest mt-0.5">{timeAgo(log.time)}</span>
                                    </div>
                                    <p className="text-[12px] font-bold text-slate-500 line-clamp-2 leading-relaxed">{log.desc}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-40">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                    <Clock size={40} className="text-slate-300" />
                                </div>
                                <p className="text-[14px] font-bold text-slate-500">Belum ada aktivitas tercatat</p>
                            </div>
                        )}
                    </div>
                    <div className="p-6 bg-slate-50/30 border-t border-slate-100">
                        <button className="w-full py-3 px-4 bg-white border border-slate-200 rounded-2xl text-[13px] font-black text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-[0.98]">
                            Lihat Semua Riwayat
                        </button>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Pie Chart */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-sm min-h-[420px] flex flex-col">
                    <div className="mb-8">
                        <h2 className="text-[18px] font-black text-slate-900 tracking-tight">Komposisi Program</h2>
                        <p className="text-[13px] font-bold text-slate-400 mt-0.5">Distribusi jenis kegiatan yang berjalan</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center relative">
                        <div className="w-[260px] h-[260px]">
                            <Doughnut 
                                data={{
                                    labels: pieChartData.map((d: any) => d.label),
                                    datasets: [{
                                        data: pieChartData.map((d: any) => d.count),
                                        backgroundColor: pieChartData.map((d: any) => d.color),
                                        borderColor: '#ffffff',
                                        borderWidth: 4,
                                        hoverOffset: 20,
                                    }]
                                }} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    cutout: '72%',
                                    plugins: {
                                        legend: { 
                                            position: 'bottom', 
                                            labels: { 
                                                usePointStyle: true, 
                                                pointStyle: 'circle',
                                                padding: 24, 
                                                font: { size: 12, weight: 700, family: "'Plus Jakarta Sans'" },
                                                color: '#64748b'
                                            } 
                                        },
                                        tooltip: { 
                                            backgroundColor: '#0D1F3C', 
                                            padding: 16, 
                                            titleFont: { size: 14, weight: 800 }, 
                                            bodyFont: { size: 13, weight: 600 }, 
                                            usePointStyle: true,
                                            cornerRadius: 16
                                        }
                                    }
                                }} 
                            />
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none translate-y-[-20px]">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                            <span className="text-3xl font-black text-slate-900">{stats.totalPengajuan}</span>
                        </div>
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-sm min-h-[420px] flex flex-col">
                    <div className="mb-8">
                        <h2 className="text-[18px] font-black text-slate-900 tracking-tight">Tren Tahunan</h2>
                        <p className="text-[13px] font-bold text-slate-400 mt-0.5">Pertumbuhan data kegiatan PKM</p>
                    </div>
                    <div className="flex-1">
                        {barChartData?.labels ? (
                            <Bar 
                                data={barChartData} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: { 
                                            backgroundColor: '#0D1F3C', 
                                            padding: 16, 
                                            cornerRadius: 16,
                                            titleFont: { size: 14, weight: 800 },
                                            bodyFont: { size: 13, weight: 600 }
                                        }
                                    },
                                    scales: {
                                        x: { 
                                            grid: { display: false }, 
                                            ticks: { 
                                                font: { size: 12, weight: 700, family: "'Plus Jakarta Sans'" },
                                                color: '#94a3b8'
                                            } 
                                        },
                                        y: { 
                                            beginAtZero: true, 
                                            border: { dash: [6, 6] }, 
                                            grid: { color: 'rgba(148, 163, 184, 0.1)' }, 
                                            ticks: { 
                                                stepSize: 1, 
                                                font: { size: 12, weight: 600 },
                                                color: '#94a3b8'
                                            } 
                                        }
                                    }
                                }} 
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 text-[14px] font-bold italic">Data tren pengajuan belum tersedia</div>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .custom-leaflet-marker { background: transparent; border: none; }
                .marker-pin {
                    width: 36px; height: 36px; border-radius: 50% 50% 50% 0;
                    position: absolute; transform: rotate(-45deg);
                    left: 50%; top: 50%; margin: -18px 0 0 -18px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    display: flex; align-items: center; justify-content: center; z-index: 2;
                    border: 3px solid white;
                }
                .marker-pin i { transform: rotate(45deg); color: white; font-size: 14px; }
                .marker-pulse {
                    width: 44px; height: 44px; border: 3px solid; border-radius: 50%;
                    position: absolute; left: 50%; top: 50%; margin: -22px 0 0 -22px;
                    animation: pulse 2s infinite ease-out; z-index: 1; opacity: 0.8;
                }
                @keyframes pulse { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(1.6); opacity: 0; } }
                .poltekpar-map-popup .leaflet-popup-content-wrapper { 
                    border-radius: 20px; 
                    padding: 8px;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .poltekpar-map-popup .leaflet-popup-tip-container { display: none; }
            `}} />
        </AdminLayout>
    );
};

export default Dashboard;
