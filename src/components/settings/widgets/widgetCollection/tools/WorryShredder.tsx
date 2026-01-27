import { useState } from 'react';
import { WidgetWrapper } from '../Common';
import { useWidgetStorage } from '../SDK';

// --- 1. Worry Shredder (근심 파쇄기) ---
export function WorryShredder({ gridSize }: { gridSize?: { w: number; h: number } }) {
    const [text, setText] = useWidgetStorage('widget-shredder-text', '');
    const [isShredding, setIsShredding] = useState(false);

    const handleShred = () => {
        if (!text) return;
        setIsShredding(true);
        setTimeout(() => {
            setText('');
            setIsShredding(false);
        }, 2000);
    };

    const w = gridSize?.w || 2;
    const h = gridSize?.h || 2;
    const isWide = w >= 2 && h === 1;

    return (
        <WidgetWrapper className="bg-gray-800 border-gray-700">
            <div className={`w-full h-full flex ${isWide ? 'flex-row' : 'flex-col'} items-center justify-between p-2 gap-2`}>
                {!isWide && <div className="w-full text-center text-gray-400 text-xs font-mono">WORRY SHREDDER</div>}

                <div className={`relative flex-1 flex flex-col items-center overflow-hidden ${isWide ? 'h-full w-full' : 'w-full'}`}>
                    {/* Paper Input */}
                    <div
                        className={`bg-white p-2 text-xs text-gray-800 shadow-md transition-all duration-[2000ms] ease-in-out font-mono leading-tight
                        ${isShredding ? 'translate-y-[150%] opacity-0' : 'translate-y-0 opacity-100'}
                        ${isWide ? 'w-full h-full' : 'w-3/4 h-[60px]'}`}
                    >
                        {isShredding ? (
                            <div className="w-full h-full flex gap-1 overflow-hidden">
                                {/* Shred lines simulation */}
                                {[...Array(isWide ? 15 : 10)].map((_, i) => (
                                    <div key={i} className="flex-1 bg-gray-200 h-full transform translate-y-2"></div>
                                ))}
                            </div>
                        ) : (
                            <textarea
                                className="w-full h-full resize-none outline-none bg-transparent placeholder:text-gray-300"
                                placeholder={isWide ? "Write worry..." : "걱정을 입력하세요..."}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                disabled={isShredding}
                            />
                        )}
                    </div>

                    {/* Shredder Mouth */}
                    {!isWide && <div className="absolute bottom-0 w-full h-4 bg-black/50 backdrop-blur-sm z-10 border-t-2 border-red-500/50"></div>}
                </div>

                <div className={`${isWide ? 'h-full flex items-center justify-center' : 'w-full'}`}>
                    <button
                        onClick={handleShred}
                        disabled={!text || isShredding}
                        className={`bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold rounded shadow-lg transition-colors
                        ${isWide ? 'h-full w-12 flex items-center justify-center text-[10px]' : 'w-full py-2 text-xs'}
                        `}
                    >
                        {isShredding ? (isWide ? '...' : 'SHREDDING...') : (isWide ? 'CUT' : 'DESTROY WORRY')}
                    </button>
                    {isWide && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-red-500/50 pointer-events-none"></div>}
                </div>
            </div>
        </WidgetWrapper>
    );
}
