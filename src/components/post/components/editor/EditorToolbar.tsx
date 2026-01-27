import React from 'react';
import {
    Trash2,
    Type,
    AlignLeft,
    AlignCenter,
    AlignRight,
    BringToFront,
    SendToBack,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    ChevronDown,
    ChevronUp, // ✨ Import ChevronUp
    Scissors,
    RotateCcw,
    Search, // ✨ Import Search for Zoom
    Eraser, // ✨ Import Eraser for BG Removal
    Image as ImageIcon, // ✨ Import Image Icon
    Waves // ✨ Import Waves for Text Effects
} from 'lucide-react';
import { useBackgroundRemoval } from '../../../../hooks/useBackgroundRemoval';
import type { Block, Sticker, FloatingText, FloatingImage } from '../../types';
import { FONT_FAMILIES } from '../../constants';

interface Props {
    selectedId: string;
    selectedType: 'block' | 'sticker' | 'floating' | 'floatingImage' | 'title';
    currentItem: Block | Sticker | FloatingText | FloatingImage | any;
    onUpdate: (id: string, type: 'block' | 'sticker' | 'floating' | 'floatingImage' | 'title', changes: any) => void;
    onDelete?: () => void;
    positionMode?: 'fixed' | 'inline';
    // ✨ New Props
    onCropToggle?: () => void;
    isCropping?: boolean;
    scale?: number;
}

