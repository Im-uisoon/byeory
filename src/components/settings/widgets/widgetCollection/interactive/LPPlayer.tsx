import { useState } from 'react';

import { WidgetWrapper } from '../Common';

interface LPPlayerProps {
    gridSize?: { w: number; h: number };
}

export function LPPlayer({ gridSize }: LPPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);

    const w = gridSize?.w || 2;
    const h = gridSize?.h || 1;

    // Calculate limit based on the smaller dimension to prevent cutting off
    const minDim = Math.min(w, h);

    // Dynamic scale logic
    let scale = 0.8; // Default for 1x1 base size

    if (minDim >= 3) {
        scale = 1.6;
    } else if (minDim >= 2) {
        scale = 1.3;
    } else {
        scale = 0.8;
    }

    return (
        <WidgetWrapper className="bg-[#2a2a2a] border-none p-0">
            <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">

                {/* Turntable Base - Scaled */}
                <div
                    className="relative flex items-center justify-center shrink-0"
                    style={{
                        width: `${160 * scale}px`,
                        height: `${160 * scale}px`,
                    }}
                >
                    {/* Vinyl Record */}
                    <div className={`w-full h-full rounded-full bg-black border-4 border-[#1a1a1a] flex items-center justify-center shadow-xl ${isPlaying ? 'animate-spin-slow' : ''}`}>
                        {/* LP Grooves */}
                        <div className="absolute inset-[10%] rounded-full border border-gray-800 opacity-50"></div>
                        <div className="absolute inset-[20%] rounded-full border border-gray-800 opacity-50"></div>
                        <div className="absolute inset-[30%] rounded-full border border-gray-800 opacity-50"></div>
                        <div className="absolute inset-[40%] rounded-full border border-gray-800 opacity-40"></div>

                        {/* Center Label */}
                        <div className="w-1/3 h-1/3 rounded-full bg-yellow-600 flex items-center justify-center relative shadow-inner overflow-hidden">
                            {/* Label Art */}
                            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-black/10 -translate-x-1/2"></div>
                            <div className="absolute left-0 right-0 top-1/2 h-px bg-black/10 -translate-y-1/2"></div>
                            <div className="text-[6px] text-black/70 font-bold rotate-[-15deg] mt-2">BYEORY</div>
                            <div className="w-1.5 h-1.5 rounded-full bg-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                        </div>
                    </div>

                    {/* Tone Arm */}
                    <div
                        className={`absolute top-0 right-0 w-[6px] h-[55%] bg-gray-300 origin-top rounded-full shadow-lg transition-transform duration-700 ease-in-out z-10 border border-gray-400`}
                        style={{
                            right: `${15 * scale}px`,
                            top: `-${10 * scale}px`,
                            transform: isPlaying ? 'rotate(25deg)' : 'rotate(-25deg)'
                        }}
                    >
                        {/* Head shell */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[15%] bg-gray-400 rounded-sm"></div>
                    </div>
                </div>

                {/* Controls (Only visible on medium+) */}
                {minDim >= 2 && (
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`mt-4 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest transition-all ${isPlaying ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                        {isPlaying ? 'NOW PLAYING' : 'PLAY RECORD'}
                    </button>
                )}

                {/* Click area for small size */}
                {minDim < 2 && (
                    <div className="absolute inset-0 cursor-pointer" onClick={() => setIsPlaying(!isPlaying)}></div>
                )}
            </div>

            <style>{`
                .animate-spin-slow {
                  animation: spin 3s linear infinite;
                }
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
            `}</style>
        </WidgetWrapper>
    );
}
