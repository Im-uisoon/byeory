
import React from 'react';
import type { WidgetDecoration } from '../types';
import { getSvgPathFromPoints } from '../utils';


interface DecorationLayerProps {
    decorations?: WidgetDecoration[];
    scale?: number; // ✨ NEW
}

const DecorationLayer: React.FC<DecorationLayerProps> = ({ decorations = [], scale = 1 }) => {
    if (!decorations || decorations.length === 0) return null;

    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[inherit]">
            {/* 🌟 Global Animation Styles */}
            <style>
                {`
                    @keyframes spin { 0% { transform: translate(-50%, -50%) rotate(0deg); } 100% { transform: translate(-50%, -50%) rotate(360deg); } }
                    @keyframes pulse { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.1); } }
                    @keyframes bounce { 0%, 100% { transform: translate(-50%, -50%); } 50% { transform: translate(-50%, -60%); } }
                    @keyframes float { 0% { transform: translate(-50%, -50%); } 50% { transform: translate(-50%, -55%); } 100% { transform: translate(-50%, -50%); } }
                    @keyframes wiggle { 0%, 100% { transform: translate(-50%, -50%) rotate(-3deg); } 50% { transform: translate(-50%, -50%) rotate(3deg); } }
                `}
            </style>
            {decorations.map((deco) => {
                // 🌟 Data recovery and normalization
                let safeType = deco.type;
                if (typeof safeType === 'object' && (safeType as any).type) {
                    safeType = (safeType as any).type;
                }

                // Aliases
                const isText = safeType === 'text';
                const defaultSize = isText ? 'auto' : 100;

                // ✨ Apply Scale
                const rawW = deco.w ?? deco.width ?? defaultSize;
                const rawH = deco.h ?? deco.height ?? defaultSize;

                const widthVal = typeof rawW === 'number' ? rawW * scale : rawW;
                const heightVal = typeof rawH === 'number' ? rawH * scale : rawH;
                const unit = deco.unit || 'px';

                // ✨ Ensure Numbers for positions
                const xVal = !isNaN(Number(deco.x)) ? Number(deco.x) : 0;
                const yVal = !isNaN(Number(deco.y)) ? Number(deco.y) : 0;

                const widthStyle = (widthVal as any) === 'auto' ? 'auto' : `${widthVal}${unit}`;
                const heightStyle = (heightVal as any) === 'auto' ? 'auto' : `${heightVal}${unit}`;

                const imageUrl = deco.imageUrl || deco.src;
                const isShape = ['circle', 'square', 'star', 'shape', 'line'].includes(safeType);
                const isImage = ['image', 'sticker'].includes(safeType) || !!imageUrl;

                return (
                    <div
                        key={deco.id || Math.random().toString()}
                        className={`absolute flex items-center justify-center transform-gpu ${isText ? 'whitespace-pre-wrap' : ''}`}
                        style={{
                            left: `${xVal}%`,
                            top: `${yVal}%`,
                            width: widthStyle,
                            height: heightStyle,
                            transform: `rotate(${deco.rotation || 0}deg)`,
                            opacity: deco.opacity,
                            zIndex: deco.zIndex || 0,
                            // 🌟 Animation Implementation
                            animationName: deco.animation?.type,
                            animationDuration: `${deco.animation?.duration || 3}s`,
                            animationIterationCount: 'infinite',
                            animationTimingFunction: 'ease-in-out',
                            animationDelay: `${deco.animation?.delay || 0}s`,
                            // 🌟 CSS Transition
                            transition: 'all 0.5s ease-in-out',
                            ...deco.style, // Apply custom styles from SQL (e.g. mixBlendMode, filter)
                        }}
                    >
                        {/* 1. Text Type */}
                        {isText && (
                            <div style={{ pointerEvents: 'none', textAlign: 'center' }}>
                                {deco.text}
                            </div>
                        )}

                        {/* 2. Blob Type (SVG) */}
                        {safeType === 'blob' && !deco.mediaType && !imageUrl && (
                            <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
                                <path
                                    d={getSvgPathFromPoints(deco.points || [], 0.5, true)}
                                    fill={deco.color}
                                />
                            </svg>
                        )}

                        {/* 3. Shape / Image Type */}
                        {(isShape || isImage) && (
                            <div
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: (deco.mediaType === 'video' || isImage) ? undefined : deco.color,
                                    // Image Background
                                    backgroundImage: (deco.mediaType !== 'video' && imageUrl) ? `url(${imageUrl})` : undefined,
                                    backgroundSize: 'contain', // Default to contain for stickers, cover for shapes? SQL uses backgroundSize in style usually, but here it is decoration
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center',
                                    borderRadius: (safeType === 'circle' || (safeType === 'shape' && (deco as any).shapeType === 'circle')) ? '50%' :
                                        (safeType === 'square' || (safeType === 'shape' && (deco as any).shapeType === 'square')) ? '4px' : '0%',
                                    clipPath: (safeType === 'star' || (safeType === 'shape' && (deco as any).shapeType === 'star'))
                                        ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                                        : (safeType === 'blob' && deco.points)
                                            ? `path('${getSvgPathFromPoints(deco.points, 0.5, true).replace(/,/g, ' ')}')`
                                            : undefined,
                                    ...deco.style // Allow override
                                }}
                            >
                                {/* Video Element */}
                                {deco.mediaType === 'video' && deco.videoUrl && (
                                    <video
                                        src={deco.videoUrl}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onTimeUpdate={(e) => {
                                            const vid = e.currentTarget;
                                            const start = deco.videoStartTime || 0;
                                            const end = deco.videoEndTime || 0;
                                            if (end > 0 && vid.currentTime >= end) {
                                                vid.currentTime = start;
                                            }
                                        }}
                                        onLoadedMetadata={(e) => {
                                            if (deco.videoStartTime) e.currentTarget.currentTime = deco.videoStartTime;
                                        }}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default DecorationLayer;
