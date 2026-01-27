import React, { Suspense } from 'react';
import type { Block, FloatingImage, FloatingText, Sticker } from "../types.ts";
import { WIDGET_COMPONENT_MAP } from '../../settings/widgets/componentMap.ts';
import CustomWidgetPreview from '../../settings/widgets/customwidget/components/CustomWidgetPreview.tsx';

interface MiniPostViewerProps {
    title: string;
    titleStyles: Record<string, any>;
    styles?: Record<string, any>; // ✨ Add paper styles prop
    blocks?: Block[];
    stickers?: Sticker[];
    floatingTexts?: FloatingText[];
    floatingImages?: FloatingImage[];
    scale?: number;
    minHeight?: string;
    hideTitle?: boolean; // ✨ Option to hide title
    preserveTitleSpace?: boolean; // ✨ Maintain title height even if hidden
    paddingClass?: string; // ✨ Custom padding class (default: px-12)
}

// ✨ Safe Image Component to handle Blob errors
const SafeImage = ({ src, alt, className, style, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
    const [status, setStatus] = React.useState<'loading' | 'valid' | 'error'>('loading');

    React.useEffect(() => {
        let isMounted = true;

        if (!src) {
            setStatus('error');
            return;
        }

        // Pre-validate blob URLs using Image object to avoid unhandled fetch errors
        if (src.startsWith('blob:')) {
            setStatus('loading');
            const img = new Image();
            img.onload = () => {
                if (isMounted) setStatus('valid');
            };
            img.onerror = () => {
                if (isMounted) setStatus('error');
            };
            img.src = src;
        } else {
            // For regular URLs, assume valid initially and let onError catch issues
            setStatus('valid');
        }

        return () => {
            isMounted = false;
        };
    }, [src]);

    if (status === 'error') {
        return (
            <div
                className={`bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs ${className}`}
                style={style}
            >
                <span className="text-[10px]">이미지 없음</span>
            </div>
        );
    }

    if (status === 'loading') {
        return (
            <div className={`bg-gray-50 animate-pulse ${className}`} style={style} />
        );
    }

    return (
        <img
            src={src}
            onError={() => setStatus('error')}
            alt={alt || ""}
            className={className}
            style={style}
            {...props}
        />
    );
};

const MiniPostViewer: React.FC<MiniPostViewerProps> = ({
    title,
    titleStyles = {},
    styles = {}, // ✨ Default empty styles
    blocks = [],
    stickers = [],
    floatingTexts = [],
    floatingImages = [],
    scale = 1,
    minHeight = 'auto',
    hideTitle = false, // ✨ Default false
    preserveTitleSpace = false,
    paddingClass = 'px-12' // ✨ Default padding
}) => {
    const ORIGINAL_WIDTH = 800; // 에디터 기준 너비

    // ✨ Restore helper function
    const getSafeStyle = (item: any, defaultSize = 150) => {
        const x = item.x ?? item.left ?? 0;
        const y = item.y ?? item.top ?? 0;
        const width = item.w ?? item.width ?? defaultSize;
        const height = item.h ?? item.height ?? 'auto';

        return {
            position: 'absolute' as const,
            left: `${x}px`,
            top: `${y}px`,
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height,
            transform: `rotate(${item.rotation || 0}deg)`,
            zIndex: item.zIndex || 10,
            opacity: item.opacity ?? 1,
        };
    };

    return (
        <div
            // ✨ overflow-hidden 제거: 부모(CommunityCard)에서 스크롤 처리
            className="origin-top-left bg-white shadow-sm relative select-none"
            style={{
                width: `${ORIGINAL_WIDTH}px`,
                minHeight: minHeight,
                height: 'auto',
                zoom: scale,
                ...styles, // ✨ Apply paper styles (background, etc.)
                position: 'relative', // Ensure relative positioning for absolute children
            }}
        >

            {/* 本文 블록 */}
            <div className={`${paddingClass} pb-20 space-y-6 relative z-0`}>
                {blocks.map((block, index) => {
                    const textStyle = {
                        fontFamily: block.styles?.fontFamily || 'sans-serif',
                        fontSize: block.styles?.fontSize || '18px',
                        fontWeight: block.styles?.fontWeight || 'normal',
                        textAlign: block.styles?.textAlign as any || 'left',
                        color: block.styles?.color || '#333',
                        backgroundColor: block.styles?.backgroundColor || 'transparent',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                    };

                    const imgHeight = block.styles?.imageHeight || '350px';
                    const imgFit = block.imageFit || 'cover';

                    return (
                        <div key={`block-${block.id || 'none'}-${index}`} className="relative">
                            {block.type === 'image-full' && (
                                <div className="space-y-3">
                                    <SafeImage src={block.imageUrl} className="w-full rounded-lg bg-gray-100" style={{ height: imgHeight, objectFit: imgFit }} />
                                    {block.text && <div style={textStyle}>{block.text}</div>}
                                </div>
                            )}

                            {block.type === 'image-double' && (
                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <SafeImage src={block.imageUrl} className="w-1/2 rounded-lg bg-gray-100" style={{ height: imgHeight, objectFit: imgFit }} />
                                        <SafeImage src={block.imageUrl2} className="w-1/2 rounded-lg bg-gray-100" style={{ height: imgHeight, objectFit: imgFit }} />
                                    </div>
                                    {block.text && <div style={textStyle}>{block.text}</div>}
                                </div>
                            )}

                            {(block.type === 'image-left' || block.type === 'image-right') && (
                                <div className={`flex gap-6 items-start ${block.type === 'image-right' ? 'flex-row-reverse' : ''}`}>
                                    <SafeImage src={block.imageUrl} className="w-1/2 rounded-lg bg-gray-100 flex-shrink-0" style={{ height: imgHeight, objectFit: imgFit }} />
                                    <div className="flex-1 min-w-0 pt-1" style={textStyle}>{block.text}</div>
                                </div>
                            )}

                            {block.type === 'paragraph' && (
                                <div style={{
                                    ...textStyle,
                                    padding: '8px',
                                    minHeight: '75px', // ✨ Match Editor min-height
                                    borderRadius: '4px'
                                }}>
                                    {block.text || <span className="opacity-0">Empty</span>}
                                </div>
                            )}

                            {/* ✨ Bullet List Support */}
                            {block.type === 'bullet-list' && (
                                <div style={{
                                    ...textStyle,
                                    padding: '8px',
                                    minHeight: '75px',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}>
                                    {((block as any).content?.items || []).map((it: string, i: number) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <span className="select-none">•</span>
                                            <div className="flex-1 min-w-0 break-words">{it}</div>
                                        </div>
                                    ))}
                                    {(!((block as any).content?.items) || (block as any).content?.items.length === 0) && <span className="opacity-0">Empty List</span>}
                                </div>
                            )}

                            {/* ✨ Number List Support */}
                            {block.type === 'number-list' && (
                                <div style={{
                                    ...textStyle,
                                    padding: '8px',
                                    minHeight: '75px',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}>
                                    {((block as any).content?.items || []).map((it: string, i: number) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <span className="select-none min-w-[1.2em]">{i + 1}.</span>
                                            <div className="flex-1 min-w-0 break-words">{it}</div>
                                        </div>
                                    ))}
                                    {(!((block as any).content?.items) || (block as any).content?.items.length === 0) && <span className="opacity-0">Empty List</span>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 3. 자유 배치 요소들 */}
            {stickers.map((stk, index) => {


                if (stk.widgetType) {
                    return (
                        <div
                            key={`stk-${stk.id || 'none'}-${index}`}
                            style={{
                                ...getSafeStyle(stk, 120),
                                pointerEvents: 'none'
                            }}
                        >
                            <Suspense fallback={<div className="w-full h-full bg-gray-100 animate-pulse rounded-xl" />}>
                                {stk.widgetType.startsWith('custom-') ? (
                                    <CustomWidgetPreview
                                        content={stk.widgetProps?.content || {}}
                                        defaultSize={stk.widgetProps?.defaultSize || "2x2"}
                                    />
                                ) : (
                                    (() => {
                                        const WidgetComp = WIDGET_COMPONENT_MAP[stk.widgetType];
                                        return WidgetComp ? <WidgetComp {...stk.widgetProps} /> : null;
                                    })()
                                )}
                            </Suspense>
                        </div>
                    );
                }

                return (
                    <SafeImage
                        key={`stk-${stk.id || 'none'}-${index}`}
                        src={stk.url}
                        style={{
                            ...getSafeStyle(stk, 120),
                            pointerEvents: 'none'
                        }}
                        alt="sticker"
                    />
                );
            })}

            {floatingImages.map((img, index) => (
                <SafeImage
                    key={`img-${img.id || 'none'}-${index}`}
                    src={img.url}
                    style={{
                        ...getSafeStyle(img, 200),
                        objectFit: 'cover',
                        borderRadius: '8px',
                        pointerEvents: 'none'
                    }}
                    alt="floating"
                />
            ))}

            {floatingTexts.map((txt, index) => (
                <div
                    key={`txt-${txt.id || 'none'}-${index}`}
                    style={{
                        ...getSafeStyle(txt, 200),
                        padding: '8px',
                        fontFamily: txt.styles?.fontFamily,
                        fontSize: txt.styles?.fontSize || '16px',
                        fontWeight: txt.styles?.fontWeight || 'normal',
                        color: txt.styles?.color || '#000',
                        backgroundColor: txt.styles?.backgroundColor || 'transparent',
                        textAlign: txt.styles?.textAlign as any || 'left',
                        fontStyle: txt.styles?.fontStyle || 'normal',
                        textDecoration: txt.styles?.textDecoration || 'none',
                        whiteSpace: 'pre-wrap',
                        overflow: 'hidden',
                        wordBreak: 'break-word'
                    }}
                >
                    {txt.text}
                </div>
            ))}
        </div>
    );
};

export default React.memo(MiniPostViewer);