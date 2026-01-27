import { useState } from 'react';
import { Sun, Cloud, CloudRain, Snowflake, CloudLightning, Wind } from 'lucide-react';
import { WidgetWrapper } from '../Common';

const STICKERS = [
    { id: 'sun', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
    { id: 'cloud', icon: Cloud, color: 'text-blue-400', bg: 'bg-blue-50', border: 'border-blue-200' },
    { id: 'rain', icon: CloudRain, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    { id: 'snow', icon: Snowflake, color: 'text-sky-300', bg: 'bg-sky-50', border: 'border-sky-200' },
    { id: 'storm', icon: CloudLightning, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
    { id: 'wind', icon: Wind, color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200' },
];

interface WeatherStickersProps {
    gridSize?: { w: number; h: number };
}

export function WeatherStickers({ gridSize }: WeatherStickersProps) {
    const [selectedId, setSelectedId] = useState('sun');

    const w = gridSize?.w || 2;
    const h = gridSize?.h || 2;
    const isSmall = w === 1 && h === 1;

    const currentSticker = STICKERS.find((s) => s.id === selectedId) || STICKERS[0];

    // --- Small View: Display Only ---
    if (isSmall) {
        return (
            <WidgetWrapper className="bg-transparent border-none shadow-none p-0 flex items-center justify-center">
                <div
                    className={`w-full h-full max-w-[90%] max-h-[90%] flex items-center justify-center rounded-2xl border-4 ${currentSticker.bg} ${currentSticker.border} shadow-lg transition-transform active:scale-95 cursor-pointer`}
                    onClick={() => {
                        // Cycle through stickers on click in small mode
                        const idx = STICKERS.findIndex(s => s.id === selectedId);
                        const next = STICKERS[(idx + 1) % STICKERS.length];
                        setSelectedId(next.id);
                    }}
                >
                    <currentSticker.icon size={48} className={`${currentSticker.color} drop-shadow-sm`} strokeWidth={2.5} />
                    {/* Glossy shine effect */}
                    <div className="absolute top-2 right-2 w-4 h-4 bg-white/40 rounded-full blur-[1px]"></div>
                </div>
            </WidgetWrapper>
        );
    }

    // --- Large View: Sticker Pack Selection ---
    return (
        <WidgetWrapper className="bg-[#fcfbf9] dark:bg-slate-800 border-stone-200 dark:border-slate-700 relative overflow-hidden">
            {/* Texture overlay */}
            <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none"></div>

            <div className="relative z-10 h-full flex flex-col p-2">
                <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Weather Pack</span>
                    <span className="text-[9px] text-stone-300">vol.1</span>
                </div>

                <div className="flex-1 grid grid-cols-3 gap-2">
                    {STICKERS.map((sticker) => {
                        const isSelected = sticker.id === selectedId;
                        return (
                            <button
                                key={sticker.id}
                                onClick={() => setSelectedId(sticker.id)}
                                className={`
                                    relative flex items-center justify-center rounded-xl border-2 transition-all p-2
                                    ${sticker.bg} ${sticker.border}
                                    ${isSelected ? 'ring-2 ring-offset-1 ring-black/20 dark:ring-white/20 scale-100 opacity-100 shadow-md rotate-[-2deg]' : 'opacity-60 scale-95 hover:scale-100 hover:opacity-100'}
                                `}
                            >
                                <sticker.icon size={20} className={sticker.color} strokeWidth={2.5} />
                                {isSelected && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full border border-white text-[8px] flex items-center justify-center text-white">✓</div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </WidgetWrapper>
    );
}
