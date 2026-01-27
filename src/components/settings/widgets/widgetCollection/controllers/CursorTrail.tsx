import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { EffectController } from './SharedController';
import { Sparkles, X } from 'lucide-react';

interface ComponentProps {
    className?: string;
    style?: React.CSSProperties;
}

type TrailStyle = 'sparkles' | 'bubbles' | 'stars' | 'rainbow' | 'snow' | 'fire';

const STYLES: { id: TrailStyle, label: string, icon: string }[] = [
    { id: 'sparkles', label: 'Sparkles', icon: '✨' },
    { id: 'bubbles', label: 'Bubbles', icon: '.。' },
    { id: 'stars', label: 'Stars', icon: '⭐' },
    { id: 'rainbow', label: 'Rainbow', icon: '🌈' },
    { id: 'snow', label: 'Snow', icon: '❄️' },
    { id: 'fire', label: 'Fire', icon: '🔥' },
];

const PortalEffect = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>(0);
    const particles = useRef<Array<{ x: number, y: number, vx: number, vy: number, life: number, color: string, size: number, type?: string }>>([]);
    const position = useRef({ x: 0, y: 0 });

    const [style, setStyle] = useState<TrailStyle>(() =>
        (localStorage.getItem('cursor-trail-style') as TrailStyle) || 'sparkles'
    );

    // Listen for style changes from storage (for immediate update if changed via settings)
    useEffect(() => {
        const checkStyle = () => {
            const current = localStorage.getItem('cursor-trail-style') as TrailStyle;
            if (current && current !== style) {
                setStyle(current);
            }
        };
        const interval = setInterval(checkStyle, 500); // Poll for changes or use custom event
        return () => clearInterval(interval);
    }, [style]);

    const createParticle = (x: number, y: number, style: TrailStyle) => {
        const random = Math.random();

        switch (style) {
            case 'bubbles':
                return {
                    x, y,
                    vx: (random - 0.5) * 1,
                    vy: -random * 2 - 0.5, // Float up
                    life: 1.0,
                    color: `rgba(255, 255, 255, ${0.3 + random * 0.3})`,
                    size: random * 6 + 2
                };
            case 'stars':
                return {
                    x, y,
                    vx: (random - 0.5) * 1.5,
                    vy: (random - 0.5) * 1.5,
                    life: 1.0,
                    color: `hsl(${40 + random * 20}, 100%, 70%)`, // Yellow/Gold
                    size: random * 4 + 2,
                    type: 'star'
                };
            case 'rainbow':
                return {
                    x, y,
                    vx: (random - 0.5) * 2,
                    vy: (random - 0.5) * 2,
                    life: 1.0,
                    color: `hsl(${Math.random() * 360}, 80%, 60%)`,
                    size: random * 4 + 2
                };
            case 'snow':
                return {
                    x, y,
                    vx: (random - 0.5) * 1,
                    vy: random * 2 + 1, // Fall down
                    life: 1.2,
                    color: 'white',
                    size: random * 3 + 1
                };
            case 'fire':
                return {
                    x, y,
                    vx: (random - 0.5) * 1,
                    vy: -random * 3 - 1, // Rise fast
                    life: 0.8,
                    color: `hsl(${random * 40}, 100%, 60%)`, // Red/Orange/Yellow
                    size: random * 5 + 3
                };
            case 'sparkles':
            default:
                return {
                    x, y,
                    vx: (random - 0.5) * 2,
                    vy: (random - 0.5) * 2,
                    life: 1.0,
                    color: `hsl(${random * 360}, 70%, 80%)`, // Pastel rainbow
                    size: random * 3 + 1
                };
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            position.current = { x: e.clientX, y: e.clientY };
            // Add particles
            const count = style === 'fire' || style === 'snow' ? 3 : 2;
            for (let i = 0; i < count; i++) {
                particles.current.push(createParticle(e.clientX, e.clientY, style));
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        const animate = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = particles.current.length - 1; i >= 0; i--) {
                const p = particles.current[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.02;

                if (p.life <= 0) {
                    particles.current.splice(i, 1);
                    continue;
                }

                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;

                if (style === 'stars' || p.type === 'star') {
                    // Draw Star
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.beginPath();
                    for (let j = 0; j < 5; j++) {
                        ctx.lineTo(Math.cos((18 + j * 72) * Math.PI / 180) * p.size,
                            -Math.sin((18 + j * 72) * Math.PI / 180) * p.size);
                        ctx.lineTo(Math.cos((54 + j * 72) * Math.PI / 180) * (p.size / 2),
                            -Math.sin((54 + j * 72) * Math.PI / 180) * (p.size / 2));
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                } else if (style === 'bubbles') {
                    // Draw Ring
                    ctx.strokeStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.stroke();
                } else {
                    // Draw Circle
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            requestRef.current = requestAnimationFrame(animate);
        };

        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(requestRef.current);
        };
    }, [style]);

    return createPortal(
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[9999]"
        />,
        document.body
    );
};



export const CursorTrail = ({ className, style, gridSize: _ }: ComponentProps & { gridSize?: { w: number; h: number } }) => {
    const [showSettings, setShowSettings] = useState(false);
    const [currentStyle, setCurrentStyle] = useState<TrailStyle>(() =>
        (localStorage.getItem('cursor-trail-style') as TrailStyle) || 'sparkles'
    );

    const handleStyleChange = (newStyle: TrailStyle) => {
        setCurrentStyle(newStyle);
        localStorage.setItem('cursor-trail-style', newStyle);
    };

    return (
        <EffectController
            className={className}
            style={style}
            label="커서 트레일"
            icon={<Sparkles size={20} />}
            storageKey="effect-cursor-trail"
            onSettingsClick={() => setShowSettings(true)}
        >
            <>
                <PortalEffect />

                {showSettings && createPortal(
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50" onClick={() => setShowSettings(false)}>
                        <div className="bg-white rounded-2xl p-6 w-[320px] shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Sparkles className="text-yellow-400" />
                                    Trail Style
                                </h3>
                                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {STYLES.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => handleStyleChange(s.id)}
                                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${currentStyle === s.id
                                            ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm'
                                            : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                            }`}
                                    >
                                        <div className="text-2xl">{s.icon}</div>
                                        <span className="text-xs font-medium">{s.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </>
        </EffectController>
    );
};
