import React from 'react';
import {
    Settings2,
    Plus,
    Trash2,
    Info,
    CheckCircle,
    AlertTriangle,
    XCircle,
    ThumbsUp,
    Heart,
    Zap,
    Star, Search, Film, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight,
    Sparkles, // [NEW] Added for decoration header
    Scissors, Eraser, RotateCcw // ✨ NEW
} from 'lucide-react';
import { useBackgroundRemoval } from '../../../../../hooks/useBackgroundRemoval'; // ✨ NEW
import { uploadImageToSupabase } from '../../../../../components/post/api';
import type { WidgetBlock, WidgetDecoration } from '../types';
import { getLabelByType, generateBlobPoints } from '../utils';

interface Props {
    selectedBlock: WidgetBlock | undefined;
    onUpdateBlock: (id: string, updates: any) => void;
    onDeleteBlock?: (id: string) => void;
    onClose?: () => void;
    // Debcoration Props
    selectedDecoration?: WidgetDecoration;
    onUpdateDecoration?: (id: string, updates: Partial<WidgetDecoration>) => void;
    onDeleteDecoration?: (id: string) => void;
    type?: string;
    onCropToggle?: () => void; // ✨ NEW
    isCropping?: boolean;      // ✨ NEW
}

const RightSidebar: React.FC<Props> = ({
    selectedBlock, onUpdateBlock, onClose,
    selectedDecoration, onUpdateDecoration, onDeleteDecoration,
    onCropToggle, isCropping // ✨ NEW
}) => {
    // ✨ Handle AI Background Removal
    const { removeBg, isProcessing } = useBackgroundRemoval();

    // --- 🌟 [추가] 책 검색을 위한 로컬 상태 ---
    const [bookQuery, setBookQuery] = React.useState('');
    const [bookResults, setBookResults] = React.useState<any[]>([]);
    const [isSearching, setIsSearching] = React.useState(false);

    // --- 🌟 [추가] 영화 검색 상태 ---
    const [movieQuery, setMovieQuery] = React.useState('');
    const [movieResults, setMovieResults] = React.useState<any[]>([]);
    const [isMovieSearching, setIsMovieSearching] = React.useState(false);

    // 블록이 바뀌면 검색 상태 초기화
    React.useEffect(() => {
        setBookQuery('');
        setBookResults([]);
        setIsSearching(false);
        setMovieQuery('');
        setMovieResults([]);
    }, [selectedBlock?.id]);

    const handleRemoveBackground = async () => {
        if (!selectedDecoration || !selectedDecoration.imageUrl || !onUpdateDecoration) return;

        // Set Loading State (Optimistic or local?)
        // WidgetDecoration doesn't have isProcessing field, maybe strictly local or add to type?
        // EditorToolbar updated the ITEM.
        // Let's assume we can block UI with isProcessing from hook.

        try {
            let blobToProcess: Blob;
            const imageUrl = selectedDecoration.imageUrl;

            // Handle Cropped Images: Bake visible area
            if (selectedDecoration.crop) {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = imageUrl;
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });

                const canvas = document.createElement('canvas');
                // Use crop dims
                canvas.width = selectedDecoration.crop.contentW; // Or viewport W?
                // Wait, crop.contentW is the IMAGE width.
                // In EditorToolbar:
                // canvas.width = currentItem.w (viewport)
                // ctx.drawImage(img, crop.contentX, crop.contentY, ...)
                // But wait, contentX/Y are relative to viewport?
                // Actually EditorToolbar logic was:
                // ctx.drawImage(img, crop.contentX, crop.contentY, crop.contentW, crop.contentH)
                // This draws the SUBSET of the image?
                // No, Canvas.draw image(img, sx, sy, sw, sh, dx, dy, dw, dh)
                // EditorToolbar used 5 args: (img, dx, dy, dw, dh).
                // This draws the ENTIRE image into the rect (dx, dy, dw, dh).
                // That logic in EditorToolbar seems to be baking the *transformed* image?
                // Let's re-read EditorToolbar logic carefully (Step 449).

                /*
                ctx.drawImage(
                    img,
                    currentItem.crop.contentX,
                    currentItem.crop.contentY,
                    currentItem.crop.contentW,
                    currentItem.crop.contentH
                );
                */
                // This draws the image at (contentX, contentY) with size (contentW, contentH) onto a canvas of size (w, h).
                // Since contentX/Y are typically negative (panning), this draws the visible portion into the viewport.
                // Correct.

                const viewportW = selectedDecoration.w;
                const viewportH = selectedDecoration.h;

                canvas.width = viewportW;
                canvas.height = viewportH;

                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error("Canvas Context Error");

                ctx.drawImage(
                    img,
                    selectedDecoration.crop.contentX,
                    selectedDecoration.crop.contentY,
                    selectedDecoration.crop.contentW,
                    selectedDecoration.crop.contentH
                );

                const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
                if (!blob) throw new Error("Blob failed");
                blobToProcess = blob;

            } else {
                const response = await fetch(imageUrl, { mode: 'cors' });
                blobToProcess = await response.blob();
            }

            const { url: previewUrl, blob: processedBlob } = await removeBg(blobToProcess);
            if (previewUrl && processedBlob) {
                // 1. Optimistic Update (Preview)
                onUpdateDecoration(selectedDecoration.id, {
                    imageUrl: previewUrl,
                    crop: undefined // Reset crop after BG removal
                });

                // 2. Upload to Supabase (Persistence)
                try {
                    const file = new File([processedBlob], `bg-removed-${Date.now()}.png`, { type: 'image/png' });
                    const supabaseUrl = await uploadImageToSupabase(file);

                    if (supabaseUrl) {
                        onUpdateDecoration(selectedDecoration.id, {
                            imageUrl: supabaseUrl
                        });
                    }
                } catch (uploadError) {
                    console.error("Background removed image upload failed:", uploadError);
                    // Keep the blob URL if upload fails, or show error?
                    // User might lose it on refresh, but better than broken UI now.
                }
            }

        } catch (error) {
            console.error("BG Removal Error:", error);
            alert("배경 제거 중 오류가 발생했습니다.");
        }
    };

    // 🌟 데코레이션 편집 모드
    if (selectedDecoration && !selectedBlock) {
        return (
            <div className="w-80 h-full bg-[var(--bg-card)] border-l border-[var(--border-color)] flex flex-col shadow-xl z-50 overflow-hidden">
                {/* 헤더 */}
                <div className="h-14 flex items-center justify-between px-4 border-b border-[var(--border-color)] bg-[var(--bg-card-secondary)]">
                    <div className="flex items-center gap-2">
                        <Sparkles size={18} className="text-indigo-500" />
                        <span className="font-bold text-[var(--text-primary)]">배경 꾸미기</span>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full dark:hover:bg-white/10 transition-colors">
                        <XCircle size={20} className="text-[var(--text-secondary)]" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* 0. 🌟 [NEW] 미디어 (이미지 / 동영상) 선택 */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">미디어 타입</label>
                        <div className="flex bg-[var(--bg-primary)] p-1 rounded-lg border border-[var(--border-color)]">
                            <button
                                onClick={() => onUpdateDecoration?.(selectedDecoration.id, { mediaType: 'image' })}
                                className={`flex-1 py-1 text-xs font-bold rounded flex items-center justify-center gap-1 transition-colors
                                    ${(selectedDecoration.mediaType || 'image') === 'image'
                                        ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                    }`}
                            >
                                <Search size={12} /> 이미지
                            </button>
                            <button
                                onClick={() => onUpdateDecoration?.(selectedDecoration.id, { mediaType: 'video' })}
                                className={`flex-1 py-1 text-xs font-bold rounded flex items-center justify-center gap-1 transition-colors
                                    ${selectedDecoration.mediaType === 'video'
                                        ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                    }`}
                            >
                                <Film size={12} /> 동영상
                            </button>
                        </div>

                        {/* Image Input */}
                        {(selectedDecoration.mediaType || 'image') === 'image' && (
                            <div className="space-y-2 mt-2">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">이미지 주소</label>
                                <input
                                    type="text"
                                    value={selectedDecoration.imageUrl || ''}
                                    onChange={(e) => onUpdateDecoration?.(selectedDecoration.id, { imageUrl: e.target.value })}
                                    placeholder="이미지 URL 입력..."
                                    className="w-full p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded text-xs text-[var(--text-primary)]"
                                />
                                {/* ✨ Crop & AI Tools */}
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={handleRemoveBackground}
                                        disabled={isProcessing}
                                        className={`flex items-center justify-center gap-1 py-1.5 rounded text-xs font-bold transition-colors
                                            ${isProcessing ? 'bg-violet-100 text-violet-500 animate-pulse' : 'bg-violet-50 text-violet-600 hover:bg-violet-100'} border border-violet-100`}
                                        title={isProcessing ? "배경 제거 중..." : "AI 배경 제거"}
                                    >
                                        <Eraser size={14} className={isProcessing ? "animate-spin" : ""} />
                                        {isProcessing ? '처리 중...' : '배경 제거'}
                                    </button>
                                    <button
                                        onClick={onCropToggle}
                                        className={`flex items-center justify-center gap-1 py-1.5 rounded text-xs font-bold transition-colors border
                                            ${isCropping
                                                ? 'bg-indigo-500 text-white border-indigo-600 shadow-sm'
                                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Scissors size={14} />
                                        {isCropping ? '완료' : '자르기'}
                                    </button>
                                </div>

                                {/* ✨ Crop Tools (Zoom & Reset) */}
                                {isCropping && selectedDecoration.crop && (
                                    <div className="mt-2 p-2 bg-[var(--bg-secondary)] rounded border border-[var(--border-color)] animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Search size={12} className="text-[var(--text-tertiary)]" />
                                            <input
                                                type="range"
                                                min="100"
                                                max="300"
                                                step="1"
                                                value={(selectedDecoration.crop.contentW / (selectedDecoration.w || 100)) * 100}
                                                onChange={(e) => {
                                                    if (!onUpdateDecoration || !selectedDecoration.crop) return;
                                                    const scale = parseInt(e.target.value) / 100;
                                                    const baseW = selectedDecoration.w || 100;
                                                    const currentW = selectedDecoration.crop.contentW;
                                                    const newW = baseW * scale;

                                                    // Maintain Aspect Ratio
                                                    const aspect = selectedDecoration.crop.contentW / selectedDecoration.crop.contentH;
                                                    const newH = newW / aspect;

                                                    // Center Zoom (Adjustment)
                                                    const diffW = newW - currentW;
                                                    const diffH = newH - selectedDecoration.crop.contentH;

                                                    onUpdateDecoration(selectedDecoration.id, {
                                                        crop: {
                                                            ...selectedDecoration.crop,
                                                            contentW: newW,
                                                            contentH: newH,
                                                            contentX: selectedDecoration.crop.contentX - (diffW / 2),
                                                            contentY: selectedDecoration.crop.contentY - (diffH / 2)
                                                        }
                                                    });
                                                }}
                                                className="flex-1 h-1 bg-[var(--border-color)] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                            />
                                            <span className="text-[10px] text-[var(--text-secondary)] w-8 text-right font-mono">
                                                {Math.round((selectedDecoration.crop.contentW / (selectedDecoration.w || 100)) * 100)}%
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (onUpdateDecoration) {
                                                    onUpdateDecoration(selectedDecoration.id, {
                                                        crop: undefined
                                                    });
                                                }
                                                if (onCropToggle) onCropToggle();
                                            }}
                                            className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-red-500 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
                                        >
                                            <RotateCcw size={12} /> 자르기 초기화
                                        </button>
                                    </div>
                                )}
                                {selectedDecoration.imageUrl && (
                                    <div className="w-20 h-20 bg-[var(--bg-primary)] rounded border border-[var(--border-color)] overflow-hidden mx-auto">
                                        <img src={selectedDecoration.imageUrl} alt="preview" className="w-full h-full object-contain" />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Video Input */}
                        {selectedDecoration.mediaType === 'video' && (
                            <div className="space-y-2 mt-2">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">동영상 주소 (mp4/webm)</label>
                                <input
                                    type="text"
                                    value={selectedDecoration.videoUrl || ''}
                                    onChange={(e) => onUpdateDecoration?.(selectedDecoration.id, { videoUrl: e.target.value })}
                                    placeholder="동영상 URL 입력... (직접 링크)"
                                    className="w-full p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded text-xs text-[var(--text-primary)]"
                                />
                                <div className="flex gap-2">
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[10px] text-[var(--text-secondary)]">시작 시간 (초)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            value={selectedDecoration.videoStartTime || 0}
                                            onChange={(e) => onUpdateDecoration?.(selectedDecoration.id, { videoStartTime: parseFloat(e.target.value) })}
                                            className="w-full p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded text-xs"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[10px] text-[var(--text-secondary)]">종료 시간 (초)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            value={selectedDecoration.videoEndTime || 0}
                                            onChange={(e) => onUpdateDecoration?.(selectedDecoration.id, { videoEndTime: parseFloat(e.target.value) })}
                                            className="w-full p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded text-xs"
                                        />
                                    </div>
                                </div>
                                {selectedDecoration.videoUrl && (
                                    <div className="w-full h-24 bg-[var(--bg-primary)] rounded border border-[var(--border-color)] overflow-hidden mx-auto relative group">
                                        {/* Simple Preview */}
                                        <video
                                            src={selectedDecoration.videoUrl}
                                            className="w-full h-full object-cover"
                                            autoPlay muted loop playsInline
                                            onTimeUpdate={(e) => {
                                                const vid = e.currentTarget;
                                                const start = selectedDecoration.videoStartTime || 0;
                                                const end = selectedDecoration.videoEndTime || 0;
                                                if (end > 0 && vid.currentTime >= end) {
                                                    vid.currentTime = start;
                                                }
                                            }}
                                        />
                                        <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1 rounded">Preview</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 🌟 [NEW] Blob Regeneration (Restored at Top) */}
                    {selectedDecoration.type === 'blob' && (
                        <div className="space-y-2 pb-3 mb-3 border-b border-[var(--border-color)]">
                            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">도형 생성</label>
                            <button
                                onClick={() => onUpdateDecoration?.(selectedDecoration.id, { points: generateBlobPoints() })}
                                className="w-full py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded hover:bg-[var(--bg-card-hover)] text-xs font-bold flex items-center justify-center gap-2"
                            >
                                <Sparkles size={14} /> 랜덤 모양 생성
                            </button>
                        </div>
                    )}

                    {/* 1. 색상 선택 */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">색상</label>
                        <div className="flex flex-wrap gap-2">
                            {['#a5b4fc', '#818cf8', '#6366f1', '#fb7185', '#f472b6', '#2dd4bf', '#34d399', '#fbbf24', '#f87171', '#94a3b8'].map((c) => (
                                <button
                                    key={c}
                                    onClick={() => onUpdateDecoration?.(selectedDecoration.id, { color: c })}
                                    className={`w-6 h-6 rounded-full border border-gray-300 shadow-sm transition-transform hover:scale-110 ${selectedDecoration.color === c ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                            {/* 🌟 Custom Color Picker */}
                            <label className="w-6 h-6 rounded-full border border-gray-300 shadow-sm transition-transform hover:scale-110 cursor-pointer flex items-center justify-center bg-white overflow-hidden relative group" title="커스텀 색상 선택">
                                <div className="absolute inset-0 bg-gradient-to-br from-red-400 via-green-400 to-blue-400 opacity-50 group-hover:opacity-80 transition-opacity" />
                                <Plus size={14} className="text-gray-700 z-10" />
                                <input
                                    type="color"
                                    value={selectedDecoration.color}
                                    onChange={(e) => onUpdateDecoration?.(selectedDecoration.id, { color: e.target.value })}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full p-0 border-0"
                                />
                            </label>
                        </div>
                    </div>

                    {/* 2. 투명도 */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                            <label className="font-bold uppercase">투명도</label>
                            <span>{Math.round(selectedDecoration.opacity * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={selectedDecoration.opacity}
                            onChange={(e) => onUpdateDecoration?.(selectedDecoration.id, { opacity: parseFloat(e.target.value) })}
                            className="w-full accent-indigo-500 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* 3. 크기 & 회전 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">크기 (W)</label>
                            <input
                                type="number"
                                value={selectedDecoration.w}
                                onChange={(e) => onUpdateDecoration?.(selectedDecoration.id, { w: Number(e.target.value) })}
                                className="w-full p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded text-sm text-[var(--text-primary)]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">크기 (H)</label>
                            <input
                                type="number"
                                value={selectedDecoration.h}
                                onChange={(e) => onUpdateDecoration?.(selectedDecoration.id, { h: Number(e.target.value) })}
                                className="w-full p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded text-sm text-[var(--text-primary)]"
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                                <label className="font-bold uppercase">회전</label>
                                <span>{selectedDecoration.rotation || 0}°</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="360"
                                step="15"
                                value={selectedDecoration.rotation || 0}
                                onChange={(e) => onUpdateDecoration?.(selectedDecoration.id, { rotation: Number(e.target.value) })}
                                className="w-full accent-indigo-500 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* 4. 위치 (X, Y) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">X 위치 (%)</label>
                            <input
                                type="number"
                                value={selectedDecoration.x}
                                onChange={(e) => onUpdateDecoration?.(selectedDecoration.id, { x: Number(e.target.value) })}
                                className="w-full p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded text-sm text-[var(--text-primary)]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Y 위치 (%)</label>
                            <input
                                type="number"
                                value={selectedDecoration.y}
                                onChange={(e) => onUpdateDecoration?.(selectedDecoration.id, { y: Number(e.target.value) })}
                                className="w-full p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded text-sm text-[var(--text-primary)]"
                            />
                        </div>
                    </div>



                    {/* 6. 🌟 [NEW] 애니메이션 설정 */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">애니메이션</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['none', 'spin', 'pulse', 'float', 'wiggle', 'bounce'].map((anim) => (
                                <button
                                    key={anim}
                                    onClick={() => {
                                        if (anim === 'none') {
                                            onUpdateDecoration?.(selectedDecoration.id, { animation: undefined });
                                        } else {
                                            onUpdateDecoration?.(selectedDecoration.id, {
                                                animation: {
                                                    type: anim as any,
                                                    duration: selectedDecoration.animation?.duration || 3,
                                                    delay: selectedDecoration.animation?.delay || 0
                                                }
                                            });
                                        }
                                    }}
                                    className={`p-2 text-xs rounded border transition-all capitalized ${selectedDecoration.animation?.type === anim || (!selectedDecoration.animation && anim === 'none')
                                        ? 'bg-indigo-600 text-white border-indigo-500'
                                        : 'bg-[var(--bg-primary)] text-[var(--text-primary)] border-[var(--border-color)] hover:bg-[var(--bg-card-hover)]'
                                        }`}
                                >
                                    {anim === 'none' ? '없음' : anim}
                                </button>
                            ))}
                        </div>
                        {selectedDecoration.animation && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <div className="space-y-1">
                                    <span className="text-[10px] text-[var(--text-secondary)]">속도 (초)</span>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        value={selectedDecoration.animation.duration || 3}
                                        onChange={(e) => onUpdateDecoration?.(selectedDecoration.id, {
                                            animation: { ...selectedDecoration.animation!, duration: Number(e.target.value) }
                                        })}
                                        className="w-full p-1.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-[var(--text-secondary)]">지연 (초)</span>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={selectedDecoration.animation.delay || 0}
                                        onChange={(e) => onUpdateDecoration?.(selectedDecoration.id, {
                                            animation: { ...selectedDecoration.animation!, delay: Number(e.target.value) }
                                        })}
                                        className="w-full p-1.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded text-xs"
                                    />
                                </div>
                            </div>
                        )}
                    </div>


                </div>
                {/* Footer: 삭제 */}
                <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-card-secondary)]">
                    <button
                        onClick={() => {
                            if (confirm('이 꾸미기 요소를 삭제하시겠습니까?')) {
                                onDeleteDecoration?.(selectedDecoration.id);
                                onClose?.();
                            }
                        }}
                        className="w-full flex items-center justify-center gap-2 p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-bold"
                    >
                        <Trash2 size={16} />
                        삭제하기
                    </button>
                </div>
            </div >
        );
    }

    if (!selectedBlock) return <EmptyState />;

    const { type, content, styles } = selectedBlock;

    // リ스트 항목 업데이트 헬퍼
    const updateListItem = (index: number, value: string) => {
        const newItems = [...content.items];
        newItems[index] = value;
        onUpdateBlock(selectedBlock.id, { content: { items: newItems } });
    };

    // 리스트 항목 추가
    const addListItem = () => {
        onUpdateBlock(selectedBlock.id, { content: { items: [...content.items, '새 항목'] } });
    };

    // 리스트 항목 삭제
    const removeListItem = (index: number) => {
        const newItems = content.items.filter((_: any, i: number) => i !== index);
        onUpdateBlock(selectedBlock.id, { content: { items: newItems } });
    };

    const updateContent = (key: string, value: any) => {
        onUpdateBlock(selectedBlock.id, { content: { ...content, [key]: value } });
    };

    // 책 검색 함수
    const searchBooks = async () => {
        if (!bookQuery.trim()) return;
        setIsSearching(true);
        try {
            const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(bookQuery)}&maxResults=5`);
            const data = await res.json();
            setBookResults(data.items || []);
        } catch (e) {
            console.error(e);
            alert('검색 중 오류가 발생했습니다.');
        } finally {
            setIsSearching(false);
        }
    };


    // 영화 검색 함수 (TMDB API 사용)
    const searchMovies = async () => {
        if (!movieQuery.trim()) return;
        setIsMovieSearching(true);
        try {
            const API_KEY = 'd7ddca14f677d7854d5e222002f435ee';
            const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(movieQuery)}&language=ko-KR&include_adult=false`;

            const res = await fetch(url);
            const data = await res.json();
            setMovieResults(data.results || []);
        } catch (e) {
            console.error(e);
            alert('영화 검색 실패 (TMDB API)');
        } finally {
            setIsMovieSearching(false);
        }
    };

    // 영화 선택 핸들러 (상세 정보 Fetch)
    const handleSelectTMDBMovie = async (movie: any) => {
        try {
            const API_KEY = 'd7ddca14f677d7854d5e222002f435ee';
            // 감독 정보를 얻기 위해 credits API 호출
            const creditRes = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${API_KEY}&language=ko-KR`);
            const creditData = await creditRes.json();

            const director = creditData.crew?.find((c: any) => c.job === 'Director')?.name || '';
            const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '';
            const year = movie.release_date ? movie.release_date.split('-')[0] : '';

            onUpdateBlock(selectedBlock.id, {
                content: {
                    ...content,
                    movieData: {
                        title: movie.title,
                        poster: posterUrl,
                        year: year,
                        director: director,
                        plot: movie.overview
                    }
                }
            });
            setMovieResults([]);
            setMovieQuery('');
        } catch (e) {
            console.error(e);
            alert('영화 상세 정보 가져오기 실패');
        }
    };

    return (
        <aside className="w-80 bg-white/80 backdrop-blur-md border-l border-[var(--border-color)] flex flex-col text-sm h-full max-md:w-full">
            <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
                <h2 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Settings2 size={16} /> {getLabelByType(type)} 설정
                </h2>
                {onClose && (
                    <button onClick={onClose} className="p-1 hover:bg-[var(--bg-card-secondary)] rounded md:hidden">
                        <XCircle size={20} className="text-[var(--text-secondary)]" />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-[var(--border-color)]">

                {/* --- 1. 콘텐츠 설정 (타입별 분기) --- */}
                <div className="space-y-4">
                    <Label>DATA & CONTENT</Label>

                    {/* A. 기본 텍스트류 */}
                    {['heading1', 'heading2', 'heading3', 'text', 'typing-text', 'quote', 'callout', 'spoiler', 'highlight', 'vertical-text',].includes(type) && (
                        <TextArea
                            value={content.text}
                            onChange={(val: string) => updateContent('text', val)}
                            placeholder="내용을 입력하세요"
                        />
                    )}
                    {/* 🌟 [NEW] 책 정보 위젯 설정 (사이드바 검색 통합) */}
                    {type === 'book-info' && (
                        <div className="space-y-4">
                            <Label>도서 검색 및 설정</Label>

                            {/* 1. 데이터가 없을 때: 검색 UI 표시 */}
                            {!content.bookData ? (
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <span className="text-xs text-[var(--text-secondary)]">책 제목 검색</span>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={bookQuery}
                                                onChange={(e) => setBookQuery(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && searchBooks()}
                                                placeholder="예: 해리포터"
                                                className="flex-1 bg-[var(--bg-card-secondary)] text-[var(--text-primary)] p-2 rounded border border-[var(--border-color)] outline-none text-xs placeholder:text-[var(--text-secondary)]"
                                            />
                                            <button
                                                onClick={searchBooks}
                                                disabled={isSearching}
                                                className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold disabled:opacity-50"
                                            >
                                                {isSearching ? '...' : <Search size={14} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* 검색 결과 리스트 */}
                                    {bookResults.length > 0 && (
                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-600 border-t border-[var(--border-color)] pt-2">
                                            <span className="text-xs text-[var(--text-secondary)] block mb-1">검색 결과 (클릭하여 선택)</span>
                                            {bookResults.map((item) => {
                                                const info = item.volumeInfo;
                                                return (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => {
                                                            // 책 선택 시 content 업데이트
                                                            const newBookData = {
                                                                title: info.title || '제목 없음',
                                                                authors: info.authors || ['저자 미상'],
                                                                publisher: info.publisher || '',
                                                                publishedDate: info.publishedDate || '',
                                                                description: info.description || '',
                                                                thumbnail: info.imageLinks?.thumbnail || '',
                                                                previewLink: info.previewLink || ''
                                                            };
                                                            onUpdateBlock(selectedBlock.id, {
                                                                content: { ...content, bookData: newBookData }
                                                            });
                                                            // 상태 초기화
                                                            setBookResults([]);
                                                            setBookQuery('');
                                                        }}
                                                        className="flex gap-2 p-2 rounded bg-[var(--bg-card-secondary)] hover:bg-[var(--bg-card)] cursor-pointer border border-transparent hover:border-indigo-500 transition-all"
                                                    >
                                                        <div className="w-8 h-12 bg-[var(--bg-card)] flex-shrink-0 rounded overflow-hidden">
                                                            {info.imageLinks?.thumbnail && (
                                                                <img src={info.imageLinks.thumbnail} alt="" className="w-full h-full object-cover" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-xs font-bold text-gray-200 truncate">{info.title}</div>
                                                            <div className="text-[10px] text-[var(--text-secondary)] truncate">{info.authors?.join(', ')}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* 2. 데이터가 있을 때: 편집 폼 표시 */
                                <>
                                    <div className="p-3 bg-indigo-900/20 border border-indigo-500/30 rounded flex gap-3 items-start mb-2">
                                        <div className="w-10 h-14 bg-[var(--bg-card)] rounded overflow-hidden flex-shrink-0">
                                            {content.bookData.thumbnail && <img src={content.bookData.thumbnail} alt="" className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs font-bold text-indigo-300 truncate">{content.bookData.title}</div>
                                            <div className="text-[10px] text-[var(--text-secondary)]">선택된 도서입니다.</div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <span className="text-xs text-[var(--text-secondary)]">제목 수정</span>
                                        <Input
                                            value={content.bookData.title}
                                            onChange={(val: string) => {
                                                onUpdateBlock(selectedBlock.id, {
                                                    content: { ...content, bookData: { ...content.bookData, title: val } }
                                                });
                                            }}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <span className="text-xs text-[var(--text-secondary)]">저자</span>
                                        <Input
                                            value={(Array.isArray(content.bookData.authors) ? content.bookData.authors : []).join(', ')}
                                            onChange={(val: string) => {
                                                const arr = val.split(',').map(s => s.trim());
                                                onUpdateBlock(selectedBlock.id, {
                                                    content: { ...content, bookData: { ...content.bookData, authors: arr } }
                                                });
                                            }}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <span className="text-xs text-[var(--text-secondary)]">책 소개</span>
                                        <TextArea
                                            value={content.bookData.description}
                                            onChange={(val: string) => {
                                                onUpdateBlock(selectedBlock.id, {
                                                    content: { ...content, bookData: { ...content.bookData, description: val } }
                                                });
                                            }}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <span className="text-xs text-[var(--text-secondary)]">이미지 URL</span>
                                        <Input
                                            value={content.bookData.thumbnail}
                                            onChange={(val: string) => {
                                                onUpdateBlock(selectedBlock.id, {
                                                    content: { ...content, bookData: { ...content.bookData, thumbnail: val } }
                                                });
                                            }}
                                        />
                                    </div>

                                    <div className="pt-2 border-t border-[var(--border-color)] mt-2">
                                        <button
                                            onClick={() => {
                                                if (confirm('현재 책 정보를 삭제하고 다시 검색하시겠습니까?')) {
                                                    onUpdateBlock(selectedBlock.id, { content: { ...content, bookData: null } });
                                                    setBookResults([]);
                                                    setBookQuery('');
                                                }
                                            }}
                                            className="w-full py-2 bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800 rounded text-xs transition-colors flex justify-center items-center gap-2"
                                        >
                                            <Trash2 size={12} /> 책 삭제 (재검색)
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                    {/* 🌟 [NEW] 별점/평점 전용 설정 */}
                    {type === 'rating' && (
                        <div className="space-y-4">
                            <Label>평점 설정</Label>

                            {/* 1. 현재 점수 슬라이더 */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                                    <span>점수</span>
                                    <span>{content.value} / {content.max}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max={content.max || 5}
                                    value={content.value || 0}
                                    onChange={(e) => updateContent('value', Number(e.target.value))}
                                    className="w-full h-2 bg-[var(--bg-card-hover)] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>

                            {/* 2. 최대 개수 설정 */}
                            <div className="space-y-1">
                                <Label>최대 개수</Label>
                                <div className="flex gap-2">
                                    {[5, 10].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => updateContent('max', num)}
                                            className={`flex-1 py-1 text-xs rounded border transition-colors ${content.max === num
                                                ? 'bg-indigo-600 text-white border-indigo-500'
                                                : 'bg-[var(--bg-card-secondary)] text-[var(--text-primary)] border-[var(--border-color)] hover:bg-[var(--bg-card-hover)]'
                                                }`}
                                        >
                                            {num}개
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 3. 아이콘 모양 선택 */}
                            <div className="space-y-1">
                                <Label>아이콘 모양</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { val: 'star', icon: <Star size={16} fill="currentColor" /> },
                                        { val: 'heart', icon: <Heart size={16} fill="currentColor" /> },
                                        { val: 'zap', icon: <Zap size={16} fill="currentColor" /> },
                                        { val: 'thumb', icon: <ThumbsUp size={16} fill="currentColor" /> },
                                    ].map((item) => (
                                        <button
                                            key={item.val}
                                            onClick={() => updateContent('icon', item.val)}
                                            className={`p-2 rounded flex justify-center items-center transition-all ${content.icon === item.val
                                                ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-500'
                                                : 'bg-[var(--bg-card-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                                                }`}
                                            title={item.val}
                                        >
                                            {item.icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {/* 🌟 [NEW] 타이핑 효과 전용 설정 (속도) */}
                    {type === 'typing-text' && (
                        <div className="space-y-4">
                            {/* 기존 속도 조절 */}
                            <div className="space-y-2">
                                <Label>타이핑 속도 (ms)</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="range"
                                        min="30"
                                        max="300"
                                        step="10"
                                        value={content.speed || 100}
                                        onChange={(e) => updateContent('speed', Number(e.target.value))}
                                        className="flex-1"
                                    />
                                    <span className="text-xs text-[var(--text-secondary)] w-8 text-right">{content.speed || 100}</span>
                                </div>
                            </div>

                            {/* 🆕 [NEW] 백스페이스 효과 토글 버튼 */}
                            <div className="flex items-center gap-2 bg-[var(--bg-card-secondary)] p-2.5 rounded border border-[var(--border-color)]">
                                <input
                                    type="checkbox"
                                    id="backspace-toggle"
                                    checked={!!content.isBackspaceMode}
                                    onChange={(e) => updateContent('isBackspaceMode', e.target.checked)}
                                    className="w-4 h-4 rounded border-[var(--border-color)] text-indigo-600 focus:ring-indigo-500 bg-[var(--bg-card-hover)] cursor-pointer"
                                />
                                <label htmlFor="backspace-toggle" className="text-xs text-[var(--text-primary)] cursor-pointer select-none flex-1">
                                    백스페이스 효과 (지워짐)
                                </label>
                            </div>

                            <p className="text-[10px] text-[var(--text-secondary)]">
                                켜짐: 한 글자씩 지워집니다.<br />
                                꺼짐: 문장이 한 번에 사라지고 반복됩니다.
                            </p>
                        </div>

                    )}

                    {/* 🌟 [NEW] 스크롤 텍스트 전용 설정 (속도) */}
                    {type === 'scroll-text' && (
                        <div className="space-y-2">
                            <Label>스크롤 속도 (초)</Label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="3"
                                    max="30"
                                    step="1"
                                    value={content.speed || 10}
                                    onChange={(e) => updateContent('speed', Number(e.target.value))}
                                    className="flex-1"
                                />
                                <span className="text-xs text-[var(--text-secondary)] w-8 text-right">{content.speed || 10}s</span>
                            </div>
                            <p className="text-[10px] text-[var(--text-secondary)]">숫자가 작을수록 빨리 지나갑니다.</p>
                        </div>
                    )}
                    {/* 🌟 [NEW] 수식(Math) 설정 */}
                    {type === 'math' && (
                        <div className="space-y-3">
                            <Label>LaTeX 수식 입력</Label>
                            <TextArea
                                value={content.text}
                                onChange={(val: string) => updateContent('text', val)}
                                placeholder="예: E = mc^2"
                            />

                            {/* 자주 쓰는 수식 버튼들 (편의기능) */}
                            <div className="grid grid-cols-4 gap-1">
                                {[
                                    { label: '분수', code: '\\frac{a}{b}' },
                                    { label: '루트', code: '\\sqrt{x}' },
                                    { label: '제곱', code: 'x^2' },
                                    { label: '시그마', code: '\\sum' },
                                    { label: '알파', code: '\\alpha' },
                                    { label: '베타', code: '\\beta' },
                                    { label: '화살표', code: '\\rightarrow' },
                                    { label: '무한', code: '\\infty' },
                                ].map((item) => (
                                    <button
                                        key={item.label}
                                        onClick={() => updateContent('text', (content.text || '') + item.code)}
                                        className="bg-[var(--bg-card-secondary)] hover:bg-[var(--btn-ghost-hover)] text-[var(--text-primary)] text-[10px] py-1 rounded border border-[var(--border-color)]"
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-[var(--bg-card)]/50 p-2 rounded text-[10px] text-[var(--text-secondary)]">
                                💡 LaTeX 문법을 지원합니다.<br />
                                예: \frac&#123;a&#125;&#123;b&#125;
                            </div>
                        </div>
                    )}
                    {/* 🌟 [NEW] 콜아웃 전용 설정 */}
                    {type === 'callout' && (
                        <div className="space-y-3 mb-4 p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)]">
                            <Label>콜아웃 타입</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { value: 'info', icon: <Info size={16} />, color: 'text-blue-400', bg: 'bg-blue-900/30' },
                                    { value: 'success', icon: <CheckCircle size={16} />, color: 'text-green-400', bg: 'bg-green-900/30' },
                                    { value: 'warning', icon: <AlertTriangle size={16} />, color: 'text-orange-400', bg: 'bg-orange-900/30' },
                                    { value: 'error', icon: <XCircle size={16} />, color: 'text-red-400', bg: 'bg-red-900/30' }
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => updateContent('type', opt.value)}
                                        className={`flex flex-col items-center justify-center p-2 rounded transition-all ${content.type === opt.value
                                            ? `${opt.bg} border border-${opt.color.split('-')[1]}-500/50 ring-1 ring-${opt.color.split('-')[1]}-500`
                                            : 'hover:bg-[var(--bg-card-hover)] border border-transparent'
                                            }`}
                                        title={opt.value}
                                    >
                                        <div className={opt.color}>{opt.icon}</div>
                                    </button>
                                ))}
                            </div>

                            <div className="pt-2 border-t border-[var(--border-color)] mt-2">
                                <Label>제목 (선택사항)</Label>
                                <Input
                                    value={content.title}
                                    onChange={(val: string) => updateContent('title', val)}
                                    placeholder="제목 없음"
                                />
                            </div>
                        </div>
                    )}

                    {/* 🆕 4. 토글 목록 설정 */}
                    {type === 'toggle-list' && (
                        <div className="space-y-3">
                            <Label>제목 설정</Label>
                            <Input
                                value={content.title}
                                onChange={(val: string) => updateContent('title', val)}
                                placeholder="토글 제목"
                            />

                            <Label>숨겨진 목록 편집</Label>
                            {content.items.map((item: string, idx: number) => (
                                <div key={idx} className="flex gap-2">
                                    <Input
                                        value={item}
                                        onChange={(val: string) => {
                                            const newItems = [...content.items];
                                            newItems[idx] = val;
                                            updateContent('items', newItems);
                                        }}
                                    />
                                    <button onClick={() => {
                                        const newItems = content.items.filter((_: any, i: number) => i !== idx);
                                        updateContent('items', newItems);
                                    }} className="text-[var(--text-secondary)] hover:text-red-400"><Trash2 size={14} /></button>
                                </div>
                            ))}
                            <button onClick={() => updateContent('items', [...content.items, '새 항목'])} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs">
                                + 항목 추가
                            </button>
                        </div>
                    )}
                    {selectedBlock?.type === 'mindmap' && (
                        <div className="space-y-3">
                            <div className="text-xs font-bold text-[var(--text-primary)]">Mind Map</div>

                            {(() => {
                                const nodes = selectedBlock.content.nodes || [];
                                const edges = selectedBlock.content.edges || [];
                                const selectedNodeId = selectedBlock.content.selectedNodeId || null;
                                const selectedNode = nodes.find((n: any) => n.id === selectedNodeId);

                                const addNode = () => {
                                    const newId = `mm-n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
                                    onUpdateBlock(selectedBlock.id, {
                                        content: {
                                            ...selectedBlock.content,
                                            nodes: [
                                                ...nodes,
                                                {
                                                    id: newId,
                                                    type: 'mindmap',
                                                    position: { x: 20 * nodes.length, y: 20 * nodes.length },
                                                    data: { label: 'New Node' },
                                                },
                                            ],
                                            selectedNodeId: newId,
                                        },
                                    });
                                };

                                const deleteNode = () => {
                                    if (!selectedNodeId) return;
                                    onUpdateBlock(selectedBlock.id, {
                                        content: {
                                            ...selectedBlock.content,
                                            nodes: nodes.filter((n: any) => n.id !== selectedNodeId),
                                            edges: edges.filter(
                                                (e: any) => e.source !== selectedNodeId && e.target !== selectedNodeId
                                            ),
                                            selectedNodeId: null,
                                        },
                                    });
                                };

                                const updateLabel = (label: string) => {
                                    if (!selectedNodeId) return;
                                    onUpdateBlock(selectedBlock.id, {
                                        content: {
                                            ...selectedBlock.content,
                                            nodes: nodes.map((n: any) =>
                                                n.id === selectedNodeId ? { ...n, data: { ...(n.data || {}), label } } : n
                                            ),
                                        },
                                    });
                                };

                                return (
                                    <>
                                        <button
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded"
                                            onClick={addNode}
                                        >
                                            노드 추가
                                        </button>

                                        <label className="block text-xs text-[var(--text-secondary)]">선택 노드 라벨</label>
                                        <input
                                            className="w-full bg-[var(--bg-card-secondary)] border border-[var(--border-color)] rounded px-2 py-1 text-xs text-[var(--text-primary)]"
                                            value={selectedNode?.data?.label || ''}
                                            disabled={!selectedNodeId}
                                            onChange={(e) => updateLabel(e.target.value)}
                                        />

                                        <button
                                            className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded disabled:opacity-40"
                                            disabled={!selectedNodeId}
                                            onClick={deleteNode}
                                        >
                                            선택 노드 삭제
                                        </button>

                                        <div className="text-[11px] text-[var(--text-secondary)]">
                                            Nodes: {nodes.length} / Edges: {edges.length}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    )}

                    {selectedBlock?.type === 'flashcards' && (
                        <div className="space-y-3">
                            <div className="text-xs font-bold text-[var(--text-primary)]">Flashcards</div>

                            {/* 제목 */}
                            <label className="block text-xs text-[var(--text-secondary)]">Title</label>
                            <input
                                className="w-full bg-[var(--bg-card-secondary)] border border-[var(--border-color)] rounded px-2 py-1 text-xs text-[var(--text-primary)]"
                                value={selectedBlock.content.title || ''}
                                onChange={(e) =>
                                    onUpdateBlock(selectedBlock.id, {
                                        content: { ...selectedBlock.content, title: e.target.value },
                                    })
                                }
                            />

                            {/* 카드 추가 */}
                            <button
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded"
                                onClick={() => {
                                    const prevCards = selectedBlock.content.cards || [];
                                    const newCard = {
                                        id: `fc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                                        front: '',
                                        back: '',
                                    };

                                    onUpdateBlock(selectedBlock.id, {
                                        content: {
                                            ...selectedBlock.content,
                                            cards: [newCard, ...prevCards],
                                            currentIndex: 0,
                                            showBack: false,
                                        },
                                    });
                                }}
                            >
                                카드 추가
                            </button>

                            {/* 현재 카드 편집 */}
                            {(() => {
                                const cards = (selectedBlock.content.cards || []) as any[];
                                const idx = Math.min(selectedBlock.content.currentIndex ?? 0, Math.max(cards.length - 1, 0));
                                const cur = cards[idx];

                                if (!cur) {
                                    return <div className="text-xs text-[var(--text-secondary)]">카드가 없습니다.</div>;
                                }

                                const updateCard = (patch: any) => {
                                    const next = cards.map((c, i) => (i === idx ? { ...c, ...patch } : c));
                                    onUpdateBlock(selectedBlock.id, {
                                        content: { ...selectedBlock.content, cards: next },
                                    });
                                };

                                const removeCurrent = () => {
                                    const nextCards = cards.filter((_, i) => i !== idx);
                                    const nextIndex = Math.max(0, Math.min(idx, nextCards.length - 1));
                                    onUpdateBlock(selectedBlock.id, {
                                        content: {
                                            ...selectedBlock.content,
                                            cards: nextCards,
                                            currentIndex: nextIndex,
                                            showBack: false,
                                        },
                                    });
                                };

                                return (
                                    <div className="space-y-2 border border-gray-800 rounded p-2">
                                        <div className="flex items-center justify-between">
                                            <div className="text-xs text-[var(--text-secondary)]">
                                                Editing: {idx + 1}/{cards.length}
                                            </div>
                                            <button
                                                className="text-xs font-bold text-red-400 hover:text-red-300"
                                                onClick={removeCurrent}
                                            >
                                                삭제
                                            </button>
                                        </div>

                                        <label className="block text-xs text-[var(--text-secondary)]">Front</label>
                                        <textarea
                                            className="w-full bg-[var(--bg-card-secondary)] border border-[var(--border-color)] rounded px-2 py-1 text-xs text-[var(--text-primary)] min-h-[70px]"
                                            value={cur.front || ''}
                                            onChange={(e) => updateCard({ front: e.target.value })}
                                        />

                                        <label className="block text-xs text-[var(--text-secondary)]">Back</label>
                                        <textarea
                                            className="w-full bg-[var(--bg-card-secondary)] border border-[var(--border-color)] rounded px-2 py-1 text-xs text-[var(--text-primary)] min-h-[70px]"
                                            value={cur.back || ''}
                                            onChange={(e) => updateCard({ back: e.target.value })}
                                        />

                                        <div className="flex gap-2">
                                            <button
                                                className="flex-1 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-gray-200 text-xs font-bold py-2 rounded disabled:opacity-40"
                                                disabled={idx === 0}
                                                onClick={() =>
                                                    onUpdateBlock(selectedBlock.id, {
                                                        content: { ...selectedBlock.content, currentIndex: idx - 1, showBack: false },
                                                    })
                                                }
                                            >
                                                이전 카드
                                            </button>
                                            <button
                                                className="flex-1 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-gray-200 text-xs font-bold py-2 rounded disabled:opacity-40"
                                                disabled={idx >= cards.length - 1}
                                                onClick={() =>
                                                    onUpdateBlock(selectedBlock.id, {
                                                        content: { ...selectedBlock.content, currentIndex: idx + 1, showBack: false },
                                                    })
                                                }
                                            >
                                                다음 카드
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* 🌟 [NEW] 진행 게이지(Progress Bar) 설정 */}
                    {type === 'progress-bar' && (
                        <div className="space-y-4">
                            <Label>게이지 설정</Label>

                            {/* 라벨 입력 */}
                            <div className="space-y-1">
                                <span className="text-xs text-[var(--text-secondary)]">제목 (라벨)</span>
                                <Input
                                    value={content.label}
                                    onChange={(val: string) => updateContent('label', val)}
                                    placeholder="예: 달성률"
                                />
                            </div>

                            {/* 값 설정 */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <span className="text-xs text-[var(--text-secondary)]">현재 값</span>
                                    <input
                                        type="number"
                                        value={content.value || 0}
                                        onChange={(e) => updateContent('value', Number(e.target.value))}
                                        className="w-full bg-[var(--bg-card-secondary)] text-[var(--text-primary)] p-2 rounded border border-[var(--border-color)] outline-none text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-[var(--text-secondary)]">최대 값</span>
                                    <input
                                        type="number"
                                        value={content.max || 100}
                                        onChange={(e) => updateContent('max', Number(e.target.value))}
                                        className="w-full bg-[var(--bg-card-secondary)] text-[var(--text-primary)] p-2 rounded border border-[var(--border-color)] outline-none text-xs"
                                    />
                                </div>
                            </div>

                            {/* 🔥 [수정됨] 주석 해제 및 스타일 선택 기능 구현 */}
                            <div className="space-y-1">
                                <span className="text-xs text-[var(--text-secondary)]">스타일</span>
                                <select
                                    value={content.style || 'bar'}
                                    onChange={(e) => updateContent('style', e.target.value)}
                                    className="w-full bg-[var(--bg-card-secondary)] text-[var(--text-primary)] p-2 rounded border border-[var(--border-color)] outline-none text-xs cursor-pointer"
                                >
                                    <option value="bar">직선형 (Bar)</option>
                                    <option value="circle">원형 (Circle)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {selectedBlock?.type === 'pdf-viewer' && (
                        <div className="space-y-3">
                            <div className="text-xs font-bold text-[var(--text-primary)]">PDF Viewer</div>

                            <label className="block text-xs text-[var(--text-secondary)]">PDF 업로드</label>
                            <input
                                type="file"
                                accept="application/pdf"
                                className="block w-full text-xs text-[var(--text-primary)]"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const url = URL.createObjectURL(file);
                                    onUpdateBlock(selectedBlock.id, {
                                        content: {
                                            ...selectedBlock.content,
                                            fileUrl: url,
                                            fileName: file.name,
                                        },
                                    });
                                }}
                            />

                            <label className="block text-xs text-[var(--text-secondary)]">PDF URL</label>
                            <input
                                className="w-full bg-[var(--bg-card-secondary)] border border-[var(--border-color)] rounded px-2 py-1 text-xs text-[var(--text-primary)]"
                                value={selectedBlock.content.fileUrl || ''}
                                placeholder="https://...pdf"
                                onChange={(e) => {
                                    onUpdateBlock(selectedBlock.id, {
                                        content: {
                                            ...selectedBlock.content,
                                            fileUrl: e.target.value,
                                            // URL 입력이면 fileName은 비워두거나 유지(취향)
                                        },
                                    });
                                }}
                            />

                            <button
                                className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded"
                                onClick={() => {
                                    const url = selectedBlock.content.fileUrl || '';
                                    if (url.startsWith('blob:')) URL.revokeObjectURL(url);
                                    onUpdateBlock(selectedBlock.id, {
                                        content: { ...selectedBlock.content, fileUrl: '', fileName: '' },
                                    });
                                }}
                            >
                                PDF 초기화
                            </button>
                        </div>
                    )}

                    {/* 🌟 [NEW] 단위 변환기 설정 */}
                    {type === 'unit-converter' && (
                        <div className="space-y-4">
                            <Label>변환기 설정</Label>

                            <div className="space-y-1">
                                <span className="text-xs text-[var(--text-secondary)]">제목</span>
                                <Input
                                    value={content.title}
                                    onChange={(val: string) => updateContent('title', val)}
                                    placeholder="단위 변환기"
                                />
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs text-[var(--text-secondary)]">카테고리 선택</span>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { val: 'length', label: '길이 (m)' },
                                        { val: 'weight', label: '무게 (kg)' },
                                        { val: 'temperature', label: '온도 (°C)' },
                                        { val: 'area', label: '넓이 (평)' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.val}
                                            onClick={() => {
                                                // 카테고리 변경 시 인덱스 초기화
                                                onUpdateBlock(selectedBlock.id, {
                                                    content: {
                                                        ...content,
                                                        category: opt.val,
                                                        fromUnitIdx: 0,
                                                        toUnitIdx: 1,
                                                        value: 1
                                                    }
                                                });
                                            }}
                                            className={`p-2 rounded text-xs border transition-all ${(content.category || 'length') === opt.val
                                                ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
                                                : 'bg-[var(--bg-card-secondary)] text-[var(--text-primary)] border-[var(--border-color)] hover:bg-[var(--bg-card-hover)]'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-[var(--bg-card)]/50 p-2 rounded text-[10px] text-[var(--text-secondary)]">
                                💡 카테고리를 변경하면 입력값이 초기화됩니다.
                            </div>
                        </div>
                    )}

                    {/* 🌟 [NEW] 데이터베이스(Database) 설정 */}
                    {type === 'database' && (
                        <div className="space-y-4">
                            <Label>데이터베이스 설정</Label>

                            {/* 1. 컬럼 헤더 설정 */}
                            <div className="space-y-2">
                                <span className="text-xs text-[var(--text-secondary)] font-bold">컬럼 (헤더)</span>
                                <div className="flex gap-1 flex-wrap">
                                    {(content.headers || []).map((header: string, idx: number) => (
                                        <div key={idx} className="flex items-center bg-indigo-900/50 text-indigo-200 px-2 py-1 rounded text-xs border border-indigo-500/30">
                                            <span>{header}</span>
                                            <button
                                                onClick={() => {
                                                    const newHeaders = content.headers.filter((_: any, i: number) => i !== idx);
                                                    // 헤더 삭제 시 해당 열의 데이터도 삭제하는 로직 필요 (여기선 생략)
                                                    updateContent('headers', newHeaders);
                                                }}
                                                className="ml-1 hover:text-red-400"
                                            >
                                                <Trash2 size={10} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => {
                                            const name = prompt("새 컬럼 이름 입력:");
                                            if (name) updateContent('headers', [...(content.headers || []), name]);
                                        }}
                                        className="px-2 py-1 rounded text-xs bg-[var(--bg-card-hover)] hover:bg-gray-600 text-[var(--text-primary)] flex items-center gap-1"
                                    >
                                        <Plus size={10} /> 컬럼 추가
                                    </button>
                                </div>
                            </div>

                            {/* 2. 데이터 행 관리 (간소화 버전) */}
                            <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-[var(--text-secondary)] font-bold">데이터 목록</span>
                                    <button
                                        onClick={() => {
                                            // 새 빈 행 추가 (헤더 개수만큼 빈 문자열)
                                            const emptyRow = Array((content.headers || []).length).fill('');
                                            updateContent('rows', [...(content.rows || []), emptyRow]);
                                        }}
                                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                                    >
                                        <Plus size={12} /> 행 추가
                                    </button>
                                </div>

                                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                                    {(content.rows || []).map((row: string[], rowIdx: number) => (
                                        <div key={rowIdx} className="bg-[var(--bg-card)] p-2 rounded border border-[var(--border-color)] relative group">
                                            {/* 행 삭제 버튼 */}
                                            <button
                                                onClick={() => {
                                                    const newRows = content.rows.filter((_: any, i: number) => i !== rowIdx);
                                                    updateContent('rows', newRows);
                                                }}
                                                className="absolute right-1 top-1 text-[var(--text-secondary)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={12} />
                                            </button>

                                            {/* 셀 입력 필드들 */}
                                            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }}>
                                                {row.map((cell, cellIdx) => (
                                                    <input
                                                        key={cellIdx}
                                                        type="text"
                                                        value={cell}
                                                        onChange={(e) => {
                                                            const newRows = [...content.rows];
                                                            newRows[rowIdx][cellIdx] = e.target.value;
                                                            updateContent('rows', newRows);
                                                        }}
                                                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded px-1 py-0.5 text-[10px] text-[var(--text-primary)] focus:border-indigo-500 outline-none"
                                                        placeholder={content.headers?.[cellIdx] || ''}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 🌟 [NEW] 여행 플래너 (Travel Plan) 설정 */}
                    {/* 🌟 [NEW] 여행 플래너 (Travel Plan) 설정 */}
                    {type === 'travel-plan' && (
                        <div className="space-y-4">
                            <Label>여행 플래너 설정</Label>

                            {/* 1. 기본 정보 */}
                            <div className="space-y-2">
                                <span className="text-xs text-[var(--text-secondary)] font-bold">기본 정보</span>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-[var(--text-secondary)]">여행지 / 제목</span>
                                    <Input
                                        value={content.travelData?.title}
                                        onChange={(val: string) => {
                                            const newData = { ...(content.travelData || {}), title: val };
                                            onUpdateBlock(selectedBlock.id, { content: { ...content, travelData: newData } });
                                        }}
                                        placeholder="여행지 입력"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-[var(--text-secondary)]">시작일</span>
                                        <input
                                            type="date"
                                            value={content.travelData?.startDate || ''}
                                            onChange={(e) => {
                                                const newData = { ...(content.travelData || {}), startDate: e.target.value };
                                                onUpdateBlock(selectedBlock.id, { content: { ...content, travelData: newData } });
                                            }}
                                            className="w-full bg-[var(--bg-card-secondary)] text-[var(--text-primary)] p-1.5 rounded border border-[var(--border-color)] outline-none text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-[var(--text-secondary)]">종료일</span>
                                        <input
                                            type="date"
                                            value={content.travelData?.endDate || ''}
                                            onChange={(e) => {
                                                const newData = { ...(content.travelData || {}), endDate: e.target.value };
                                                onUpdateBlock(selectedBlock.id, { content: { ...content, travelData: newData } });
                                            }}
                                            className="w-full bg-[var(--bg-card-secondary)] text-[var(--text-primary)] p-1.5 rounded border border-[var(--border-color)] outline-none text-xs"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-[var(--text-secondary)]">통화 (Currency)</span>
                                    <Input
                                        value={content.travelData?.currency}
                                        onChange={(val: string) => {
                                            const newData = { ...(content.travelData || {}), currency: val };
                                            onUpdateBlock(selectedBlock.id, { content: { ...content, travelData: newData } });
                                        }}
                                        placeholder="KRW, USD, etc."
                                    />
                                </div>
                            </div>

                            {/* 2. 컬럼 관리 (Notion Style) */}
                            <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                                <span className="text-xs text-[var(--text-secondary)] font-bold">테이블 컬럼 (데이터베이스)</span>
                                <div className="flex flex-col gap-2">
                                    {(content.travelData?.columns || []).map((col: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2 bg-[var(--bg-card-secondary)] p-2 rounded text-xs border border-[var(--border-color)]">
                                            {/* Type Icon / Select */}
                                            <div className="relative group/type">
                                                <div className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded text-gray-600 cursor-pointer hover:bg-indigo-100">
                                                    {col.type === 'text' && 'T'}
                                                    {col.type === 'number' && '#'}
                                                    {col.type === 'date' && '📅'}
                                                    {col.type === 'select' && '🔽'}
                                                    {col.type === 'checkbox' && '✅'}
                                                </div>
                                                {/* Type Dropdown */}
                                                <select
                                                    value={col.type}
                                                    onChange={(e) => {
                                                        const newCols = [...(content.travelData?.columns || [])];
                                                        newCols[idx] = { ...newCols[idx], type: e.target.value };
                                                        const newData = { ...(content.travelData || {}), columns: newCols };
                                                        onUpdateBlock(selectedBlock.id, { content: { ...content, travelData: newData } });
                                                    }}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                >
                                                    <option value="text">텍스트</option>
                                                    <option value="number">숫자 (비용)</option>
                                                    <option value="date">날짜</option>
                                                    <option value="select">선택 (태그)</option>
                                                    <option value="checkbox">체크박스</option>
                                                </select>
                                            </div>

                                            <input
                                                value={col.name}
                                                onChange={(e) => {
                                                    const newCols = [...(content.travelData?.columns || [])];
                                                    newCols[idx] = { ...newCols[idx], name: e.target.value };
                                                    const newData = { ...(content.travelData || {}), columns: newCols };
                                                    onUpdateBlock(selectedBlock.id, { content: { ...content, travelData: newData } });
                                                }}
                                                className="bg-transparent border-b border-gray-300 w-full outline-none focus:border-indigo-500"
                                            />

                                            <button
                                                onClick={() => {
                                                    const curCols = content.travelData?.columns || [];
                                                    const newCols = curCols.filter((_: any, i: number) => i !== idx);
                                                    const newData = { ...(content.travelData || {}), columns: newCols };
                                                    onUpdateBlock(selectedBlock.id, { content: { ...content, travelData: newData } });
                                                }}
                                                className="text-gray-400 hover:text-red-400"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => {
                                            const curCols = content.travelData?.columns || [];
                                            const newCol = { id: `c-${Date.now()}`, name: '새 속성', type: 'text', width: 100 };
                                            const newCols = [...curCols, newCol];
                                            const newData = { ...(content.travelData || {}), columns: newCols };
                                            onUpdateBlock(selectedBlock.id, { content: { ...content, travelData: newData } });
                                        }}
                                        className="w-full py-1.5 rounded text-xs border border-dashed border-gray-300 hover:border-indigo-400 hover:text-indigo-500 text-gray-400 flex items-center justify-center gap-1"
                                    >
                                        <Plus size={12} /> 속성 추가
                                    </button>
                                </div>

                                <div className="text-[10px] text-[var(--text-secondary)] mt-2 bg-[var(--bg-card-secondary)] p-2 rounded">
                                    <p>💡 Tip:</p>
                                    <ul className="list-disc pl-3 space-y-0.5">
                                        <li>'숫자' 타입 컬럼에 '비용', 'Cost', 'Price'가 포함되면 총 예산에 합산됩니다.</li>
                                        <li>'선택' 타입은 태그처럼 활용하세요.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* 🆕 5. 다단 컬럼 설정 (🔥 여기가 수정된 부분입니다) */}
                    {type === 'columns' && (
                        <div className="space-y-4">
                            <Label>레이아웃 (단 수 조절)</Label>
                            <div className="flex gap-2">
                                {[2, 3, 4].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => {
                                            // 기존 레이아웃(블록 배열들) 가져오기
                                            const currentLayout = content.layout || [[], []];
                                            let newLayout = [...currentLayout];

                                            // 칸 늘리기
                                            if (num > newLayout.length) {
                                                for (let i = newLayout.length; i < num; i++) newLayout.push([]);
                                            }
                                            // 칸 줄이기 (데이터 삭제 주의)
                                            else if (num < newLayout.length) {
                                                if (confirm("칸을 줄이면 내용이 삭제됩니다. 계속하시겠습니까?")) {
                                                    newLayout = newLayout.slice(0, num);
                                                } else {
                                                    return; // 취소
                                                }
                                            }
                                            updateContent('layout', newLayout);
                                        }}
                                        className={`flex-1 py-2 rounded text-xs font-bold transition-colors ${content.layout?.length === num ? 'bg-indigo-600 text-white' : 'bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:bg-gray-600'}`}
                                    >
                                        {num}단
                                    </button>
                                ))}
                            </div>
                            <div className="bg-[var(--bg-card)]/50 p-3 rounded text-[var(--text-secondary)] text-xs leading-relaxed border border-[var(--border-color)]/50">
                                💡 <b>사용법:</b><br />
                                1. 캔버스에서 <b>빈 칸을 클릭</b>하여 선택하세요.<br />
                                2. 왼쪽 메뉴에서 원하는 <b>기능을 클릭</b>하여 칸 안에 추가하세요.
                            </div>
                        </div>
                    )}

                    {/* 🆕 6. 아코디언 설정 */}
                    {type === 'accordion' && (
                        <div className="space-y-3">
                            <Label>제목 (질문)</Label>
                            <Input
                                value={content.title}
                                onChange={(val: string) => updateContent('title', val)}
                                placeholder="아코디언 제목"
                            />

                            <Label>본문 (답변)</Label>
                            <TextArea
                                value={content.body}
                                onChange={(val: string) => updateContent('body', val)}
                                placeholder="펼쳤을 때 보일 내용"
                            />
                        </div>
                    )}

                    {/* --- 1. 구분선 설정 --- */}
                    {type === 'divider' && (
                        <div className="space-y-2">
                            <Label>스타일</Label>
                            <ColorPicker label="선 색상" value={styles.color} onChange={(val: string) => onUpdateBlock(selectedBlock.id, { color: val })} />
                        </div>
                    )}

                    {/* --- 2. 목록 설정 (글머리 & 번호 공통) --- */}
                    {(type === 'bullet-list' || type === 'number-list') && (
                        <div className="space-y-3">
                            <Label>목록 편집</Label>
                            {content.items.map((item: string, idx: number) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <div className="w-6 text-center text-[var(--text-secondary)] text-xs font-bold">
                                        {type === 'number-list' ? `${idx + 1}.` : '•'}
                                    </div>

                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => updateListItem(idx, e.target.value)}
                                        className="flex-1 bg-[var(--bg-card)] text-white p-2 rounded border border-[var(--border-color)] outline-none text-xs focus:border-indigo-500"
                                    />

                                    <button onClick={() => removeListItem(idx)} className="text-[var(--text-secondary)] hover:text-red-400">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}

                            <button
                                onClick={addListItem}
                                className="w-full py-2 flex items-center justify-center gap-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                            >
                                <Plus size={14} /> 항목 추가하기
                            </button>
                        </div>
                    )}

                    {/* B. 할 일 목록 (Todo List) - 배열 관리 */}
                    {type === 'todo-list' && (
                        <div className="space-y-2">
                            {content.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-2 items-center bg-[var(--bg-card)] p-2 rounded">
                                    <input
                                        type="checkbox"
                                        checked={item.done}
                                        onChange={(e) => {
                                            const newItems = [...content.items];
                                            newItems[idx].done = e.target.checked;
                                            updateContent('items', newItems);
                                        }}
                                        className="cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={item.text}
                                        onChange={(e) => {
                                            const newItems = [...content.items];
                                            newItems[idx].text = e.target.value;
                                            updateContent('items', newItems);
                                        }}
                                        className="flex-1 bg-transparent text-white outline-none text-xs"
                                    />
                                    <button
                                        onClick={() => {
                                            const newItems = content.items.filter((_: any, i: number) => i !== idx);
                                            updateContent('items', newItems);
                                        }}
                                        className="text-[var(--text-secondary)] hover:text-red-400"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => updateContent('items', [...content.items, { text: '새 할 일', done: false }])}
                                className="w-full py-2 flex items-center justify-center gap-2 text-xs bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-indigo-400 rounded dashed border border-[var(--border-color)]"
                            >
                                <Plus size={14} /> 항목 추가
                            </button>
                        </div>
                    )}



                    {(type === 'chart-pie' || type === 'chart-bar' || type === 'chart-radar') && (
                        <div className="space-y-3">
                            <Label>차트 데이터 (0 ~ 100)</Label>

                            {/* 헤더 */}
                            <div className="flex text-xs text-[var(--text-secondary)] px-1 gap-2">
                                <span className="flex-1">라벨명</span>
                                <span className="w-12 text-center">점수</span>
                                <span className="w-5"></span>
                            </div>

                            {/* 데이터 리스트 */}
                            {(content.data || []).map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <Input
                                        value={item.label}
                                        onChange={(val: string) => {
                                            const newData = [...content.data];
                                            newData[idx].label = val;
                                            updateContent('data', newData);
                                        }}
                                        placeholder="항목명"
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={item.value}
                                        onChange={(e) => {
                                            const newData = [...content.data];
                                            newData[idx].value = Number(e.target.value);
                                            updateContent('data', newData);
                                        }}
                                        className="w-12 bg-[var(--bg-card)] text-gray-900 p-2 rounded border border-[var(--border-color)] outline-none text-xs text-center"
                                    />
                                    <button
                                        onClick={() => {
                                            const newData = content.data.filter((_: any, i: number) => i !== idx);
                                            updateContent('data', newData);
                                        }}
                                        className="text-[var(--text-secondary)] hover:text-red-400"
                                        title="삭제"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}

                            {/* 추가 버튼 */}
                            <button
                                onClick={() => updateContent('data', [...(content.data || []), { label: '새 항목', value: 50 }])}
                                className="w-full py-2 text-xs bg-indigo-900/50 text-indigo-400 rounded hover:bg-indigo-900 border border-indigo-500/30 transition-colors"
                            >
                                + 데이터 추가
                            </button>

                            {/* 🌟 방사형 차트 전용 옵션 */}
                            {type === 'chart-radar' && (
                                <div className="pt-2 mt-2 border-t border-[var(--border-color)] flex items-center justify-between">
                                    <span className="text-[var(--text-secondary)] text-xs">라벨 표시</span>
                                    <input
                                        type="checkbox"
                                        checked={content.showLabels !== false}
                                        onChange={(e) => updateContent('showLabels', e.target.checked)}
                                        className="cursor-pointer"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                    {/* 🌟 [NEW] 히트맵(잔디) 전용 설정 */}
                    {type === 'heatmap' && (
                        <div className="space-y-4">
                            <Label>잔디 설정</Label>

                            {/* 보기 모드 선택 */}
                            <div className="space-y-2">
                                <span className="text-xs text-[var(--text-secondary)]">조회 기간</span>
                                <div className="grid grid-cols-3 gap-1 bg-[var(--bg-card)] p-1 rounded">
                                    {[
                                        { label: '1년', value: 'year' },
                                        { label: '한 달', value: 'month' },
                                        { label: '일주일', value: 'week' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => updateContent('viewMode', opt.value)}
                                            className={`text-xs py-1.5 rounded transition-colors ${content.viewMode === opt.value
                                                ? 'bg-indigo-600 text-white font-bold'
                                                : 'text-[var(--text-secondary)] hover:text-gray-200'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-[var(--text-secondary)] pt-1">
                                    {content.viewMode === 'year' && '최근 365일의 기록을 보여줍니다.'}
                                    {content.viewMode === 'month' && '최근 30일의 기록을 보여줍니다.'}
                                    {content.viewMode === 'week' && '최근 7일의 기록을 보여줍니다.'}
                                </p>
                            </div>

                            {/* 제목 설정 (선택사항) */}
                            <div className="space-y-1">
                                <Label>제목</Label>
                                <Input
                                    value={content.title}
                                    onChange={(val: string) => updateContent('title', val)}
                                    placeholder="예: 나의 개발 기록"
                                />
                            </div>
                        </div>
                    )}
                    {/* 🌟 [NEW] 영화 티켓 설정 */}
                    {type === 'movie-ticket' && (
                        <div className="space-y-4">
                            <Label>영화 티켓 설정</Label>

                            {/* 1. 영화 데이터가 없을 때: 검색 모드 */}
                            {!content.movieData ? (
                                <div className="space-y-3">
                                    <div className="bg-[var(--bg-card)] p-3 rounded text-center">
                                        <Film className="mx-auto text-[var(--text-secondary)] mb-1" size={20} />
                                        <p className="text-xs text-[var(--text-secondary)]">기록하고 싶은 영화를<br />검색해보세요.</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={movieQuery}
                                            onChange={(e) => setMovieQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && searchMovies()}
                                            placeholder="영화 제목 (예: 인셉션)"
                                            className="flex-1 bg-[var(--bg-card-secondary)] text-[var(--text-primary)] p-2 rounded border border-[var(--border-color)] outline-none text-xs placeholder:text-[var(--text-secondary)]"
                                        />
                                        <button
                                            onClick={searchMovies}
                                            disabled={isMovieSearching}
                                            className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold disabled:opacity-50"
                                        >
                                            검색
                                        </button>
                                    </div>

                                    {/* 검색 결과 리스트 */}
                                    {movieResults.length > 0 && (
                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin border-t border-[var(--border-color)] pt-2">
                                            {movieResults.map((m: any) => {
                                                // TMDB API 데이터 매핑
                                                const year = m.release_date ? m.release_date.substring(0, 4) : '';
                                                const posterUrl = m.poster_path ? `https://image.tmdb.org/t/p/w200${m.poster_path}` : '';

                                                return (
                                                    <div
                                                        key={m.id}
                                                        onClick={() => handleSelectTMDBMovie(m)}
                                                        className="flex gap-2 p-2 rounded bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] cursor-pointer transition-colors border border-transparent hover:border-indigo-500"
                                                    >
                                                        {posterUrl ? (
                                                            <img src={posterUrl} className="w-8 h-12 object-cover rounded bg-black" alt="" />
                                                        ) : (
                                                            <div className="w-8 h-12 bg-gray-800 rounded flex items-center justify-center text-gray-500">
                                                                <Film size={16} />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                            <div className="text-xs font-bold text-gray-200 truncate">{m.title}</div>
                                                            <div className="text-[10px] text-[var(--text-secondary)]">{year}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* 2. 영화 데이터가 있을 때: 정보 입력 모드 */
                                <>
                                    {/* 선택된 영화 요약 */}
                                    <div className="flex gap-3 bg-[var(--bg-card)] p-2 rounded border border-[var(--border-color)]">
                                        <img src={content.movieData.poster} className="w-10 h-14 object-cover rounded bg-black" alt="" />
                                        <div className="min-w-0 flex-1 py-1">
                                            <div className="text-xs font-bold text-indigo-300 truncate">{content.movieData.title}</div>
                                            <button
                                                onClick={() => {
                                                    if (confirm('영화를 변경하시겠습니까? (작성 내용은 유지됩니다)')) {
                                                        onUpdateBlock(selectedBlock.id, { content: { ...content, movieData: null } });
                                                    }
                                                }}
                                                className="text-[10px] text-red-400 hover:underline mt-1 flex items-center gap-1"
                                            >
                                                <Trash2 size={10} /> 영화 다시 검색
                                            </button>
                                        </div>
                                    </div>

                                    {/* 관람 날짜 입력 */}
                                    <div className="space-y-1">
                                        <span className="text-xs text-[var(--text-secondary)]">관람 날짜 (Watched Date)</span>
                                        <input
                                            type="date"
                                            value={content.watchedDate}
                                            onChange={(e) => updateContent('watchedDate', e.target.value)}
                                            className="w-full bg-[var(--bg-card-secondary)] text-[var(--text-primary)] p-2 rounded border border-[var(--border-color)] outline-none text-xs"
                                        />
                                    </div>

                                    {/* 감상평 입력 */}
                                    <div className="space-y-1">
                                        <span className="text-xs text-[var(--text-secondary)]">나의 감상평 (Review)</span>
                                        <TextArea
                                            value={content.review}
                                            onChange={(val: string) => updateContent('review', val)}
                                            placeholder="영화 어떠셨나요? 소감을 남겨보세요."
                                        />
                                    </div>

                                    {/* (선택) 포스터 URL 직접 수정 */}
                                    <div className="space-y-1 pt-2 border-t border-[var(--border-color)]">
                                        <span className="text-xs text-[var(--text-secondary)]">포스터 이미지 URL (선택사항)</span>
                                        <Input
                                            value={content.movieData.poster}
                                            onChange={(val: string) => {
                                                onUpdateBlock(selectedBlock.id, {
                                                    content: {
                                                        ...content,
                                                        movieData: { ...content.movieData, poster: val }
                                                    }
                                                });
                                            }}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                    {/* D. D-Day (카운터/기념일) */}
                    {type === 'counter' && (
                        <>
                            <Input value={content.title} onChange={(val: string) => updateContent('title', val)} placeholder="제목 (예: 시험까지)" />
                            <div className="space-y-1">
                                <span className="text-xs text-[var(--text-secondary)]">목표 날짜</span>
                                <input
                                    type="date"
                                    value={content.date || ''}
                                    onChange={(e) => updateContent('date', e.target.value)}
                                    className="w-full bg-[var(--bg-card-secondary)] text-[var(--text-primary)] p-2 rounded border border-[var(--border-color)] outline-none"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* --- 2. 스타일 설정 --- */}
                <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
                    <Label>STYLE & APPEARANCE</Label>

                    <div className="grid grid-cols-2 gap-2">
                        <ColorPicker label="글자색" value={styles.color} onChange={(val: string) => onUpdateBlock(selectedBlock.id, { color: val })} />
                        <ColorPicker label="배경색" value={styles.bgColor} onChange={(val: string) => onUpdateBlock(selectedBlock.id, { bgColor: val })} />
                    </div>

                    <Label>TEXT STYLE</Label>
                    <div className="flex flex-wrap gap-2 mt-2 bg-[var(--bg-card)] p-2 rounded border border-[var(--border-color)]">
                        {/* Bold */}
                        <button
                            onClick={() => onUpdateBlock(selectedBlock.id, { bold: !styles.bold })}
                            className={`p-2 rounded transition-colors ${styles.bold ? 'bg-indigo-600 text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'}`}
                            title="Bold"
                        >
                            <Bold size={16} />
                        </button>
                        {/* Italic */}
                        <button
                            onClick={() => onUpdateBlock(selectedBlock.id, { italic: !styles.italic })}
                            className={`p-2 rounded transition-colors ${styles.italic ? 'bg-indigo-600 text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'}`}
                            title="Italic"
                        >
                            <Italic size={16} />
                        </button>
                        {/* Underline */}
                        <button
                            onClick={() => onUpdateBlock(selectedBlock.id, { underline: !styles.underline })}
                            className={`p-2 rounded transition-colors ${styles.underline ? 'bg-indigo-600 text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'}`}
                            title="Underline"
                        >
                            <Underline size={16} />
                        </button>
                        {/* Strikethrough */}
                        <button
                            onClick={() => onUpdateBlock(selectedBlock.id, { strikethrough: !styles.strikethrough })}
                            className={`p-2 rounded transition-colors ${styles.strikethrough ? 'bg-indigo-600 text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'}`}
                            title="Strikethrough"
                        >
                            <Strikethrough size={16} />
                        </button>

                        <div className="w-px h-6 bg-[var(--border-color)] mx-1 self-center"></div>

                        {/* Alignment */}
                        <div className="flex bg-[var(--bg-card-secondary)] rounded overflow-hidden border border-[var(--border-color)]">
                            <button
                                onClick={() => onUpdateBlock(selectedBlock.id, { align: 'left' })}
                                className={`p-2 ${styles.align === 'left' || !styles.align ? 'bg-indigo-600 text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'}`}
                                title="Align Left"
                            >
                                <AlignLeft size={16} />
                            </button>
                            <button
                                onClick={() => onUpdateBlock(selectedBlock.id, { align: 'center' })}
                                className={`p-2 ${styles.align === 'center' ? 'bg-indigo-600 text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'}`}
                                title="Align Center"
                            >
                                <AlignCenter size={16} />
                            </button>
                            <button
                                onClick={() => onUpdateBlock(selectedBlock.id, { align: 'right' })}
                                className={`p-2 ${styles.align === 'right' ? 'bg-indigo-600 text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'}`}
                                title="Align Right"
                            >
                                <AlignRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </aside>
    );
};

// UI 컴포넌트들
const EmptyState = () => (
    <aside className="w-80 h-full bg-white/80 backdrop-blur-md border-l border-[var(--border-color)] flex flex-col items-center justify-center text-[var(--text-secondary)] space-y-2">
        <p className="text-center text-sm">캔버스에서 블록을 선택하세요</p>
    </aside>
);
const Label = ({ children }: any) => <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{children}</div>;
const Input = ({ value, onChange, placeholder }: any) => (
    <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-[var(--bg-card-secondary)] text-[var(--text-primary)] p-2 rounded border border-[var(--border-color)] outline-none focus:border-indigo-500 text-xs placeholder:text-[var(--text-secondary)]" />
);
const TextArea = ({ value, onChange, placeholder }: any) => (
    <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full h-20 bg-[var(--bg-card-secondary)] text-[var(--text-primary)] p-2 rounded border border-[var(--border-color)] outline-none resize-none focus:border-indigo-500 text-xs placeholder:text-[var(--text-secondary)]" />
);
const ColorPicker = ({ label, value, onChange }: any) => (
    <div className="bg-[var(--bg-card-secondary)] p-2 rounded flex items-center justify-between">
        <span className="text-[var(--text-secondary)] text-xs">{label}</span>
        <div className="relative w-6 h-6 rounded-full overflow-hidden border border-[var(--border-color)]">
            <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer" />
        </div>
    </div>
);

export default RightSidebar;