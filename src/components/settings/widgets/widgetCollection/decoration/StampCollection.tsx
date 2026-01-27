import { useState } from 'react';
import { Plane, Stamp as StampIcon, MapPin } from 'lucide-react';
import { WidgetWrapper } from '../Common';

const STAMPS = [
    { id: 1, location: 'SEOUL', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
    { id: 2, location: 'TOKYO', color: 'text-pink-500', bg: 'bg-pink-50', border: 'border-pink-200' },
    { id: 3, location: 'PARIS', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
    { id: 4, location: 'NY', color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    { id: 5, location: 'LONDON', color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    { id: 6, location: 'SPACE', color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
];

interface StampCollectionProps {
    gridSize?: { w: number; h: number };
}

export function StampCollection({ gridSize }: StampCollectionProps) {
    const [collected, setCollected] = useState<number[]>(() => {
        const saved = localStorage.getItem('collected_stamps');
        return saved ? JSON.parse(saved) : [1];
    });

    const w = gridSize?.w || 2;
    const h = gridSize?.h || 2;
    const isSmall = w === 1 && h === 1;

    const toggleStamp = (id: number) => {
        let newCollected;
        if (collected.includes(id)) {
            newCollected = collected.filter(i => i !== id);
        } else {
            newCollected = [...collected, id];
        }
        setCollected(newCollected);
        localStorage.setItem('collected_stamps', JSON.stringify(newCollected));
    };

    if (isSmall) {
        // Show count
        return (
            <WidgetWrapper className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 flex flex-col items-center justify-center p-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1 opacity-20">
                    <Plane size={32} />
                </div>
                <div className="font-serif font-bold text-2xl text-amber-800 dark:text-amber-500">
                    {collected.length}
                </div>
                <div className="text-[9px] text-amber-600/70 font-bold uppercase tracking-widest mt-1">
                    COLLECTED
                </div>
            </WidgetWrapper>
        );
    }

    return (
        <WidgetWrapper className="bg-[#f2f0eb] dark:bg-stone-900 border-none p-0 relative shadow-inner">
            {/* Paper Texture */}
            <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none"></div>

            <div className="p-3 w-full h-full flex flex-col">
                <div className="flex justify-between items-center mb-2 px-1 border-b border-stone-300 pb-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1">
                        <MapPin size={10} /> Travel Log
                    </span>
                    <span className="text-[9px] text-stone-400">{collected.length} / {STAMPS.length}</span>
                </div>

                <div className={`flex-1 grid gap-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-stone-300 ${w === 1 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {STAMPS.map((stamp) => {
                        const isUnlocked = collected.includes(stamp.id);
                        return (
                            <button
                                key={stamp.id}
                                onClick={() => toggleStamp(stamp.id)}
                                className={`
                                    relative aspect-square flex flex-col items-center justify-center rounded-md border-[3px] border-dashed transition-all p-1
                                    ${isUnlocked ? `${stamp.bg} ${stamp.border} opacity-100 rotate-0 scale-100 shadow-sm` : 'bg-transparent border-stone-200 opacity-40 hover:opacity-70 scale-95'}
                                `}
                            >
                                <StampIcon size={18} className={isUnlocked ? stamp.color : 'text-stone-300'} />
                                {isUnlocked ? (
                                    <span className={`text-[8px] font-bold mt-1 ${stamp.color.replace('text-', 'text-opacity-80 text-')}`}>{stamp.location}</span>
                                ) : (
                                    <span className="text-[8px] text-stone-300 mt-1 font-bold">???</span>
                                )}

                                {/* Postmark overlay */}
                                {isUnlocked && (
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border border-stone-400/30 flex items-center justify-center rotate-[-15deg] pointer-events-none">
                                        <div className="w-11/12 h-px bg-stone-400/30"></div>
                                        <div className="absolute w-px h-11/12 bg-stone-400/30"></div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </WidgetWrapper>
    );
}