const EditorToolbar: React.FC<Props> = ({
    selectedId, selectedType, currentItem, onUpdate, onDelete, positionMode = 'fixed', onCropToggle, isCropping
}) => {
    // const [isLoading, setIsLoading] = useState(false); // ✨ Removed local state in favor of hook
    const [activeMenu, setActiveMenu] = React.useState<'text' | 'bg' | 'effect' | null>(null); // ✨ Single Active Menu State
    const [isCollapsed, setIsCollapsed] = React.useState(false); // ✨ Collapse State

    const itemType = (currentItem as any)?.type;
    const currentZIndex = (currentItem as any).zIndex || 1;

    const handleZIndexChange = (change: number) => {
        const newZIndex = Math.max(1, currentZIndex + change);
        onUpdate(selectedId, selectedType, { zIndex: newZIndex });
    };

    // ✨ Handle AI Background Removal (Local Library)
    const { removeBg, isProcessing } = useBackgroundRemoval();

    const handleRemoveBackground = async () => {
        if (!selectedId || (selectedType !== 'floatingImage' && selectedType !== 'sticker')) return;

        // We need a URL. For stickers/images, we check if they have a source URL.
        const imageUrl = (currentItem as any).url || (currentItem as any).src;
        if (!imageUrl) {
            alert("이미지 처리 중 오류가 발생했습니다.");
            return;
        }

        // Set Loading State ON
        onUpdate(selectedId, selectedType, { isProcessing: true });

        try {
            let blobToProcess: Blob;

            // ✨ Handle Cropped Images: Bake visible area to new Blob
            if (currentItem.crop) {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = imageUrl;

                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });

                const canvas = document.createElement('canvas');
                // Viewport size
                const w = typeof currentItem.w === 'number' ? currentItem.w : parseFloat(currentItem.w);
                const h = typeof currentItem.h === 'number' ? currentItem.h : parseFloat(currentItem.h);

                canvas.width = w;
                canvas.height = h;

                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error("Canvas Context Error");

                // Draw exactly what is visible:
                ctx.drawImage(
                    img,
                    currentItem.crop.contentX,
                    currentItem.crop.contentY,
                    currentItem.crop.contentW,
                    currentItem.crop.contentH
                );

                const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
                if (!blob) throw new Error("Canvas Blob conversion failed");
                blobToProcess = blob;

            } else {
                const response = await fetch(imageUrl, { mode: 'cors' });
                blobToProcess = await response.blob();
            }

            // Remove Background
            const newUrl = await removeBg(blobToProcess);

            if (newUrl) {
                onUpdate(selectedId, selectedType, {
                    url: newUrl,
                    crop: undefined,
                    isProcessing: false // Turn OFF loading
                });
            } else {
                // If it failed silently or returned null?
                onUpdate(selectedId, selectedType, { isProcessing: false });
            }

        } catch (error) {
            console.error("BG Removal Error:", error);
            alert(error instanceof Error ? error.message : "배경 제거 중 오류가 발생했습니다.");
            // Turn OFF loading on error
            onUpdate(selectedId, selectedType, { isProcessing: false });
        }
    };

    const isTextItem = (selectedType === 'block' && ['paragraph', 'image-left', 'image-right', 'image-full', 'image-double'].includes(itemType)) || (selectedType === 'floating') || (selectedType === 'title');
    const isImageItem = (selectedType === 'block' && itemType !== 'paragraph') || selectedType === 'sticker' || selectedType === 'floatingImage';

    const handleTextUpdate = (key: string, value: any) => {
        // ✨ Fix: Always update nested 'styles' for text properties, even for blocks
        const currentStyles = (currentItem as any).styles || {};
        const newStyles = { ...currentStyles, [key]: value };
        onUpdate(selectedId, selectedType, { styles: newStyles });
    };

    // 폰트 크기 숫자(px)만 추출하는 헬퍼
    const getFontSizeNumber = () => {
        const sizeStr = (currentItem as any).styles?.fontSize || '18px';
        return parseInt(sizeStr.replace('px', '')) || 18;
    };

    const positionClasses = positionMode === 'fixed'
        ? "fixed bottom-8 left-1/2 -translate-x-1/2"
        : "absolute top-full mt-2 left-1/2 -translate-x-1/2";

    // ✨ Handle Zoom (Content Resize during Crop OR Sticky Focus)
    const handleZoom = (zoomValue: number) => {
        if (!isCropping) return;

        // ✨ Case 1: Floating Text (Sticky Note) Image Focus
        if (selectedType === 'floating' && (currentItem as FloatingText).imageTransform) {
            const transform = (currentItem as FloatingText).imageTransform || { x: 0, y: 0, scale: 1 };
            onUpdate(selectedId, selectedType, {
                imageTransform: {
                    ...transform,
                    scale: zoomValue
                }
            });
            return;
        }

        // ✨ Case 2: Crop (Images/Stickers)
        if (!currentItem.crop) return;

        const crop = currentItem.crop;
        const currentW = crop.contentW;
        const currentH = crop.contentH;

        // Prevent division by zero
        if (currentW === 0 || currentH === 0) return;

        const aspectRatio = currentW / currentH;

        const scaleFactor = zoomValue; // 0.5 to 4.0
        const viewportW = typeof currentItem.w === 'number' ? currentItem.w : parseFloat(currentItem.w);
        const viewportH = typeof currentItem.h === 'number' ? currentItem.h : parseFloat(currentItem.h);

        // Determine base size (object-fit: cover equivalent at scale 1.0)
        let baseW, baseH;
        if (aspectRatio > (viewportW / viewportH)) {
            baseH = viewportH;
            baseW = viewportH * aspectRatio;
        } else {
            baseW = viewportW;
            baseH = viewportW / aspectRatio;
        }

        const newW = baseW * scaleFactor;
        const newH = baseH * scaleFactor;

        // Current image center relative to viewport
        const imgCenter = {
            x: crop.contentX + currentW / 2,
            y: crop.contentY + currentH / 2
        };

        const anchorX = imgCenter.x;
        const anchorY = imgCenter.y;

        onUpdate(selectedId, selectedType, {
            crop: {
                ...crop,
                contentW: newW,
                contentH: newH,
                contentX: anchorX - newW / 2,
                contentY: anchorY - newH / 2
            }
        });
    };

    const isStickyWithImage = selectedType === 'floating' && !!(currentItem as FloatingText)?.styles?.backgroundImage;

    return (
        <div
            className={`${positionClasses} bg-white/95 backdrop-blur-md shadow-2xl border border-gray-200 rounded-2xl px-6 py-3 flex flex-col sm:flex-row items-center gap-3 z-[100] animate-in slide-in-from-bottom-5 text-gray-900 min-w-[500px] transition-all duration-300`}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
                e.stopPropagation();
                setActiveMenu(null); // ✨ Close menus on background click
            }}
        >
            {/* ✨ Collapse/Expand Toggle (Mobile Friendly) */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-indigo-500 sm:hidden self-start"
            >
                {isCollapsed ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {/* ✨ Content Container (Wrapped) */}
            <div className={`flex flex-wrap items-center gap-2 ${isCollapsed ? 'hidden sm:flex' : 'flex'}`}>


                {/* 1. 레이어 순서 (Floating) & Title & Block */}
                <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400 font-bold mr-1 whitespace-nowrap">순서</span>
                    <button onClick={() => handleZIndexChange(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600" title="뒤로 보내기">
                        <SendToBack size={18} />
                    </button>
                    <span className="text-xs font-mono w-4 text-center">{currentZIndex}</span>
                    <button onClick={() => handleZIndexChange(1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600" title="앞으로 가져오기">
                        <BringToFront size={18} />
                    </button>
                    {/* Visual Separator */}
                    <div className="w-px h-4 bg-gray-200 mx-2 hidden sm:block"></div>
                </div>


                {isTextItem && (
                    <>
                        {/* 폰트 선택 */}
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border">
                            <select
                                value={(currentItem as any).styles?.fontFamily || FONT_FAMILIES[0].value}
                                onChange={(e) => handleTextUpdate('fontFamily', e.target.value)}
                                className="bg-transparent text-sm outline-none cursor-pointer w-24 truncate px-1"
                            >
                                {FONT_FAMILIES.map(font => (
                                    <option key={font.name} value={font.value}>{font.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* 폰트 크기 (px input) */}
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border">
                            <Type size={14} className="text-gray-400 ml-1" />
                            <input
                                type="number"
                                min="10"
                                max="170"
                                value={getFontSizeNumber()}
                                onChange={(e) => handleTextUpdate('fontSize', `${e.target.value}px`)}
                                className="w-12 bg-transparent text-sm outline-none text-center font-mono"
                            />
                            <span className="text-xs text-gray-400 pr-1">px</span>
                        </div>

                        {/* 정렬 버튼 */}
                        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                            {['left', 'center', 'right'].map((align) => (
                                <button key={align} onClick={() => handleTextUpdate('textAlign', align)} className={`p-1.5 rounded-md ${((currentItem as any).styles?.textAlign || 'left') === align ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:bg-gray-200'}`}>
                                    {align === 'left' && <AlignLeft size={14} />}
                                    {align === 'center' && <AlignCenter size={14} />}
                                    {align === 'right' && <AlignRight size={14} />}
                                </button>
                            ))}
                        </div>

                        {/* 텍스트 스타일 드롭다운 (색상 + 꾸미기) */}
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenu(activeMenu === 'text' ? null : 'text');
                                }} // ✨ Stop bubbling
                                className={`flex items-center gap-1 px-3 py-1.5 rounded hover:bg-gray-100 transition ${activeMenu === 'text' ? 'bg-gray-100' : ''}`}
                                title="텍스트 스타일"
                            >
                                <span
                                    className="font-serif font-bold text-lg"
                                    style={{
                                        color: (currentItem as any).styles?.color || '#000000',
                                        textDecoration: (currentItem as any).styles?.textDecoration,
                                        fontStyle: (currentItem as any).styles?.fontStyle
                                    }}
                                >
                                    T
                                </span>
                                <ChevronDown size={12} className="text-gray-400" />
                            </button>

                            {/* 드롭다운 메뉴 */}
                            {activeMenu === 'text' && (
                                <div
                                    onClick={(e) => e.stopPropagation()} // ✨ Check clicks inside menu
                                    className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 flex flex-col gap-2 min-w-[140px] animate-in fade-in zoom-in-95 duration-200"
                                >
                                    {/* 1. 스타일 버튼들 */}
                                    <div className="flex justify-between bg-gray-50 rounded p-1">
                                        <button
                                            onClick={() => handleTextUpdate('fontWeight', (currentItem as any).styles?.fontWeight === 'bold' ? 'normal' : 'bold')}
                                            className={`p-1.5 rounded hover:bg-white hover:shadow-sm transition ${(currentItem as any).styles?.fontWeight === 'bold' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                                            title="굵게"
                                        >
                                            <Bold size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleTextUpdate('fontStyle', (currentItem as any).styles?.fontStyle === 'italic' ? 'normal' : 'italic')}
                                            className={`p-1.5 rounded hover:bg-white hover:shadow-sm transition ${(currentItem as any).styles?.fontStyle === 'italic' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                                            title="기울임"
                                        >
                                            <Italic size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleTextUpdate('textDecoration', (currentItem as any).styles?.textDecoration?.includes('underline') ? 'none' : 'underline')}
                                            className={`p-1.5 rounded hover:bg-white hover:shadow-sm transition ${(currentItem as any).styles?.textDecoration?.includes('underline') ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                                            title="밑줄"
                                        >
                                            <Underline size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleTextUpdate('textDecoration', (currentItem as any).styles?.textDecoration?.includes('line-through') ? 'none' : 'line-through')}
                                            className={`p-1.5 rounded hover:bg-white hover:shadow-sm transition ${(currentItem as any).styles?.textDecoration?.includes('line-through') ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                                            title="취소선"
                                        >
                                            <Strikethrough size={16} />
                                        </button>
                                    </div>

                                    {/* 2. 색상 선택 */}
                                    <div className="relative h-8 rounded-lg overflow-hidden border border-gray-200 cursor-pointer group">
                                        <div
                                            className="w-full h-full flex items-center justify-center gap-2 bg-gray-50 group-hover:bg-gray-100 transition"
                                            style={{ backgroundColor: (currentItem as any).styles?.color || '#000000' + '10' }} // 배경색으로 살짝 틴트
                                        >
                                            <span className="text-xs font-bold text-gray-600 mix-blend-difference">Color</span>
                                            <div className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: (currentItem as any).styles?.color || '#000000' }}></div>
                                        </div>
                                        <input
                                            type="color"
                                            value={(currentItem as any).styles?.color || '#000000'}
                                            onChange={(e) => handleTextUpdate('color', e.target.value)}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 배경색 스타일 드롭다운 (O 아이콘) */}
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenu(activeMenu === 'bg' ? null : 'bg');
                                }} // ✨ Stop bubbling
                                className={`flex items-center gap-1 px-2 py-2 rounded hover:bg-gray-100 transition ${activeMenu === 'bg' ? 'bg-gray-100' : ''}`}
                                title="배경 색상"
                            >
                                <span
                                    className="w-5 h-5 rounded-full border border-gray-300 shadow-sm flex items-center justify-center font-bold text-xs"
                                    style={{ backgroundColor: (currentItem as any).styles?.backgroundColor || 'transparent' }}
                                >
                                    {/* 배경색이 투명이면 빗금 표시 등으로 표현 가능하지만 지금은 심플하게 */}
                                    {!(currentItem as any).styles?.backgroundColor || (currentItem as any).styles?.backgroundColor === 'transparent' ? '/' : ''}
                                </span>
                                <ChevronDown size={12} className="text-gray-400" />
                            </button>

                            {/* 배경색 메뉴 */}
                            {activeMenu === 'bg' && (
                                <div
                                    onClick={(e) => e.stopPropagation()} // ✨ Check clicks inside menu
                                    className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 flex flex-col gap-2 min-w-[140px] animate-in fade-in zoom-in-95 duration-200"
                                >
                                    {/* 색상 선택 */}
                                    <div className="relative h-8 rounded-lg overflow-hidden border border-gray-200 cursor-pointer group">
                                        <div
                                            className="w-full h-full flex items-center justify-center gap-2 bg-gray-50 group-hover:bg-gray-100 transition"
                                        >
                                            <span className="text-xs font-bold text-gray-600">BG Color</span>
                                            <div className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: (currentItem as any).styles?.backgroundColor || 'transparent' }}></div>
                                        </div>
                                        <input
                                            type="color"
                                            value={(currentItem as any).styles?.backgroundColor === 'transparent' ? '#ffffff' : ((currentItem as any).styles?.backgroundColor || '#ffffff')}
                                            onChange={(e) => handleTextUpdate('backgroundColor', e.target.value)}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        />
                                    </div>
                                    {/* 초기화 버튼 */}
                                    <button
                                        onClick={() => handleTextUpdate('backgroundColor', 'transparent')}
                                        className="w-full py-1.5 text-xs font-bold text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition"
                                    >
                                        배경색 없음
                                    </button>

                                    {/* ✨ Custom Image Upload */}
                                    <div className="border-t pt-1 mt-1">
                                        <label className="flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded cursor-pointer transition">
                                            <ImageIcon size={14} />
                                            <span>이미지 배경</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        // Handle Upload
                                                        const { uploadImageToSupabase } = await import('../../api'); // Lazy import or ensure it is imported at top
                                                        const url = await uploadImageToSupabase(file);
                                                        if (url) {
                                                            // ✨ Fix: Batch updates to prevent stale state overwrite
                                                            const currentStyles = (currentItem as any).styles || {};
                                                            onUpdate(selectedId, selectedType, {
                                                                styles: {
                                                                    ...currentStyles,
                                                                    backgroundImage: url,
                                                                    backgroundColor: 'transparent'
                                                                }
                                                            });
                                                        }
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ✨ Text Effect Dropdown (Waves Icon) */}
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenu(activeMenu === 'effect' ? null : 'effect');
                                }} // ✨ Stop bubbling
                                className={`flex items-center gap-1 px-2 py-2 rounded hover:bg-gray-100 transition ${activeMenu === 'effect' ? 'bg-gray-100' : ''}`}
                                title="텍스트 효과"
                            >
                                <Waves size={18} className={/* Active indicator */ (currentItem as any).styles?.textEffect && (currentItem as any).styles?.textEffect !== 'none' ? 'text-indigo-600' : 'text-gray-600'} />
                                <ChevronDown size={12} className="text-gray-400" />
                            </button>

                            {activeMenu === 'effect' && (
                                <div
                                    onClick={(e) => e.stopPropagation()} // ✨ Check clicks inside menu
                                    className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 flex flex-col gap-2 min-w-[140px] animate-in fade-in zoom-in-95 duration-200"
                                >
                                    <span className="text-xs font-bold text-gray-400 px-1">텍스트 효과</span>
                                    {['none', 'curve', 'wave', 'double-wave'].map((effect) => (
                                        <button
                                            key={effect}
                                            onClick={() => {
                                                const currentStyles = (currentItem as any).styles || {};
                                                onUpdate(selectedId, selectedType, {
                                                    styles: {
                                                        ...currentStyles,
                                                        textEffect: effect,
                                                        textPathPoints: undefined // ✨ Reset points to force re-initialization
                                                    }
                                                });
                                            }}
                                            className={`px-3 py-2 text-sm rounded text-left transition ${((currentItem as any).styles?.textEffect || 'none') === effect ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-gray-50 text-gray-700'}`}
                                        >
                                            {effect === 'none' && '없음'}
                                            {effect === 'curve' && '둥글게'}
                                            {effect === 'wave' && '물결'}
                                            {effect === 'double-wave' && '더블 물결'}
                                        </button>
                                    ))}


                                </div>
                            )}
                        </div>

                        {/* ✨ Sticky Note Image Focus Button & Controls */}
                        {isStickyWithImage && onCropToggle && (
                            <>
                                <div className="w-px h-4 bg-gray-200 mx-1 hidden sm:block"></div>
                                <button
                                    onClick={onCropToggle}
                                    className={`p-2 rounded-lg transition items-center justify-center flex
                                    ${isCropping ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-200' : 'text-gray-600 hover:bg-gray-100'}
                                `}
                                    title={isCropping ? "완료" : "확대/이동"}
                                >
                                    <Scissors size={18} />
                                </button>

                                {isCropping && (
                                    <div className="flex items-center gap-2 bg-blue-50/50 px-3 py-1.5 rounded-xl border border-blue-100 animate-in fade-in zoom-in-95">
                                        <Search size={14} className="text-blue-400" />
                                        <input
                                            type="range"
                                            min="1"
                                            max="3"
                                            step="0.1"
                                            value={(currentItem as FloatingText).imageTransform?.scale || 1}
                                            onChange={(e) => handleZoom(parseFloat(e.target.value))}
                                            className="w-24 accent-blue-500 h-1.5 cursor-pointer"
                                        />
                                        <button
                                            onClick={() => {
                                                const newFit = (currentItem as FloatingText).imageFit === 'contain' ? 'cover' : 'contain';
                                                onUpdate(selectedId, selectedType, {
                                                    imageFit: newFit,
                                                    imageTransform: { x: 0, y: 0, scale: 1 } // ✨ Reset transform to original state
                                                });
                                            }}
                                            className="text-[10px] font-bold text-blue-600 bg-white border border-blue-200 px-1.5 py-0.5 rounded hover:bg-blue-50 ml-1"
                                        >
                                            {(currentItem as FloatingText).imageFit === 'contain' ? '꽉 채우기' : '다 보이기'}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                    </>
                )}

                {isImageItem && (
                    <>
                        {selectedType === 'block' && (
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 font-bold whitespace-nowrap">사진 높이</span>
                                <input
                                    type="range" min="200" max="800" step="10"
                                    value={parseInt((currentItem as Block).styles?.imageHeight || '300')}
                                    onChange={(e) => onUpdate(selectedId, 'block', { imageHeight: `${e.target.value}px` })}
                                    className="w-32 accent-indigo-600 cursor-pointer h-2 bg-gray-200 rounded-lg appearance-none"
                                />
                            </div>
                        )}
                        {(selectedType === 'sticker' || selectedType === 'floatingImage') && (
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 font-bold whitespace-nowrap">투명도</span>
                                <input
                                    type="range" min="0" max="1" step="0.01"
                                    value={(currentItem as any).opacity ?? 1}
                                    onChange={(e) => onUpdate(selectedId, selectedType, { opacity: parseFloat(e.target.value) })}
                                    className="w-32 accent-indigo-600 cursor-pointer h-2 bg-gray-200 rounded-lg appearance-none"
                                />
                            </div>
                        )}

                        {/* ✨ AI & Crop Controls */}
                        {(selectedType === 'sticker' || selectedType === 'floatingImage') && onCropToggle && (
                            <div className="border-l pl-3 ml-2 border-gray-200 flex items-center gap-3">
                                <button
                                    onClick={handleRemoveBackground}
                                    disabled={isProcessing}
                                    className={`p-2 rounded-lg transition items-center justify-center flex text-violet-600 hover:bg-violet-50
                                    ${isProcessing ? 'animate-pulse bg-violet-50' : ''}
                                `}
                                    title={currentItem.crop ? "자른 영역 배경 제거 (저장)" : "배경 제거 (AI)"}
                                >
                                    <Eraser size={18} className={isProcessing ? "animate-bounce" : ""} />
                                </button>

                                <button
                                    onClick={onCropToggle}
                                    className={`p-2 rounded-lg transition items-center justify-center flex
                                    ${isCropping ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-200' : 'text-gray-600 hover:bg-gray-100'}
                                `}
                                    title={isCropping ? "자르기 완료" : "자르기"}
                                >
                                    <Scissors size={18} />
                                </button>

                                {isCropping && currentItem.crop && (
                                    <>
                                        <div className="flex items-center gap-2 bg-blue-50/50 px-3 py-1.5 rounded-xl border border-blue-100">
                                            <Search size={14} className="text-blue-400" />
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="4"
                                                step="0.05"
                                                value={(currentItem.crop.contentW / (currentItem.w as number)) || 1}
                                                onChange={(e) => handleZoom(parseFloat(e.target.value))}
                                                className="w-24 accent-blue-500 h-1.5 cursor-pointer"
                                            />
                                            <span className="text-[10px] font-bold text-blue-500 w-8">
                                                {Math.round((currentItem.crop.contentW / (currentItem.w as number)) * 100)}%
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => onUpdate(selectedId, selectedType, { crop: undefined })}
                                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition items-center justify-center flex border border-red-100"
                                            title="자르기 초기화"
                                        >
                                            <RotateCcw size={18} />
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </>
                )}

                {onDelete && (
                    <div className="ml-auto flex items-center pl-2 border-l border-gray-200"> {/* Keep Delete at end, add separator */}
                        <button onClick={onDelete} className="flex items-center justify-center text-red-500 hover:bg-red-50 w-8 h-8 rounded-lg transition" title="삭제">
                            <Trash2 size={18} />
                        </button>
                    </div>
                )}    </div>
        </div>
    );
};

export default EditorToolbar;
