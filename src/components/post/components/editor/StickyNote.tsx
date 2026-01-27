import React, { useRef, useState, useEffect } from 'react';
import { Pencil, Check, Settings2 } from 'lucide-react'; // ✨ Icons for mode toggle
import type { FloatingText } from '../../types';

interface Props {
    item: FloatingText;
    scale: number; // Global canvas scale for event correction
    isSelected: boolean;
    isCropping: boolean;
    readOnly: boolean;
    onUpdate: (changes: Partial<FloatingText>) => void;
    onSelect: () => void;
}

const StickyNote: React.FC<Props> = ({ item, scale, isSelected, isCropping, readOnly, onUpdate, onSelect }) => {
    // Text Effect State
    // Text Effect State
    // Text Effect State
    const [isTextMode, setIsTextMode] = useState(false); // ✨ Explicit Text Mode
    const [showPoints, setShowPoints] = useState(false); // ✨ Control Points Visibility
    const [dimensions, setDimensions] = useState({ w: 200, h: 200 });

    const containerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null); // ✨ Ref for focus control

    useEffect(() => {
        if (containerRef.current) {
            setDimensions({
                w: containerRef.current.offsetWidth,
                h: containerRef.current.offsetHeight
            });
        }
    }, []);

    // Resize Observer to keep dimensions updated
    useEffect(() => {
        if (!containerRef.current) return;
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setDimensions({
                    w: entry.contentRect.width,
                    h: entry.contentRect.height
                });
            }
        });
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    const textEffect = item.styles.textEffect || 'none';
    const hasEffect = textEffect !== 'none';

    // Interactive Points State
    const [draggingPointIndex, setDraggingPointIndex] = useState<number | null>(null);

    // Initialize Points if needed
    useEffect(() => {
        if (!hasEffect) return;

        // If points exist and match current effect, use them. 
        // (Simple check: Curve needs 3, Wave needs 4?)
        // Let's rely on existence for now.
        if (item.styles.textPathPoints && item.styles.textPathPoints.length > 0) return;

        // Initialize defaults based on dimensions
        const { w, h } = dimensions;
        if (w === 0 || h === 0) return;

        const midY = h / 2;
        let newPoints: { x: number, y: number }[] = [];

        if (textEffect === 'curve') {
            // Start, Control, End
            newPoints = [
                { x: 0, y: midY + h * 0.2 },
                { x: w / 2, y: midY - h * 0.5 },
                { x: w, y: midY + h * 0.2 }
            ];
        } else if (textEffect === 'wave') {
            // Quad Spline? Or Cubic? Let's use Cubic Bezier (4 points: Start, C1, C2, End)
            // Or Multiple Quads? standard SVG TextPath often works best with simple paths.
            // Let's use a series of points for a poly-bezier or Catmull-Rom?
            // User wants "Add points". A Polyline that is smoothed?
            // Simplest for "Wave": Start, Peak1, Peak2, End. (4 points)
            newPoints = [
                { x: 0, y: midY },
                { x: w * 0.33, y: midY - h * 0.3 },
                { x: w * 0.66, y: midY + h * 0.3 },
                { x: w, y: midY }
            ];
        } else if (textEffect === 'double-wave') {
            // 3 Control Points Effect (Total 5 points)
            // Start(0), C1(1), Mid(2), C2(3), End(4)
            // Creates two quadratic curves connected at Mid.
            newPoints = [
                { x: 0, y: midY },
                { x: w * 0.25, y: midY - h * 0.3 }, // Peak 1
                { x: w * 0.5, y: midY },            // Mid Anchor
                { x: w * 0.75, y: midY + h * 0.3 }, // Peak 2 (Valley)
                { x: w, y: midY }
            ];
        }

        if (newPoints.length > 0) {
            onUpdate({ styles: { ...item.styles, textPathPoints: newPoints } });
        }
    }, [textEffect, dimensions.w, dimensions.h]);

    // Construct Path from Points
    const getPathFromPoints = (points: { x: number, y: number }[]) => {
        if (!points || points.length < 2) return '';

        // Simple Quadratic Bezier Chain?
        // If 3 points: Q
        // If 4 points: C? Or Q chain?
        // Let's use a simple smoothed line logic or specific logic based on count.

        const p = points;

        if (p.length === 3) {
            // 1 Control Point: Quadratic
            return `M ${p[0].x},${p[0].y} Q ${p[1].x},${p[1].y} ${p[2].x},${p[2].y}`;
        }

        if (p.length === 4) {
            // 2 Control Points: Cubic
            return `M ${p[0].x},${p[0].y} C ${p[1].x},${p[1].y} ${p[2].x},${p[2].y} ${p[3].x},${p[3].y}`;
        }

        if (p.length === 5) {
            // 3 Control Points (Visual): Two Quadratic Curves
            // M P0 Q P1 P2 Q P3 P4
            return `M ${p[0].x},${p[0].y} Q ${p[1].x},${p[1].y} ${p[2].x},${p[2].y} Q ${p[3].x},${p[3].y} ${p[4].x},${p[4].y}`;
        }

        // For more points, just connect with lines or generic curve? 
        // Let's stick to C for Wave (4 points).
        // If user adds points... we need a generic spline generator.
        // For now, MVP: 3 or 4 points.
        return '';
    };

    const currentPoints = item.styles.textPathPoints || [];
    const pathD = getPathFromPoints(currentPoints);
    const pathId = `curve-path-${item.id}`;

    // Handle Point Dragging
    const handlePointMouseDown = (e: React.MouseEvent, index: number) => {
        e.stopPropagation(); // Don't drag the note
        e.preventDefault();
        setDraggingPointIndex(index);
    };

    // ✨ Refs for stable event handlers
    const currentPointsRef = useRef(currentPoints);
    const itemStylesRef = useRef(item.styles);

    useEffect(() => {
        currentPointsRef.current = currentPoints;
        itemStylesRef.current = item.styles;
    }, [currentPoints, item.styles]);

    // Global Mouse Move for Point Drag
    useEffect(() => {
        if (draggingPointIndex === null) return;

        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();

            // Simpler: Just map mouse to container-local coordinates.
            let localX = (e.clientX - rect.left) * (dimensions.w / rect.width);
            let localY = (e.clientY - rect.top) * (dimensions.h / rect.height);

            // ✨ Clamp to boundaries
            localX = Math.max(0, Math.min(dimensions.w, localX));
            localY = Math.max(0, Math.min(dimensions.h, localY));

            const pointsSnapshot = currentPointsRef.current;
            const stylesSnapshot = itemStylesRef.current;

            const newPoints = [...pointsSnapshot];
            if (newPoints[draggingPointIndex]) {
                newPoints[draggingPointIndex] = { x: localX, y: localY };
                onUpdate({ styles: { ...stylesSnapshot, textPathPoints: newPoints } });
            }
        };

        const handleGlobalMouseUp = () => {
            setDraggingPointIndex(null);
        };

        window.addEventListener('mousemove', handleGlobalMouseMove);
        window.addEventListener('mouseup', handleGlobalMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [draggingPointIndex, dimensions, onUpdate]); // ✨ Removed currentPoints, item.styles dependencies

    const [imageRef, setImageRef] = useState<{ w: number, h: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0, initialX: 0, initialY: 0, containerW: 0, containerH: 0 });
    // const containerRef = useRef<HTMLDivElement>(null); // Original definition, now moved up

    // Transform Data
    const transform = item.imageTransform || { x: 0, y: 0, scale: 1 };
    const fitMode = item.imageFit || 'cover';

    // Image Load Handler
    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        setImageRef({ w: naturalWidth, h: naturalHeight });
    };

    // Refs for event handlers to avoid dependency loops
    const transformRef = useRef(transform);
    const scaleRef = useRef(scale);
    const imageInfoRef = useRef(imageRef);
    const fitModeRef = useRef(fitMode);

    useEffect(() => {
        transformRef.current = transform;
        scaleRef.current = scale;
        imageInfoRef.current = imageRef;
        fitModeRef.current = fitMode;
    }, [transform, scale, imageRef, fitMode]);

    // Calculate Clamped Transform
    const getClampedTransform = (current: { x: number, y: number, scale: number }, containerW: number, containerH: number) => {
        const s = current.scale;

        // Use refs for calculation to ensure stability if called from event
        // But here we are passed 'current' which is the *proposed* transform
        // We need image dimensions to calculate limits
        const imgInfo = imageInfoRef.current;
        const mode = fitModeRef.current;

        let baseW = containerW;
        let baseH = containerH;

        if (imgInfo) {
            const containerRatio = containerW / containerH;
            const imageRatio = imgInfo.w / imgInfo.h;

            if (mode === 'cover') {
                if (imageRatio > containerRatio) {
                    baseH = containerH;
                    baseW = containerH * imageRatio;
                } else {
                    baseW = containerW;
                    baseH = containerW / imageRatio;
                }
            } else {
                // Contain mode
                if (imageRatio > containerRatio) {
                    baseW = containerW;
                    baseH = containerW / imageRatio;
                } else {
                    baseH = containerH;
                    baseW = containerH * imageRatio;
                }
            }
        }

        const rW = baseW * s;
        const rH = baseH * s;

        let maxX = 0;
        let maxY = 0;

        // Only allow panning if image is larger than container in that dimension
        if (rW > containerW) {
            maxX = (rW - containerW) / 2;
        }
        if (rH > containerH) {
            maxY = (rH - containerH) / 2;
        }

        // Strict clamping (No buffer)
        let { x, y } = current;

        if (x > maxX) x = maxX;
        if (x < -maxX) x = -maxX;
        if (y > maxY) y = maxY;
        if (y < -maxY) y = -maxY;

        return { x, y, scale: s };
    };

    // Panning Handler
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isCropping) return;
        e.stopPropagation();
        e.preventDefault();
        setIsDragging(true);

        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            initialX: transform.x,
            initialY: transform.y,
            containerW: rect.width,
            containerH: rect.height
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !isCropping) return;
            e.preventDefault();

            const currentScale = scaleRef.current;
            const currentTransform = transformRef.current;

            const dx = (e.clientX - dragStartRef.current.x) / currentScale;
            const dy = (e.clientY - dragStartRef.current.y) / currentScale;

            const targetX = dragStartRef.current.initialX + dx;
            const targetY = dragStartRef.current.initialY + dy;

            const currentContainerW = containerRef.current?.offsetWidth || 200;
            const currentContainerH = containerRef.current?.offsetHeight || 200;

            const clampedClean = getClampedTransform(
                { x: targetX, y: targetY, scale: currentTransform.scale },
                currentContainerW,
                currentContainerH
            );

            onUpdate({ imageTransform: clampedClean });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isCropping]); // dependency removed for transform/scale


    // Styles reconstruction
    const hasBgImage = !!item.styles.backgroundImage;

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative overflow-hidden"
            style={{ borderRadius: 'inherit' }} // Inherit rounded corners
            onClick={(e) => {
                if (isSelected) {
                    e.stopPropagation();
                }
            }}
            onMouseDown={(e) => e.stopPropagation()} // ✨ Stop drag propagation from body
        >
            {/* Background Image Layer */}
            {hasBgImage && (
                <div
                    className={`absolute inset-0 z-0 ${isCropping ? 'cursor-move' : ''}`}
                    onMouseDown={handleMouseDown}
                >
                    <img
                        src={item.styles.backgroundImage}
                        onLoad={handleImageLoad}
                        alt=""
                        className={`w-full h-full pointer-events-none ${fitMode === 'contain' ? 'object-contain' : 'object-cover'}`}
                        style={{
                            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                            transition: isDragging ? 'none' : 'transform 0.1s'
                        }}
                    />
                </div>
            )}



            {/* ✨ Edit Mode Toggle Buttons (Visible when selected and has effect) */}
            {hasEffect && isSelected && (
                <div className="absolute top-2 right-2 z-50 flex gap-2">
                    {/* Curve Point Toggle */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowPoints(!showPoints);
                            if (!showPoints) setIsTextMode(false); // Turn off text mode if showing points
                        }}
                        className={`p-1.5 rounded-full shadow-md border border-gray-200 transition-transform hover:scale-105 ${showPoints ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        title={showPoints ? "곡선 편집 종료" : "곡선 편집"}
                    >
                        <Settings2 size={14} />
                    </button>

                    {/* Text Edit Toggle */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isTextMode) {
                                setIsTextMode(false);
                                textareaRef.current?.blur();
                            } else {
                                setIsTextMode(true);
                                setShowPoints(false); // Hide points when typing
                                setTimeout(() => textareaRef.current?.focus(), 10);
                            }
                        }}
                        className={`p-1.5 rounded-full shadow-md border border-gray-200 transition-transform hover:scale-105 ${isTextMode ? 'bg-green-50 text-green-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        title={isTextMode ? "입력 완료" : "텍스트 수정"}
                    >
                        {isTextMode ? <Check size={14} /> : <Pencil size={14} />}
                    </button>
                </div>
            )}

            {/* SVG Text Layer (Visible only when not editing text) */}
            {hasEffect && !isTextMode && (
                <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none overflow-visible">
                    <defs>
                        <path id={pathId} d={pathD} fill="transparent" />
                    </defs>

                    {/* Visual Guide Lines for Control Points */}
                    {!isTextMode && showPoints && (
                        <path
                            d={`M ${currentPoints.map(p => `${p.x},${p.y}`).join(' L ')}`}
                            fill="none"
                            stroke="rgba(0,0,0,0.1)"
                            strokeWidth="1"
                            strokeDasharray="4 2"
                        />
                    )}

                    <text
                        width="100%"
                        style={{
                            fontFamily: item.styles.fontFamily,
                            fontSize: item.styles.fontSize,
                            fontWeight: item.styles.fontWeight || 'normal',
                            fill: item.styles.color,
                            fontStyle: item.styles.fontStyle || 'normal',
                            textDecoration: item.styles.textDecoration || 'none',
                        }}
                        textAnchor="middle" // Center align on path
                    >
                        <textPath xlinkHref={`#${pathId}`} startOffset="50%">
                            {item.text}
                        </textPath>
                    </text>

                    {/* Control Points Handles */}
                    {!isTextMode && showPoints && currentPoints.map((p, index) => ( // Only show points if showPoints is true
                        <circle
                            key={index}
                            cx={p.x}
                            cy={p.y}
                            r={index === 0 || index === currentPoints.length - 1 ? 8 : 6} // Endpoints larger
                            fill={index === 0 || index === currentPoints.length - 1 ? "#3b82f6" : "#ffffff"} // Blue for ends, White for controls
                            stroke="#3b82f6"
                            strokeWidth="2"
                            className="cursor-move pointer-events-auto" // Removed hover scale
                            onMouseDown={(e) => handlePointMouseDown(e, index)}
                        />
                    ))}
                </svg>
            )
            }

            {/* Text Layer - Textarea */}
            <textarea
                ref={textareaRef}
                value={item.text}
                onChange={(e) => onUpdate({ text: e.target.value })}
                onFocus={() => {
                    // ✨ Explicit Text Mode Only: Don't auto-enable on focus
                }}
                onBlur={() => {
                    setIsTextMode(false); // Exit text mode on blur
                }}
                // Pointer events: If has effect, only allow interaction if in text mode. Otherwise none (allows dragging points).
                className={`w-full h-full bg-transparent outline-none resize-none p-2 overflow-hidden relative z-20 ${isSelected ? (isCropping || (hasEffect && !isTextMode) ? 'pointer-events-none' : 'pointer-events-auto') : 'cursor-text'}`}
                style={{
                    fontFamily: item.styles.fontFamily,
                    fontSize: item.styles.fontSize,
                    fontWeight: item.styles.fontWeight || 'normal',
                    textAlign: item.styles.textAlign as any,
                    color: hasEffect && !isTextMode ? 'transparent' : item.styles.color,
                    backgroundColor: 'transparent',
                    fontStyle: item.styles.fontStyle || 'normal',
                    textDecoration: item.styles.textDecoration || 'none',
                    opacity: hasEffect && !isTextMode ? 0 : 1,
                }}
                readOnly={readOnly}
                onClick={(e) => {
                    e.stopPropagation();
                    // If effect is active and NOT in text mode, do nothing (pass through to container select).
                    // Actually pointer-events-none handles this.
                    // If in text mode, standard behavior.
                    if (!isSelected) {
                        onSelect();
                    }
                }}
            />
            {/* If background color is set AND background image is not, show color. */}
            {
                !hasBgImage && item.styles.backgroundColor && (
                    <div className="absolute inset-0 -z-10" style={{ backgroundColor: item.styles.backgroundColor }} />
                )
            }
        </div >
    );
};

export default StickyNote;
