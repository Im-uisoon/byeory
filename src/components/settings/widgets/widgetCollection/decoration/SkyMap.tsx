import { useRef, useEffect, useState } from 'react';
import { WidgetWrapper } from '../Common';

interface SkyMapProps {
    gridSize?: { w: number; h: number };
}

interface Constellation {
    name: string;
    points: { x: number; y: number }[]; // Coordinates on a normalized 100x100 grid centered at 0,0
    connections: number[][]; // Indices of points to connect
    artPath?: (ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number) => void;
}

const CONSTELLATIONS: Constellation[] = [
    {
        name: "Ursa Major", // Big Dipper part
        points: [
            { x: -60, y: -20 }, { x: -30, y: -10 }, { x: 0, y: 0 }, // Handle
            { x: 10, y: 30 }, { x: 50, y: 40 }, { x: 60, y: 10 }, { x: 30, y: -5 } // Bowl
        ],
        connections: [[0, 1], [1, 2], [2, 6], [6, 3], [3, 4], [4, 5], [5, 6]],
        artPath: (ctx, cx, cy, scale) => {
            // Bear shape approximation
            ctx.beginPath();
            ctx.ellipse(cx + 20 * scale, cy + 10 * scale, 40 * scale, 30 * scale, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
    },
    {
        name: "Orion",
        points: [
            { x: -20, y: -50 }, { x: 20, y: -55 }, // Shoulders
            { x: -5, y: -5 }, { x: 0, y: 0 }, { x: 5, y: 5 }, // Belt
            { x: -25, y: 40 }, { x: 25, y: 35 } // Knees
        ],
        connections: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6], [0, 1], [5, 6]],
        artPath: (ctx, cx, cy, scale) => {
            // Hunter body
            ctx.beginPath();
            ctx.moveTo(cx - 20 * scale, cy - 50 * scale);
            ctx.lineTo(cx + 20 * scale, cy - 55 * scale);
            ctx.lineTo(cx, cy);
            ctx.lineTo(cx - 25 * scale, cy + 40 * scale);
            ctx.stroke();
        }
    },
    {
        name: "Cassiopeia",
        points: [
            { x: -50, y: -20 }, { x: -20, y: 10 }, { x: 0, y: -10 }, { x: 20, y: 10 }, { x: 50, y: -20 }
        ],
        connections: [[0, 1], [1, 2], [2, 3], [3, 4]],
        artPath: (ctx, cx, cy, scale) => {
            // W shape (Queen's chair)
            ctx.beginPath();
            ctx.moveTo(cx - 50 * scale, cy - 20 * scale);
            ctx.lineTo(cx - 20 * scale, cy + 10 * scale);
            ctx.lineTo(cx, cy - 10 * scale);
            ctx.lineTo(cx + 20 * scale, cy + 10 * scale);
            ctx.lineTo(cx + 50 * scale, cy - 20 * scale);
            ctx.stroke();
        }
    }
];

export function SkyMap({ gridSize }: SkyMapProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Determine Size Mode
    const widthUnit = gridSize?.w || 1;
    const heightUnit = gridSize?.h || 1;
    const showLines = widthUnit >= 2;
    const showArt = widthUnit >= 3 || (widthUnit === 2 && heightUnit >= 2);

    // Cycle constellations
    useEffect(() => {
        if (!showLines) return; // Don't cycle if we only show stars
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % CONSTELLATIONS.length);
        }, 5000); // Create rotation every 5 seconds
        return () => clearInterval(interval);
    }, [showLines]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
                draw();
            }
        };

        const draw = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const width = canvas.width;
            const height = canvas.height;

            // Background
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, '#020617');
            gradient.addColorStop(1, '#0f172a');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Background Stars
            const starCount = showArt ? 150 : (showLines ? 100 : 40);
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < starCount; i++) {
                // Static random for background based on index to avoid flickering on re-render would be ideal,
                // but for simple widget, random every frame is okay if we don't animate.
                // We are re-drawing on resize or index change.
                const x = Math.random() * width;
                const y = Math.random() * height;
                const size = Math.random() * 1.5;
                const opacity = Math.random();

                ctx.globalAlpha = opacity;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1.0;

            // Dome Overlay
            const domeGradient = ctx.createRadialGradient(width / 2, height, height * 0.4, width / 2, height, height * 1.2);
            domeGradient.addColorStop(0, 'rgba(0,0,0,0)');
            domeGradient.addColorStop(1, 'rgba(0,0,0,0.6)');
            ctx.fillStyle = domeGradient;
            ctx.fillRect(0, 0, width, height);

            // Constellation
            if (showLines) {
                const current = CONSTELLATIONS[currentIndex];

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.lineWidth = 1;

                const cx = width / 2;
                const cy = height / 2;
                const scale = Math.min(width, height) / (showArt ? 250 : 200);

                // Draw Lines
                ctx.beginPath();
                current.connections.forEach(([s, e]) => {
                    const p1 = current.points[s];
                    const p2 = current.points[e];
                    if (p1 && p2) {
                        ctx.moveTo(cx + p1.x * scale, cy + p1.y * scale);
                        ctx.lineTo(cx + p2.x * scale, cy + p2.y * scale);
                    }
                });
                ctx.stroke();

                // Draw Star Vertices
                current.points.forEach((p) => {
                    const px = cx + p.x * scale;
                    const py = cy + p.y * scale;

                    ctx.save();
                    ctx.fillStyle = '#fff';
                    ctx.shadowBlur = 6;
                    ctx.shadowColor = '#fff';
                    ctx.beginPath();
                    ctx.arc(px, py, 3, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                });

                // Art and Text
                if (showArt) {
                    // Art
                    if (current.artPath) {
                        ctx.save();
                        ctx.strokeStyle = 'rgba(255, 215, 0, 0.15)';
                        ctx.lineWidth = 15 * scale;
                        ctx.lineCap = 'round';
                        ctx.lineJoin = 'round';
                        current.artPath(ctx, cx, cy, scale);
                        ctx.restore();
                    }

                    // Name
                    ctx.save();
                    ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
                    ctx.font = `italic 700 ${14 * scale}px serif`;
                    ctx.textAlign = 'center';
                    ctx.fillText(current.name, cx, cy + 90 * scale);
                    ctx.restore();
                }
            }
        };

        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, [showLines, showArt, currentIndex]);

    return (
        <WidgetWrapper className="bg-black border-slate-800 overflow-hidden relative">
            <div className="w-full h-full relative group">
                <canvas ref={canvasRef} className="w-full h-full" />

                {/* Visual Feedback for Rotation */}
                {showLines && (
                    <div className="absolute top-2 right-2 flex gap-1">
                        {CONSTELLATIONS.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/20'}`}
                            />
                        ))}
                    </div>
                )}

                <div className="absolute bottom-3 right-4 text-[10px] text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {showArt ? 'AUTO ROTATION ON' : 'NORTH'}
                </div>
            </div>
        </WidgetWrapper>
    );
}
