import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { PKM_LEGEND_STATUSES, PkmTypeMeta } from '@/data/pkmMapVisuals';

function TypeItemWithTooltip({ 
    type, 
    selectedTypes, 
    onToggleType 
}: { 
    type: PkmTypeMeta; 
    selectedTypes?: string[]; 
    onToggleType?: (typeKey: string) => void;
}) {
    const [showModal, setShowModal] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    
    return (
        <>
            <div
                onClick={() => onToggleType?.(type.key)}
                className={`flex items-center transition-colors group relative ${onToggleType ? 'cursor-pointer hover:bg-slate-50 p-1.5 -ml-1.5 rounded-lg' : ''}`}
            >
                {onToggleType && (
                    <div className={`flex items-center justify-center overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${selectedTypes?.includes(type.key) ? 'w-4 h-4 mr-2.5 opacity-100 scale-100 bg-poltekpar-primary border border-poltekpar-primary rounded shrink-0' : 'w-0 h-4 mr-0 opacity-0 scale-50 border-none'
                        }`}>
                        <i className="fa-solid fa-check text-[10px] text-white"></i>
                    </div>
                )}
                <span
                    className="w-4 h-4 mr-2.5 rounded-full shadow-sm shrink-0"
                    style={{ backgroundColor: type.color }}
                ></span>
                <span className="text-sm text-slate-600 font-medium leading-none">{type.label}</span>
                {type.deskripsi && (
                    <div className="relative ml-1">
                        <button
                            ref={buttonRef}
                            type="button"
                            className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 hover:bg-poltekpar-primary hover:text-white flex items-center justify-center text-[10px] transition-colors"
                            title="Lihat deskripsi"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowModal(true);
                            }}
                        >
                            <i className="fa-solid fa-question"></i>
                        </button>
                    </div>
                )}
            </div>
            
            {showModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
                        onClick={() => setShowModal(false)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <span 
                                    className="w-4 h-4 rounded-full shadow-sm"
                                    style={{ backgroundColor: type.color }}
                                ></span>
                                <h3 className="text-lg font-bold text-slate-900">{type.label}</h3>
                            </div>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 flex items-center justify-center transition-colors"
                            >
                                <i className="fa-solid fa-xmark text-sm"></i>
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto max-h-[60vh]">
                            <p className="text-sm text-slate-600 leading-relaxed">{type.deskripsi}</p>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

interface MapLegendProps {
    compact?: boolean;
    className?: string;
    typesMeta: PkmTypeMeta[]; // required dynamic types
    selectedTypes?: string[];
    onToggleType?: (typeKey: string) => void;
    selectedStatuses?: string[];
    onToggleStatus?: (statusKey: string) => void;
}

export default function MapLegend({
    compact = false,
    className = '',
    typesMeta,
    selectedTypes,
    onToggleType,
    selectedStatuses,
    onToggleStatus
}: MapLegendProps) {
    return (
        <div
            className={`bg-white rounded-xl shadow-soft border border-slate-100 p-4 flex flex-col ${compact ? 'p-3' : ''} ${className}`}
            style={{ maxHeight: 'max(40vh, 300px)' }}
            aria-label="Legenda visual peta PKM"
        >
            {/* Header - Fixed */}
            <div className="mb-4 pb-3 border-b border-slate-100 shrink-0">
                <span className="text-xs font-bold text-poltekpar-gray uppercase tracking-wider">Legenda</span>
                <strong className="block text-lg font-bold text-slate-900 mt-0.5">Visual Dashboard</strong>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto custom-scrollbar pr-2 flex-1 space-y-6">
                {/* PKM Types Section */}
                <div>
                    <span className="text-sm font-semibold text-slate-700 block mb-2.5 flex justify-between items-center sticky top-0 bg-white z-10 py-1">
                        Jenis PKM
                    </span>
                    <div className="space-y-1.5">
                        {typesMeta.map((type) => (
                            <TypeItemWithTooltip 
                                key={type.key} 
                                type={type} 
                                selectedTypes={selectedTypes}
                                onToggleType={onToggleType}
                            />
                        ))}
                    </div>
                </div>

                {/* PKM Status Section */}
                <div>
                    <span className="text-sm font-semibold text-slate-700 block mb-2.5 flex justify-between items-center">
                        Status PKM
                    </span>
                    <div className="space-y-1.5">
                        {PKM_LEGEND_STATUSES.map((status) => (
                            <div
                                key={status.key}
                                onClick={() => onToggleStatus?.(status.key)}
                                className={`flex items-center transition-colors ${onToggleStatus ? 'cursor-pointer hover:bg-slate-50 p-1.5 -ml-1.5 rounded-lg' : ''}`}
                            >
                                {onToggleStatus && (
                                    <div className={`flex items-center justify-center overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${selectedStatuses?.includes(status.key) ? 'w-4 h-4 mr-2.5 opacity-100 scale-100 bg-poltekpar-primary border border-poltekpar-primary rounded shrink-0' : 'w-0 h-4 mr-0 opacity-0 scale-50 border-none'
                                        }`}>
                                        <i className="fa-solid fa-check text-[10px] text-white"></i>
                                    </div>
                                )}
                                <span className={`mr-2.5 flex items-center justify-center w-6 h-6 rounded-full shrink-0 ${status.key === 'berlangsung' ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                                    <i className={`fa-solid ${status.markerIcon} text-sm ${status.key === 'berlangsung' ? 'text-amber-600' : 'text-emerald-600'}`}></i>
                                </span>
                                <span className="text-sm text-slate-600 font-medium leading-none">{status.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
