import React from 'react';
import { WidgetWrapper } from '../Common';

interface BonfireProps {
    gridSize?: { w: number; h: number };
}

export function Bonfire({ gridSize }: BonfireProps) {
    const w = gridSize?.w || 2;
    const h = gridSize?.h || 1;
    const minDim = Math.min(w, h);

    // Scale logic
    let scale = 0.85;
    if (minDim >= 3) scale = 1.7;
    else if (minDim >= 2) scale = 1.35;

    const videoRef = React.useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = React.useState(true);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <WidgetWrapper className="bg-black border-none shadow-none p-0 overflow-hidden relative group">
            <div
                className="w-full h-full flex items-center justify-center bg-black cursor-pointer"
                onClick={togglePlay}
            >
                <video
                    ref={videoRef}
                    src="/videos/bonfire.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="object-cover pointer-events-none select-none"
                    style={{
                        width: `${200 * scale}px`,
                        height: `${200 * scale}px`,
                        filter: 'brightness(1.1) contrast(1.1)',
                        maskImage: 'radial-gradient(circle, black 40%, transparent 70%)',
                        WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 70%)',
                        opacity: isPlaying ? 1 : 0.5
                    }}
                />
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center text-white/50">
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
}