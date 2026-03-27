// @ts-nocheck - Legacy component, types will be refined in future refactors
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Layout from '@/Layouts/DefaultLayout';
import MobileTabBar from '@/Components/MobileTabBar';
import BottomSheet from '@/Components/BottomSheet';
import LandingCharts from '@/Components/LandingCharts';
import DocumentationGallery from '@/Components/DocumentationGallery';
import TestimonialSidebarDisplay from '@/Components/TestimonialSidebarDisplay';

import { PkmData } from '@/types';

interface UserPengajuan {
    id_pengajuan: number;
    judul_kegiatan: string;
    status_pengajuan: string;
    created_at: string;
    total_anggaran: number;
    jenis_pkm?: { nama_jenis: string };
    provinsi?: string;
    kota_kabupaten?: string;
}

interface LandingProps {
    pkmData?: PkmData[];
    user?: { id_user: number; name: string; email: string; role: string } | null;
    userPengajuan?: UserPengajuan[];
    listJenisPkm?: { id_jenis_pkm: number; nama_jenis: string }[];
    chartStats?: { years: number[]; selesai: number[]; berlangsung: number[]; total_pengajuan: number; total_diterima: number; total_selesai: number } | null;
    testimonials?: any[];
}


// Leaflet Setup
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

const getStatusBadge = (status: string) => status === 'berlangsung' ? 'status-open' : 'status-closed';
const getStatusIcon = (status: string) => status === 'berlangsung' ? 'fa-spinner fa-spin' : 'fa-check-double';
const getStatusText = (status: string) => status === 'berlangsung' ? 'Berlangsung' : 'Selesai';

