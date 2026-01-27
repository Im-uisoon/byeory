import React, { useRef, useState, useEffect, Suspense } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { HelpCircle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import BlockRenderer from "./customwidget/components/BlockRenderer"; // .tsx 제거
import CustomWidgetPreview from "./customwidget/components/CustomWidgetPreview"; // 🌟 [NEW] CustomWidgetPreview 임포트
import { useCredits } from '../../../context/CreditContext';
import type { WidgetConfig, WidgetInstance } from "./type.ts";
import { WIDGET_COMPONENT_MAP } from "./componentMap.ts";


interface DraggableWidgetProps {
    widget: WidgetInstance;
    registry: Record<string, WidgetConfig>;
    isEditMode: boolean;
    removeWidget: (id: string) => void;
    updateLayout: (id: string, layout: Partial<WidgetInstance['layout']>) => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    onHover: (x: number, y: number, item: any) => void;
    onDrop: (x: number, y: number, item: any) => void;
    isMobile?: boolean;
    isSelected?: boolean;
    onSelect?: () => void;
    onZoom?: () => void;
    onShowInfo?: () => void;
    onUpdateWidget?: (id: string, updates: any) => void;
    isZoomEnabled?: boolean;
}

const ItemTypes = {
    WIDGET: 'widget',
};

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({
    widget,
    registry,
    isEditMode,
    removeWidget,
    updateLayout,
    onDragStart,
    onDragEnd,
    onHover,
    onDrop,
    isMobile = false,
    isSelected = false,
    onSelect,
    onZoom,
    onShowInfo,
    onUpdateWidget,
    isZoomEnabled = false
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [showSizeMenu, setShowSizeMenu] = useState(false);

    const { triggerWidgetInteraction } = useCredits();

    const [{ isDragging }, drag, preview] = useDrag({
        type: ItemTypes.WIDGET,
        item: () => {
            if (onDragStart) onDragStart();
            const { offsetWidth, offsetHeight } = ref.current || { offsetWidth: 0, offsetHeight: 0 };
            return {
                id: widget.id,
                type: widget.type,
                layout: widget.layout,
                props: widget.props,
                initialWidth: offsetWidth,
                initialHeight: offsetHeight
            };
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: () => {
            if (onDragEnd) onDragEnd();
        },
        canDrag: isEditMode,
    });

    const [, drop] = useDrop({
        accept: ItemTypes.WIDGET,
        hover: (item: { type: string, id?: string }) => {
            if (isEditMode && onHover) {
                onHover(widget.layout.x, widget.layout.y, item);
            }
        },
        drop: (item: { type: string, id?: string }) => {
            if (isEditMode && onDrop) {
                onDrop(widget.layout.x, widget.layout.y, item);
            }
        },
    });

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    }, [preview]);

    useEffect(() => {
        if (!isSelected) {
            setShowSizeMenu(false);
        }
    }, [isSelected]);

    useEffect(() => {
        if (!showSizeMenu) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (!(e.target as Element).closest('.size-menu-container')) {
                setShowSizeMenu(false);
            }
        };
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, [showSizeMenu]);

    if (isEditMode) {
        drag(drop(ref));
    }

    const { x, y, w, h } = widget.layout;
    const isTransparent = widget.type === 'transparent';

    // Widget Rendering Logic
    let WidgetComponent: any = null;
    let registryItem: WidgetConfig | undefined = registry[widget.type];

    // Registry에 있고, ComponentMap에도 코드가 있다면 연결
    if (registryItem && WIDGET_COMPONENT_MAP[widget.type]) {
        WidgetComponent = WIDGET_COMPONENT_MAP[widget.type];
    }

    // Fallback logic
    if (widget.type === 'custom-block' || !registryItem) {
        registryItem = {
            id: 0,
            widgetType: widget.type,
            label: 'Custom',
            description: '',
            category: 'My Saved',
            keywords: [],
            defaultSize: '2x2',
            validSizes: [
                [1, 1], [1, 2], [1, 3], [1, 4],
                [2, 1], [2, 2], [2, 3], [2, 4],
                [3, 1], [3, 2], [3, 3], [3, 4],
                [4, 1], [4, 2], [4, 3], [4, 4]
            ],
            defaultProps: {},
            isSystem: false,
            component: null as any
        };
    }

    const gridStyle: React.CSSProperties = {
        gridColumn: `${x} / span ${w}`,
        gridRow: `${y} / span ${h}`,
        opacity: isDragging ? 0 : 1,
        zIndex: isDragging ? 50 : (showSizeMenu ? 60 : 1),
    };

    return (
        <motion.div
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            ref={ref}
            className={`global-physics-widget relative group rounded-2xl transition-colors duration-200 
                ${isTransparent
                    ? (isEditMode ? 'bg-white/10 border-2 border-dashed border-white/30' : '')
                    : 'theme-bg-card shadow-sm hover:shadow-md'} 
                ${(isEditMode && !isMobile) ? 'cursor-move ring-2 ring-[var(--btn-bg)] ring-offset-2 overflow-visible' : 'overflow-hidden'}
                ${isDragging ? 'pointer-events-none' : ''}
                ${(isMobile && isSelected && isEditMode) ? 'ring-2 ring-[var(--btn-bg)] ring-offset-2' : ''}
                ${isEditMode ? 'select-none' : ''}
                ${(isMobile && isEditMode) ? 'overflow-visible' : ''}
            `}
            style={gridStyle}
            onClick={(e) => {
                if (isMobile && isEditMode) {
                    onSelect?.();
                    e.stopPropagation();
                } else if (!isEditMode) {
                    triggerWidgetInteraction();
                    onZoom?.();
                }
            }}
            onContextMenu={(e) => {
                if (isEditMode) e.preventDefault();
            }}
        >
            <div className={`w-full h-full transition-transform overflow-hidden rounded-2xl flex flex-col justify-start ${isEditMode ? 'pointer-events-none' : ''}`}>
                <Suspense fallback={<div className="w-full h-full bg-gray-100 animate-pulse rounded-2xl" />}>

                    {/* 🔥 [수정 3] WidgetComponent가 없거나 custom-block 일 때 BlockRenderer 렌더링 */}
                    {(() => {

                        return (widget.type === 'custom-block') ? (
                            <CustomWidgetPreview
                                content={widget.props?.content || {}}
                                styles={widget.props?.styles || {}}
                                defaultSize={widget.props?.defaultSize || '2x2'}
                                style={{ width: '100%', height: '100%' }}
                            />
                        ) : (!WidgetComponent) ? (
                            <BlockRenderer
                                block={{
                                    id: widget.id,
                                    // 🔥 [핵심 수정] widget.props가 undefined일 경우를 대비해 || {} 추가
                                    type: (widget.props || {}).type || widget.type,
                                    content: {
                                        ...((widget.props || {}).content || {}),
                                        // 🌟 [핵심 수정] decorations 보존: props.decorations가 없으면 기존 content.decorations 유지
                                        decorations: (widget.props || {}).decorations || ((widget.props || {}).content || {}).decorations
                                    },
                                    styles: (widget.props || {}).styles || {}
                                }}
                                selectedBlockId={null}
                                onSelectBlock={() => { }}
                                onRemoveBlock={() => { }}
                                onUpdateBlock={(id, updates) => {
                                    if (onUpdateWidget) {
                                        // 🌟 [Fix] Handle nested block updates for custom-block
                                        if (widget.type === 'custom-block' || (widget.props?.content?.children)) {
                                            const currentContent = widget.props?.content || {};
                                            const children = currentContent.children || [];

                                            // Check if the update is for a child block
                                            const childIndex = children.findIndex((c: any) => c.id === id);

                                            if (childIndex !== -1) {
                                                // Create a deep copy of children to avoid mutating state directly
                                                const newChildren = [...children];
                                                newChildren[childIndex] = {
                                                    ...newChildren[childIndex],
                                                    ...updates,
                                                    content: {
                                                        ...newChildren[childIndex].content,
                                                        ...(updates.content || {})
                                                    },
                                                    styles: {
                                                        ...newChildren[childIndex].styles,
                                                        ...(updates.styles || {})
                                                    }
                                                };

                                                // Update the parent widget with new children
                                                onUpdateWidget(widget.id, {
                                                    content: {
                                                        ...currentContent,
                                                        children: newChildren
                                                    }
                                                });
                                                return;
                                            }
                                        }

                                        // Fallback: Update root widget directly (for non-nested or root updates)
                                        onUpdateWidget(widget.id, updates);
                                    }
                                }}
                            />
                        ) : (
                            <WidgetComponent
                                {...(registryItem?.defaultProps || {})} // 🌟 Merge defaults first
                                {...(widget.props || {})}
                                gridSize={{ w, h }}
                                updateLayout={(layout: Partial<WidgetInstance['layout']>) => updateLayout(widget.id, layout)}
                                widgetId={widget.id}
                                onInteraction={triggerWidgetInteraction}
                            />
                        );
                    })()}
                </Suspense>
            </div>

            {isEditMode && (
                <div
                    style={{
                        opacity: (isMobile && !isSelected) ? 0 : 1,
                        pointerEvents: (isMobile && !isSelected) ? 'none' : 'auto'
                    }}
                    className={`absolute inset-0 bg-black/10 backdrop-blur-[1px] rounded-2xl flex flex-col items-center justify-center transition-opacity border-2 border-[var(--btn-bg)] z-20 gap-2 pointer-events-auto
                    ${isMobile ? '' : 'opacity-0 group-hover:opacity-100'}
                `}>
                    {/* Top Right Controls */}
                    <div className="absolute top-2 right-2 flex gap-2">
                        {/* Info Button */}
                        {onShowInfo && ( // Only show if onShowInfo prop exists
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onShowInfo?.();
                                }}
                                className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-black/70 backdrop-blur-sm transition-colors shadow-sm"
                                title="Information"
                            >
                                <HelpCircle size={14} />
                            </button>
                        )}

                        {/* Remove Button (Trash Icon) */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                removeWidget(widget.id);
                            }}
                            className="p-1.5 rounded-full bg-red-500/80 hover:bg-red-500 text-white backdrop-blur-sm transition-colors shadow-sm"
                            title="Remove Widget"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>

                    {/* Resize Handle */}
                    {registryItem.category !== 'Global' && (
                        <div
                            className="absolute bottom-2 right-2 p-2 cursor-nwse-resize touch-none text-white/80 hover:text-white transition-colors"
                            onPointerDown={(e) => {
                                e.stopPropagation(); // Prevent drag start
                                e.preventDefault(); // Prevent text selection

                                const startX = e.clientX;
                                const startY = e.clientY;
                                const originalW = w;
                                const originalH = h;
                                const element = ref.current;
                                if (!element) return;

                                const rect = element.getBoundingClientRect();
                                const cellWidth = rect.width / w;
                                const cellHeight = rect.height / h;

                                const handlePointerMove = (moveEvent: PointerEvent) => {
                                    const dx = moveEvent.clientX - startX;
                                    const dy = moveEvent.clientY - startY;

                                    const gridDx = Math.round(dx / cellWidth);
                                    const gridDy = Math.round(dy / cellHeight);

                                    let newW = Math.max(1, originalW + gridDx);
                                    let newH = Math.max(1, originalH + gridDy);

                                    // Valid Sizes Filtering
                                    const validSizes = registryItem?.validSizes;
                                    if (validSizes) {
                                        // Find closest valid size
                                        let bestSize = [newW, newH];
                                        let minDistance = Infinity;

                                        validSizes.forEach(([vw, vh]) => {
                                            // Apply mobile constraints if needed
                                            if (isMobile) {
                                                if (vw > 2) return;
                                                // Specific widget constraints...
                                                if (widget.type === 'welcome' && (vw === 1 && vh === 2)) return;
                                                if (widget.type === 'ootd' && vh !== 2) return;
                                                if (widget.type === 'chat-diary' && vw !== 2) return;
                                                if (widget.type === 'asmr-mixer' && vw !== 2) return;
                                                if (widget.type === 'random-picker' && vw === 1 && vh === 1) return;
                                            }

                                            // Simple distance metric
                                            const dist = Math.sqrt(Math.pow(vw - newW, 2) + Math.pow(vh - newH, 2));
                                            if (dist < minDistance) {
                                                minDistance = dist;
                                                bestSize = [vw, vh];
                                            }
                                        });

                                        // If dragging significantly, snap to the best candidate
                                        // To prevent jumping, only switch if we are strictly closer or sufficiently moved
                                        newW = bestSize[0];
                                        newH = bestSize[1];
                                    }

                                    // Local constraints
                                    if (isMobile && newW > 2) newW = 2; // Hard constraint for mobile width

                                    if (newW !== w || newH !== h) {
                                        updateLayout(widget.id, { w: newW, h: newH });

                                        // Update Local Config
                                        try {
                                            const key = `widget-config-${widget.type}`;
                                            const existing = localStorage.getItem(key);
                                            const config = existing ? JSON.parse(existing) : {};
                                            const newConfig = { ...config, defaultSize: `${newW}x${newH}` };
                                            localStorage.setItem(key, JSON.stringify(newConfig));
                                        } catch (e) { console.warn(e); }
                                    }
                                };

                                const handlePointerUp = () => {
                                    window.removeEventListener('pointermove', handlePointerMove);
                                    window.removeEventListener('pointerup', handlePointerUp);
                                };

                                window.addEventListener('pointermove', handlePointerMove);
                                window.addEventListener('pointerup', handlePointerUp);
                            }}
                        >
                            {/* Custom Resize Icon */}
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v6" />
                                <path d="M21 21h-6" />
                                <path d="M21 21l-9-9" />
                                <path d="M3 21h6" strokeOpacity="0.5" />
                                <path d="M9 21v-6" strokeOpacity="0.5" />
                            </svg>
                        </div>
                    )}
                </div>
            )}
            {/* Zoom Overlay */}
            {!isEditMode && isZoomEnabled && !isMobile && (
                <div
                    className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 cursor-pointer rounded-2xl"
                    onClick={(e) => {
                        e.stopPropagation();
                        onZoom?.();
                    }}
                >
                    <div className="bg-black/40 p-3 rounded-full backdrop-blur-md shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-200">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                        </svg>
                    </div>
                </div>
            )}
        </motion.div>
    );
};