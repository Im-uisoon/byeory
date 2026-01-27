import { useState, useEffect } from 'react';
import { WidgetWrapper } from '../Common';
import { Star } from 'lucide-react';

const SimpleConfetti = ({ active, onComplete }: { active: boolean; onComplete: () => void }) => {
    if (!active) return null;

    // Create particles
    const particles = Array.from({ length: 30 }).map((_, i) => {
        const angle = Math.random() * 360;
        const velocity = 2 + Math.random() * 3;
        const tx = Math.cos(angle * Math.PI / 180) * velocity * 50;
        const ty = Math.sin(angle * Math.PI / 180) * velocity * 50;
        const color = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'][Math.floor(Math.random() * 5)];

        return (
            <div
                key={i}
                className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
                style={{
                    backgroundColor: color,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 50,
                    animation: `confetti-explode 1s ease-out forwards`,
                    // @ts-ignore - custom property for animation
                    '--tx': `${tx}px`,
                    '--ty': `${ty}px`,
                }}
            />
        );
    });

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" onAnimationEnd={onComplete}>
            <style>{`
                @keyframes confetti-explode {
                    0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    100% { opacity: 0; transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0); }
                }
            `}</style>
            {particles}
        </div>
    );
};

// --- 1. Switch Board (똑딱이)
export const SwitchBoard = ({ gridSize }: { gridSize?: { w: number; h: number } }) => {
    // Default to 1x1 if undefined
    const w = gridSize?.w || 1;
    const h = gridSize?.h || 1;
    const total = w * h;

    // Initialize states array
    const [switches, setSwitches] = useState<boolean[]>(Array(total).fill(false));
    const [showConfetti, setShowConfetti] = useState(false);

    if (switches.length !== total) {
        setSwitches(prev => {
            const next = Array(total).fill(false);
            prev.forEach((s, i) => { if (i < total) next[i] = s; });
            return next;
        });
    }

    const toggle = (index: number) => {
        setSwitches(prev => {
            const next = [...prev];
            const newState = !next[index];
            next[index] = newState;

            // Star Switch Logic: If it's the last switch and it's turned ON
            if (index === total - 1 && newState) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 1000);
            }
            return next;
        });
    };

    return (
        <WidgetWrapper className="bg-[#1a1a1a] p-2 overflow-hidden h-full">
            <div
                className="w-full h-full grid gap-2"
                style={{
                    gridTemplateColumns: `repeat(${w}, 1fr)`,
                    gridTemplateRows: `repeat(${h}, 1fr)`
                }}
            >
                {Array.from({ length: total }).map((_, i) => {
                    const isOn = switches[i];
                    return (
                        <div key={i} className={`flex flex-col items-center justify-center transition-colors duration-300 rounded-lg ${isOn ? 'bg-[#fffbeb]/10' : 'bg-transparent'}`}>
                            <button
                                onClick={() => toggle(i)}
                                className={`relative w-[64px] h-[80px] rounded-xl border-4 ${isOn ? 'border-[#e5e5e5] bg-white' : 'border-[#333] bg-[#2a2a2a]'} shadow-xl transition-all flex flex-col items-center justify-between py-2 scale-90 hover:scale-100 active:scale-95`}
                            >
                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                <div className={`w-6 h-10 rounded-lg border-2 ${isOn ? 'bg-white border-gray-200 shadow-[0_4px_0_0_rgba(0,0,0,0.1)] translate-y-[-2px]' : 'bg-[#333] border-black shadow-[0_-4px_0_0_rgba(255,255,255,0.1)] translate-y-[2px]'} transition-all`}></div>
                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            </button>
                            <span className={`mt-1 text-[10px] font-bold flex items-center gap-1 ${isOn ? 'text-gray-200 border-b border-gray-200' : 'text-gray-600'}`}>
                                {i === total - 1 ? <><Star size={8} fill={isOn ? "currentColor" : "none"} /> STAR</> : (isOn ? 'ON' : 'OFF')}
                            </span>
                        </div>
                    );
                })}
            </div>
            <SimpleConfetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
        </WidgetWrapper>
    );
}
