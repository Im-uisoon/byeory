import { useState } from 'react';
import { WidgetWrapper } from '../Common';
import { Palette } from 'lucide-react';
import { useWidgetStorage } from '../SDK';

const COLORS = [
    'bg-white', 'bg-gray-200', 'bg-black',
    'bg-red-200', 'bg-pink-200', 'bg-blue-200',
    'bg-green-200', 'bg-yellow-200', 'bg-indigo-300'
];

interface OOTDSketchProps {
    gridSize?: { w: number; h: number };
}

export function OOTDSketch({ gridSize }: OOTDSketchProps) {
    const [topColorIdx, setTopColorIdx] = useWidgetStorage('ootd-top', 0);
    const [bottomColorIdx, setBottomColorIdx] = useWidgetStorage('ootd-bottom', 2);
    const [showPalette, setShowPalette] = useState<'top' | 'bottom' | null>(null);

    const w = gridSize?.w || 2;
    const h = gridSize?.h || 1;

    // Small logic: If w=1 and h=1, crop to upper body
    const isSmall = w === 1 && h === 1;

    const ColorPicker = ({ onSelect }: { onSelect: (idx: number) => void }) => (
        <div className="absolute inset-0 bg-white/90 z-50 flex items-center justify-center p-4">
            <div className="grid grid-cols-3 gap-2">
                {COLORS.map((c, i) => (
                    <button
                        key={i}
                        className={`w-8 h-8 rounded-full border border-gray-300 shadow-sm ${c} hover:scale-110 transition-transform`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(i);
                            setShowPalette(null);
                        }}
                    />
                ))}
            </div>
            <button onClick={(e) => { e.stopPropagation(); setShowPalette(null); }} className="absolute top-1 right-1 text-gray-400">✕</button>
        </div>
    );

    return (
        <WidgetWrapper className="bg-[#f0f0f0] dark:bg-slate-800 border-none relative overflow-hidden group">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#999 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>

            {showPalette && (
                <ColorPicker onSelect={(idx) => showPalette === 'top' ? setTopColorIdx(idx) : setBottomColorIdx(idx)} />
            )}

            <div className="absolute top-2 left-2 text-[8px] font-bold text-gray-400 bg-white dark:bg-black px-1 border border-gray-200 rounded z-20">
                OOTD
            </div>

            <div className={`w-full h-full flex items-center justify-center relative ${isSmall ? 'scale-125 translate-y-4' : ''}`}>
                {/* Sketchy Figure */}
                <div className="relative w-24 h-48 flex flex-col items-center">

                    {/* Head */}
                    <div className="w-10 h-10 rounded-full border-2 border-slate-400 bg-white dark:bg-slate-200 relative mb-1 z-10 shadow-sm">
                        {/* Simple face */}
                        <div className="absolute top-3 left-2 w-1 h-1 bg-slate-400 rounded-full"></div>
                        <div className="absolute top-3 right-2 w-1 h-1 bg-slate-400 rounded-full"></div>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3 h-1 bg-slate-300 rounded-full"></div>
                    </div>

                    {/* Top (Clickable) */}
                    <div
                        className={`w-16 h-16 rounded-t-xl rounded-b-md border-2 border-slate-600 shadow-sm transition-colors cursor-pointer relative z-10 ${COLORS[topColorIdx]} ${COLORS[topColorIdx] === 'bg-white' ? 'dark:bg-slate-600' : ''}`}
                        onClick={() => setShowPalette('top')}
                    >
                        {/* Arms Hint */}
                        <div className="absolute -left-2 top-0 w-3 h-10 bg-inherit border-l-2 border-y-2 border-slate-600 rounded-l-md -rotate-12 origin-top-right"></div>
                        <div className="absolute -right-2 top-0 w-3 h-10 bg-inherit border-r-2 border-y-2 border-slate-600 rounded-r-md rotate-12 origin-top-left"></div>

                        {/* Label hint on hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                            <Palette size={12} className="text-black/20" />
                        </div>
                    </div>

                    {/* Bottom (Clickable) */}
                    <div
                        className={`w-14 h-20 mt-[-4px] rounded-t-sm rounded-b-sm border-2 border-slate-600 shadow-sm transition-colors cursor-pointer relative z-0 ${COLORS[bottomColorIdx]}`}
                        onClick={() => setShowPalette('bottom')}
                    >
                        {/* Legs Separation */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[2px] h-3/4 bg-black/10"></div>
                        {/* Label hint on hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                            <Palette size={12} className="text-black/20" />
                        </div>
                    </div>

                    {/* Shoes */}
                    <div className="flex gap-2 w-14 justify-between mt-1">
                        <div className="w-5 h-2 bg-slate-800 rounded-full"></div>
                        <div className="w-5 h-2 bg-slate-800 rounded-full"></div>
                    </div>
                </div>
            </div>

            {!isSmall && (
                <div className="absolute bottom-2 right-2 text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to change style
                </div>
            )}
        </WidgetWrapper>
    );
}
