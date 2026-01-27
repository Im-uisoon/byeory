import React, { useState, useEffect } from 'react';
import type { WidgetBlock, WidgetDecoration, WidgetScene } from '../types';
import { WIDGET_SIZES } from '../constants';
import BlockRenderer from './BlockRenderer';
import DecorationLayer from './DecorationLayer';
interface CustomWidgetPreviewProps {
    content: {
        children?: WidgetBlock[];
        decorations?: WidgetDecoration[];
        scenes?: WidgetScene[];
    };
    defaultSize?: string;
    style?: React.CSSProperties;
    styles?: React.CSSProperties;
}

const CustomWidgetPreview: React.FC<CustomWidgetPreviewProps> = ({ content, defaultSize = "2x2", style, styles }) => {
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const currentWidth = containerRef.current.clientWidth;
                // If width is 0 (hidden), ignore
                if (!currentWidth) return;

                // Get Base Width (Builder Size)
                // Use defaultSize, fallback to 2x2
                const baseSize = WIDGET_SIZES[defaultSize] || WIDGET_SIZES['2x2'];
                const baseWidth = baseSize.w;

                // Calculate Scale
                // If baseWidth is 376 and current is 180 -> scale ~0.47
                const newScale = currentWidth / baseWidth;
                setScale(newScale);
            }
        };

        const resizeObserver = new ResizeObserver(updateScale);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        updateScale(); // Initial

        return () => resizeObserver.disconnect();
    }, [defaultSize]);
    const scenes = content.scenes || [];
    const hasScenes = scenes.length > 0;

    useEffect(() => {
        if (!hasScenes || scenes.length <= 1) return;

        const duration = (scenes[currentSceneIndex].duration || 1) * 1000;

        const timer = setTimeout(() => {
            setCurrentSceneIndex((prev) => (prev + 1) % scenes.length);
        }, duration);

        return () => clearTimeout(timer);
    }, [hasScenes, scenes.length, currentSceneIndex, scenes]);

    const blocks = hasScenes ? (scenes[currentSceneIndex].blocks || []) : (content.children || []);
    // 🌟 [Fix] Fallback to check if 'decorations' exists on the content object itself (if entire block passed)
    const decorations = hasScenes
        ? (scenes[currentSceneIndex].decorations || [])
        : (content.decorations || (content as any).decorations || []);

    const finalStyle = {
        ...(style || styles),
        backgroundColor: (style?.backgroundColor || styles?.backgroundColor || '#ffffff'),
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative overflow-hidden rounded-lg"
            style={finalStyle}
        >
            <DecorationLayer decorations={decorations} scale={scale} />

            <div
                className="absolute inset-0 z-10"
                style={{ overflow: 'hidden' }}
            >
                {blocks.map((block) => {
                    const blkLayout = block.layout || { x: 50, y: 50, w: '100%', h: 'auto' };
                    return (
                        <div
                            key={block.id}
                            className="absolute overflow-hidden rounded bg-transparent"
                            style={{
                                left: `${blkLayout.x}%`,
                                top: `${blkLayout.y}%`,
                                width: typeof blkLayout.w === 'number' ? `${blkLayout.w * scale}px` : blkLayout.w,
                                height: typeof blkLayout.h === 'number' ? `${blkLayout.h * scale}px` : blkLayout.h,
                                transform: `translate(-50%, -50%) rotate(${blkLayout.rotation || 0}deg)`,
                                zIndex: blkLayout.zIndex || 1,
                            }}
                        >
                            <BlockRenderer
                                block={block}
                                selectedBlockId={null}
                                onSelectBlock={() => { }}
                                onRemoveBlock={() => { }}
                                onUpdateBlock={() => { }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default React.memo(CustomWidgetPreview);
