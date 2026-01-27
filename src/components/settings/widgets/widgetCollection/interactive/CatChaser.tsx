import { useState, useRef, useEffect } from 'react';
import { WidgetWrapper } from '../Common';

// --- 5. Cat Chaser (따라오는 고양이) ---
export function CatChaser({ gridSize }: { gridSize?: { w: number; h: number } }) {
    const isSmall = (gridSize?.w || 2) < 2;
    const [eyes, setEyes] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
            const distance = Math.min(5, Math.hypot(e.clientX - centerX, e.clientY - centerY) / 10);

            setEyes({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <WidgetWrapper className="bg-[#333]">
            <div ref={containerRef} className="relative w-full h-full flex items-center justify-center overflow-hidden">
                {/* Cat Face scaled */}
                <div className={`w-24 h-20 bg-black rounded-3xl relative transition-transform ${isSmall ? 'scale-75' : 'scale-100'}`}>
                    {/* Ears */}
                    <div className="absolute -top-3 left-0 w-8 h-8 bg-black rounded-sm transform rotate-12"></div>
                    <div className="absolute -top-3 right-0 w-8 h-8 bg-black rounded-sm transform -rotate-12"></div>

                    {/* Eyes Container */}
                    <div className="absolute top-6 left-0 right-0 flex justify-center gap-4">
                        {/* Left Eye */}
                        <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center overflow-hidden relative shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                            <div
                                className="w-1.5 h-4 bg-black rounded-full"
                                style={{ transform: `translate(${eyes.x}px, ${eyes.y}px)` }}
                            ></div>
                        </div>
                        {/* Right Eye */}
                        <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center overflow-hidden relative shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                            <div
                                className="w-1.5 h-4 bg-black rounded-full"
                                style={{ transform: `translate(${eyes.x}px, ${eyes.y}px)` }}
                            ></div>
                        </div>
                    </div>

                    {/* Nose */}
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-2 h-1 bg-pink-400 rounded-full"></div>
                </div>
            </div>
        </WidgetWrapper>
    );
}
