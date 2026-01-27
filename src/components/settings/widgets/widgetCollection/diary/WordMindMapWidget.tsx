import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { WidgetWrapper } from '../../Shared';
import { RefreshCw, Tag } from 'lucide-react';

interface WordItem {
    text: string;
    value: number;
}

interface PhysicsWord extends WordItem {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    widthEst: number; // Estimated width for collision
    heightEst: number;
    color: string;
}

interface ComponentProps {
    className?: string;
    style?: React.CSSProperties;
    gridSize?: { w: number; h: number };
    isStickerMode?: boolean;
}

export const WordMindMapWidget = ({ className, style, gridSize, isStickerMode }: ComponentProps) => {
    const navigate = useNavigate();
    const [words, setWords] = useState<WordItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Physics State
    const [physicsWords, setPhysicsWords] = useState<PhysicsWord[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number | undefined>(undefined);

    const fetchPersona = async () => {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/persona", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok && response.status !== 204) {
                try {
                    const text = await response.text();
                    if (!text) {
                        setWords([]);
                        return;
                    }

                    const json = JSON.parse(text);

                    // 빈 배열([])이거나 데이터 구조가 안맞으면 빈값 처리
                    if (Array.isArray(json) && json.length === 0) {
                        setWords([]);
                        return;
                    }

                    let parsedData = json;
                    if (typeof json.analysisResult === "string") {
                        try {
                            parsedData = JSON.parse(json.analysisResult);
                        } catch (e) {
                            // ignore
                        }
                    }

                    if (parsedData && parsedData.wordCloud) {
                        setWords(parsedData.wordCloud);
                    } else {
                        setWords([]);
                    }
                } catch (e) {
                    console.error("JSON Parse Error:", e);
                    setWords([]);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPersona();
    }, []);

    // Physics Loop for 1x1
    const isSmall = (gridSize?.w || 2) === 1 && (gridSize?.h || 1) === 1;

    // Highlight colors for top words - bright and varied
    const highlightColors = [
        "text-indigo-600",
        "text-rose-600",
        "text-teal-600",
        "text-violet-600",
        "text-amber-600",
        "text-fuchsia-600"
    ];

    useEffect(() => {
        if (!isSmall || words.length === 0) {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            return;
        }

        const topWords = words.slice(0, 6);

        // Initialize positions
        const initialPhysicsSelf: PhysicsWord[] = topWords.map((w, idx) => {
            // Dramatic size steps
            let fontSizeRem = 0.8;
            if (idx === 0) fontSizeRem = 1.6;
            else if (idx === 1) fontSizeRem = 1.2;
            else if (idx === 2) fontSizeRem = 1.0;

            // Random start pos (percentage 20-80 to start safe)
            const startX = 20 + Math.random() * 60;
            const startY = 20 + Math.random() * 60;

            // Random velocity - SLOWER
            const speed = 0.05 + Math.random() * 0.05;
            const angle = Math.random() * Math.PI * 2;

            return {
                ...w,
                x: startX,
                y: startY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: fontSizeRem,
                widthEst: w.text.length * fontSizeRem * 9, // Rough px est
                heightEst: fontSizeRem * 16,
                color: highlightColors[idx % highlightColors.length]
            };
        });

        let currentWords = initialPhysicsSelf;

        const animate = () => {
            currentWords = currentWords.map(p => {
                let { x, y, vx, vy, size } = p;

                // Update Pos
                x += vx;
                y += vy;

                // Wall Collision (Bounce) with Padding
                const padding = 20;

                if (x <= padding || x >= 100 - padding) vx = -vx;
                if (y <= padding || y >= 100 - padding) vy = -vy;

                // Keep inside
                if (x < padding) x = padding;
                if (x > 100 - padding) x = 100 - padding;
                if (y < padding) y = padding;
                if (y > 100 - padding) y = 100 - padding;

                // Mass-based Collision Logic
                currentWords.forEach(other => {
                    if (other === p) return;

                    const dx = x - other.x; // Vector pointing from other -> p
                    const dy = y - other.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // Dynamic Radius: Estimate interaction range based on sizes
                    // Factor approximation: 1rem ~= 5% size radius? Tuned for aesthetic.
                    // User requested padding: Increased multiplier from 5 to 7.5
                    const combinedRadius = (size + other.size) * 7.5;

                    if (dist < combinedRadius) {
                        // COLLISION

                        if (size > other.size) {
                            // "I am bigger" (Bulldozer)
                            // Reaction: Minimal or none. I keep going almost as is.
                            // Maybe a tiny nudging to avoid passing THROUGH completely instantly,
                            // but basically preserve momentum.
                            // Not reversing velocity.
                        } else if (size < other.size) {
                            // "I am smaller" (Bounce off)
                            // Reaction: Bounce away from the Giant.

                            // Normalize the vector (other -> me)
                            // We want to fly AWAY from other. (dx, dy) is already (me - other).
                            const angle = Math.atan2(dy, dx);

                            // Current speed magnitude
                            const currentSpeed = Math.sqrt(vx * vx + vy * vy);
                            const bounceSpeed = Math.max(currentSpeed, 0.1); // Ensure it has some energy to escape

                            // Set new velocity direction away from giant
                            vx = Math.cos(angle) * bounceSpeed;
                            vy = Math.sin(angle) * bounceSpeed;

                            // Immediate Position Correction: Push out to resolve overlap preventing stickiness
                            const overlap = combinedRadius - dist;
                            x += Math.cos(angle) * overlap * 0.1;
                            y += Math.sin(angle) * overlap * 0.1;

                        } else {
                            // Equal Size
                            // Standard simple bounce
                            vx = -vx;
                            vy = -vy;

                            // Unstuck
                            x += dx * 0.05;
                            y += dy * 0.05;
                        }
                    }
                });

                return { ...p, x, y, vx, vy };
            });

            setPhysicsWords([...currentWords]);
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [words, isSmall]);


    // ----------------------------------------------------
    // Rendering
    // ----------------------------------------------------

    // ----------------------------------------------------
    // Rendering
    // ----------------------------------------------------

    if (loading) {
        return (
            <WidgetWrapper className={`bg-white ${className || ''}`} style={style}>
                <div className="flex items-center justify-center h-full text-gray-400">
                    <RefreshCw className="animate-spin w-5 h-5" />
                </div>
            </WidgetWrapper>
        )
    }

    if (words.length === 0) {
        return (
            <WidgetWrapper className={`bg-white ${className || ''}`} style={style} title="Key">
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 p-4">
                    <div className="flex flex-col items-center gap-1">
                        <Tag className="w-8 h-8 text-indigo-300 opacity-50" />
                        <span className="text-xs text-gray-400 font-medium">발견된 키워드가 없어요</span>
                    </div>

                    <button
                        onClick={() => !isStickerMode && navigate('/profile/analysis')}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded-lg transition-colors"
                    >
                        분석하러 가기
                    </button>
                </div>
            </WidgetWrapper>
        );
    }

    // 1x1: Physics Bumper Cars
    if (isSmall) {
        return (
            <WidgetWrapper className={`bg-white overflow-hidden relative ${className || ''}`} style={style}>
                {/* Container */}
                <div className="w-full h-full relative" ref={containerRef}>
                    {physicsWords.map((word, idx) => (
                        <div
                            key={idx}
                            className={`absolute font-black whitespace-nowrap leading-none transition-colors duration-500 ${word.color} select-none`}
                            style={{
                                left: `${word.x}%`,
                                top: `${word.y}%`,
                                fontSize: `${word.size}rem`,
                                transform: 'translate(-50%, -50%)', // Center on x,y
                                zIndex: 10 - idx
                            }}
                        >
                            {word.text}
                        </div>
                    ))}
                </div>
            </WidgetWrapper>
        );
    }

    // 2x1: Static Galaxy Cluster (Center-focused)
    const displayWords = words.slice(0, 11); // Take top 11

    // Static Layout Calculations for 2x1
    // We want a "Star" or "Galaxy" shape.
    // Index 0: Center (50, 50)
    // Index 1-10: Spiral out

    return (
        <WidgetWrapper className={`bg-white ${className || ''}`} style={style}>
            {/* Title watermark */}
            <div className="absolute top-3 left-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest pointer-events-none flex items-center gap-1.5 z-0">
                <Tag size={10} />
                Mind Map
            </div>

            <div className="w-full h-full relative overflow-hidden">
                {displayWords.map((word, idx) => {
                    const isTop = idx === 0;

                    // Position Logic
                    let x = 50;
                    let y = 50;

                    const goldenAngle = 2.4; // radians (~137.5 deg)
                    if (!isTop) {
                        // Spiral Shells
                        // Adjusting for 2x1 aspect ratio (width > height)
                        // Golden Angle distribution for natural packing
                        // "Gathered horizontal oval"
                        // Base radius small, grows slowly
                        const currentR = 10 + (idx * 0.8);

                        const angle = idx * goldenAngle;

                        // Elliptical Projection: Narrower horizontal spread
                        x = 50 + Math.cos(angle) * currentR * 1.8; // Reduced from 3.0
                        y = 50 + Math.sin(angle) * currentR * 1.3;
                    }

                    // Styling
                    const colorClass = isTop
                        ? highlightColors[0] // Biggest one gets primary color
                        : highlightColors[idx % highlightColors.length];

                    // Size decay
                    // User requested larger sizes to reduce "scattered" look
                    let fontSize = '1.0rem';
                    let fontWeight = '600';
                    let zIndex = 10 - idx;

                    if (isTop) {
                        fontSize = '2.5rem'; // Huge center
                        fontWeight = '900';
                        zIndex = 20;
                    } else if (idx < 4) {
                        fontSize = '1.4rem'; // Larger middle tier
                        fontWeight = '700';
                    }

                    return (
                        <div
                            key={idx}
                            className={`absolute select-none whitespace-nowrap leading-none transition-all duration-300 ${colorClass}`}
                            style={{
                                left: `${x}%`,
                                top: `${y}%`,
                                transform: 'translate(-50%, -50%)',
                                fontSize,
                                fontWeight,
                                zIndex,
                                opacity: isTop ? 1 : 0.85,
                                textShadow: isTop ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                            }}
                            title={`${word.value} mentions`}
                        >
                            {word.text}
                        </div>
                    );
                })}
            </div>
        </WidgetWrapper>
    );
};
