import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { EffectController } from './SharedController';
import { Highlighter as HighlighterIcon, Trash2, Power } from 'lucide-react';


interface ComponentProps {
    className?: string;
    style?: React.CSSProperties;
}


interface PortalEffectProps {
    onClose?: () => void;
}

const PortalEffect = ({ onClose }: PortalEffectProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);

    // State for color and width
    const [color, setColor] = useState(() => localStorage.getItem('highlighter-color') || '#ffff00');
    const [width, setWidth] = useState(() => parseInt(localStorage.getItem('highlighter-width') || '15', 10));

    // Save settings
    useEffect(() => {
        localStorage.setItem('highlighter-color', color);
        localStorage.setItem('highlighter-width', String(width));
        if (contextRef.current) {
            contextRef.current.strokeStyle = hexToRgba(color, 0.4);
            contextRef.current.lineWidth = width;
        }
    }, [color, width]);

    // Helper to convert hex to rgba
    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = hexToRgba(color, 0.4);
        ctx.lineWidth = width;
        contextRef.current = ctx;

        const handleResize = () => {
            // Simple resize handling: clear and reset size
            // For a production app, we'd want to redraw the buffer
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            if (contextRef.current) {
                contextRef.current.lineCap = 'round';
                contextRef.current.lineJoin = 'round';
                contextRef.current.strokeStyle = hexToRgba(color, 0.4);
                contextRef.current.lineWidth = width;
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []); // Run once on mount, but color/width updates are handled in separate effect

    const startDrawing = (e: React.MouseEvent) => {
        if (!contextRef.current) return;
        contextRef.current.beginPath();
        contextRef.current.moveTo(e.clientX, e.clientY);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing || !contextRef.current) return;

        // Add some "jitter" to make it look hand-drawn/crooked
        const jitter = () => (Math.random() - 0.5) * 2;
        contextRef.current.lineTo(e.clientX + jitter(), e.clientY + jitter());
        contextRef.current.stroke();
    };

    const stopDrawing = () => {
        if (!contextRef.current) return;
        contextRef.current.closePath();
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9998]">
            {/* Canvas for drawing */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
            />
            {/* Toolbar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-3 py-2 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center gap-3 border border-gray-100 pointer-events-auto animate-bounce-in">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Highlighter</span>
                </div>

                <div className="w-[1px] h-4 bg-gray-200"></div>

                {/* Color Picker */}
                <div className="relative w-6 h-6 rounded-full overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0"
                    />
                </div>

                {/* Width Slider */}
                <input
                    type="range"
                    min="5"
                    max="50"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-20 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                />

                <div className="w-[1px] h-4 bg-gray-200"></div>

                {/* Clear Button */}
                <button
                    onClick={clearCanvas}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-1.5 transition-colors"
                    title="Clear All"
                >
                    <Trash2 size={16} />
                </button>

                {/* Exit Button */}
                <button
                    onClick={onClose}
                    className="bg-gray-100 text-gray-500 hover:bg-red-500 hover:text-white rounded-full p-1.5 transition-all"
                    title="Exit Highlighter Mode"
                >
                    <Power size={16} />
                </button>
            </div>
        </div>,
        document.body
    );
};


export const Highlighter = ({ className, style, gridSize: _ }: ComponentProps & { gridSize?: { w: number; h: number } }) => {
    return (
        <EffectController
            className={className}
            style={style}
            label="형광펜"
            icon={<HighlighterIcon size={20} />}
            storageKey="effect-highlighter"
        >
            <PortalEffect />
        </EffectController>
    );
};

