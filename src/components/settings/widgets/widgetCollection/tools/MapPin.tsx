import React from 'react';
import { MapPin as MapPinIcon, Search } from 'lucide-react';
import { useWidgetStorage } from '../SDK';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export function MapPin() {
    // SDK Storage
    const [query, setQuery] = useWidgetStorage('widget-mappin-query', 'Seoul');
    const [memo, setMemo] = useWidgetStorage('widget-mappin-memo', '');

    // SRC can be derived or persisted. Let's persist to avoid re-embed if not needed, 
    // or just re-generate on mount if query exists. 
    // Actually, let's persist src to ensure exact view is kept if possible, 
    // but the original code sets src on submit.
    const [src, setSrc] = useWidgetStorage('widget-mappin-src', '');

    const searchMap = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Simple Embed API: https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=...
        // For development without specific billing-enabled key, iframe might show watermark or error.
        // But this is the standard way.

        let mapKey = GOOGLE_MAPS_API_KEY;
        if (!mapKey || mapKey === 'YOUR_KEY_HERE') {
            // Fallback for demo if no key: use a generic openstreet map or just alert?
            // Actually, for user experience, let's just use Google maps simple search URL in iframe?
            // Google Maps Embed requires API Key. 
            // Alternative: OpenStreetMap default?
            // Let's stick to Google as requested, but warn if no key.
            console.warn("No Google Maps API Key found");
        }

        const encodedQuery = encodeURIComponent(query);
        // Using Embed API
        setSrc(`https://www.google.com/maps/embed/v1/place?key=${mapKey}&q=${encodedQuery}`);
    };

    // Unified UI for all sizes

    return (
        <div className="h-full flex flex-col theme-bg-card rounded-xl shadow-sm border theme-border overflow-hidden">
            {/* Toolbar */}
            <div className="p-2 border-b theme-border flex gap-2">
                <form onSubmit={searchMap} className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <MapPinIcon size={14} className="absolute left-2 top-1/2 -translate-y-1/2 theme-text-secondary" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full text-xs pl-8 pr-2 py-1.5 rounded theme-bg-input border theme-border outline-none focus:border-[var(--btn-bg)]"
                            placeholder="Place name..."
                        />
                    </div>
                    <button type="submit" className="p-1.5 rounded bg-[var(--btn-bg)] text-white hover:opacity-90">
                        <Search size={14} />
                    </button>
                </form>
            </div>

            {/* Map Area */}
            <div className="flex-1 bg-gray-100 relative">
                {src && GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'YOUR_KEY_HERE' ? (
                    <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        src={src}
                    ></iframe>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                        <MapPinIcon size={32} className="mb-2 opacity-50" />
                        <span className="text-xs">
                            {!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_KEY_HERE'
                                ? "API Key Needed in .env"
                                : "Search to show map"}
                        </span>
                    </div>
                )}
            </div>

            {/* Footer / Memo */}
            <div className="p-2 border-t theme-border bg-[var(--bg-card-secondary)]">
                <input
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="Add a note..."
                    className="w-full bg-transparent text-xs theme-text-secondary outline-none placeholder:text-gray-400"
                />
            </div>
        </div>
    );
}
