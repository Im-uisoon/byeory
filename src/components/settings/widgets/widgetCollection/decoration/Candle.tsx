import React from 'react';
import { WidgetWrapper } from '../Common';
import { useWidgetStorage } from '../SDK';

export const Candle = React.memo(function Candle({ gridSize }: { gridSize?: { w: number; h: number } }) {
    const [isOn, setIsOn] = useWidgetStorage('candle-ison', true);

    const w = gridSize?.w || 1;
    // Render as many candles as the width unit
    const candleCount = w;

    return (
        <WidgetWrapper className="bg-gray-900 border-gray-800 p-2">
            <style>{`
          @keyframes flicker {
            0%, 100% { transform: scale(1); opacity: 0.9; }
            25% { transform: scale(0.9, 1.1) skewX(2deg); opacity: 0.8; }
            50% { transform: scale(1.1, 0.9) skewX(-2deg); opacity: 1; }
            75% { transform: scale(0.95, 1.05); opacity: 0.85; }
          }
        `}</style>
            <div className="flex flex-row items-end justify-around h-full w-full gap-2 cursor-pointer" onClick={() => setIsOn(!isOn)}>
                {Array.from({ length: candleCount }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center justify-end h-full relative min-h-[60px] w-full max-w-[80px]">
                        <div
                            className={`w-4 h-8 bg-gradient-to-t from-orange-500 via-yellow-400 to-white rounded-[50%] absolute blur-[2px] transition-opacity duration-500 ${isOn ? 'opacity-100' : 'opacity-0'}`}
                            style={{
                                animation: isOn ? `flicker ${1.5 + i * 0.2}s infinite alternate` : 'none', // Stagger animation
                                top: '20%'
                            }}
                        >
                            <div className="absolute inset-0 bg-yellow-200 blur-md opacity-40 animate-pulse"></div>
                        </div>

                        <div className="w-0.5 h-3 bg-black/50 mt-8 mb-1 z-10"></div>

                        <div className="w-10 h-16 bg-gradient-to-r from-[#fdfbf7] to-[#e6dfd1] rounded-t-sm shadow-inner relative mt-1"
                            style={{
                                height: gridSize?.h && gridSize.h > 1 ? '60%' : '40%'
                            }}
                        >
                            <div className="w-full h-2 bg-gradient-to-r from-[#fdfbf7] to-[#e6dfd1] rounded-[50%] absolute -top-1"></div>
                        </div>
                    </div>
                ))}
            </div>
        </WidgetWrapper>
    );
});