const createCustomIcon = (status: string) => {
    const markerColor = status === 'berlangsung' ? '#f59e0b' : '#16a34a';
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

function MapEvents({ isPickingLocation, onLocationPicked, setSidebarPkm }: { isPickingLocation: boolean, onLocationPicked: Function, setSidebarPkm: Function }) {
    useMapEvents({
        click(event) {
            if (isPickingLocation) {
                onLocationPicked(event.latlng);
            } else {
                setSidebarPkm(null);
            }
        },
    });
    return null;
}

// ----------------------------------------------------
// Map Search Widget Component
// ----------------------------------------------------

interface MapSearchWidgetProps {
    pkmData: PkmData[];
    onSelectPkm: (pkm: PkmData) => void;
    isHidden: boolean;
}

const MapSearchWidget = ({ pkmData, onSelectPkm, isHidden }: MapSearchWidgetProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filteredData = pkmData.filter((pkm: PkmData) =>
        pkm.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pkm.deskripsi && pkm.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="map-search-widget" style={{
            position: 'absolute', top: '24px', left: '96px', zIndex: 1000, width: '380px', maxWidth: 'calc(100vw - 100px)',
            opacity: isHidden ? 0 : 1,
            pointerEvents: isHidden ? 'none' : 'auto',
            transform: isHidden ? 'translateY(-20px)' : 'translateY(0)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
            <div style={{ position: 'relative', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', padding: '12px 16px', border: '1px solid #e2e8f0' }}>
                <i className="fa-solid fa-search" style={{ color: '#046bd2', marginRight: '12px', fontSize: '18px' }}></i>
                <input
                    type="text"
                    placeholder="Cari lokasi kegiatan P3M..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: '15px', fontWeight: '500', color: '#0f172a' }}
                />
                {searchQuery && (
                    <i className="fa-solid fa-xmark" style={{ cursor: 'pointer', color: '#94a3b8', marginLeft: '12px', fontSize: '16px' }} onClick={() => { setSearchQuery(''); setIsOpen(false); }}></i>
                )}
            </div>

            {isOpen && searchQuery && (
                <div style={{ marginTop: '8px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', maxHeight: '350px', overflowY: 'auto', overflowX: 'hidden', border: '1px solid #e2e8f0' }}>
                    {filteredData.length > 0 ? (
                        <div style={{ padding: '8px 0' }}>
                            {filteredData.map((pkm: PkmData) => (
                                <div
                                    key={pkm.id}
                                    onClick={() => {
                                        onSelectPkm(pkm);
                                        setIsOpen(false);
                                        setSearchQuery(pkm.nama);
                                    }}
                                    style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <div style={{ fontWeight: '600', fontSize: '14.5px', color: '#0f172a', lineHeight: '1.4' }}>{pkm.nama}</div>
                                    <div style={{ fontSize: '12.5px', color: '#64748b' }}><i className="fa-solid fa-location-dot" style={{ marginRight: '6px', color: '#94a3b8' }}></i>{pkm.desa}, {pkm.kecamatan}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                            <i className="fa-solid fa-magnifying-glass-minus" style={{ fontSize: '24px', color: '#cbd5e1', margin: '0 0 12px 0', display: 'block' }}></i>
                            Tidak ada hasil ditemukan untuk <b>"{searchQuery}"</b>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ----------------------------------------------------
// Main Landing Page Component
// ----------------------------------------------------

export default function LandingPage({ pkmData: initialPkmData = [], user = null, userPengajuan = [], listJenisPkm = [], chartStats = null, testimonials = [] }: LandingProps) {
    const [pkmData, setPkmData] = useState<PkmData[]>(initialPkmData);

    const [sidebarPkm, setSidebarPkm] = useState<PkmData | null>(null);
    const [validationError, setValidationError] = useState('');
    const [isMenuListOpen, setIsMenuListOpen] = useState(false);
    const [mobileActiveTab, setMobileActiveTab] = useState('peta');
    const [mobileBottomSheet, setMobileBottomSheet] = useState<'detail' | 'kegiatan' | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isPickingLocation, setIsPickingLocation] = useState(false);
    const [isModalHiddenTemporarily, setIsModalHiddenTemporarily] = useState(false);
    const [formData, setFormData] = useState<PkmData>({
        id: null, nama: '', tahun: 2026, status: 'berlangsung', deskripsi: '', thumbnail: '', laporan: '', dokumentasi: '', provinsi: '', kabupaten: '', kecamatan: '', desa: '', lat: '', lng: '',
    });

    // Accordion & Link Form states
    const [expandedSection, setExpandedSection] = useState<string | null>(null); // 'kegiatan' | null
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkFormData, setLinkFormData] = useState({ pkmId: '', linkDokumentasi: '', linkLaporan: '' });
    const [linkFormSubmitted, setLinkFormSubmitted] = useState(false);

    const toggleSection = (section: string | null) => {
        setExpandedSection(prev => prev === section ? null : section);
    };

    const handleLinkFormChange = (field: string, value: string) => {
        setLinkFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleLinkFormSubmit = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!linkFormData.pkmId) {
            setValidationError('Silakan pilih kegiatan terlebih dahulu.');
            return;
        }
        if (!linkFormData.linkDokumentasi && !linkFormData.linkLaporan) {
            setValidationError('Silakan isi minimal satu link.');
            return;
        }
        // Update the pkmData with the submitted links
        setPkmData(prev => prev.map(item => {
            if (item.id === parseInt(linkFormData.pkmId)) {
                return {
                    ...item,
                    dokumentasi: linkFormData.linkDokumentasi || item.dokumentasi,
                    laporan: linkFormData.linkLaporan || item.laporan,
                };
            }
            return item;
        }));
        setLinkFormSubmitted(true);
        setTimeout(() => {
            setLinkFormSubmitted(false);
            setLinkFormData({ pkmId: '', linkDokumentasi: '', linkLaporan: '' });
            setIsLinkModalOpen(false);
        }, 2500);
    };

    const handleMarkerClick = (pkm: PkmData) => {
        if (window.innerWidth <= 768) {
            setSidebarPkm(pkm);
            setMobileBottomSheet('detail');
        } else {
            setSidebarPkm(pkm);
        }
    };

    const handleMobileTabChange = (tabId: string) => {
        setMobileActiveTab(tabId);
        if (tabId === 'kegiatan') {
            setMobileBottomSheet('kegiatan');
        }
    };

    const closeMobileBottomSheet = () => {
        setMobileBottomSheet(null);
        if (mobileActiveTab === 'kegiatan') {
            setMobileActiveTab('peta');
        }
    };

    const handleEditPKM = (pkm: PkmData) => {
        setFormData(pkm);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsPickingLocation(false);
        setIsModalHiddenTemporarily(false);
        setFormData({
            id: null, nama: '', tahun: 2026, status: 'berlangsung', deskripsi: '', thumbnail: '', laporan: '', dokumentasi: '', provinsi: '', kabupaten: '', kecamatan: '', desa: '', lat: '', lng: '',
        });
    };

    const handlePickLocation = () => {
        setIsPickingLocation(true);
        setIsModalHiddenTemporarily(true);
    };

    const onLocationPicked = (latlng: any) => {
        setFormData((prev) => ({
            ...prev,
            lat: latlng.lat.toFixed(5),
            lng: latlng.lng.toFixed(5),
        }));
        setIsPickingLocation(false);
        setIsModalHiddenTemporarily(false);
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            const result = loadEvent.target?.result as string | null;
            if (result) {
                setFormData((prev) => ({ ...prev, thumbnail: result }));
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (!formData.id && !formData.thumbnail) {
            setValidationError('Silakan pilih thumbnail gambar terlebih dahulu.');
            return;
        }

        if (formData.id) {
            setPkmData((prev) => prev.map((item) => (item.id === formData.id ? { ...formData } : item)));
            setSidebarPkm(null);
        } else {
            setPkmData((prev) => [...prev, { ...formData, id: Date.now() }]);
        }

        handleCloseModal();
        setIsSuccessModalOpen(true);
    };

    return (
        <Layout>
            <Head title="Beranda - P3M Poltekpar Makassar" />

            {validationError && (
                <div style={{
                    position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
                    backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px',
                    padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxWidth: '420px', width: '90%',
                    animation: 'slideDown 0.2s ease',
                }}>
                    <i className="fa-solid fa-circle-exclamation" style={{ color: '#dc2626', fontSize: '16px', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: '#991b1b', fontWeight: 600, flex: 1 }}>{validationError}</span>
                    <button onClick={() => setValidationError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '2px' }}>
                        <i className="fa-solid fa-xmark" />
                    </button>
                    <style>{`@keyframes slideDown { from { opacity: 0; transform: translateX(-50%) translateY(-8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>
                </div>
            )}

            <div className="landing-page">
                <div className="landing-main-layout">
                    {/* 1. Interactive Map Section */}
                    <div className={`landing-map-column ${mobileActiveTab !== 'peta' ? 'mobile-hidden' : ''}`}>
                        <section className="fintech-map-section" id="peta-sebaran">
                            <div className="fintech-panel-header">
                                <h2 className="fintech-panel-title">Peta Sebaran Pengabdian PKM <span className="text-blue">Poltekpar Makassar</span></h2>
                            </div>

                            <div className={`map-picking-mode-container fintech-map-stretch-container ${isPickingLocation ? 'map-picking-mode' : ''}`}>
                                <div className="landing-map-wrapper map-section-boxed fintech-map-stretch-container" style={{ margin: 0, padding: 0 }}>
                                    <div className="map-wrapper-boxed fintech-map-inner" style={{ overflow: 'hidden', position: 'relative' }}>

                                        <MapSearchWidget pkmData={pkmData} onSelectPkm={(pkm: PkmData) => setSidebarPkm(pkm)} isHidden={!!sidebarPkm || isMenuListOpen} />

                                        {/* Left Vertical Navbar (Clean and Modern) */}
                                        <div className="left-side-navbar" style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            zIndex: 1010,
                                            width: '72px',
                                            height: '100%',
                                            backgroundColor: 'white',
                                            borderRight: (isMenuListOpen || sidebarPkm) ? 'none' : '1px solid #e2e8f0',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            padding: '20px 0',
                                            boxShadow: (isMenuListOpen || sidebarPkm) ? 'none' : '2px 0 8px rgba(0,0,0,0.06)',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            <button
                                                onClick={() => {
                                                    if (isMenuListOpen || sidebarPkm) {
                                                        setIsMenuListOpen(false);
                                                        setSidebarPkm(null);
                                                    } else {
                                                        setIsMenuListOpen(true);
                                                    }
                                                }}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', width: '44px', height: '44px', color: '#0f172a', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s', backgroundColor: (isMenuListOpen || sidebarPkm) ? '#f1f5f9' : 'transparent' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = (isMenuListOpen || sidebarPkm) ? '#f1f5f9' : 'transparent'}
                                            >
                                                <i className={`fa-solid ${(isMenuListOpen || sidebarPkm) ? 'fa-xmark' : 'fa-bars'}`} style={{ fontSize: '20px' }}></i>
                                            </button>
                                        </div>

                                        {/* Hamburger Menu List Panel - Master List */}
                                        <div
                                            className="left-sidebar-menu"
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: '72px',
                                                zIndex: 1007,
                                                width: '400px',
                                                height: '100%',
                                                backgroundColor: 'white',
                                                boxShadow: isMenuListOpen ? '4px 0 16px rgba(15, 23, 42, 0.08)' : 'none',
                                                transform: isMenuListOpen ? 'translateX(0)' : 'translateX(-100%)',
                                                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                borderRadius: '0',
                                                borderLeft: '1px solid #f8fafc',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {/* Sidebar Header */}
                                            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Menu</h3>
                                            </div>

                                            {/* Scrollable accordion content */}
                                            <div style={{ overflowY: 'auto', flex: 1 }}>

                                                {/* === Section 1: Daftar Kegiatan (Accordion) === */}
                                                <div style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                    <button
                                                        onClick={() => toggleSection('kegiatan')}
                                                        style={{
                                                            width: '100%', padding: '16px 24px', background: expandedSection === 'kegiatan' ? '#f8fafc' : 'white',
                                                            border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                            transition: 'background 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = expandedSection === 'kegiatan' ? '#f8fafc' : 'white'}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <i className="fa-solid fa-list-check" style={{ color: '#2563eb', fontSize: '16px' }}></i>
                                                            </div>
                                                            <div style={{ textAlign: 'left' }}>
                                                                <div style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>Daftar Kegiatan</div>
                                                                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{pkmData.length} kegiatan tersedia</div>
                                                            </div>
                                                        </div>
                                                        <i className={`fa-solid fa-chevron-${expandedSection === 'kegiatan' ? 'up' : 'down'}`} style={{ color: '#94a3b8', fontSize: '14px', transition: 'transform 0.3s' }}></i>
                                                    </button>

                                                    {/* Expandable PKM list */}
                                                    <div style={{
                                                        maxHeight: expandedSection === 'kegiatan' ? '600px' : '0',
                                                        overflow: 'hidden',
                                                        transition: 'max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                                                    }}>
                                                        {pkmData.map(pkm => (
                                                            <div
                                                                key={pkm.id}
                                                                onClick={() => {
                                                                    setSidebarPkm(pkm);
                                                                }}
                                                                style={{ padding: '14px 24px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', gap: '14px', alignItems: 'center' }}
                                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                            >
                                                                <div
                                                                    style={{
                                                                        width: '56px', height: '56px', borderRadius: '10px', backgroundColor: '#f1f5f9', flexShrink: 0,
                                                                        backgroundImage: pkm.thumbnail ? `url(${pkm.thumbnail})` : 'none',
                                                                        backgroundSize: 'cover', backgroundPosition: 'center',
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)'
                                                                    }}
                                                                >
                                                                    {!pkm.thumbnail && <i className="fa-solid fa-image" style={{ color: '#cbd5e1', fontSize: '20px' }}></i>}
                                                                </div>
                                                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                                                                    <div style={{ fontWeight: '600', fontSize: '13.5px', color: '#0f172a', lineHeight: '1.4', marginBottom: '4px' }}>{pkm.nama}</div>
                                                                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                                        <i className="fa-solid fa-location-dot" style={{ marginRight: '5px', color: '#94a3b8' }}></i>
                                                                        {pkm.desa}, Kec. {pkm.kecamatan}
                                                                    </div>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                                                                        <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: pkm.status === 'berlangsung' ? '#f59e0b' : '#16a34a' }}></span>
                                                                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{pkm.status === 'berlangsung' ? 'Berlangsung' : 'Selesai'}</span>
                                                                    </div>
                                                                </div>
                                                                <i className="fa-solid fa-chevron-right" style={{ color: '#cbd5e1', fontSize: '12px' }}></i>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* === Section 2: Submit Link Dokumentasi & Laporan (Button to open modal) === */}
                                                <div style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                    <button
                                                        onClick={() => setIsLinkModalOpen(true)}
                                                        style={{
                                                            width: '100%', padding: '16px 24px', background: 'white',
                                                            border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                            transition: 'background 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <i className="fa-solid fa-link" style={{ color: '#d97706', fontSize: '16px' }}></i>
                                                            </div>
                                                            <div style={{ textAlign: 'left' }}>
                                                                <div style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>Submit Link</div>
                                                                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Dokumentasi & Laporan</div>
                                                            </div>
                                                        </div>
                                                        <i className="fa-solid fa-arrow-up-right-from-square" style={{ color: '#94a3b8', fontSize: '14px' }}></i>
                                                    </button>
                                                </div>

                                            </div>
                                        </div>

                                        <MapContainer center={[-5.132, 119.49]} zoom={15} className="map-container">
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution=''
                                            />
                                            {pkmData.map((pkm) => (
                                                <Marker
                                                    key={pkm.id}
                                                    position={[Number(pkm.lat), Number(pkm.lng)]}

                                                    icon={createCustomIcon(pkm.status)}
                                                    eventHandlers={{ click: () => handleMarkerClick(pkm) }}
                                                />
                                            ))}
                                            <MapEvents
                                                isPickingLocation={isPickingLocation}
                                                onLocationPicked={onLocationPicked}
                                                setSidebarPkm={setSidebarPkm}
                                            />
                                        </MapContainer>

                                        {/* Premium Fintech Map Legend Overlay */}
                                        <div className="fintech-map-legend">
                                            <div className="legend-title">LEGENDA:</div>
                                            <div className="legend-item">
                                                <span className="legend-icon" style={{ backgroundColor: '#16a34a' }}></span>
                                                <span className="legend-text">PKM Selesai</span>
                                            </div>
                                            <div className="legend-item">
                                                <span className="legend-icon" style={{ backgroundColor: '#f59e0b' }}></span>
                                                <span className="legend-text">PKM Berlangsung</span>
                                            </div>
                                        </div>

                                        <div className={`map-overlay ${sidebarPkm || isMenuListOpen ? 'active' : ''}`} onClick={() => { setSidebarPkm(null); setIsMenuListOpen(false); }}></div>


                                        <aside className={`sidebar ${!sidebarPkm ? 'sidebar-hidden' : ''}`}>
                                            <div className="dashboard-content" style={{ position: 'relative' }}>
                                                {sidebarPkm && (
                                                    <>
                                                        <button
                                                            onClick={() => setSidebarPkm(null)}
                                                            style={{ position: 'absolute', top: '36px', right: '36px', zIndex: 10, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#475569', transition: 'all 0.2s' }}
                                                            title={isMenuListOpen ? "Kembali ke Daftar" : "Tutup Detail"}
                                                        >
                                                            <i className={`fa-solid ${isMenuListOpen ? "fa-arrow-left" : "fa-xmark"}`} style={{ fontSize: '16px' }}></i>
                                                        </button>
                                                        <div className="location-card">
                                                            <div
                                                                className={`card-image-wrapper ${sidebarPkm.thumbnail ? 'has-image' : ''}`}
                                                                style={sidebarPkm.thumbnail ? { backgroundImage: `url(${sidebarPkm.thumbnail})` } : {}}
                                                            >
                                                                {!sidebarPkm.thumbnail && <i className="fa-solid fa-image"></i>}
                                                            </div>

                                                            <div className="card-body">
                                                                <div className="card-header-flex">
                                                                    <h2 className="card-title">{sidebarPkm.nama}</h2>
                                                                    <span className="card-year">{sidebarPkm.tahun}</span>
                                                                </div>

                                                                <div className={`card-status ${getStatusBadge(sidebarPkm.status)}`}>
                                                                    <i className={`fa-solid ${getStatusIcon(sidebarPkm.status)}`}></i> {getStatusText(sidebarPkm.status)}
                                                                </div>

                                                                <p className="card-description">{sidebarPkm.deskripsi}</p>

                                                                <DocumentationGallery status={sidebarPkm.status} />
                                                                <TestimonialSidebarDisplay status={sidebarPkm.status} />

                                                                <div className="card-location">
                                                                    <i className="fa-solid fa-map-pin"></i> {sidebarPkm.desa}, Kec. {sidebarPkm.kecamatan},{' '}
                                                                    {sidebarPkm.kabupaten}, {sidebarPkm.provinsi}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </aside>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* 2. Data Visualization Charts Section */}
                    <div className={`landing-charts-column ${mobileActiveTab !== 'dashboard' ? 'mobile-hidden' : ''}`}>
                        <LandingCharts chartStats={chartStats} />
                    </div>
                </div>

                {/* 3. User Dashboard Section (logged in only) */}
                {user && (
                    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
                        <UserDashboardSection user={user} userPengajuan={userPengajuan} listJenisPkm={listJenisPkm} />
                    </div>
                )}

                {/* Mobile Bottom Sheet — Location Detail */}
                <BottomSheet
                    isOpen={mobileBottomSheet === 'detail'}
                    onClose={() => { closeMobileBottomSheet(); setSidebarPkm(null); }}
                    title={sidebarPkm?.nama}
                >
                    {sidebarPkm && (
                        <div className="mobile-detail-content">
                            <div className="mobile-detail-image" style={sidebarPkm.thumbnail ? { backgroundImage: `url(${sidebarPkm.thumbnail})` } : {}}>
                                {!sidebarPkm.thumbnail && <i className="fa-solid fa-image" style={{ fontSize: '2rem', color: '#cbd5e1' }}></i>}
                            </div>
                            <div className="mobile-detail-body">
                                <div className="mobile-detail-meta">
                                    <span className={`card-status ${getStatusBadge(sidebarPkm.status)}`}>
                                        <i className={`fa-solid ${getStatusIcon(sidebarPkm.status)}`}></i> {getStatusText(sidebarPkm.status)}
                                    </span>
                                    <span className="card-year">{sidebarPkm.tahun}</span>
                                </div>
                                <p className="mobile-detail-desc">{sidebarPkm.deskripsi}</p>

                                <DocumentationGallery status={sidebarPkm.status} />
                                <TestimonialSidebarDisplay status={sidebarPkm.status} />

                                <div className="mobile-detail-location">
                                    <i className="fa-solid fa-map-pin"></i>
                                    <span>{sidebarPkm.desa}, Kec. {sidebarPkm.kecamatan}, {sidebarPkm.kabupaten}, {sidebarPkm.provinsi}</span>
                                </div>
                                <div className="mobile-detail-actions">
                                    <button className="mobile-action-btn primary" onClick={() => window.open(`https://maps.google.com/?q=${sidebarPkm.lat},${sidebarPkm.lng}`)}>
                                        <i className="fa-solid fa-location-arrow"></i> Rute
                                    </button>
                                    <button className="mobile-action-btn secondary" onClick={() => sidebarPkm.laporan && window.open(sidebarPkm.laporan)} disabled={!sidebarPkm.laporan}>
                                        <i className="fa-solid fa-file-alt"></i> Laporan
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </BottomSheet>

                {/* Mobile Bottom Sheet — Daftar Kegiatan */}
                <BottomSheet
                    isOpen={mobileBottomSheet === 'kegiatan'}
                    onClose={closeMobileBottomSheet}
                    title="Daftar Kegiatan"
                >
                    <div className="mobile-kegiatan-list">
                        {pkmData.map((pkm: PkmData) => (
                            <div
                                key={pkm.id}
                                className="mobile-kegiatan-item"
                                onClick={() => {
                                    setSidebarPkm(pkm);
                                    setMobileBottomSheet('detail');
                                    setMobileActiveTab('peta');
                                }}
                            >
                                <div className="mobile-kegiatan-thumb" style={pkm.thumbnail ? { backgroundImage: `url(${pkm.thumbnail})` } : {}}>
                                    {!pkm.thumbnail && <i className="fa-solid fa-image" style={{ color: '#cbd5e1', fontSize: '20px' }}></i>}
                                </div>
                                <div className="mobile-kegiatan-info">
                                    <div className="mobile-kegiatan-name">{pkm.nama}</div>
                                    <div className="mobile-kegiatan-loc">
                                        <i className="fa-solid fa-location-dot"></i> {pkm.desa}, Kec. {pkm.kecamatan}
                                    </div>
                                    <div className="mobile-kegiatan-status">
                                        <span className={`status-dot ${pkm.status}`}></span>
                                        <span>{pkm.status === 'berlangsung' ? 'Berlangsung' : 'Selesai'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </BottomSheet>

                {/* Mobile Bottom Tab Bar */}
                <MobileTabBar activeTab={mobileActiveTab} onTabChange={handleMobileTabChange} />

                {/* Data Entry Modals from existing Map structure */}
                {isModalOpen && !isModalHiddenTemporarily && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>{formData.id ? 'Edit Data PKM' : 'Tambah Data PKM Baru'}</h2>
                                <button className="close-btn" onClick={handleCloseModal}>
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>

                            <form className="modal-body" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="nama">Nama Kegiatan PKM</label>
                                    <input
                                        type="text"
                                        id="nama"
                                        value={formData.nama}
                                        onChange={(event) => setFormData({ ...formData, nama: event.target.value })}
                                        placeholder="Masukkan nama kegiatan"
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="tahun">Tahun</label>
                                        <select
                                            id="tahun"
                                            value={formData.tahun}
                                            onChange={(event) => setFormData({ ...formData, tahun: parseInt(event.target.value, 10) })}
                                            required
                                        >
                                            <option value="2024">2024</option>
                                            <option value="2025">2025</option>
                                            <option value="2026">2026</option>
                                            <option value="2027">2027</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="status">Status</label>
                                        <select
                                            id="status"
                                            value={formData.status}
                                            onChange={(event) => setFormData({ ...formData, status: event.target.value })}
                                            required
                                        >
                                            <option value="berlangsung">Berlangsung</option>
                                            <option value="selesai">Selesai</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="deskripsi">Deskripsi</label>
                                    <textarea
                                        id="deskripsi"
                                        value={formData.deskripsi}
                                        onChange={(event) => setFormData({ ...formData, deskripsi: event.target.value })}
                                        placeholder="Deskripsi kegiatan..."
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Thumbnail Gambar</label>
                                    <input type="file" accept="image/*" onChange={handleImageChange} />
                                </div>

                                {formData.thumbnail && (
                                    <img src={formData.thumbnail} alt="Thumbnail Preview" className="thumbnail-preview" />
                                )}

                                <div className="form-section-title">
                                    Lokasi <span className="hint-text">(Klik tombol di bawah untuk memilih dari peta)</span>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="provinsi">Provinsi</label>
                                        <input
                                            type="text"
                                            id="provinsi"
                                            value={formData.provinsi}
                                            onChange={(event) => setFormData({ ...formData, provinsi: event.target.value })}
                                            placeholder="Contoh: Sulawesi Selatan"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="kabupaten">Kabupaten/Kota</label>
                                        <input
                                            type="text"
                                            id="kabupaten"
                                            value={formData.kabupaten}
                                            onChange={(event) => setFormData({ ...formData, kabupaten: event.target.value })}
                                            placeholder="Contoh: Makassar"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="kecamatan">Kecamatan</label>
                                        <input
                                            type="text"
                                            id="kecamatan"
                                            value={formData.kecamatan}
                                            onChange={(event) => setFormData({ ...formData, kecamatan: event.target.value })}
                                            placeholder="Contoh: Tamalanrea"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="desa">Desa/Kelurahan</label>
                                        <input
                                            type="text"
                                            id="desa"
                                            value={formData.desa}
                                            onChange={(event) => setFormData({ ...formData, desa: event.target.value })}
                                            placeholder="Contoh: Bira"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="lat">Latitude</label>
                                        <input
                                            type="text"
                                            id="lat"
                                            value={formData.lat}
                                            onChange={(event) => setFormData({ ...formData, lat: event.target.value })}
                                            placeholder="-5.13500"
                                            readOnly
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="lng">Longitude</label>
                                        <input
                                            type="text"
                                            id="lng"
                                            value={formData.lng}
                                            onChange={(event) => setFormData({ ...formData, lng: event.target.value })}
                                            placeholder="119.49500"
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <button type="button" className="btn-pick-map" onClick={handlePickLocation}>
                                    <i className="fa-solid fa-map-pin"></i> Pilih Lokasi dari Peta
                                </button>

                                <div className="form-section-title">Informasi Tambahan</div>

                                <div className="form-group">
                                    <label htmlFor="laporan">Link Laporan (Opsional)</label>
                                    <input
                                        type="url"
                                        id="laporan"
                                        value={formData.laporan}
                                        onChange={(event) => setFormData({ ...formData, laporan: event.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="dokumentasi">Link Dokumentasi (Opsional)</label>
                                    <input
                                        type="url"
                                        id="dokumentasi"
                                        value={formData.dokumentasi}
                                        onChange={(event) => setFormData({ ...formData, dokumentasi: event.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            </form>

                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                                    Batal
                                </button>
                                <button type="button" className="btn-primary" onClick={handleSubmit}>
                                    <i className="fa-solid fa-save"></i> Simpan Data
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {isPickingLocation && (
                    <div className="picking-toast">
                        <i className="fa-solid fa-hand-pointer"></i> Klik lokasi pada peta... (Tekan <b>ESC</b> untuk batal)
                    </div>
                )}

                {isSuccessModalOpen && (
                    <div className="modal-overlay" style={{ zIndex: 3000 }}>
                        <div className="success-content">
                            <div className="success-icon-container">
                                <i className="fa-solid fa-check success-check"></i>
                            </div>
                            <h2 style={{ fontSize: '1.625rem', fontWeight: 700, margin: '0 0 12px 0' }}>Berhasil!</h2>
                            <p style={{ color: '#64748b', marginBottom: '32px' }}>Data PKM berhasil disimpan ke peta.</p>
                            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setIsSuccessModalOpen(false)}>
                                Tutup
                            </button>
                        </div>
                    </div>
                )}

                {/* Submit Link Dokumentasi & Laporan Modal */}
                {isLinkModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Submit Link Dokumentasi & Laporan</h2>
                                <button className="close-btn" onClick={() => { setIsLinkModalOpen(false); setLinkFormSubmitted(false); setLinkFormData({ pkmId: '', linkDokumentasi: '', linkLaporan: '' }); }}>
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>

                            {linkFormSubmitted ? (
                                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                                    <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                        <i className="fa-solid fa-check" style={{ color: '#16a34a', fontSize: '32px' }}></i>
                                    </div>
                                    <h3 style={{ fontWeight: '700', fontSize: '20px', color: '#0f172a', marginBottom: '8px' }}>Link Berhasil Dikirim!</h3>
                                    <p style={{ fontSize: '14px', color: '#64748b' }}>Data kegiatan telah diperbarui.</p>
                                </div>
                            ) : (
                                <form className="modal-body" onSubmit={handleLinkFormSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="linkPkmId">Pilih Kegiatan</label>
                                        <select
                                            id="linkPkmId"
                                            value={linkFormData.pkmId}
                                            onChange={(e) => handleLinkFormChange('pkmId', e.target.value)}
                                            required
                                        >
                                            <option value="">-- Pilih Kegiatan --</option>
                                            {pkmData.map((pkm, index) => (
                                                <option key={pkm.id ?? index} value={pkm.id ?? ''}>{pkm.nama}</option>
                                            ))}

                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="linkDokumentasi">Link Dokumentasi</label>
                                        <input
                                            type="url"
                                            id="linkDokumentasi"
                                            value={linkFormData.linkDokumentasi}
                                            onChange={(e) => handleLinkFormChange('linkDokumentasi', e.target.value)}
                                            placeholder="https://drive.google.com/..."
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="linkLaporan">Link Laporan</label>
                                        <input
                                            type="url"
                                            id="linkLaporan"
                                            value={linkFormData.linkLaporan}
                                            onChange={(e) => handleLinkFormChange('linkLaporan', e.target.value)}
                                            placeholder="https://drive.google.com/..."
                                        />
                                    </div>
                                </form>
                            )}

                            {!linkFormSubmitted && (
                                <div className="modal-footer">
                                    <button type="button" className="btn-secondary" onClick={() => { setIsLinkModalOpen(false); setLinkFormData({ pkmId: '', linkDokumentasi: '', linkLaporan: '' }); }}>
                                        Batal
                                    </button>
                                    <button type="button" className="btn-primary" onClick={handleLinkFormSubmit}>
                                        <i className="fa-solid fa-paper-plane"></i> Kirim Link
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}

// =====================================================
// User Dashboard Section (Form + Status Table)
// =====================================================

const statusConfig: Record<string, { label: string; cls: string; dot: string }> = {
    diproses: { label: 'Diproses', cls: 'bg-blue-50 text-blue-700', dot: 'bg-blue-400' },
    direvisi: { label: 'Perlu Revisi', cls: 'bg-amber-50 text-amber-700', dot: 'bg-amber-400' },
    diterima: { label: 'Diterima', cls: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-400' },
    ditolak: { label: 'Ditolak', cls: 'bg-red-50 text-red-700', dot: 'bg-red-400' },
    selesai: { label: 'Selesai', cls: 'bg-indigo-50 text-indigo-700', dot: 'bg-indigo-400' },
};

function UserDashboardSection({ user, userPengajuan, listJenisPkm }: {
    user: any;
    userPengajuan: UserPengajuan[];
    listJenisPkm: any[];
}) {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        id_jenis_pkm: '', provinsi: '', kota_kabupaten: '', kecamatan: '', kelurahan_desa: '', alamat_lengkap: '',
        judul_kegiatan: '', kebutuhan: '', instansi_mitra: '', sumber_dana: '', total_anggaran: '',
        tgl_mulai: '', tgl_selesai: '', proposal: '', surat_permohonan: '', rab: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/pengajuan', form, {
            onError: (err) => setErrors(err),
            onSuccess: () => {
                setShowForm(false);
                setForm({ id_jenis_pkm: '', provinsi: '', kota_kabupaten: '', kecamatan: '', kelurahan_desa: '', alamat_lengkap: '', judul_kegiatan: '', kebutuhan: '', instansi_mitra: '', sumber_dana: '', total_anggaran: '', tgl_mulai: '', tgl_selesai: '', proposal: '', surat_permohonan: '', rab: '' });
            },
        });
    };

    const inputCls = (hasError: boolean) =>
        `w-full rounded-lg border ${hasError ? 'border-red-400 bg-red-50/50' : 'border-zinc-200'} px-4 py-2.5 text-[13px] text-zinc-900 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all bg-white`;

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Dashboard Saya</h2>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0' }}>
                        Selamat datang, <strong>{user.name}</strong> ({user.role})
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
                            backgroundColor: showForm ? '#f1f5f9' : '#0f172a', color: showForm ? '#0f172a' : 'white',
                            border: showForm ? '1px solid #e2e8f0' : 'none', borderRadius: '10px',
                            fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
                        }}
                    >
                        <i className={`fa-solid ${showForm ? 'fa-xmark' : 'fa-plus'}`}></i>
                        {showForm ? 'Tutup Form' : 'Buat Pengajuan'}
                    </button>
                    <Link href="/logout" method="post" as="button"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: 'white', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                        <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
                    </Link>
                </div>
            </div>

            {/* Pengajuan Form (collapsible) */}
            {showForm && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>Form Pengajuan PKM</h3>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 24px' }}>Isi formulir dengan lengkap. Link dokumen (Google Drive, dll).</p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Judul Kegiatan *</label>
                            <input value={form.judul_kegiatan} onChange={e => setForm({ ...form, judul_kegiatan: e.target.value })} required placeholder="Judul kegiatan PKM..." className={inputCls(!!errors.judul_kegiatan)} />
                            {errors.judul_kegiatan && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.judul_kegiatan}</p>}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Jenis PKM *</label>
                                <select value={form.id_jenis_pkm} onChange={e => setForm({ ...form, id_jenis_pkm: e.target.value })} required className={inputCls(!!errors.id_jenis_pkm)}>
                                    <option value="">-- Pilih Jenis --</option>
                                    {listJenisPkm.map(j => <option key={j.id_jenis_pkm} value={j.id_jenis_pkm}>{j.nama_jenis}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Provinsi *</label>
                                <input value={form.provinsi} onChange={e => setForm({ ...form, provinsi: e.target.value })} required placeholder="Contoh: Sulawesi Selatan" className={inputCls(!!errors.provinsi)} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Kota / Kabupaten *</label>
                                <input value={form.kota_kabupaten} onChange={e => setForm({ ...form, kota_kabupaten: e.target.value })} required placeholder="Contoh: Makassar" className={inputCls(!!errors.kota_kabupaten)} />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Kecamatan</label>
                                <input value={form.kecamatan} onChange={e => setForm({ ...form, kecamatan: e.target.value })} placeholder="Contoh: Tamalanrea" className={inputCls(false)} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Kelurahan / Desa</label>
                                <input value={form.kelurahan_desa} onChange={e => setForm({ ...form, kelurahan_desa: e.target.value })} placeholder="Contoh: Bira" className={inputCls(false)} />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Alamat Lengkap *</label>
                                <input value={form.alamat_lengkap} onChange={e => setForm({ ...form, alamat_lengkap: e.target.value })} required placeholder="Nama jalan, nomor, RT/RW, patokan..." className={inputCls(!!errors.alamat_lengkap)} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Instansi Mitra</label>
                                <input value={form.instansi_mitra} onChange={e => setForm({ ...form, instansi_mitra: e.target.value })} placeholder="Nama instansi mitra" className={inputCls(false)} />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Sumber Dana</label>
                                <input value={form.sumber_dana} onChange={e => setForm({ ...form, sumber_dana: e.target.value })} placeholder="Sumber dana" className={inputCls(false)} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Total Anggaran (Rp)</label>
                                <input type="number" value={form.total_anggaran} onChange={e => setForm({ ...form, total_anggaran: e.target.value })} placeholder="0" className={inputCls(false)} />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Tgl Mulai</label>
                                <input type="date" value={form.tgl_mulai} onChange={e => setForm({ ...form, tgl_mulai: e.target.value })} className={inputCls(false)} />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Tgl Selesai</label>
                                <input type="date" value={form.tgl_selesai} onChange={e => setForm({ ...form, tgl_selesai: e.target.value })} min={form.tgl_mulai} className={inputCls(false)} />
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Deskripsi Kebutuhan</label>
                            <textarea value={form.kebutuhan} onChange={e => setForm({ ...form, kebutuhan: e.target.value })} rows={3} placeholder="Jelaskan latar belakang dan tujuan..." style={{ resize: 'none' }} className={inputCls(false)} />
                        </div>

                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '8px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: '0 0 12px' }}>Link Dokumen</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Proposal PKM *</label>
                                    <input type="url" value={form.proposal} onChange={e => setForm({ ...form, proposal: e.target.value })} required placeholder="https://drive.google.com/file/d/..." className={inputCls(!!errors.proposal)} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Surat Permohonan *</label>
                                    <input type="url" value={form.surat_permohonan} onChange={e => setForm({ ...form, surat_permohonan: e.target.value })} required placeholder="https://drive.google.com/file/d/..." className={inputCls(!!errors.surat_permohonan)} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>RAB (opsional)</label>
                                    <input type="url" value={form.rab} onChange={e => setForm({ ...form, rab: e.target.value })} placeholder="https://drive.google.com/file/d/..." className={inputCls(false)} />
                                </div>
                            </div>
                        </div>

                        <button type="submit" style={{ padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginTop: '8px' }}>
                            <i className="fa-solid fa-paper-plane" style={{ marginRight: '8px' }}></i> Kirim Pengajuan
                        </button>
                    </form>
                </div>
            )}

            {/* Status Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Riwayat Pengajuan</h3>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{userPengajuan.length} pengajuan</span>
                </div>
                {userPengajuan.length === 0 ? (
                    <div style={{ padding: '48px 24px', textAlign: 'center', color: '#94a3b8' }}>
                        <i className="fa-regular fa-file-lines" style={{ fontSize: '40px', color: '#cbd5e1', display: 'block', marginBottom: '12px' }}></i>
                        <p style={{ fontWeight: '600' }}>Belum ada pengajuan.</p>
                        <button onClick={() => setShowForm(true)} style={{ color: '#2563eb', fontWeight: '700', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', marginTop: '8px' }}>
                            Buat pengajuan pertama &rarr;
                        </button>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8fafc' }}>
                                    <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Judul</th>
                                    <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Jenis / Lokasi</th>
                                    <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tanggal</th>
                                    <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userPengajuan.map((p) => {
                                    const st = statusConfig[p.status_pengajuan] || statusConfig.diproses;
                                    return (
                                        <tr key={p.id_pengajuan} style={{ borderTop: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>{p.judul_kegiatan}</div>
                                            </td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{p.jenis_pkm?.nama_jenis || '-'}</div>
                                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{p.kota_kabupaten ? `${p.kota_kabupaten}, ${p.provinsi}` : '-'}</div>
                                            </td>
                                            <td style={{ padding: '16px 20px', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
                                                {new Date(p.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '6px',
                                                    fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em',
                                                    backgroundColor: st.cls.includes('blue') ? '#eff6ff' : st.cls.includes('amber') ? '#fffbeb' : st.cls.includes('emerald') ? '#ecfdf5' : st.cls.includes('red') ? '#fef2f2' : '#eef2ff',
                                                    color: st.cls.includes('blue') ? '#1d4ed8' : st.cls.includes('amber') ? '#b45309' : st.cls.includes('emerald') ? '#047857' : st.cls.includes('red') ? '#dc2626' : '#4338ca',
                                                }}>
                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: st.dot.includes('blue') ? '#60a5fa' : st.dot.includes('amber') ? '#fbbf24' : st.dot.includes('emerald') ? '#34d399' : st.dot.includes('red') ? '#f87171' : '#818cf8' }}></span>
                                                    {st.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
