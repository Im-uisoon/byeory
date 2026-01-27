import { useState, useRef, useEffect } from 'react';
import { WidgetWrapper } from '../Common';
import { TreePine } from 'lucide-react';

export function SnowGlobe({ }: { gridSize?: { w: number; h: number } }) {
    // Responsive logic: removed manual scale. CSS handles it.

    // Note: We don't really need gridSize if we just fill container

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isShaking, setIsShaking] = useState(false);

    // Physics state
    const particles = useRef<{ x: number, y: number, r: number, vx: number, vy: number, alpha: number }[]>([]);
    const requestRef = useRef<number>(0);

    // Initialize particles with 3D-like depth properties
    const initParticles = (width: number, height: number) => {
        particles.current = [];
        const count = 100; // Dense snow
        for (let i = 0; i < count; i++) {
            particles.current.push({
                x: Math.random() * width,
                y: Math.random() * height,
                r: Math.random() * 2 + 1, // Size variation
                vx: (Math.random() - 0.5) * 0.5, // Horizontal drift
                vy: Math.random() * 1 + 0.5, // Fall speed
                alpha: Math.random() * 0.5 + 0.3 // Opacity for depth
            });
        }
    };

    // Animation Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Initial setup
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        initParticles(canvas.width, canvas.height);

        const loop = () => {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const width = canvas.width;
            const height = canvas.height;

            // Handle resize dynamically
            const newRect = canvas.getBoundingClientRect();
            // Use round to avoid subpixel flickering issues
            if (Math.round(newRect.width) !== width || Math.round(newRect.height) !== height) {
                canvas.width = Math.round(newRect.width);
                canvas.height = Math.round(newRect.height);
                // On drastic resize, re-init? No, let them fall.
                if (particles.current.length === 0) initParticles(canvas.width, canvas.height);
            }

            ctx.clearRect(0, 0, width, height);

            // Draw particles
            ctx.fillStyle = "white";

            for (let i = 0; i < particles.current.length; i++) {
                const p = particles.current[i];

                ctx.globalAlpha = p.alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();

                // Physics
                p.x += p.vx;
                p.y += p.vy;

                // Shake Impulse (Upward wind)
                if (isShaking) {
                    p.vy -= 0.5; // Strong upward force
                    p.vx += (Math.random() - 0.5) * 0.5; // Chaos
                } else {
                    // Gravity wrapper
                    if (p.vy < (p.r * 0.5)) p.vy += 0.05; // Terminal velocity based on size
                }

                // Boundaries
                if (p.y > height) {
                    p.y = -5;
                    p.x = Math.random() * width;
                    p.vy = Math.random() * 1 + 0.5; // Reset speed
                }
                if (p.y < -height * 0.5) { // If blown too high up
                    p.y = -10;
                    p.vy = Math.random() * 1 + 0.5;
                }
                if (p.x > width) p.x = 0;
                if (p.x < 0) p.x = width;
            }

            requestRef.current = requestAnimationFrame(loop);
        };

        loop();
        return () => cancelAnimationFrame(requestRef.current);
    }, [isShaking]);

    const handleShake = () => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 800); // Longer shake duration
    };

    return (
        <WidgetWrapper className="bg-transparent border-0 shadow-none overflow-visible flex items-center justify-center p-0">
            <div
                onClick={handleShake}
                className={`relative cursor-pointer transition-all duration-300 ease-out origin-center ${isShaking ? 'animate-shake' : 'hover:scale-[1.02]'}`}
                style={{
                    height: '90%', // Fill 90% of the container height
                    aspectRatio: '1/1', // Keep it specific square
                    maxWidth: '100%', // Don't overflow width
                    maxHeight: '100%'
                }}
            >
                {/* Glass Sphere Container */}
                <div className="absolute inset-0 rounded-full overflow-hidden shadow-2xl bg-gradient-to-b from-blue-100/20 to-blue-300/10 backdrop-blur-[1px] border border-white/40 ring-1 ring-white/20 z-10 box-border">

                    {/* Inner Sky Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#a1c4fd]/30 to-[#c2e9fb]/20 pointer-events-none" />

                    {/* Scene Content - Relative sizing using percents */}
                    <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 flex flex-col items-center z-0 w-[60%] h-[50%] justify-end">
                        {/* A tiny winter scene */}
                        <div className="flex items-end justify-center w-full">
                            <TreePine className="text-[#2d5a4c] fill-[#2d5a4c] drop-shadow-md pb-1 stroke-1 w-[50%] h-auto" />
                            <div className="w-[20%] aspect-square rounded-full bg-white shadow-sm flex items-center justify-center -ml-[10%] mb-[5%] text-[10px] sm:text-xs lg:text-sm">
                                ☃️
                            </div>
                        </div>
                        {/* Ground Snow */}
                        <div className="w-[80%] h-[15%] bg-white rounded-[50%] blur-sm -mt-[5%] opacity-90" />
                    </div>

                    {/* Snow Canvas Layer */}
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full pointer-events-none z-20"
                    />

                    {/* Glass Reflection Highlight (Gloss) */}
                    <div className="absolute top-[10%] left-[15%] w-[30%] h-[15%] bg-gradient-to-br from-white/60 to-transparent rounded-full transform -rotate-45 opacity-70 pointer-events-none blur-[1px]" />
                    <div className="absolute bottom-[10%] right-[15%] w-[15%] h-[8%] bg-white/30 rounded-full transform -rotate-45 opacity-40 pointer-events-none blur-[2px]" />
                </div>

                {/* Base Stand - Responsive positioning */}
                <div className="absolute -bottom-[6%] left-1/2 -translate-x-1/2 w-[60%] h-[12%] z-0">
                    {/* Top of base (darker) */}
                    <div className="w-full h-full bg-[#5d4037] rounded-lg shadow-lg relative overflow-hidden border-t border-[#8d6e63]">
                        {/* Wood Texture Lines */}
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,rgba(0,0,0,0.2)_4px,rgba(0,0,0,0.2)_5px)] opacity-50" />
                    </div>
                </div>

            </div>
        </WidgetWrapper>
    );
}
