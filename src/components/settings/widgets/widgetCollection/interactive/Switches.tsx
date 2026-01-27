import React, { useState } from 'react';
import { WidgetWrapper } from '../../Shared';
import { Star } from 'lucide-react';

interface ComponentProps {
    className?: string;
    style?: React.CSSProperties;
}

export const Switches = ({ className, style, gridSize }: ComponentProps & { gridSize?: { w: number; h: number } }) => {
    const [states, setStates] = useState([false, true, false, false]);

    const toggle = (index: number) => {
        const newStates = [...states];
        newStates[index] = !newStates[index];
        setStates(newStates);

        if (index === 2 && !states[index]) {
            fireConfetti();
        }
    };

    // Confetti Logic
    const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; angle: number; velocity: number }[]>([]);

    const fireConfetti = () => {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];
        const newParticles = Array.from({ length: 20 }).map((_, i) => ({
            id: Date.now() + i,
            x: 50, // Center %
            y: 50, // Center %
            color: colors[Math.floor(Math.random() * colors.length)],
            angle: Math.random() * 360,
            velocity: Math.random() * 10 + 5
        }));
        setParticles(newParticles);
        setTimeout(() => setParticles([]), 1000);
    };

    const w = gridSize?.w || 2;
    const h = gridSize?.h || 2;
    const isTall = w === 1 && h >= 2;
    const isWide = w >= 2 && h === 1;

    // Responsive Grid Classes
    // Tall (1x2): 1 Col, 4 Rows
    // Wide (2x1): 4 Cols, 1 Row
    // Square (2x2): 2 Cols, 2 Rows
    const gridClass = isTall
        ? 'grid-cols-1 grid-rows-4'
        : isWide
            ? 'grid-cols-4 grid-rows-1'
            : 'grid-cols-2 grid-rows-2';

    // Helper for Cell Wrapper
    const Cell = ({ children, onClick, className = '' }: { children: React.ReactNode, onClick?: () => void, className?: string }) => (
        <div
            onClick={onClick}
            className={`
                relative flex items-center justify-center rounded-xl transition-all duration-200
                bg-[#e0e5ec] shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff]
                hover:shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff]
                active:shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff]
                cursor-pointer overflow-hidden
                ${className}
            `}
        >
            {children}
        </div>
    );

    return (
        <WidgetWrapper className={`bg-[#e0e5ec] ${className || ''}`} style={style}>
            <div className={`w-full h-full p-3`}>
                <div className={`w-full h-full grid gap-3 ${gridClass}`}>

                    {/* Switch 1: Toggle Pill */}
                    <Cell onClick={() => toggle(0)}>
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${states[0] ? 'bg-green-400' : 'bg-gray-300 shadow-inner'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${states[0] ? 'translate-x-[24px]' : 'translate-x-0'}`} />
                        </div>
                    </Cell>

                    {/* Switch 2: Rocker Switch */}
                    <Cell onClick={() => toggle(1)}>
                        <div className="relative w-8 h-12 bg-gray-700 rounded-md border border-gray-600 overflow-hidden shadow-lg">
                            <div className={`absolute w-full h-1/2 bg-gray-600 top-0 border-b border-black transition-all duration-100 ${states[1] ? 'opacity-100 bg-gray-500 shadow-inner' : 'opacity-80'}`} />
                            <div className={`absolute w-full h-1/2 bg-gray-600 bottom-0 border-t border-gray-500 transition-all duration-100 ${!states[1] ? 'opacity-100 bg-gray-500 shadow-inner' : 'opacity-80'}`} />
                            <div className={`absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${states[1] ? 'bg-green-400 shadow-[0_0_5px_#4ade80]' : 'bg-gray-800'}`} />
                        </div>
                    </Cell>

                    {/* Switch 3: Star Button (Confetti) */}
                    <Cell onClick={() => toggle(2)}>
                        <div className={`p-2 rounded-full transition-all duration-300 ${states[2] ? 'scale-110' : 'scale-100'}`}>
                            <Star size={24} className={`transition-colors duration-300 ${states[2] ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]' : 'text-gray-400'}`} />
                        </div>
                        {particles.map(p => (
                            <div
                                key={p.id}
                                className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
                                style={{
                                    backgroundColor: p.color,
                                    left: '50%',
                                    top: '50%',
                                    animation: `confetti-explode 0.8s ease-out forwards`,
                                    // Custom property for rotation
                                    '--tw-rotate': `${p.angle}deg`,
                                } as any}
                            />
                        ))}
                    </Cell>

                    {/* Switch 4: Lever (Vertical Toggle) */}
                    <Cell onClick={() => toggle(3)}>
                        <div className="w-4 h-14 bg-gray-300 rounded-full relative shadow-inner">
                            <div className="absolute inset-0 bg-black/5 rounded-full" />
                            <div
                                className={`absolute left-[-6px] w-7 h-7 rounded-full bg-[#f0f0f0] border border-gray-300 shadow-[2px_2px_5px_rgba(0,0,0,0.2)] transition-all duration-200 flex items-center justify-center ${states[3] ? 'top-1' : 'bottom-1'
                                    }`}
                            >
                                <div className="w-2 h-0.5 bg-gray-400/50 rounded-full" />
                            </div>
                        </div>
                    </Cell>

                </div>
            </div>
            <style>{`
                @keyframes confetti-explode {
                    0% { transform: translate(-50%, -50%) rotate(0deg) translate(0px); opacity: 1; }
                    100% { transform: translate(-50%, -50%) rotate(var(--tw-rotate)) translate(60px); opacity: 0; }
                }
            `}</style>
        </WidgetWrapper>
    );
};
