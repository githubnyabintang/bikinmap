import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search } from 'lucide-react';

// Fix for default marker icon in leaflet under Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapLocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number, address?: any) => void;
  className?: string;
}

const DEFAULT_CENTER: [number, number] = [-5.1866, 119.4311]; // Default to Makassar
const DEFAULT_ZOOM = 13;

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) {
  const markerRef = useRef<L.Marker>(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  const eventHandlers = React.useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setPosition(marker.getLatLng());
        }
      },
    }),
    [setPosition],
  );

  return position === null ? null : (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    ></Marker>
  );
}

function MapUpdater({ center }: { center: L.LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 1.5, easeLinearity: 0.25 });
  }, [center, map]);
  return null;
}

export default function MapLocationPicker({ latitude, longitude, onChange, className = "h-64 w-full rounded-xl overflow-hidden shadow-inner border border-slate-200" }: MapLocationPickerProps) {
    const [position, setPosition] = useState<L.LatLng | null>(
        latitude && longitude ? new L.LatLng(latitude, longitude) : null
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [center, setCenter] = useState<L.LatLng>(
        latitude && longitude ? new L.LatLng(latitude, longitude) : new L.LatLng(DEFAULT_CENTER[0], DEFAULT_CENTER[1])
    );
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        if (position) {
            onChange(position.lat, position.lng);
        }
    }, [position]);

    useEffect(() => {
        if (!searchQuery.trim() || searchQuery.length < 3) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const timeout = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1&countrycodes=id`);
                const data = await res.json();
                setSearchResults(data || []);
                setShowResults(true);
            } catch (error) {
                console.error(error);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchQuery]);

    const handleSelectLocation = (loc: any) => {
        const lat = parseFloat(loc.lat);
        const lon = parseFloat(loc.lon);
        const newPos = new L.LatLng(lat, lon);
        setCenter(newPos);
        setPosition(newPos);
        
        // Hide UI and preserve input text smoothly
        setShowResults(false);
        setSearchQuery(loc.display_name.split(',')[0]);
        onChange(lat, lon, loc.address);
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="relative z-50">
                <div className="flex bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-poltekpar-primary/20 focus-within:border-poltekpar-primary transition-all">
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onBlur={() => setTimeout(() => setShowResults(false), 200)}
                        onFocus={() => { if (searchResults.length > 0) setShowResults(true); }}
                        placeholder="Ketik nama lokasi untuk mencari rekomendasi tempat..." 
                        className="px-4 py-2.5 w-full text-sm border-none focus:ring-0 outline-none"
                    />
                    <div className="px-4 bg-zinc-50 flex items-center justify-center border-l border-slate-200 text-zinc-400">
                        {isSearching ? <div className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-poltekpar-primary animate-spin"></div> : <Search size={16} />}
                    </div>
                </div>

                {showResults && searchResults.length > 0 && (
                    <ul className="absolute top-full left-0 w-full bg-white border border-slate-200 shadow-xl rounded-lg mt-1.5 max-h-60 overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
                        {searchResults.map((loc, i) => (
                            <li key={i}>
                                <button type="button" onMouseDown={() => handleSelectLocation(loc)} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors">
                                    <p className="text-[13px] font-bold text-slate-800 line-clamp-1">{loc.display_name.split(',')[0]}</p>
                                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{loc.display_name}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className={`relative ${className}`}>
                <MapContainer center={center} zoom={DEFAULT_ZOOM} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 10 }}>
                    <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapUpdater center={center} />
                    <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
            </div>
        </div>
    );
}
