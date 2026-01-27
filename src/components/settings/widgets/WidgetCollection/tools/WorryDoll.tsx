import { useState, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import { WidgetWrapper } from '../Common';
import { useWidgetStorage } from '../SDK';

interface WorryDollProps {
    gridSize?: { w: number; h: number };
}

export function WorryDoll({ gridSize }: WorryDollProps) {
    const [worry, setWorry] = useState('');
    const [storedWorry, setStoredWorry] = useWidgetStorage<string | null>('widget-worry-doll-val', null);

    const hasWorry = !!storedWorry;
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const handleGiveWorry = () => {
        if (!worry.trim()) return;
        setStoredWorry(worry);
        setWorry('');
    };

    const handleClearWorry = () => {
        setStoredWorry(null);
    };

    const w = gridSize?.w || 2;
    const h = gridSize?.h || 2;

    // Layout Flags
    const isSmall = w === 1 && h === 1;
    const isWide = w >= 2 && h === 1;
    const isLarge = w >= 2 && h >= 2;

    // Responsive Styles
    const containerClasses = isWide
        ? 'flex-row gap-4 px-6'
        : 'flex-col gap-2 p-3';

    const dollScale = isSmall ? 0.65 : isLarge ? 1.2 : 1;
    const dollMargin = isSmall ? 'mb-0' : isWide ? 'mb-0' : 'mb-2';
    const textAreaHeight = isSmall ? 'h-10 text-[10px]' : isLarge ? 'h-24 text-sm' : 'h-20 text-xs';
    const showText = !isSmall; // Hide "I'll keep this..." text on 1x1 to save space

    return (
        <WidgetWrapper className="bg-[#fdfbf7] border-none p-0 relative overflow-hidden flex items-center justify-center">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')] pointer-events-none"></div>

            <div className={`relative z-10 flex items-center justify-center w-full h-full ${containerClasses}`}>

                {/* The Doll Visual */}
                <div
                    className={`transition-all duration-500 flex-shrink-0 flex flex-col items-center justify-center ${dollMargin}`}
                    style={{ transform: `scale(${dollScale})` }}
                >
                    {/* SVG Composition */}
                    <svg width="60" height="80" viewBox="0 0 60 80" className="drop-shadow-md">
                        {/* Body */}
                        <rect x="15" y="30" width="30" height="40" rx="4" fill={hasWorry ? "#f97316" : "#fed7aa"} />
                        <path d="M15,30 L45,30 L40,70 L20,70 Z" fill={hasWorry ? "#ea580c" : "#fdba74"} />
                        {/* Head */}
                        <circle cx="30" cy="20" r="14" fill="#ffedd5" stroke="#fb923c" strokeWidth="2" />
                        {/* Eyes */}
                        <circle cx="25" cy="18" r="1.5" fill="#431407" />
                        <circle cx="35" cy="18" r="1.5" fill="#431407" />
                        {/* Mouth */}
                        {hasWorry ? (
                            <path d="M26,24 Q30,28 34,24" stroke="#431407" fill="none" strokeWidth="1.5" />
                        ) : (
                            <path d="M28,24 L32,24" stroke="#431407" strokeWidth="1.5" />
                        )}
                        {/* Arms */}
                        {hasWorry && (
                            <>
                                <path d="M10,40 Q20,50 30,45" stroke="#f97316" strokeWidth="4" strokeLinecap="round" fill="none" />
                                <path d="M50,40 Q40,50 30,45" stroke="#f97316" strokeWidth="4" strokeLinecap="round" fill="none" />
                                <rect x="24" y="38" width="12" height="10" fill="white" stroke="#ccc" transform="rotate(-5 30 43)" />
                            </>
                        )}
                    </svg>
                </div>

                {/* Content Area */}
                {hasWorry ? (
                    <div className={`text-center animate-fade-in ${isWide ? 'text-left flex-1' : ''}`}>
                        {showText && (
                            <p className="text-sm text-stone-600 dark:text-stone-400 font-medium mb-2 leading-tight">
                                "I'll keep this<br />worry for you."
                            </p>
                        )}
                        <button
                            onClick={handleClearWorry}
                            className={`bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-full transition-colors whitespace-nowrap shadow-sm ${isSmall ? 'text-[10px] px-2 py-1' : 'text-xs px-3 py-1.5'}`}
                        >
                            {isSmall ? "I'm okay" : "Thanks, I'm okay"}
                        </button>
                    </div>
                ) : (
                    <div className={`relative ${isWide ? 'flex-1 h-20' : 'w-full max-w-[200px]'}`}>
                        <textarea
                            ref={inputRef}
                            value={worry}
                            onChange={(e) => setWorry(e.target.value)}
                            placeholder={isSmall ? "Worry..." : "Tell me your worry..."}
                            className={`w-full p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg resize-none focus:outline-none focus:border-orange-300 shadow-sm theme-text-primary ${textAreaHeight}`}
                        />
                        <button
                            onClick={handleGiveWorry}
                            disabled={!worry.trim()}
                            className={`absolute bottom-1.5 right-1.5 p-1 bg-orange-100 dark:bg-orange-900 rounded-full text-orange-600 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800 disabled:opacity-50 transition-colors ${isSmall ? 'scale-75' : ''}`}
                        >
                            <MessageCircle size={14} />
                        </button>
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
}
