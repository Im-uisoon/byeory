import React, { useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import EditorToolbar from './EditorToolbar';

interface Props {
    selectedId: string;
    selectedType: 'block' | 'sticker' | 'floating' | 'floatingImage' | 'title';
    currentItem: any;
    onUpdate: (id: string, type: 'block' | 'sticker' | 'floating' | 'floatingImage' | 'title', changes: any) => void;
    onDelete?: () => void;
    scale: number;
    // ✨ Crop Props
    onCropToggle?: () => void;
    isCropping?: boolean;
}

const ToolbarOverlay: React.FC<Props> = ({ selectedId, selectedType, currentItem, onUpdate, onDelete, scale, onCropToggle, isCropping }) => {
    const [position, setPosition] = useState<{ top: number, left: number } | null>(null);
    const [toolbarWidth, setToolbarWidth] = useState(0);
    const toolbarRef = React.useRef<HTMLDivElement>(null);

    // 1. Observe Toolbar Width
    useLayoutEffect(() => {
        if (!toolbarRef.current) return;

        const updateWidth = () => {
            if (toolbarRef.current) {
                setToolbarWidth(toolbarRef.current.offsetWidth);
            }
        };

        // Initial measure
        updateWidth();

        const ro = new ResizeObserver(updateWidth);
        ro.observe(toolbarRef.current);

        return () => ro.disconnect();
    }, []);


    // 2. Calculate Position (Fixed Viewport Coordinates)
    useLayoutEffect(() => {
        const updatePosition = () => {
            if (!selectedId) return;

            const targetEl = document.getElementById(selectedId);
            if (!targetEl) return;

            const targetRect = targetEl.getBoundingClientRect();

            // Calculate Style Top/Left (Viewport relative since we use Portal + Fixed)
            // ✨ Position BELOW the element by default
            let top = targetRect.bottom + 10;
            const centerLeft = targetRect.left + targetRect.width / 2;

            // ✨ Viewport-Aware Clamping Logic
            let finalLeft = centerLeft;

            if (toolbarWidth > 0) {
                const halfToolbar = toolbarWidth / 2;
                const safeMargin = 10; // Margin from screen edges

                // Screen boundaries
                // Left edge of toolbar >= safeMargin
                const minLeft = halfToolbar + safeMargin;

                // Right edge of toolbar <= window.innerWidth - safeMargin
                const maxLeft = window.innerWidth - safeMargin - halfToolbar;

                // Apply Clamp
                finalLeft = Math.max(minLeft, Math.min(centerLeft, maxLeft));
            }

            // Toggle to TOP if bottom is clipped (e.g. at bottom of screen)
            const toolbarHeight = toolbarRef.current?.offsetHeight || 60;
            if (top + toolbarHeight > window.innerHeight) {
                top = targetRect.top - toolbarHeight - 10; // Position above with margin
            }

            setPosition(prev => {
                // Check if changed significantly to avoid loops
                if (prev && Math.abs(prev.top - top) < 1 && Math.abs(prev.left - finalLeft) < 1) {
                    return prev;
                }
                return { top: top, left: finalLeft };
            });
        };

        updatePosition();

        const resizeObserver = new ResizeObserver(updatePosition);
        const targetEl = document.getElementById(selectedId);
        if (targetEl) resizeObserver.observe(targetEl);

        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [selectedId, selectedType, scale, toolbarWidth]);

    if (!position || !selectedId) return null;

    // ✨ Render to Body using Portal
    return createPortal(
        <div
            ref={toolbarRef}
            style={{
                position: 'fixed', // ✨ Fixed relative to Viewport
                top: position.top,
                left: position.left,
                transform: 'translateX(-50%)',
                zIndex: 99999, // ✨ Really Always on Top
                width: 'max-content',
                maxWidth: '94vw', // ✨ Limit width to screen (with margin)
                pointerEvents: 'auto',
                color: '#1f2937',
                whiteSpace: 'normal', // ✨ Allow wrapping
                // Add shadow/border to ensure visibility against any background
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
            }}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <EditorToolbar
                selectedId={selectedId}
                selectedType={selectedType}
                currentItem={currentItem}
                onUpdate={onUpdate}
                onDelete={onDelete}
                positionMode="inline"
                onCropToggle={onCropToggle}
                isCropping={isCropping}
            />
        </div>,
        document.body
    );
};

export default ToolbarOverlay;
