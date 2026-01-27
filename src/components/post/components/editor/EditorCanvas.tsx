import React, { useRef, useState, useLayoutEffect, useEffect, forwardRef, useImperativeHandle, Suspense } from 'react';
import ContentBlock from './ContentBlock';
import { WIDGET_COMPONENT_MAP } from '../../../../components/settings/widgets/componentMap';
import CustomWidgetPreview from '../../../../components/settings/widgets/customwidget/components/CustomWidgetPreview'; // 🌟 Import CustomWidgetPreview
import ResizableItem from './ResizableItem';
import StickyNote from './StickyNote';
// import EditorToolbar from './EditorToolbar'; // Unused
import ToolbarOverlay from './ToolbarOverlay';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { Block, Sticker, FloatingText, FloatingImage } from '../../types';
import { Image as ImageIcon, Type, ArrowUp, ArrowDown, LayoutTemplate, ArrowRightLeft, StickyNote as StickyNoteIcon, Loader2 } from 'lucide-react';

interface Props {
    title: string;
    setTitle: (v: string) => void;
    titleStyles: Record<string, any>;
    viewMode: 'editor' | 'read';
    blocks: Block[];
    stickers: Sticker[];
    floatingTexts: FloatingText[];
    floatingImages: FloatingImage[];
    selectedId: string | null;
    selectedIds?: string[]; // ✨ Multi-Select Support
    selectedType?: 'block' | 'sticker' | 'floating' | 'floatingImage' | 'title' | null;

    setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
    onSelect: (id: string | null, type: 'block' | 'sticker' | 'floating' | 'floatingImage' | 'title' | null, isMulti?: boolean) => void; // ✨ Updated Signature
    onUpdate: (id: string, type: 'block' | 'sticker' | 'floating' | 'floatingImage' | 'title', changes: any) => void;
    onDelete: () => void;
    onBlockImageUpload: (id: string, file: File, idx?: number) => void;
    onBackgroundClick: () => void;
    paperStyles?: Record<string, any>;
    hideTitle?: boolean; // ✨ Optional prop to hide title
    onAddFloatingText?: (x?: number, y?: number) => void; // ✨ Handler for adding floating text
}
// ✨ [설정] 기본 너비를 여기서 조절하세요. (기존 800 -> 1100으로 확대)
const BASE_WIDTH = 1100;
// ✨ [설정] 종이 내부 실제 콘텐츠 영역 너비 (여백 고려)
const CONTENT_MAX_WIDTH = 800;

