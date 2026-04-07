import L from 'leaflet';

export interface PkmTypeMeta {
    key: string;
    label: string;
    color: string;
}

export interface PkmStatusMeta {
    key: string;
    label: string;
    markerIcon: string;
}

export const PKM_STATUS_META: Record<string, PkmStatusMeta> = {
    selesai: {
        key: 'selesai',
        label: 'PKM Selesai',
        markerIcon: 'fa-check-double',
    },
    berlangsung: {
        key: 'berlangsung',
        label: 'PKM Berlangsung',
        markerIcon: 'fa-hourglass-half',
    },
    ada_pengajuan: {
        key: 'ada_pengajuan',
        label: 'Tahap Pengajuan',
        markerIcon: 'fa-file-import',
    },
    belum_mulai: {
        key: 'belum_mulai',
        label: 'Belum Mulai',
        markerIcon: 'fa-clock',
    },
    diproses: {
        key: 'diproses',
        label: 'Dalam Proses',
        markerIcon: 'fa-spinner',
    },
    direvisi: {
        key: 'direvisi',
        label: 'Perlu Revisi',
        markerIcon: 'fa-pen-to-square',
    },
};

// Palette warna curated — dipakai jika warna_icon dari DB tidak ada atau semua sama
export const COLOR_PALETTE = [
    '#15325F', // poltekpar-primary (navy biru)
    '#DCAF67', // poltekpar-gold
    '#2563eb', // biru terang
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // merah
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
];

/**
 * Mengekstrak jenis PKM secara dinamis dari seluruh pkmData yang ada.
 * Memastikan semua chart, marker map, dan legend menggunakan warna yang sama (palette fallback jika perlu).
 */
export const extractDynamicPkmTypes = (pkmData: any[]): PkmTypeMeta[] => {
    if (!Array.isArray(pkmData) || pkmData.length === 0) return [];

    const jenisMap = new Map<string, { rawLabel: string, color: string }>();
    pkmData.forEach((item) => {
        const rawJenis = item?.jenis_pkm;
        const rawLabel = (typeof rawJenis === 'string' ? rawJenis : (rawJenis?.nama_jenis || String(rawJenis ?? ''))) .trim() || 'Lainnya';
        
        if (!jenisMap.has(rawLabel)) {
            const rawColor = (item as any)?.warna_icon || (typeof rawJenis === 'object' ? rawJenis?.warna : null);
            const hasValidColor = rawColor && typeof rawColor === 'string' && (rawColor.startsWith('#') || rawColor.startsWith('rgb'));
            jenisMap.set(rawLabel, { rawLabel, color: hasValidColor ? rawColor : '' });
        }
    });

    const allColors = [...jenisMap.values()].map((j) => j.color).filter(Boolean);
    const uniqueColors = new Set(allColors);
    const colorsAreUseful = uniqueColors.size > 1 || (uniqueColors.size === 1 && jenisMap.size === 1);

    let colorIndex = 0;
    return Array.from(jenisMap.values()).map((jenis) => {
        const labelStr = jenis.rawLabel;
        // User request 3: "penamaan PKM harus diawali dengan pkm di jenis pkm"
        const displayLabel = labelStr.toLowerCase().startsWith('pkm') ? labelStr : `PKM ${labelStr}`;

        return {
            key: labelStr,
            label: displayLabel,
            color: colorsAreUseful && jenis.color
                ? jenis.color
                : COLOR_PALETTE[colorIndex++ % COLOR_PALETTE.length],
        };
    });
};

export const getPkmStatusMeta = (status: any): PkmStatusMeta => {
    const statusKey = String(status ?? 'berlangsung').toLowerCase();
    return PKM_STATUS_META[statusKey] ?? PKM_STATUS_META.berlangsung;
};

// Menggunakan tipe meta statis bila hanya 1 elemen (fallback), tapi lebih baik kirim color statis override dari caller
export const createPkmMarkerIcon = (status: string, color: string, isReview: boolean = false) => {
    const statusMeta = getPkmStatusMeta(status);
    const isNew = status === 'ada_pengajuan' || status === 'diproses' || status === 'direvisi';
    const shouldJump = isNew && !isReview;

    return L.divIcon({
        className: `custom-leaflet-marker${shouldJump ? ' pkm-marker--new' : ''}`,
        html: `
            <div class="pkm-map-marker-wrap" style="--pkm-marker-color: ${color}">
                <div class="pkm-map-marker${shouldJump ? ' pkm-map-marker--large' : ''}">
                    <span class="pkm-map-marker__inner">
                        <i class="fa-solid ${statusMeta.markerIcon}"></i>
                    </span>
                </div>
            </div>
        `,
        iconSize: shouldJump ? [38, 52] : [30, 40],
        iconAnchor: shouldJump ? [19, 44] : [15, 34],
        popupAnchor: [0, -32],
    });
};

export const PKM_LEGEND_STATUSES = Object.values(PKM_STATUS_META);
