import React from 'react';
import type { AlbumCoverConfig } from './constants';
import { COVER_COLORS } from './constants';
import { motion } from 'framer-motion';

interface Props {
    config?: AlbumCoverConfig;
    title: string;
    tag?: string; // Optional separate tag
    count?: number | string;
    onClick?: () => void;
    className?: string;
    showFullTitle?: boolean;
}

const AlbumBook: React.FC<Props> = ({ config, title, tag, count, onClick, className, showFullTitle = false }) => {
    // Default to a simple cream cover if no config
    const activeConfig = config || {
        type: 'solid',
        value: COVER_COLORS[0].value,
        spineColor: COVER_COLORS[0].spine,
        labelColor: COVER_COLORS[0].text
    };

    const isPattern = activeConfig.type !== 'solid' && activeConfig.type !== 'gradient';

    const renderCoverBackground = () => {
        if (activeConfig.type === 'image' && activeConfig.customImage) {
            return {
                backgroundImage: `url(${activeConfig.customImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: activeConfig.spineColor || '#e5e7eb'
            };
        }
        if (activeConfig.type === 'illustration') {
            return {
                backgroundImage: activeConfig.value,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            };
        }
        if (isPattern) {
            const baseSize = activeConfig.backgroundSize || '20px 20px';
            const scale = (activeConfig.patternScale || 100) / 100;
            const [w, h] = baseSize.split(' ').map(s => parseFloat(s));
            const calculatedSize = w && h ? `${w * scale}px ${h * scale}px` : baseSize;

            return {
                backgroundImage: activeConfig.value,
                backgroundColor: activeConfig.backgroundColor || activeConfig.spineColor || '#ffffff',
                backgroundSize: calculatedSize,
                backgroundPosition: `${activeConfig.patternPositionX || 0}% ${activeConfig.patternPositionY || 0}%`
            };
        }
        return { backgroundColor: activeConfig.value };
    };

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`relative aspect-[4/5] rounded-r-2xl rounded-l-md shadow-lg cursor-pointer transition-shadow duration-300 hover:shadow-xl ${className}`}
            style={{
                backfaceVisibility: 'hidden',
                WebkitFontSmoothing: 'subpixel-antialiased',
                transform: 'translateZ(0)', // Force GPU layer
            }}
        >
            {/* Spine (Left Edge Binding) */}
            <div
                className="absolute left-0 top-0 bottom-0 w-6 z-20 rounded-l-md"
                style={{
                    background: activeConfig.spineColor || '#e5e7eb',
                    boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.1), inset 2px 0 2px rgba(255,255,255,0.3)'
                }}
            />

            {/* Fold/Crease Effect */}
            <div className="absolute left-6 top-0 bottom-0 w-1 bg-black/5 z-20" />

            {/* Main Cover */}
            <div
                className="absolute inset-0 left-2 w-full h-full rounded-r-2xl overflow-hidden z-10"
                style={renderCoverBackground()}
            >
                {/* Sticker / Icon Area */}
                {activeConfig.sticker && (
                    <div className="absolute top-4 left-8 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-sm text-2xl border border-white/40">
                        {activeConfig.sticker}
                    </div>
                )}

                {/* Bottom Gradient Overlay for Text Readability */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                {/* Content Area (Bottom Aligned) */}
                <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end z-20">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3
                            className="text-xl font-bold leading-tight break-words drop-shadow-sm"
                            style={{
                                color: activeConfig.labelColor || '#1f2937',
                                textShadow: '0 1px 2px rgba(255,255,255,0.5)'
                            }}
                        >
                            {/* Truncate Title checking */}
                            {(!showFullTitle && title.length > 6) ? `${title.slice(0, 6)}...` : title}
                        </h3>
                        {/* Tag Pill (Only show if tag is present) */}
                        {tag && (
                            <span
                                className="bg-white/30 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold border border-white/40 shadow-sm"
                                style={{ color: activeConfig.labelColor || '#1f2937' }}
                            >
                                {/* ✨ Robust Hash Display: Always exact one hash */}
                                #{tag.replace(/^#+/, '')}
                            </span>
                        )}
                    </div>

                    {count !== undefined && (
                        <p
                            className="text-xs font-medium flex items-center gap-1 opacity-90"
                            style={{ color: activeConfig.labelColor || '#1f2937' }}
                        >
                            <span
                                className="w-1.5 h-1.5 rounded-full inline-block"
                                style={{ backgroundColor: activeConfig.labelColor || '#1f2937' }}
                            />
                            {typeof count === 'number' ? `${count}개의 기록` : count}
                        </p>
                    )}
                </div>

                {/* Texture Overlay (Paper feel) */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cardboard-flat.png')] opacity-30 pointer-events-none mix-blend-multiply" />

                {/* Lighting Gradient */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/5 via-transparent to-white/20 pointer-events-none rounded-r-2xl" />
            </div>
        </motion.div>
    );
};

export default AlbumBook;
