import React, { useRef, useEffect, useState } from 'react';
import { WidgetWrapper } from '../../Shared';
import { RefreshCw } from 'lucide-react';

interface ComponentProps {
    className?: string;
    style?: React.CSSProperties;
    text?: string;
    imageSrc?: string;
}

export const ScratchCard = ({ className, style, text = "Lucky Day!", imageSrc, gridSize: _ }: ComponentProps & { gridSize?: { w: number; h: number } }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isScratched, setIsScratched] = useState(false);

    // Random prizes or fortunes if no props provided
    const [content, setContent] = useState(text);

    const reset = () => {
        const prizes = ["1등 당첨!", "꽝입니다", "한번 더!", "행운 가득", "커피 당첨"];
        setContent(prizes[Math.floor(Math.random() * prizes.length)]);
        setIsScratched(false);
        initCanvas();
    };

    const initCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Reset composite operation to draw the silver layer
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#CCCCCC'; // Silver color
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add some noise or texture to look like foil
        for (let i = 0; i < 500; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? '#BBBBBB' : '#DDDDDD';
            ctx.fillRect(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                2, 2
            );
        }

        // Add text "SCRATCH HERE"
        ctx.fillStyle = '#888888';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SCRATCH ME', canvas.width / 2, canvas.height / 2);
    };

    useEffect(() => {
        initCanvas();
    }, []);



    const scratch = (x: number, y: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();

        checkReveal();
    };

    const checkReveal = () => {
        // Optimization: Don't check every frame, maybe just set 'scratched' to true after some interaction
        // For simple usage, we can just say "it's being scratched"
        if (!isScratched) setIsScratched(true);
    };

    return (
        <WidgetWrapper className={`bg-white select-none ${className || ''}`} style={style}>
            <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                {/* Hidden Content */}
                <div className="absolute inset-0 flex items-center justify-center bg-yellow-100 text-gray-800 font-bold text-xl flex-col gap-2">
                    {imageSrc ? <img src={imageSrc} alt="Prize" className="w-16 h-16 object-cover rounded" /> : <span>{content}</span>}
                </div>

                {/* Scratch Layer */}
                <canvas
                    ref={canvasRef}
                    width={300}
                    height={300}
                    className="absolute inset-0 w-full h-full cursor-pointer z-10 touch-none"
                    onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const scaleX = e.currentTarget.width / rect.width;
                        const scaleY = e.currentTarget.height / rect.height;
                        const x = (e.clientX - rect.left) * scaleX;
                        const y = (e.clientY - rect.top) * scaleY;
                        if (e.buttons === 1) scratch(x, y);
                    }}
                    onMouseDown={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const scaleX = e.currentTarget.width / rect.width;
                        const scaleY = e.currentTarget.height / rect.height;
                        const x = (e.clientX - rect.left) * scaleX;
                        const y = (e.clientY - rect.top) * scaleY;
                        scratch(x, y);
                    }}
                    style={{ opacity: isScratched ? 1 : 1 }} // Keep it visible until fully cleared
                />

                {/* Reset Button (only visible if scratched somewhat?) */}
                <button
                    onClick={reset}
                    className="absolute bottom-2 right-2 z-20 p-1.5 bg-white/80 rounded-full shadow-sm hover:bg-white text-gray-600 transition-opacity"
                    title="New Card"
                >
                    <RefreshCw size={14} />
                </button>
            </div>
        </WidgetWrapper>
    );
};