const EditorCanvas = forwardRef<HTMLDivElement, Props>(({
    title, setTitle, titleStyles, viewMode, blocks, stickers, floatingTexts, floatingImages, selectedId, selectedIds = [], selectedType,
    setBlocks, onSelect, onUpdate, onDelete, onBlockImageUpload, paperStyles, hideTitle = false, onAddFloatingText
}, ref) => {

    // ✨ Responsive Scaling Logic
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null); // ✨ Wrapper Ref (Paper + Controls)
    const [scale, setScale] = useState(1);
    const [scaledHeight, setScaledHeight] = useState<number | undefined>(undefined);
    const titleRef = useRef<HTMLDivElement>(null); // ✨ Title Measurement
    const [titleHeight, setTitleHeight] = useState(0);

    // ✨ Drag Selection State
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionBox, setSelectionBox] = useState<{ startX: number, startY: number, currentX: number, currentY: number } | null>(null);
    const [isToolbarVisible, setIsToolbarVisible] = useState(false); // ✨ Toolbar Visibility State
    const [croppingId, setCroppingId] = useState<string | null>(null); // ✨ Crop State

    // ✨ Expose Content Ref
    useImperativeHandle(ref, () => contentRef.current!);
    useLayoutEffect(() => {
        const updateHeight = () => {
            if (wrapperRef.current) {
                const originalHeight = wrapperRef.current.scrollHeight;
                // 스케일이 줄어들면 전체 높이도 비율에 맞춰 줄어듦 + 여유공간
                setScaledHeight(originalHeight * scale + 60);
            }
            if (titleRef.current) {
                setTitleHeight(titleRef.current.offsetHeight);
            }
        };

        updateHeight();
        const observer = new ResizeObserver(() => window.requestAnimationFrame(updateHeight));
        if (wrapperRef.current) observer.observe(wrapperRef.current);
        if (contentRef.current) observer.observe(contentRef.current); // contentRef 변화도 감지
        return () => observer.disconnect();
    }, [scale, blocks, stickers, floatingTexts, floatingImages, title]);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth;

                // 여유 공간(Padding)을 20px 정도 뺀 너비로 계산하여 꽉 끼는 느낌 방지
                const availableWidth = containerWidth - 20;

                if (availableWidth < BASE_WIDTH && availableWidth > 0) {
                    // 비율 계산: 현재 가용 너비 / 기준 너비
                    const newScale = availableWidth / BASE_WIDTH;
                    setScale(newScale);
                } else {
                    // 충분히 넓으면 원본 크기(1) 유지
                    setScale(1);
                }
            }
        };

        const resizeObserver = new ResizeObserver(() => {
            // ResizeObserver로 컨테이너 크기 변화를 즉시 감지
            window.requestAnimationFrame(handleResize);
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        window.addEventListener('resize', handleResize);
        handleResize(); // 초기 실행

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', handleResize);
        };
    }, [viewMode]);

    // ✨ Delete Key Listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                const activeTag = document.activeElement?.tagName.toLowerCase();
                const isInputActive = activeTag === 'input' || activeTag === 'textarea' || (document.activeElement as HTMLElement).isContentEditable;

                // If editing text, do not delete object
                if (isInputActive) return;

                if ((selectedIds && selectedIds.length > 0) || selectedId) {
                    onDelete();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIds, selectedId, onDelete]);

    // ✨ Reset cropping when selection changes
    useEffect(() => {
        setCroppingId(null);
    }, [selectedId]);

    // ✨ Handle Crop Toggle
    const handleCropToggle = () => {
        if (!selectedId) return;

        if (croppingId === selectedId) {
            setCroppingId(null);
        } else {
            setCroppingId(selectedId);

            // Initialize Crop Data if missing
            // Find item
            let item: any = null;
            if (selectedType === 'sticker') item = stickers.find(s => s.id === selectedId);
            else if (selectedType === 'floatingImage') item = floatingImages.find(f => f.id === selectedId);

            if (item && !item.crop) {
                // Determine implicit type for onUpdate
                // Type is strictly needed by onUpdate
                onUpdate(selectedId, selectedType as any, {
                    crop: {
                        contentX: 0,
                        contentY: 0,
                        contentW: item.w,
                        contentH: item.h
                    }
                });
            }
        }
    };

    // ✨ Update wrapper height to match scaled content

    // ✨ Selection Box Logic
    const handleMouseDown = (e: React.MouseEvent) => {
        if (viewMode !== 'editor') return;

        const target = e.target as HTMLElement;

        if (['input', 'textarea', 'button'].includes(target.tagName.toLowerCase())) return;
        if (target.closest('button')) return;

        e.preventDefault();

        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        const rect = contentRef.current!.getBoundingClientRect();
        // Calculate relative position within the content area, accounting for scale
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        setIsSelecting(true);
        setSelectionBox({ startX: x, startY: y, currentX: x, currentY: y });

        // Clear selection initially if not holding shift
        if (!e.shiftKey) {
            onSelect(null, null);
            setIsToolbarVisible(false); // ✨ Hide toolbar on new selection start
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isSelecting || !selectionBox || !contentRef.current) return;

        const rect = contentRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        setSelectionBox(prev => prev ? { ...prev, currentX: x, currentY: y } : null);
    };

    const handleMouseUp = () => {
        if (isSelecting && selectionBox) {
            // Calculate selection logic
            const boxLeft = Math.min(selectionBox.startX, selectionBox.currentX);
            const boxTop = Math.min(selectionBox.startY, selectionBox.currentY);
            const boxWidth = Math.abs(selectionBox.currentX - selectionBox.startX);
            const boxHeight = Math.abs(selectionBox.currentY - selectionBox.startY);
            const boxRight = boxLeft + boxWidth;
            const boxBottom = boxTop + boxHeight;

            // Threshold to distinguish click from drag
            if (boxWidth > 5 || boxHeight > 5) {
                const newSelectedIds: string[] = [];

                // Helper to check intersection
                const checkIntersection = (id: string, x: number, y: number, w: number, h: number) => {
                    // Try getting DOM element first for accurate size
                    const el = document.getElementById(id);
                    let finalX = x, finalY = y, finalW = w, finalH = h;

                    if (el && contentRef.current) {
                        const elRect = el.getBoundingClientRect();
                        const contentRect = contentRef.current.getBoundingClientRect();

                        // Calculate element position relative to the contentRef, scaled
                        finalX = (elRect.left - contentRect.left) / scale;
                        finalY = (elRect.top - contentRect.top) / scale;
                        finalW = elRect.width / scale;
                        finalH = elRect.height / scale;
                    }

                    if (boxLeft < finalX + finalW &&
                        boxRight > finalX &&
                        boxTop < finalY + finalH &&
                        boxBottom > finalY) {
                        return true;
                    }
                    return false;
                }

                // Check intersection with stickers
                stickers.forEach(stk => {
                    if (checkIntersection(stk.id, stk.x as number, stk.y as number, stk.w as number, stk.h as number)) {
                        newSelectedIds.push(stk.id);
                    }
                });

                // Also check text / images
                floatingTexts.forEach(txt => {
                    if (checkIntersection(txt.id, txt.x as number, txt.y as number, txt.w as number, txt.h as number)) {
                        newSelectedIds.push(txt.id);
                    }
                });

                floatingImages.forEach(img => {
                    if (checkIntersection(img.id, img.x as number, img.y as number, img.w as number, img.h as number)) {
                        newSelectedIds.push(img.id);
                    }
                });

                // ✨ Check blocks (standard content)
                blocks.forEach(blk => {

                    if (checkIntersection(blk.id, 0, 0, 0, 0)) { // x,y,w,h are placeholders, checkIntersection will use DOM rect
                        newSelectedIds.push(blk.id);
                    }
                });

                newSelectedIds.forEach(id => {
                    // Determine type
                    let type: any = 'sticker';
                    if (floatingTexts.some(t => t.id === id)) type = 'floating';
                    if (floatingImages.some(i => i.id === id)) type = 'floatingImage';
                    if (blocks.some(b => b.id === id)) type = 'block'; // ✨ Support blocks

                    // We use isMulti=true to append.
                    if (!selectedIds.includes(id)) {
                        onSelect(id, type, true);
                    }
                });
            }
        }
        setIsSelecting(false);
        setSelectionBox(null);
    };


    // 드래그가 끝났을 때 순서를 바꾸는 함수
    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;
        if (sourceIndex === destinationIndex) return;
        const newBlocks = Array.from(blocks);
        const [reorderedItem] = newBlocks.splice(sourceIndex, 1);
        newBlocks.splice(destinationIndex, 0, reorderedItem);
        setBlocks(newBlocks);
    };

    const handleAddBlock = (type: Block['type']) => {
        const newBlock: Block = {
            id: `manual-${Date.now()}`,
            type, text: '', imageRotation: 0, imageFit: 'cover', styles: { imageHeight: '500px' }
        };
        setBlocks(prev => [...prev, newBlock]);
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === blocks.length - 1) return;
        const newBlocks = [...blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
        setBlocks(newBlocks);
    };

    const handleSwapLayout = (id: string) => {
        setBlocks(prev => prev.map(b => {
            if (b.id !== id) return b;
            if (b.type === 'image-left') return { ...b, type: 'image-right' };
            if (b.type === 'image-right') return { ...b, type: 'image-left' };
            return b;
        }));
    };

    const handleDeleteBlock = (id: string) => {
        setBlocks(prev => prev.filter(b => b.id !== id));
        if (selectedId === id) onSelect('', 'block');
    };

    const getDetectedType = () => {
        if (selectedType) return selectedType;
        if (!selectedId) return null;
        if (selectedId === 'title') return 'title';
        if (blocks.some(b => b.id === selectedId)) return 'block';
        if (stickers.some(s => s.id === selectedId)) return 'sticker';
        if (floatingTexts.some(t => t.id === selectedId)) return 'floating';
        if (floatingImages.some(i => i.id === selectedId)) return 'floatingImage';
        return null;
    };

    const detectedType = getDetectedType();

    const getSelectedItem = () => {
        if (!selectedId || !detectedType) return null;
        if (detectedType === 'title') return { id: 'title', type: 'title', styles: titleStyles };
        if (detectedType === 'block') return blocks.find(b => b.id === selectedId);
        if (detectedType === 'sticker') return stickers.find(s => s.id === selectedId);
        if (detectedType === 'floating') return floatingTexts.find(t => t.id === selectedId);
        if (detectedType === 'floatingImage') return floatingImages.find(i => i.id === selectedId);
        return null;
    };

    const currentItem = getSelectedItem();



    return (
        // 최상위 컨테이너 (Scale Wrapper)
        <div
            ref={containerRef}
            className={`w-full h-full flex items-start justify-center overflow-x-hidden overflow-y-auto py-4 md:py-8 px-2 md:px-0 custom-scrollbar ${viewMode === 'read' ? 'items-center' : ''}`}
            // ✨ Bind selection handlers
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* ✨ [수정] Spacer div 스타일 보강 */}
            <div style={{
                height: scaledHeight,
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                flexShrink: 0 // ✨ 중요: 창이 줄어들어도 이 영역이 찌그러지지 않도록 고정
            }}>
                <div
                    ref={wrapperRef}
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        width: `${BASE_WIDTH}px`,
                        minWidth: `${BASE_WIDTH}px`,
                        minHeight: '200px'
                    }}
                >
                    <div
                        ref={contentRef}
                        className={`w-full max-w-[${CONTENT_MAX_WIDTH}px] mx-auto ${viewMode === 'editor' ? 'min-h-[200px] pb-48' : ''} relative flex flex-col transition-shadow duration-300 overflow-hidden rounded-xl selection-zone`}
                        style={{ ...paperStyles, maxWidth: `${CONTENT_MAX_WIDTH}px` }}
                    >
                        {/* ✨ Background Layer: Title & Separate Pages */}
                        <div className="absolute inset-0 pointer-events-none z-0">
                            {/* Title Background Area */}
                            <div
                                style={{
                                    height: titleHeight ? `${titleHeight}px` : '100px',
                                    // backgroundColor: '#ffffff' // ✨ Allow paperStyles to dictate bg
                                }}
                                className="w-full"
                            />

                            {/* Page Sheets & Gaps */}
                            {Array.from({ length: Math.max(1, Math.ceil(((scaledHeight || 200) - (titleHeight || 0)) / (930 + 20))) + 1 }).map((_, i) => {
                                // Start pages AFTER the title
                                // Page 0 (First Page) starts at titleHeight
                                const PAGE_HEIGHT = 930; // ✨ Adjusted to 930px to match BookView capacity (Editor has padding)
                                const topPos = (titleHeight || 0) + i * (PAGE_HEIGHT + 20);

                                return (
                                    <React.Fragment key={`page-bg-${i}`}>
                                        {/* White Paper Sheet Removed for Dynamic Height */}

                                        {/* Gap / Page Break Indicator */}
                                        <div
                                            className="absolute left-0 w-full h-[20px] flex items-center justify-center z-10"
                                            style={{ top: `${topPos + PAGE_HEIGHT}px` }}
                                        >
                                            <span className="text-[10px] font-medium text-gray-400 bg-gray-100/80 px-2 rounded-full backdrop-blur-sm border border-gray-200">
                                                Page {i + 1} End — Page {i + 2} Start
                                            </span>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        {/* ✨ Selection Overlay */}
                        {isSelecting && selectionBox && (
                            <div
                                style={{
                                    position: 'absolute',
                                    left: Math.min(selectionBox.startX, selectionBox.currentX),
                                    top: Math.min(selectionBox.startY, selectionBox.currentY),
                                    width: Math.abs(selectionBox.currentX - selectionBox.startX),
                                    height: Math.abs(selectionBox.currentY - selectionBox.startY),
                                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                    border: '1px solid rgba(59, 130, 246, 0.5)',
                                    zIndex: 9999,
                                    pointerEvents: 'none'
                                }}
                            />
                        )}

                        {/* 헤더 */}
                        {!hideTitle && (
                            <div
                                ref={titleRef} // ✨ Measure Title Height
                                id="title" // ✨ Added ID for ToolbarOverlay
                                className={`sticky top-0 bg-transparent border-b-0 flex flex-col justify-start items-start transition-all pointer-events-none ${viewMode === 'editor' && selectedId === 'title' ? '' : ''}`}
                                style={{ zIndex: titleStyles.zIndex || 20, backgroundColor: 'transparent' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (viewMode === 'editor') onSelect('title', 'title');
                                }}
                            >
                                <div className="flex justify-between items-start gap-4 pointer-events-auto w-full bg-transparent">
                                    <input
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="제목을 입력하세요"
                                        readOnly={viewMode === 'read'}
                                        className="flex-1 outline-none bg-transparent placeholder-gray-300 min-w-0 h-25 pl-5"
                                        style={{
                                            ...titleStyles,
                                            fontSize: titleStyles.fontSize || '30px',
                                            fontWeight: titleStyles.fontWeight || 'bold',
                                        }}
                                    />
                                </div>
                                {viewMode === 'editor' && selectedId === 'title' && (
                                    // ✨ Toolbar Removed: Moved to Overlay
                                    null
                                )}
                            </div>
                        )}

                        <div className={`flex-1 relative ${viewMode === 'read' ? 'p-6 md:pl-12 md:py-12 md:pr-16' : 'pl-12 py-12 pr-16'}`}>

                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="content-blocks-list">
                                    {(provided) => (
                                        <div
                                            className="space-y-4"
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                        >
                                            {blocks.map((block, index) => {
                                                const isFocused = viewMode === 'editor' && selectedId === block.id;
                                                const canSwap = block.type === 'image-left' || block.type === 'image-right';

                                                return (
                                                    <Draggable
                                                        key={block.id}
                                                        draggableId={block.id}
                                                        index={index}
                                                        isDragDisabled={viewMode === 'read' || !!block.locked}
                                                    >
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                id={block.id} // ✨ Added ID for selection logic
                                                                style={{
                                                                    ...provided.draggableProps.style,
                                                                    opacity: snapshot.isDragging ? 0.8 : 1,
                                                                    zIndex: snapshot.isDragging ? 100 : ((block as any).zIndex || 'auto')
                                                                }}
                                                                className={`relative group transition-shadow duration-200 ${isFocused ? 'rounded-xl' : ''}`}
                                                                onClick={(e) => { e.stopPropagation(); if (viewMode === 'editor') { onSelect(block.id, 'block', e.shiftKey); setIsToolbarVisible(true); } }}
                                                                onDoubleClick={(e) => { e.stopPropagation(); if (viewMode === 'editor') { onSelect(block.id, 'block'); setIsToolbarVisible(true); } }}
                                                            >
                                                                <ContentBlock
                                                                    block={block}
                                                                    onUpdate={(id, k, v) => setBlocks(p => p.map(b => b.id === id ? { ...b, [k]: v } : b))}
                                                                    onDelete={handleDeleteBlock}
                                                                    onImageUpload={onBlockImageUpload}
                                                                    isSelected={isFocused}
                                                                    onSelect={() => { onSelect(block.id, 'block'); setIsToolbarVisible(true); }}
                                                                    readOnly={viewMode === 'read' || !!block.locked}
                                                                    dragHandleProps={provided.dragHandleProps}
                                                                />

                                                                {viewMode === 'editor' && isFocused && (
                                                                    <>
                                                                        {!block.locked && (
                                                                            <div className="absolute -right-14 top-0 h-full flex flex-col justify-center gap-2 z-30">
                                                                                <div className="flex flex-col gap-1 bg-white/80 backdrop-blur rounded-lg shadow-sm p-1 border">
                                                                                    <button onClick={(e) => { e.stopPropagation(); moveBlock(index, 'up'); }} className="p-1.5 rounded hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition"><ArrowUp size={16} /></button>
                                                                                    <button onClick={(e) => { e.stopPropagation(); moveBlock(index, 'down'); }} className="p-1.5 rounded hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition"><ArrowDown size={16} /></button>
                                                                                </div>
                                                                                {canSwap && (
                                                                                    <button onClick={(e) => { e.stopPropagation(); handleSwapLayout(block.id); }} className="p-2 bg-white border shadow-md rounded-full text-indigo-600 hover:bg-indigo-50 transition flex items-center justify-center ring-1 ring-indigo-100"><ArrowRightLeft size={18} /></button>
                                                                                )}
                                                                            </div>
                                                                        )}

                                                                        {/* EditorToolbar Removed: Moved to Overlay */}
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                );
                                            })}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>


                        </div>


                        {floatingTexts.map(txt => (
                            <ResizableItem
                                key={txt.id}
                                {...txt}
                                isSelected={selectedId === txt.id || selectedIds.includes(txt.id)}
                                readOnly={viewMode === 'read' || !!txt.locked}
                                onSelect={(isMulti) => { onSelect(txt.id, 'floating', isMulti); setIsToolbarVisible(true); }}
                                onDoubleClick={() => setIsToolbarVisible(true)}
                                onUpdate={(changes) => onUpdate(txt.id, 'floating', changes)}
                                minY={120} // ✨ Prevent overlap with title
                                scale={scale}
                            >
                                <StickyNote
                                    item={txt}
                                    scale={scale}
                                    isSelected={selectedId === txt.id || selectedIds.includes(txt.id)}
                                    isCropping={croppingId === txt.id} // ✨ Explicit Cropping State
                                    readOnly={viewMode === 'read' || !!txt.locked}
                                    onUpdate={(changes) => onUpdate(txt.id, 'floating', changes)}
                                    onSelect={() => {
                                        if (viewMode === 'editor') {
                                            onSelect(txt.id, 'floating');
                                            setIsToolbarVisible(true);
                                        }
                                    }}
                                />
                            </ResizableItem>
                        ))}

                        {/* Floating Images Layer */}
                        {floatingImages.map((img) => (
                            <ResizableItem
                                key={img.id}
                                id={img.id}
                                x={img.x}
                                y={img.y}
                                w={img.w}
                                h={img.h}
                                rotation={img.rotation}
                                zIndex={img.zIndex}
                                opacity={img.opacity}
                                isSelected={selectedId === img.id || (selectedIds && selectedIds.includes(img.id))}
                                readOnly={viewMode === 'read' || !!img.locked}
                                onSelect={(isMulti) => { if (viewMode === 'editor') { onSelect(img.id, 'floatingImage', isMulti); setIsToolbarVisible(true); } }}
                                onUpdate={(changes) => onUpdate(img.id, 'floatingImage', changes)}
                                onDoubleClick={() => { if (viewMode === 'editor') { onSelect(img.id, 'floatingImage'); setIsToolbarVisible(true); } }}
                                isCropping={croppingId === img.id}
                                crop={img.crop}
                                minY={120} // ✨ Prevent overlap with title
                                scale={scale}
                            >
                                <img
                                    src={img.url}
                                    alt="floating"
                                    className="w-full h-full object-cover pointer-events-none select-none"
                                    draggable={false}
                                />
                                {img.isProcessing && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 rounded-xl">
                                        <Loader2 className="animate-spin text-white" size={32} />
                                    </div>
                                )}
                            </ResizableItem>
                        ))}

                        {/* Stickers Layer */}
                        {stickers.map((sticker) => (
                            <ResizableItem
                                key={sticker.id}
                                id={sticker.id}
                                x={sticker.x}
                                y={sticker.y}
                                w={sticker.w}
                                h={sticker.h}
                                rotation={sticker.rotation}
                                zIndex={sticker.zIndex}
                                opacity={sticker.opacity}
                                isSelected={selectedId === sticker.id || (selectedIds && selectedIds.includes(sticker.id))}
                                readOnly={viewMode === 'read' || !!sticker.locked}
                                onSelect={(isMulti) => { if (viewMode === 'editor') { onSelect(sticker.id, 'sticker', isMulti); setIsToolbarVisible(false); } }}
                                onUpdate={(changes) => onUpdate(sticker.id, 'sticker', changes)}
                                onDoubleClick={() => { if (viewMode === 'editor') { onSelect(sticker.id, 'sticker'); setIsToolbarVisible(true); } }}
                                isCropping={croppingId === sticker.id}
                                crop={sticker.crop}
                                scale={scale}
                            >
                                {sticker.widgetType ? (
                                    <Suspense fallback={<div className="w-full h-full bg-gray-100 animate-pulse rounded-xl" />}>
                                        {sticker.widgetType.startsWith('custom-') ? (
                                            <CustomWidgetPreview
                                                content={sticker.widgetProps?.content || {}}
                                                defaultSize={sticker.widgetProps?.defaultSize || "2x2"}
                                            />
                                        ) : (
                                            (() => {
                                                const WidgetComp = WIDGET_COMPONENT_MAP[sticker.widgetType];
                                                return WidgetComp ? <WidgetComp {...sticker.widgetProps} /> : <div>Widget Load Error</div>;
                                            })()
                                        )}
                                    </Suspense>
                                ) : (
                                    <img
                                        src={sticker.url}
                                        alt="sticker"
                                        className="w-full h-full object-contain pointer-events-none select-none drop-shadow-sm"
                                        draggable={false}
                                    />
                                )}
                                {sticker.isProcessing && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 rounded-xl">
                                        <Loader2 className="animate-spin text-white" size={32} />
                                    </div>
                                )}
                            </ResizableItem>
                        ))}

                        {/* ✨ Old Page Guides Removed - Handled by Background Layer */}

                        {/* ✨ Duplicate Title & Toolbar Removed */}

                    </div>

                </div>
                {viewMode === 'editor' && (
                    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-3 pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-300 w-full px-4">
                        <span className="text-xs font-bold text-gray-600 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full shadow-sm border border-gray-100/50 pointer-events-auto select-none">
                            어떤 내용을 추가할까요?
                        </span>

                        <div className="flex items-center gap-3 p-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 pointer-events-auto ring-1 ring-black/5 hover:bg-white/90 transition-colors max-w-full overflow-x-auto no-scrollbar touch-pan-x">
                            <button onClick={() => handleAddBlock('paragraph')} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-50/80 hover:bg-blue-100 border border-blue-200/50 hover:border-blue-300 rounded-full transition shadow-sm text-blue-700 font-medium text-sm group whitespace-nowrap">
                                <Type size={16} className="group-hover:scale-110 transition-transform" /> <span>글만 쓰기</span>
                            </button>
                            <button onClick={() => handleAddBlock('image-left')} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-green-50/80 hover:bg-green-100 border border-green-200/50 hover:border-green-300 rounded-full transition shadow-sm text-green-700 font-medium text-sm group whitespace-nowrap">
                                <LayoutTemplate size={16} className="group-hover:scale-110 transition-transform" /> <span>사진 + 글</span>
                            </button>
                            <button onClick={() => handleAddBlock('image-full')} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-rose-50/80 hover:bg-rose-100 border border-rose-200/50 hover:border-rose-300 rounded-full transition shadow-sm text-rose-700 font-medium text-sm group whitespace-nowrap">
                                <ImageIcon size={16} className="group-hover:scale-110 transition-transform" /> <span>꽉찬 사진</span>
                            </button>
                            <button onClick={() => handleAddBlock('image-double')} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-purple-50/80 hover:bg-purple-100 border border-purple-200/50 hover:border-purple-300 rounded-full transition shadow-sm text-purple-700 font-medium text-sm group whitespace-nowrap">
                                <div className="flex group-hover:scale-110 transition-transform"><ImageIcon size={14} /><ImageIcon size={14} /></div> <span>사진 2장</span>
                            </button>

                            <div className="flex-shrink-0 w-px h-6 bg-gray-200 mx-1"></div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (contentRef.current && onAddFloatingText) {
                                        const rect = contentRef.current.getBoundingClientRect();
                                        const windowCenterY = window.innerHeight / 2;
                                        const relativeY = (windowCenterY - rect.top) / scale;
                                        const centerX = 260; // Center of 520px
                                        onAddFloatingText(centerX - 100, relativeY - 100);
                                    }
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-yellow-50/80 hover:bg-yellow-100 border border-yellow-200/50 hover:border-yellow-300 rounded-full transition shadow-sm text-yellow-700 font-medium text-sm group whitespace-nowrap"
                            >
                                <StickyNoteIcon size={16} className="group-hover:scale-110 transition-transform" /> <span>포스트잇</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ✨ Fixed Toolbar (Moved outside of scaled content) */}
                {isToolbarVisible && selectedId && currentItem && (
                    <ToolbarOverlay
                        selectedId={selectedId}
                        selectedType={selectedType as any}
                        currentItem={currentItem}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        scale={scale}
                        onCropToggle={handleCropToggle}
                        isCropping={croppingId === selectedId}
                    />
                )}

            </div>
        </div>
    );
}); // ✨ Properly close forwardRef

export default EditorCanvas;