import React, { useEffect, useState } from 'react';
import type { WidgetBlock, BlockLayout } from '../../types.ts';
import { Trash2, RotateCw, ArrowUp, ArrowDown } from 'lucide-react';
import BlockRenderer from '../BlockRenderer.tsx';
import { Resizable } from 're-resizable';

interface DraggableBlockItemProps {
    block: WidgetBlock;
    layout: BlockLayout;
    selectedBlockId: string | null;
    onSelectBlock: (id: string | null) => void;
    onRemoveBlock: (id: string) => void;
    onUpdateBlock: (id: string, updates: any) => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onOpenSettings?: () => void;
}

const DraggableBlockItem: React.FC<DraggableBlockItemProps> = (props) => {
    const { block, layout, selectedBlockId, onSelectBlock, onRemoveBlock, onUpdateBlock, onMouseDown, onOpenSettings } = props;

    const [boundaryElement, setBoundaryElement] = useState<HTMLElement | null>(null);
    useEffect(() => {
        const canvasEl = document.getElementById('canvas-boundary');
        if (canvasEl) {
            setBoundaryElement(canvasEl);
        }
    }, []);

    const handleRotateStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        const rect = e.currentTarget.parentElement?.getBoundingClientRect();
        if (!rect) return;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - centerX;
            const dy = moveEvent.clientY - centerY;
            // atan2 returns radians, convert to degrees and add 90 because handle is at top
            const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
            onUpdateBlock(block.id, { layout: { ...layout, rotation: angle } });
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const handleZIndexChange = (delta: number) => {
        const currentZ = layout.zIndex || 1;
        onUpdateBlock(block.id, { layout: { ...layout, zIndex: Math.max(1, currentZ + delta) } });
    };

    const isSelected = selectedBlockId === block.id;

    return (
        <div
            className="absolute"
            style={{
                left: `${layout.x}%`,
                top: `${layout.y}%`,
                transform: `translate(-50%, -50%) rotate(${layout.rotation || 0}deg)`,
                zIndex: isSelected ? 1000 : (layout.zIndex || 1),
                pointerEvents: 'auto',
            }}
            onMouseDown={(e) => {
                onMouseDown(e);
            }}
        >
            <Resizable
                className="relative"
                bounds={boundaryElement || undefined}
                minWidth={30}
                minHeight={20}
                size={{
                    width: layout.w,
                    height: layout.h,
                }}
                onResizeStart={(e) => {
                    e.stopPropagation();
                }}
                onResizeStop={(e, direction, ref) => {
                    onUpdateBlock(block.id, {
                        layout: {
                            ...layout,
                            w: ref.style.width,
                            h: ref.style.height,
                        }
                    });
                }}
                enable={{
                    top: false,
                    right: isSelected && block.type !== 'link-bookmark',
                    bottom: isSelected && block.type !== 'link-bookmark',
                    left: false,
                    topRight: false,
                    bottomRight: isSelected && block.type !== 'link-bookmark',
                    bottomLeft: false,
                    topLeft: false,
                }}
                handleStyles={{
                    bottomRight: {
                        bottom: 0,
                        right: 0,
                        width: '12px',
                        height: '12px',
                        backgroundColor: '#6366f1',
                        borderRadius: '50%',
                        cursor: 'nwse-resize',
                        zIndex: 50,
                    },
                    right: { width: '10px', right: -5, cursor: 'col-resize' },
                    bottom: { height: '10px', bottom: -5, cursor: 'row-resize' }
                }}
            >
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelectBlock(block.id);
                    }}
                    onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (onOpenSettings) onOpenSettings();
                    }}
                    className={`
                        relative group rounded-lg transition-all border-2 h-full overflow-hidden
                        ${isSelected
                            ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
                            : 'border-transparent hover:border-[var(--border-color)] hover:bg-[var(--bg-card-secondary)] bg-transparent'
                        }
                    `}
                >
                    <div className="w-full h-full p-0">
                        <BlockRenderer
                            block={block}
                            selectedBlockId={selectedBlockId}
                            onSelectBlock={onSelectBlock}
                            onRemoveBlock={onRemoveBlock}
                            onUpdateBlock={onUpdateBlock}
                        />
                    </div>
                </div>

                {isSelected && (
                    <>
                        {/* Rotation Handle */}
                        <div
                            onMouseDown={handleRotateStart}
                            className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-2 border-indigo-500 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-sm z-50 hover:bg-indigo-50"
                        >
                            <RotateCw size={12} className="text-indigo-500" />
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-indigo-500"></div>
                        </div>

                        {/* Delete Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemoveBlock(block.id);
                            }}
                            className="absolute -right-2 -top-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 z-50"
                        >
                            <Trash2 size={12} />
                        </button>

                        {/* Z-Index Controls */}
                        <div className="absolute -left-10 top-0 flex flex-col gap-1 z-50">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleZIndexChange(1); }}
                                className="bg-white border border-gray-200 p-1.5 rounded shadow-sm hover:bg-gray-50 text-gray-600"
                                title="Bring Forward"
                            >
                                <ArrowUp size={12} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleZIndexChange(-1); }}
                                className="bg-white border border-gray-200 p-1.5 rounded shadow-sm hover:bg-gray-50 text-gray-600"
                                title="Send Backward"
                            >
                                <ArrowDown size={12} />
                            </button>
                            <div className="bg-gray-800 text-white text-[10px] px-1 rounded flex justify-center items-center h-4 font-mono">
                                {layout.zIndex || 1}
                            </div>
                        </div>
                    </>
                )}
            </Resizable>
        </div>
    );
};

export default DraggableBlockItem;
