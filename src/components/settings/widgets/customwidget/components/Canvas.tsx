import React, { useRef, useEffect } from 'react';
import { Smartphone, ArrowUp, ArrowDown, RotateCw } from 'lucide-react'; // ✨ Added RotateCw
import type { WidgetBlock, WidgetSize, WidgetDecoration } from '../types';
import { getSvgPathFromPoints, generateBlobPoints } from '../utils';
import DraggableBlockItem from './Rendercomponent/DraggableBlockItem';

interface Props {
    blocks: WidgetBlock[];
    currentSize: WidgetSize;
    selectedBlockId: string | null;
    onSelectBlock: (id: string | null) => void;
    onRemoveBlock: (id: string) => void;
    onUpdateBlock: (id: string, updates: any) => void;
    decorations: WidgetDecoration[];
    selectedDecorationId: string | null;
    onSelectDecoration: (id: string | null) => void;
    updateDecoration: (id: string, updates: Partial<WidgetDecoration>) => void;
    onOpenSettings?: () => void;
    croppingId: string | null; // ✨ NEW
}

const Canvas: React.FC<Props> = (props) => {
    const {
        blocks,
        currentSize,
        selectedBlockId,
        onSelectBlock,
        onRemoveBlock,
        onUpdateBlock,
        decorations,
        selectedDecorationId,
        onSelectDecoration,
        updateDecoration,
        onOpenSettings,
        croppingId // ✨ NEW
    } = props;

    const blockDragRef = useRef<{
        id: string | null;
        startX: number;
        startY: number;
        initialX: number;
        initialY: number;
    }>({ id: null, startX: 0, startY: 0, initialX: 50, initialY: 50 });

    const handleBlockMouseDown = (e: React.MouseEvent, block: WidgetBlock) => {
        e.stopPropagation();
        onSelectBlock(block.id);

        const layout = block.layout || { x: 50, y: 50, w: 100, h: 'auto', rotation: 0, zIndex: 1 };

        blockDragRef.current = {
            id: block.id,
            startX: e.clientX,
            startY: e.clientY,
            initialX: typeof layout.x === 'number' ? layout.x : 50,
            initialY: typeof layout.y === 'number' ? layout.y : 50,
        };

        window.addEventListener('mousemove', handleBlockMouseMove);
        window.addEventListener('mouseup', handleBlockMouseUp);
    };

    const handleBlockMouseMove = (e: MouseEvent) => {
        if (!blockDragRef.current.id) return;

        const { startX, startY, initialX, initialY, id } = blockDragRef.current;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        const canvasW = currentSize.w || 1;
        const canvasH = currentSize.h || 1;

        const deltaXPercent = (deltaX / canvasW) * 100;
        const deltaYPercent = (deltaY / canvasH) * 100;

        const currentBlock = blocks.find(b => b.id === id);
        if (!currentBlock) return;

        const newX = initialX + deltaXPercent;
        const newY = initialY + deltaYPercent;

        // ✨ Boundary Constraint (0% - 100%)
        const constrainedX = Math.max(0, Math.min(100, newX));
        const constrainedY = Math.max(0, Math.min(100, newY));

        onUpdateBlock(id, {
            layout: {
                ...currentBlock.layout,
                x: constrainedX,
                y: constrainedY,
            }
        });
    };

    const handleBlockMouseUp = () => {
        blockDragRef.current.id = null;
        window.removeEventListener('mousemove', handleBlockMouseMove);
        window.removeEventListener('mouseup', handleBlockMouseUp);
    };

    const dragRef = useRef<{
        id: string | null;
        startX: number;
        startY: number;
        initialDecoX: number;
        initialDecoY: number;
    }>({ id: null, startX: 0, startY: 0, initialDecoX: 50, initialDecoY: 50 });

    // ✨ Rotation Ref
    const rotationDragRef = useRef<{
        id: string | null;
        startAngle: number;
        initialRotation: number;
        centerX: number;
        centerY: number;
    }>({ id: null, startAngle: 0, initialRotation: 0, centerX: 0, centerY: 0 });

    const handleDecoMouseDown = (e: React.MouseEvent, deco: WidgetDecoration) => {
        e.stopPropagation();
        e.preventDefault();
        onSelectDecoration(deco.id);

        // ✨ Pan Mode Check
        if (croppingId === deco.id && deco.crop) {
            panRef.current = {
                id: deco.id,
                startX: e.clientX,
                startY: e.clientY,
                initialContentX: deco.crop.contentX,
                initialContentY: deco.crop.contentY,
                initialContentW: deco.crop.contentW,
                initialContentH: deco.crop.contentH
            };
            window.addEventListener('mousemove', handlePanMouseMove);
            window.addEventListener('mouseup', handlePanMouseUp);
            return;
        }

        dragRef.current = {
            id: deco.id,
            startX: e.clientX,
            startY: e.clientY,
            initialDecoX: deco.x,
            initialDecoY: deco.y,
        };

        window.addEventListener('mousemove', handleDecoMouseMove);
        window.addEventListener('mouseup', handleDecoMouseUp);
    };

    // ✨ Rotation Handlers
    const handleRotateMouseDown = (e: React.MouseEvent, deco: WidgetDecoration) => {
        e.stopPropagation();
        e.preventDefault();

        const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate initial angle from center to mouse
        const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);

        rotationDragRef.current = {
            id: deco.id,
            startAngle,
            initialRotation: deco.rotation || 0,
            centerX,
            centerY
        };

        window.addEventListener('mousemove', handleRotateMouseMove);
        window.addEventListener('mouseup', handleRotateMouseUp);
    };

    const handleRotateMouseMove = (e: MouseEvent) => {
        const { id, startAngle, initialRotation, centerX, centerY } = rotationDragRef.current;
        if (!id) return;

        const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        const deltaAngle = currentAngle - startAngle;
        const newRotation = (initialRotation + deltaAngle) % 360;

        updateDecoration(id, { rotation: newRotation });
    };

    const handleRotateMouseUp = () => {
        rotationDragRef.current.id = null;
        window.removeEventListener('mousemove', handleRotateMouseMove);
        window.removeEventListener('mouseup', handleRotateMouseUp);
    };

    // ✨ Z-Index Handler
    const handleDecoZIndexChange = (e: React.MouseEvent, id: string, currentZ: number, delta: number) => {
        e.stopPropagation();
        const newZ = Math.max(0, (currentZ || 0) + delta);
        updateDecoration(id, { zIndex: newZ });
    };

    // ✨ Pan Handlers
    const panRef = useRef<{
        id: string | null;
        startX: number;
        startY: number;
        initialContentX: number;
        initialContentY: number;
        initialContentW: number;
        initialContentH: number;
    }>({ id: null, startX: 0, startY: 0, initialContentX: 0, initialContentY: 0, initialContentW: 0, initialContentH: 0 });

    const handlePanMouseMove = (e: MouseEvent) => {
        if (!panRef.current.id) return;
        const { startX, startY, initialContentX, initialContentY, initialContentW, initialContentH, id } = panRef.current;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        updateDecoration(id, {
            crop: {
                contentX: initialContentX + deltaX,
                contentY: initialContentY + deltaY,
                contentW: initialContentW,
                contentH: initialContentH
            }
        });
    };

    const handlePanMouseUp = () => {
        panRef.current.id = null;
        window.removeEventListener('mousemove', handlePanMouseMove);
        window.removeEventListener('mouseup', handlePanMouseUp);
    };

    const handleDecoMouseMove = (e: MouseEvent) => {
        if (!dragRef.current.id) return;
        const { startX, startY, initialDecoX, initialDecoY, id } = dragRef.current;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const width = currentSize.w || 1;
        const height = currentSize.h || 1;
        const deltaXPercent = (deltaX / width) * 100;
        const deltaYPercent = (deltaY / height) * 100;

        let newX = initialDecoX + deltaXPercent;
        let newY = initialDecoY + deltaYPercent;

        // ✨ Boundary Constraint (0% - 100%)
        newX = Math.max(0, Math.min(100, newX));
        newY = Math.max(0, Math.min(100, newY));

        updateDecoration(id, { x: newX, y: newY });
    };

    const handleDecoMouseUp = () => {
        dragRef.current.id = null;
        window.removeEventListener('mousemove', handleDecoMouseMove);
        window.removeEventListener('mouseup', handleDecoMouseUp);
    };

    const resizeRef = useRef<{
        id: string | null;
        startX: number;
        startY: number;
        initialW: number;
        initialH: number;
        initialX: number;
        initialY: number;
        handle: string;
    }>({ id: null, startX: 0, startY: 0, initialW: 0, initialH: 0, initialX: 0, initialY: 0, handle: '' });

    const handleResizeMouseDown = (e: React.MouseEvent, deco: WidgetDecoration, handle: string) => {
        e.stopPropagation();
        e.preventDefault();

        resizeRef.current = {
            id: deco.id,
            startX: e.clientX,
            startY: e.clientY,
            initialW: deco.w,
            initialH: deco.h,
            initialX: deco.x,
            initialY: deco.y,
            handle,
        };

        window.addEventListener('mousemove', handleResizeMouseMove);
        window.addEventListener('mouseup', handleResizeMouseUp);
    };

    const handleResizeMouseMove = (e: MouseEvent) => {
        if (!resizeRef.current.id) return;
        const { startX, startY, initialW, initialH, initialX, initialY, handle, id } = resizeRef.current;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const canvasW = currentSize.w || 1;
        const canvasH = currentSize.h || 1;

        // ✨ [Safe] Ensure explicit Number conversion
        let newW = Number(initialW) || 0;
        let newH = Number(initialH) || 0;
        let newX = Number(initialX) || 0;
        let newY = Number(initialY) || 0;

        // 🌟 [NEW] Aspect Ratio Lock Logic
        if (e.shiftKey) {
            const ratio = initialW / initialH;

            // Determine dominant axis based on handle (simplified logic)
            // Or just use DeltaX to drive both
            let d = deltaX;
            if (handle.includes('nm') || handle.includes('s')) d = deltaY; // vertical handles (not used here yet)

            // For corner handles, let's use the larger movement or X
            // actually simpler: just let width drive height or vice versa based on handle

            switch (handle) {
                case 'se':
                    newW = initialW + deltaX;
                    newH = newW / ratio;
                    break;
                case 'sw':
                    newW = initialW - deltaX;
                    newH = newW / ratio;
                    break;
                case 'ne':
                    newW = initialW + deltaX;
                    newH = newW / ratio;
                    break;
                case 'nw':
                    newW = initialW - deltaX;
                    newH = newW / ratio;
                    break;
            }

            // Recalculate position based on new size and handle
            switch (handle) {
                case 'se':
                    newX = initialX + ((newW - initialW) / 2 / canvasW * 100);
                    newY = initialY + ((newH - initialH) / 2 / canvasH * 100);
                    break;
                case 'sw':
                    newX = initialX - ((newW - initialW) / 2 / canvasW * 100);
                    newY = initialY + ((newH - initialH) / 2 / canvasH * 100);
                    break;
                case 'ne':
                    newX = initialX + ((newW - initialW) / 2 / canvasW * 100);
                    newY = initialY - ((newH - initialH) / 2 / canvasH * 100);
                    break;
                case 'nw':
                    newX = initialX - ((newW - initialW) / 2 / canvasW * 100);
                    newY = initialY - ((newH - initialH) / 2 / canvasH * 100);
                    break;
            }

        } else {
            switch (handle) {
                case 'se':
                    newW = initialW + deltaX;
                    newH = initialH + deltaY;
                    newX = initialX + ((deltaX / 2) / canvasW * 100);
                    newY = initialY + ((deltaY / 2) / canvasH * 100);
                    break;
                case 'sw':
                    newW = initialW - deltaX;
                    newH = initialH + deltaY;
                    newX = initialX + ((deltaX / 2) / canvasW * 100);
                    newY = initialY + ((deltaY / 2) / canvasH * 100);
                    break;
                case 'ne':
                    newW = initialW + deltaX;
                    newH = initialH - deltaY;
                    newX = initialX + ((deltaX / 2) / canvasW * 100);
                    newY = initialY + ((deltaY / 2) / canvasH * 100);
                    break;
                case 'nw':
                    newW = initialW - deltaX;
                    newH = initialH - deltaY;
                    newX = initialX + ((deltaX / 2) / canvasW * 100);
                    newY = initialY + ((deltaY / 2) / canvasH * 100);
                    break;
            }
        }

        if (newW < 20) newW = 20;
        if (newH < 20) newH = 20;

        updateDecoration(id, { w: newW, h: newH, x: newX, y: newY });
    };

    const handleResizeMouseUp = () => {
        resizeRef.current.id = null;
        window.removeEventListener('mousemove', handleResizeMouseMove);
        window.removeEventListener('mouseup', handleResizeMouseUp);
    };

    // ✨ Refined Point Drag Handlers
    const pointDragRef = useRef<{
        decoId: string | null;
        pointIndex: number | null;
        startX: number;
        startY: number;
        initialPointX: number;
        initialPointY: number;
    }>({ decoId: null, pointIndex: null, startX: 0, startY: 0, initialPointX: 0, initialPointY: 0 });

    const handlePointMouseDown = (e: React.MouseEvent, deco: WidgetDecoration, index: number) => {
        e.stopPropagation();
        e.preventDefault();

        // Right click to delete
        if (e.button === 2) {
            const newPoints = [...(deco.points || [])];
            newPoints.splice(index, 1);
            if (newPoints.length < 3) return; // Keep min 3 points
            updateDecoration(deco.id, { points: newPoints });
            return;
        }

        if (!deco.points) return;

        pointDragRef.current = {
            decoId: deco.id,
            pointIndex: index,
            startX: e.clientX,
            startY: e.clientY,
            initialPointX: deco.points[index].x,
            initialPointY: deco.points[index].y
        };

        window.addEventListener('mousemove', handlePointMouseMove);
        window.addEventListener('mouseup', handlePointMouseUp);
    };

    const handlePointMouseMove = (e: MouseEvent) => {
        const { decoId, pointIndex, startX, startY, initialPointX, initialPointY } = pointDragRef.current;
        if (!decoId || pointIndex === null) return;

        const deco = decorations.find(d => d.id === decoId);
        if (!deco) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        // Convert pixel delta to percentage
        const scaleX = 100 / (deco.w || 100);
        const scaleY = 100 / (deco.h || 100);

        let newX = initialPointX + (deltaX * scaleX);
        let newY = initialPointY + (deltaY * scaleY);

        newX = Math.max(0, Math.min(100, newX));
        newY = Math.max(0, Math.min(100, newY));

        const newPoints = [...(deco.points || [])];
        newPoints[pointIndex] = { x: newX, y: newY };

        updateDecoration(decoId, { points: newPoints });
    };

    const handlePointMouseUp = () => {
        pointDragRef.current = { decoId: null, pointIndex: null, startX: 0, startY: 0, initialPointX: 0, initialPointY: 0 };
        window.removeEventListener('mousemove', handlePointMouseMove);
        window.removeEventListener('mouseup', handlePointMouseUp);
    };

    // ✨ Refined Path Click (Add Point)
    const handlePathClick = (e: React.MouseEvent, deco: WidgetDecoration) => {
        e.stopPropagation();

        // 🌟 [Fix] Only add points if ALREADY selected
        if (selectedDecorationId !== deco.id) {
            onSelectDecoration(deco.id);
            return;
        }

        if (!deco.points) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = ((e.clientX - rect.left) / rect.width) * 100;
        const clickY = ((e.clientY - rect.top) / rect.height) * 100;

        // Find best insertion index
        let bestIndex = 0;
        let minDistance = Infinity;

        for (let i = 0; i < deco.points.length; i++) {
            const p1 = deco.points[i];
            const p2 = deco.points[(i + 1) % deco.points.length];
            const dist = distanceToSegment(clickX, clickY, p1.x, p1.y, p2.x, p2.y);
            if (dist < minDistance) {
                minDistance = dist;
                bestIndex = i + 1;
            }
        }

        const newPoints = [...deco.points];
        newPoints.splice(bestIndex, 0, { x: clickX, y: clickY });
        updateDecoration(deco.id, { points: newPoints });
    };

    // Helper for distance
    const distanceToSegment = (x: number, y: number, x1: number, y1: number, x2: number, y2: number) => {
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) param = dot / lenSq;
        let xx, yy;
        if (param < 0) { xx = x1; yy = y1; }
        else if (param > 1) { xx = x2; yy = y2; }
        else { xx = x1 + param * C; yy = y1 + param * D; }
        const dx = x - xx;
        const dy = y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    };

    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', handleDecoMouseMove);
            window.removeEventListener('mouseup', handleDecoMouseUp);
            window.removeEventListener('mousemove', handleResizeMouseMove);
            window.removeEventListener('mouseup', handleResizeMouseUp);
            window.removeEventListener('mousemove', handlePointMouseMove);
            window.removeEventListener('mouseup', handlePointMouseUp);
            window.removeEventListener('mousemove', handleBlockMouseMove);
            window.removeEventListener('mouseup', handleBlockMouseUp);
            window.removeEventListener('mousemove', handlePanMouseMove); // ✨
            window.removeEventListener('mouseup', handlePanMouseUp);     // ✨
            window.removeEventListener('mousemove', handleRotateMouseMove); // ✨
            window.removeEventListener('mouseup', handleRotateMouseUp);     // ✨
        };
    }, []);



    return (
        <div
            id="canvas-boundary"
            // ✨ [Fix] Removed outer <main> and fixed sizing to preventing internal scrolling
            // The parent in WidgetBuilder now controls the "Stage" size.
            // We set width/height: '100%' here to fill that stage, 
            // OR use the explicit size if we want to be sure.
            // Using '100%' is safer if parent is already sized.
            className="bg-[var(--bg-card)] rounded-[24px] shadow-[0_0_50px_rgba(0,0,0,0.3)] overflow-hidden relative transition-all duration-500 flex flex-col ring-[12px] ring-gray-900 border border-[var(--border-color)]"
            style={{
                width: '100%',
                height: '100%',
                // width: `${currentSize.w}px`, // Parent already has this size
                // height: `${currentSize.h}px`,
            }}
            onClick={() => {
                onSelectBlock(null);
                onSelectDecoration(null);
            }}
        >
            <style>
                {`
                    @keyframes spin { 0% { transform: translate(-50%, -50%) rotate(0deg); } 100% { transform: translate(-50%, -50%) rotate(360deg); } }
                    @keyframes pulse { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.1); } }
                    @keyframes bounce { 0%, 100% { transform: translate(-50%, -50%); } 50% { transform: translate(-50%, -60%); } }
                    @keyframes float { 0% { transform: translate(-50%, -50%); } 50% { transform: translate(-50%, -55%); } 100% { transform: translate(-50%, -50%); } }
                    @keyframes wiggle { 0%, 100% { transform: translate(-50%, -50%) rotate(-3deg); } 50% { transform: translate(-50%, -50%) rotate(3deg); } }
                `}
            </style>

            {/* ✨ Empty State (Background Z-0) */}
            {blocks.length === 0 && decorations.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-secondary)] z-0 pointer-events-none select-none">
                    <Smartphone size={40} className="mb-3 opacity-10" />
                    <p className="text-sm font-semibold opacity-20 max-md:hidden">좌측에서 기능 선택</p>
                    <p className="text-sm font-semibold opacity-20 md:hidden">아래에서 기능 선택</p>
                </div>
            )}

            {/* ✨ Unified Rendering for Stacking Context */}
            {decorations?.map(deco => {
                let safeType = deco.type;
                if (typeof safeType === 'object' && (safeType as any).type) safeType = (safeType as any).type;

                return (
                    <div
                        key={deco.id}
                        onMouseDown={(e) => handleDecoMouseDown(e, deco)}
                        onClick={(e) => e.stopPropagation()}
                        onDoubleClick={(e) => {
                            e.stopPropagation();
                            if (onOpenSettings) onOpenSettings();
                        }}
                        className={`absolute transition-all duration-300 ease-out cursor-pointer pointer-events-auto ${selectedDecorationId === deco.id ? 'ring-2 ring-indigo-500 ring-offset-2' : 'hover:ring-1 hover:ring-indigo-300'}`}
                        style={{
                            left: `${deco.x}%`,
                            top: `${deco.y}%`,
                            width: `${deco.w}px`,
                            height: `${deco.h}px`,
                            zIndex: deco.zIndex || 0, // ✨ Fix Z-Index
                            transform: `translate(-50%, -50%) rotate(${deco.rotation || 0}deg)`, // ✨ Fix Rotation (and center origin)
                            transformOrigin: 'center center',
                            // ✨ Cropping Logic
                            overflow: deco.crop ? 'hidden' : 'visible',
                        }}
                    >
                        {/* ✨ Ghost Overlay for Panning Feedback */}
                        {croppingId === deco.id && deco.crop && (
                            <div
                                className="absolute border border-blue-400 pointer-events-none z-50"
                                style={{
                                    left: deco.crop.contentX,
                                    top: deco.crop.contentY,
                                    width: deco.crop.contentW,
                                    height: deco.crop.contentH,
                                    opacity: 0.5
                                }}
                            />
                        )}

                        {safeType === 'blob' && !deco.mediaType && !deco.imageUrl ? (
                            <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
                                <path
                                    d={getSvgPathFromPoints(deco.points || [], 0.5, true)}
                                    fill={deco.color}
                                    fillOpacity={0.8}
                                    stroke={selectedDecorationId === deco.id ? "rgba(99, 102, 241, 0.5)" : "none"}
                                    strokeWidth="1"
                                    className="pointer-events-none"
                                />
                                {/* ✨ Invisible click target for adding points */}
                                <path
                                    d={getSvgPathFromPoints(deco.points || [], 0.5, true)}
                                    fill="transparent"
                                    stroke="transparent"
                                    strokeWidth="15"
                                    className="cursor-crosshair pointer-events-auto"
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => handlePathClick(e, deco)}
                                    onDoubleClick={(e) => {
                                        // ✨ Regenerate Shape on Double Click
                                        e.stopPropagation();
                                        updateDecoration(deco.id, { points: generateBlobPoints() });
                                    }}
                                />
                            </svg>
                        ) : (
                            <div
                                style={{
                                    width: deco.crop ? `${deco.crop.contentW}px` : '100%',
                                    height: deco.crop ? `${deco.crop.contentH}px` : '100%',
                                    position: deco.crop ? 'absolute' : 'static',
                                    left: deco.crop ? deco.crop.contentX : undefined,
                                    top: deco.crop ? deco.crop.contentY : undefined,
                                    backgroundColor: (deco.mediaType === 'video' || deco.imageUrl) ? undefined : deco.color,
                                    backgroundImage: (deco.mediaType !== 'video' && deco.imageUrl && safeType !== 'blob' && !deco.crop) ? `url(${deco.imageUrl})` : undefined, // Disable BG image if cropped (use IMG tag)
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    borderRadius: safeType === 'circle' ? '50%' : (safeType === 'square' || safeType === 'image') ? '10%' : '0%', // ✨ 'line' gets 0%
                                    clipPath: (safeType === 'star')
                                        ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                                        : (safeType === 'blob' && deco.points)
                                            ? `path('${getSvgPathFromPoints(deco.points, 0.5, true).replace(/,/g, ' ')}')`
                                            : undefined
                                }}
                            >
                                {deco.mediaType === 'video' && deco.videoUrl && (
                                    <video
                                        src={deco.videoUrl}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                )}
                                {/* ✨ Render IMG if cropped OR blob OR explicit image */}
                                {deco.mediaType !== 'video' && deco.imageUrl && (safeType === 'blob' || deco.crop) && (
                                    <img src={deco.imageUrl} alt="" className="w-full h-full object-cover" />
                                )}
                            </div>
                        )}

                        {selectedDecorationId === deco.id && safeType === 'blob' && deco.points && (
                            <>
                                {/* 🌟 [NEW] Control Polygon (Guide to show where segments are) */}
                                <svg className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
                                    <polygon
                                        points={deco.points.map(p => `${p.x},${p.y}`).join(' ')}
                                        fill="none"
                                        stroke="#6366f1"
                                        strokeWidth="1"
                                        strokeDasharray="4 4"
                                        opacity="0.5"
                                    />
                                </svg>

                                {deco.points.map((p, idx) => (
                                    <div
                                        key={idx}
                                        onMouseDown={(e) => handlePointMouseDown(e, deco, idx)}
                                        className="absolute w-3 h-3 bg-white border border-indigo-500 rounded-full cursor-grab active:cursor-grabbing hover:bg-red-100 z-50 shadow-sm"
                                        style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }}
                                        title="우클릭하여 삭제 / 드래그하여 이동"
                                    />
                                ))}
                            </>
                        )}

                        {selectedDecorationId === deco.id && (
                            <>
                                <div onMouseDown={(e) => handleResizeMouseDown(e, deco, 'nw')} className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border border-indigo-500 rounded-full cursor-nw-resize z-50" />
                                <div onMouseDown={(e) => handleResizeMouseDown(e, deco, 'ne')} className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border border-indigo-500 rounded-full cursor-ne-resize z-50" />
                                <div onMouseDown={(e) => handleResizeMouseDown(e, deco, 'sw')} className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border border-indigo-500 rounded-full cursor-sw-resize z-50" />
                                <div onMouseDown={(e) => handleResizeMouseDown(e, deco, 'se')} className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border border-indigo-500 rounded-full cursor-se-resize z-50" />

                                {/* 🌟 Rotation Handle (Unified Style) */}
                                <div
                                    onMouseDown={(e) => handleRotateMouseDown(e, deco)}
                                    className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-2 border-indigo-500 rounded-full flex items-center justify-center cursor-move z-50 shadow-sm hover:bg-indigo-50"
                                    title="회전하기"
                                >
                                    <RotateCw size={12} className="text-indigo-500" />
                                    {/* Line connecting handle to element */}
                                    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-indigo-500"></div>
                                </div>

                                {/* ✨ Z-Index Controls (Left Side) - Matching Block Style */}
                                <div className="absolute -left-10 top-0 flex flex-col gap-1 z-50">
                                    <button
                                        onMouseDown={(e) => handleDecoZIndexChange(e, deco.id, deco.zIndex || 0, 1)}
                                        className="bg-white border border-gray-200 p-1.5 rounded shadow-sm hover:bg-gray-50 text-gray-600 flex items-center justify-center cursor-pointer pointer-events-auto"
                                        title="앞으로 가져오기"
                                    >
                                        <ArrowUp size={12} />
                                    </button>
                                    <button
                                        onMouseDown={(e) => handleDecoZIndexChange(e, deco.id, deco.zIndex || 0, -1)}
                                        className="bg-white border border-gray-200 p-1.5 rounded shadow-sm hover:bg-gray-50 text-gray-600 flex items-center justify-center cursor-pointer pointer-events-auto"
                                        title="뒤로 보내기"
                                    >
                                        <ArrowDown size={12} />
                                    </button>
                                    <div className="bg-gray-800 text-white text-[10px] px-1 rounded flex justify-center items-center h-4 font-mono select-none">
                                        {deco.zIndex || 0}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                );
            })}

            {blocks.map((block) => (
                <DraggableBlockItem
                    key={block.id}
                    block={block}
                    layout={block.layout || { x: 50, y: 50, w: 100, h: 'auto', rotation: 0, zIndex: 1 }}
                    selectedBlockId={selectedBlockId}
                    onSelectBlock={onSelectBlock}
                    onRemoveBlock={onRemoveBlock}
                    onUpdateBlock={onUpdateBlock}
                    onMouseDown={(e) => handleBlockMouseDown(e, block)}
                    onOpenSettings={onOpenSettings}
                />
            ))}
        </div>
    );
};

export default Canvas;
