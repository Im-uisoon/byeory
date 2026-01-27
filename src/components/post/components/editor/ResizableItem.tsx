import React, { useRef, useState, useEffect } from 'react';
import { Move } from 'lucide-react'; // ✨ Import Move Icon

interface Props {
    id: string;
    x: number | string;
    y: number | string;
    w: number | string;
    h: number | string;
    rotation: number;
    zIndex: number;
    isSelected: boolean;
    readOnly: boolean;
    onSelect: (isMulti?: boolean) => void;
    onUpdate: (changes: any) => void;
    onDoubleClick?: () => void;
    opacity?: number;
    // ✨ Crop Support
    isCropping?: boolean;
    crop?: {
        contentX: number;
        contentY: number;
        contentW: number;
        contentH: number;
    };
    scale?: number; // ✨ Added scale support
    minY?: number; // ✨ Minimum Y boundary
    children: React.ReactNode;
}

const ResizableItem: React.FC<Props> = ({
    id, x, y, w, h, rotation, zIndex, opacity = 1, isSelected, readOnly, onSelect, onUpdate, onDoubleClick, children,
    isCropping = false, crop, scale = 1, minY = 0
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const [isPanning, setIsPanning] = useState(false); // ✨ Panning State
    const elementRef = useRef<HTMLDivElement>(null);

    // 드래그 시작 시점의 상태 저장
    const startPos = useRef({
        startX: 0, startY: 0,
        initialX: 0, initialY: 0,
        initialW: 0, initialH: 0,
        initialRotate: 0,
        centerX: 0, centerY: 0,
        // ✨ Panning Initial State
        initialContentX: 0, initialContentY: 0,
        initialContentW: 0, initialContentH: 0
    });

    // ✨ Handle Item Move OR Content Pan
    const handleMoveStart = (e: React.MouseEvent) => {
        if (readOnly) return;

        const target = e.target as HTMLElement;
        if (['textarea', 'input', 'button', 'select'].includes(target.tagName.toLowerCase())) {
            return;
        }

        e.stopPropagation();
        e.preventDefault();
        onSelect(e.shiftKey);

        if (isCropping && crop) {
            // ✨ Pan Mode
            setIsPanning(true);
            startPos.current = {
                ...startPos.current,
                startX: e.clientX,
                startY: e.clientY,
                initialContentX: crop.contentX,
                initialContentY: crop.contentY
            };
        } else {
            // ✨ Move Mode
            setIsDragging(true);
            const currentX = elementRef.current?.offsetLeft || 0;
            const currentY = elementRef.current?.offsetTop || 0;

            startPos.current = {
                ...startPos.current,
                startX: e.clientX,
                startY: e.clientY,
                initialX: currentX,
                initialY: currentY
            };
        }
    };

    const handleResizeStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(true);
        const currentW = typeof w === 'number' ? w : parseFloat(w);
        const currentH = typeof h === 'number' ? h : parseFloat(h);

        startPos.current = {
            ...startPos.current,
            startX: e.clientX,
            startY: e.clientY,
            initialX: Number(x),
            initialY: Number(y),
            initialW: currentW,
            initialH: currentH,
            initialContentX: crop?.contentX || 0,
            initialContentY: crop?.contentY || 0,
            initialContentW: crop?.contentW || currentW,
            initialContentH: crop?.contentH || currentH
        };
    };

    const handleRotateStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIsRotating(true);
        const rect = elementRef.current?.getBoundingClientRect();
        if (rect) {
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            startPos.current = {
                ...startPos.current,
                centerX, centerY,
                initialRotate: rotation
            };
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const deltaX = (e.clientX - startPos.current.startX) / scale;
                const deltaY = (e.clientY - startPos.current.startY) / scale;

                let newX = startPos.current.initialX + deltaX;
                let newY = startPos.current.initialY + deltaY;

                // ✨ Boundary Clamping
                if (elementRef.current && elementRef.current.parentElement) {
                    const parentWidth = elementRef.current.parentElement.clientWidth;
                    const parentHeight = elementRef.current.parentElement.clientHeight;
                    const itemWidth = elementRef.current.offsetWidth;
                    const itemHeight = elementRef.current.offsetHeight;

                    // Clamp X
                    if (newX < 0) newX = 0;
                    if (newX + itemWidth > parentWidth) newX = parentWidth - itemWidth;

                    // Clamp Y (Only top and bottom if needed, but usually we just clamp to positive Y)
                    if (newY < minY) newY = minY;
                    if (newY + itemHeight > parentHeight) newY = parentHeight - itemHeight;
                }

                onUpdate({
                    x: newX,
                    y: newY
                });
            } else if (isPanning && crop) {
                // ✨ Update Content Position (Pan)
                const deltaX = (e.clientX - startPos.current.startX) / scale;
                const deltaY = (e.clientY - startPos.current.startY) / scale;

                const newContentX = startPos.current.initialContentX + deltaX;
                const newContentY = startPos.current.initialContentY + deltaY;

                onUpdate({
                    crop: {
                        ...crop,
                        contentX: newContentX,
                        contentY: newContentY
                    }
                });

            } else if (isResizing) {
                const deltaX = (e.clientX - startPos.current.startX) / scale;
                const deltaY = (e.clientY - startPos.current.startY) / scale;

                const newW = Math.max(30, startPos.current.initialW + deltaX);
                const newH = Math.max(30, startPos.current.initialH + deltaY);

                if (!isCropping && crop) {
                    // ✨ Proportional Scaling: Scale content along with viewport
                    // Use initial values to avoid cumulative error
                    const ratioW = newW / startPos.current.initialW;
                    const ratioH = newH / startPos.current.initialH;

                    onUpdate({
                        w: newW,
                        h: newH,
                        crop: {
                            ...crop,
                            contentX: startPos.current.initialContentX * ratioW,
                            contentY: startPos.current.initialContentY * ratioH,
                            contentW: startPos.current.initialContentW * ratioW,
                            contentH: startPos.current.initialContentH * ratioH
                        }
                    });
                } else {
                    onUpdate({
                        w: newW,
                        h: newH
                    });
                }
            } else if (isRotating) {
                const { centerX, centerY } = startPos.current;
                const radians = Math.atan2(e.clientY - centerY, e.clientX - centerX);
                const degrees = radians * (180 / Math.PI);
                onUpdate({ rotation: degrees + 90 });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
            setIsRotating(false);
            setIsPanning(false);
        };

        if (isDragging || isResizing || isRotating || isPanning) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, isRotating, isPanning, onUpdate, crop]);

    // ✨ Compute Inner Content Style
    const contentStyle: React.CSSProperties = crop ? {
        position: 'absolute',
        left: crop.contentX,
        top: crop.contentY,
        width: crop.contentW,
        height: crop.contentH
    } : {
        width: '100%',
        height: '100%'
    };

    return (
        <div
            ref={elementRef}
            id={id}
            className={`absolute group`}
            style={{
                left: typeof x === 'number' ? `${x}px` : x,
                top: typeof y === 'number' ? `${y}px` : y,
                width: typeof w === 'number' ? `${w}px` : w,
                height: typeof h === 'number' ? `${h}px` : h,
                transform: `rotate(${rotation}deg)`,
                zIndex: zIndex,
                opacity: opacity,
                cursor: readOnly ? 'default' : (isCropping ? 'move' : 'default'), // ✨ Cursor changed for pan mode
                touchAction: 'none'
            }}
            onMouseDown={handleMoveStart}
            onClick={(e) => {
                e.stopPropagation();
                onSelect(e.shiftKey);
            }}
            onDoubleClick={(e) => {
                e.stopPropagation();
                if (onDoubleClick) onDoubleClick();
            }}
        >
            {/* ✨ Viewport: This handles the clipping for cropping */}
            <div className={`w-full h-full relative ${isSelected && !readOnly ? (isCropping ? 'ring-2 ring-blue-500' : 'ring-2 ring-indigo-500') : ''} overflow-hidden rounded-[calc(inherit-4px)]`}>
                {/* ✨ Inner Content Wrapper with Crop Logic */}
                <div
                    className="pointer-events-auto"
                    style={contentStyle}
                >
                    {children}
                </div>

                {/* ✨ Ghost Overlay for Panning Feedback */}
                {isCropping && crop && (
                    <div
                        className="absolute border border-blue-400 pointer-events-none"
                        style={{
                            left: crop.contentX,
                            top: crop.contentY,
                            width: crop.contentW,
                            height: crop.contentH,
                            opacity: 0.5
                        }}
                    />
                )}
            </div>

            {/* ✨ Handles: Now rendered OUTSIDE the overflow-hidden div */}
            {isSelected && !readOnly && (
                <>
                    {/* 크기 조절 핸들 (우측 하단) */}
                    <div
                        onMouseDown={handleResizeStart}
                        className={`absolute -bottom-3 -right-3 w-6 h-6 bg-white border-2 rounded-full cursor-se-resize z-[100] shadow-md hover:scale-110 transition flex items-center justify-center
                            ${isCropping ? 'border-blue-500' : 'border-indigo-500'}
                        `}
                        title={isCropping ? "영역 조절" : "크기 조절"}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${isCropping ? 'bg-blue-500' : 'bg-indigo-500'}`} />
                    </div>

                    {/* 회전 핸들 (상단 중앙) */}
                    <div
                        onMouseDown={handleRotateStart}
                        className={`absolute -top-10 left-1/2 -translate-x-1/2 w-8 h-8 bg-white border-2 rounded-full cursor-grab z-[100] flex items-center justify-center shadow-md hover:scale-110 transition
                            ${isCropping ? 'border-blue-500 text-blue-600' : 'border-indigo-500 text-indigo-700'}
                        `}
                        title="회전"
                    >
                        <span className="text-xs font-bold font-mono">↻</span>
                    </div>

                    {!isCropping && (
                        /* 이동 핸들 */
                        <div
                            onMouseDown={handleMoveStart}
                            className="absolute -top-10 left-1/2 translate-x-[20px] w-8 h-8 bg-indigo-500 text-white border-2 border-indigo-500 rounded-full cursor-move z-[100] flex items-center justify-center shadow-md hover:bg-indigo-600 hover:scale-110 transition"
                            title="이동"
                        >
                            <Move size={14} strokeWidth={3} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ResizableItem;