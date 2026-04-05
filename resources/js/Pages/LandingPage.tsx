import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Layout from '@/Layouts/DefaultLayout';
import LandingCharts from '@/Components/LandingCharts';
import MapLegend from '@/Components/MapLegend';
import CTABanner from '@/Components/CTABanner';
import { resolvePublicPkmData } from '@/data/sigapData';
import { createPkmMarkerIcon, getPkmTypeMeta, getPkmStatusMeta } from '@/data/pkmMapVisuals';
import { PkmData } from '@/types';
import '../../css/landing.css';

// Leaflet Setup
if (typeof window !== 'undefined' && L && L.Icon && L.Icon.Default) {
    (L.Icon.Default.prototype as any)._getIconUrl = undefined;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
        iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
        shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
    });
}

interface MapSizeInvalidatorProps {
    watchKey: string;
}

function MapSizeInvalidator({ watchKey }: MapSizeInvalidatorProps): null {
    const map = useMap();
    useEffect(() => {
        const runInvalidate = () => { map.invalidateSize(); };
        const timeoutId = window.setTimeout(runInvalidate, 200);
        return () => window.clearTimeout(timeoutId);
    }, [map, watchKey]);
    return null;
}

const MapSummaryOverlay: React.FC<{
    total: number;
    selesai: number;
    berlangsung: number;
    forceHide?: boolean;
    selectedTypes: string[];
    onToggleType: (t: string) => void;
    selectedStatuses: string[];
    onToggleStatus: (s: string) => void;
}> = ({ total, selesai, berlangsung, forceHide = false, selectedTypes, onToggleType, selectedStatuses, onToggleStatus }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={`absolute bottom-8 left-8 z-[1000] flex items-end gap-3 pointer-events-none transition-all duration-500 ease-in-out ${forceHide ? 'opacity-0 translate-y-8 scale-90 pointer-events-none' : 'opacity-100 translate-y-0 scale-100'}`}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-10 h-10 mb-1 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 flex items-center justify-center text-slate-500 hover:text-sigappa-primary hover:scale-105 active:scale-95 transition-all outline-none z-10 pointer-events-auto"
                title={isCollapsed ? "Tampilkan Informasi Map" : "Sembunyikan Informasi Map"}
            >
                <i className={`fa-solid ${isCollapsed ? 'fa-chart-pie' : 'fa-chevron-left'} transition-transform duration-300`}></i>
            </button>

            {/* Container for Cards */}
            <div className={`flex items-end gap-3 transition-all duration-500 ease-in-out origin-bottom-left ${isCollapsed ? 'opacity-0 scale-0 -translate-x-10 translate-y-6 pointer-events-none absolute left-12 bottom-0' : 'opacity-100 scale-100 translate-x-0 translate-y-0 relative'}`}>
                {/* Legend Card - Minimized Glass */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-1 shadow-2xl border border-white/40 whitespace-nowrap pointer-events-auto">
                    <MapLegend
                        className="bg-transparent border-none shadow-none"
                        compact
                        selectedTypes={selectedTypes}
                        onToggleType={onToggleType}
                        selectedStatuses={selectedStatuses}
                        onToggleStatus={onToggleStatus}
                    />
                </div>

                {/* Summary Card - Ultra Compact Horizontal Glass */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 shadow-2xl border border-white/40 flex items-center gap-5 whitespace-nowrap mb-1 pointer-events-auto">
                    <div className="flex items-center gap-2 px-1">
                        <div className="w-8 h-8 bg-gradient-to-br from-sigappa-primary/20 to-sigappa-primary/5 rounded-lg flex items-center justify-center text-sigappa-primary shadow-sm">
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

export default function LandingPage({ publicPkmData = null }: { publicPkmData?: PkmData[] | null }) {
    const [pkmData] = useState<PkmData[]>(() => resolvePublicPkmData(publicPkmData));
    const [sidebarPkm, setSidebarPkm] = useState<PkmData | null>(null);

    const [isListSidebarOpen, setIsListSidebarOpen] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [listSelectedPkm, setListSelectedPkm] = useState<PkmData | null>(null);

    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

    const toggleType = (key: string) => {
        setSelectedTypes(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    };

    const toggleStatus = (key: string) => {
        setSelectedStatuses(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    };

    const filteredPkmData = pkmData.filter(pkm => {
        const matchesSearch = pkm.nama.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            pkm.desa.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            pkm.kabupaten.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            pkm.provinsi.toLowerCase().includes(searchKeyword.toLowerCase());

        const typeMeta = getPkmTypeMeta(pkm);
        const statusMeta = getPkmStatusMeta(pkm.status);

        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(typeMeta.key);
        const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(statusMeta.key);

        return matchesSearch && matchesType && matchesStatus;
    });

    const totalPkm = filteredPkmData.length;
    const totalSelesai = filteredPkmData.filter((item) => item.status === 'selesai').length;
    const totalBerlangsung = filteredPkmData.filter((item) => item.status === 'berlangsung').length;

    return (
        <Layout mainClassName="site-main-content" mainStyle={{ flex: '1', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
            <Head title="Geospatial PKM Dashboard" />

            <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 flex-1 flex flex-col py-4">
                {/* Combined Map + Dashboard Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-sigappa-navy/5 border border-slate-100 overflow-hidden mb-4 p-3">
                    {/* Dashboard Evaluasi PKM Header */}
                    <div className="mb-2.5 px-1">
                        <h2 className="text-lg font-bold text-slate-900">
                            Dashboard Evaluasi <span className="text-poltekpar-primary">PKM</span>
                        </h2>
                    </div>

                    {/* Map Section */}
                    <div className="relative w-full h-[60vh] overflow-hidden z-10">
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
                            {filteredPkmData.map((pkm) => (
                                <Marker
                                    key={pkm.id}
                                    position={[parseFloat(String(pkm.lat)), parseFloat(String(pkm.lng))]}
                                    icon={createPkmMarkerIcon(pkm)}
                                    eventHandlers={{ click: () => setSidebarPkm(pkm) }}
                                />
                            ))}
                            <MapSizeInvalidator watchKey="landing-map" />
                        </MapContainer>

                        {/* Top Right Action Button */}
                        <div className={`absolute top-3 right-3 z-[1000] transition-all duration-500 ease-in-out ${isListSidebarOpen || !!sidebarPkm ? 'opacity-0 -translate-y-4 pointer-events-none scale-90' : 'opacity-100 translate-y-0 scale-100'}`}>
                            <button
                                onClick={() => {
                                    setIsListSidebarOpen(true);
                                    setSidebarPkm(null);
                                    setListSelectedPkm(null);
                                }}
                                className="bg-white/95 backdrop-blur-md border border-slate-100 shadow-md rounded-lg px-3.5 py-2 flex items-center gap-2 text-[11px] font-black text-slate-700 hover:text-poltekpar-primary hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                <i className="fa-solid fa-list-ul"></i>
                                DAFTAR PKM
                            </button>
                        </div>

                        {/* Summary & Legend Overlay - Bottom Left */}
                        <MapSummaryOverlay
                            total={totalPkm}
                            selesai={totalSelesai}
                            berlangsung={totalBerlangsung}
                            forceHide={isListSidebarOpen || !!sidebarPkm}
                            selectedTypes={selectedTypes}
                            onToggleType={toggleType}
                            selectedStatuses={selectedStatuses}
                            onToggleStatus={toggleStatus}
                        />

                        {/* Sidebar PKM Detail Overlay - Right Side */}
                        <div className={`pk-detail-sidebar absolute top-3 bottom-3 right-3 w-[300px] max-w-[calc(100%-24px)] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl z-[1100] p-4 overflow-y-auto transition-transform duration-700 border border-white/60 ${!sidebarPkm ? 'translate-x-[120%]' : 'translate-x-0'}`}>
                            {sidebarPkm && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                                    <div className="flex items-center justify-between">
                                        {(() => {
                                            const s = sidebarPkm.status;
                                            const m = getPkmStatusMeta(s);
                                            const cls = s === 'berlangsung' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700';
                                            return (
                                                <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${cls}`}>
                                                    <i className={`fa-solid ${m.markerIcon}`}></i> {m.label}
                                                </span>
                                            );
                                        })()}
                                        <button onClick={() => setSidebarPkm(null)} className="w-7 h-7 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"><i className="fa-solid fa-xmark text-xs"></i></button>
                                    </div>
                                    <div className="aspect-video rounded-xl overflow-hidden shadow-md border border-slate-100 bg-slate-50 group">
                                        {sidebarPkm.thumbnail ? (
                                            <img src={sidebarPkm.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-200"><i className="fa-solid fa-mountain-sun text-3xl"></i></div>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-base font-black text-slate-900 leading-tight tracking-tight">{sidebarPkm.nama}</h3>
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Ringkasan</span>
                                            <p className="text-[11px] font-bold text-slate-600 leading-relaxed text-justify">{sidebarPkm.deskripsi}</p>
                                        </div>
                                        <div className="flex flex-col gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-sigappa-primary/10 text-sigappa-primary flex items-center justify-center text-[10px]"><i className="fa-solid fa-location-dot"></i></div> {sidebarPkm.desa}, {sidebarPkm.kabupaten}</div>
                                            <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-sigappa-primary/10 text-sigappa-primary flex items-center justify-center text-[10px]"><i className="fa-solid fa-calendar"></i></div> Tahun {sidebarPkm.tahun}</div>
                                        </div>

                                        {/* Tim Pelaksana */}
                                        <div className="pt-3 border-t border-slate-100">
                                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tim Pelaksana</span>
                                            {sidebarPkm.tim_kegiatan && sidebarPkm.tim_kegiatan.length > 0 ? (
                                                <div className="space-y-1.5">
                                                    {sidebarPkm.tim_kegiatan.map((t, i) => (
                                                        <div key={i} className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                                            <div className="w-6 h-6 rounded-md bg-poltekpar-primary/10 text-poltekpar-primary flex items-center justify-center text-[8px] font-black">{t.nama?.charAt(0)?.toUpperCase() || '?'}</div>
                                                            <div className="min-w-0">
                                                                <span className="text-[10px] font-bold text-slate-700 block leading-tight truncate">{t.nama}</span>
                                                                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">{t.peran}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-center">
                                                    <span className="text-[9px] font-bold text-slate-400">Belum ada data tim</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Anggaran */}
                                        <div className="pt-3 border-t border-slate-100">
                                            <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-poltekpar-primary/10 text-poltekpar-primary flex items-center justify-center text-xs"><i className="fa-solid fa-money-bill-wave"></i></div>
                                                <div className="flex-1">
                                                    <span className="block text-[8px] font-black text-poltekpar-primary/60 uppercase tracking-widest">Total Anggaran</span>
                                                    <span className="text-sm font-black text-poltekpar-primary">Rp {Number(sidebarPkm.total_anggaran || 0).toLocaleString('id-ID')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Testimoni */}
                                        {sidebarPkm.testimoni && sidebarPkm.testimoni.length > 0 && (
                                            <div className="pt-3 border-t border-slate-100">
                                                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Testimoni</span>
                                                <div className="space-y-2">
                                                    {sidebarPkm.testimoni.slice(0, 2).map((t, i) => (
                                                        <div key={i} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                                                            <div className="flex items-center justify-between mb-0.5">
                                                                <span className="text-[10px] font-bold text-slate-700">{t.nama_pemberi}</span>
                                                                <div className="flex gap-0.5">
                                                                    {[...Array(5)].map((_, si) => (
                                                                        <i key={si} className={`fa-solid fa-star text-[7px] ${si < t.rating ? 'text-poltekpar-gold' : 'text-slate-200'}`}></i>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <p className="text-[9px] text-slate-500 leading-relaxed truncate">{t.pesan_ulasan}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar PKM List Overlay */}
                        <div className={`absolute top-3 bottom-3 right-3 w-[300px] max-w-[calc(100%-24px)] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl z-[1150] overflow-hidden flex flex-col transition-transform duration-700 border border-white/60 ${!isListSidebarOpen ? 'translate-x-[120%]' : 'translate-x-0'}`}>
                            {listSelectedPkm ? (
                                <>
                                    <div className="p-4 pb-2 bg-white/95 backdrop-blur-xl z-20 border-b border-slate-100 flex-shrink-0">
                                        <div className="flex items-center gap-2.5">
                                            <button onClick={() => setListSelectedPkm(null)} className="w-7 h-7 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-200 transition-all flex items-center justify-center flex-shrink-0">
                                                <i className="fa-solid fa-arrow-left text-xs"></i>
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-black text-slate-900 tracking-tight truncate">{listSelectedPkm.nama}</h3>
                                                {(() => {
                                                    const s = listSelectedPkm.status;
                                                    const m = getPkmStatusMeta(s);
                                                    const cls = s === 'berlangsung' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700';
                                                    return (
                                                        <span className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${cls}`}>
                                                            <i className={`fa-solid ${m.markerIcon}`}></i> {m.label}
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                            <button onClick={() => { setIsListSidebarOpen(false); setListSelectedPkm(null); }} className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0">
                                                <i className="fa-solid fa-xmark text-xs"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4 overflow-y-auto flex-1 space-y-4 animate-in fade-in slide-in-from-right-8 duration-500 custom-scrollbar">
                                        <div className="aspect-video rounded-xl overflow-hidden shadow-md border border-slate-100 bg-slate-50 group">
                                            {listSelectedPkm.thumbnail ? (
                                                <img src={listSelectedPkm.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-200"><i className="fa-solid fa-mountain-sun text-3xl"></i></div>
                                            )}
                                        </div>
                                        <div className="space-y-4">
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Ringkasan</span>
                                                <p className="text-[11px] font-bold text-slate-600 leading-relaxed text-justify">{listSelectedPkm.deskripsi}</p>
                                            </div>
                                            <div className="flex flex-col gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-sigappa-primary/10 text-sigappa-primary flex items-center justify-center text-[10px]"><i className="fa-solid fa-location-dot"></i></div> {listSelectedPkm.desa}, {listSelectedPkm.kabupaten}</div>
                                                <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-sigappa-primary/10 text-sigappa-primary flex items-center justify-center text-[10px]"><i className="fa-solid fa-calendar"></i></div> Tahun {listSelectedPkm.tahun}</div>
                                            </div>

                                            {/* Tim & Anggaran (Combined Compact) */}
                                            <div className="pt-3 border-t border-slate-100 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Tim Pelaksana</span>
                                                    <span className="text-[9px] font-black text-poltekpar-primary">Rp {Number(listSelectedPkm.total_anggaran || 0).toLocaleString('id-ID')}</span>
                                                </div>
                                                {listSelectedPkm.tim_kegiatan && listSelectedPkm.tim_kegiatan.slice(0, 3).map((t, i) => (
                                                    <div key={i} className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                                        <div className="w-5 h-5 rounded bg-poltekpar-primary/10 text-poltekpar-primary flex items-center justify-center text-[7px] font-black">{t.nama?.charAt(0)?.toUpperCase() || '?'}</div>
                                                        <span className="text-[10px] font-bold text-slate-700 truncate">{t.nama}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="p-4 pb-2 bg-white/95 backdrop-blur-xl z-20 border-b border-slate-100 flex-shrink-0">
                                        <div className="flex items-center justify-between mb-3 px-1">
                                            <h3 className="text-sm font-black text-slate-900 tracking-tight">Daftar PKM</h3>
                                            <button onClick={() => setIsListSidebarOpen(false)} className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                                                <i className="fa-solid fa-xmark text-[10px]"></i>
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]"></i>
                                            <input
                                                type="text"
                                                placeholder="Cari desa atau kegiatan..."
                                                value={searchKeyword}
                                                onChange={(e) => setSearchKeyword(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-100 placeholder:text-slate-400 text-slate-700 text-[10px] font-bold rounded-lg py-2 pl-8 pr-3 outline-none focus:border-poltekpar-primary focus:bg-white transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>
                                    <div className="p-4 pt-2 overflow-y-auto flex-1 space-y-2 custom-scrollbar">
                                        {filteredPkmData.map(pkm => {
                                            const typeColor = getPkmTypeMeta(pkm).color;
                                            return (
                                                <button
                                                    key={pkm.id}
                                                    onClick={() => {
                                                        setListSelectedPkm(pkm);
                                                    }}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 flex flex-col gap-1.5 text-left hover:bg-poltekpar-primary hover:text-white hover:border-poltekpar-primary transition-all group shadow-sm cursor-pointer"
                                                >
                                                    <div className="flex items-center justify-between w-full">
                                                        <div className="flex items-center gap-2 w-[90%]">
                                                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: typeColor }}></div>
                                                            <div className="font-black text-[11px] text-slate-800 group-hover:text-white transition-colors truncate">{pkm.nama}</div>
                                                        </div>
                                                        <i className="fa-solid fa-arrow-right text-slate-300 group-hover:text-white transition-colors flex-shrink-0 text-[8px]"></i>
                                                    </div>
                                                    <div className="flex items-center gap-3 pl-3.5 text-[8px] font-bold text-slate-400 group-hover:text-white/80 transition-colors uppercase tracking-widest">
                                                        <span className="flex items-center gap-1"><i className="fa-solid fa-location-dot"></i> {pkm.desa}</span>
                                                        <span className="flex items-center gap-1"><i className="fa-solid fa-calendar"></i> {pkm.tahun}</span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                        {filteredPkmData.length === 0 && (
                                            <div className="text-center py-4">
                                                <p className="text-[9px] font-bold text-slate-400">Data tidak ditemukan.</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Dashboard Evaluasi PKM */}
                    <div className="border-t border-slate-100">
                        <LandingCharts pkmData={pkmData} />
                    </div>
                </div>

                {/* CTA Section */}
                <CTABanner />
            </div>
        </Layout>
    );
}
