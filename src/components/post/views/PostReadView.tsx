import React, { useLayoutEffect, useState, useMemo } from 'react';
import { ChevronRight, Trash2, PenLine } from 'lucide-react';
import PostBreadcrumb from '../components/PostBreadcrumb';
import { useBreadcrumbs } from '../hooks/useBreadcrumbs';


// ✨ Pagination Constants & Helpers
const PAGE_HEIGHT = 930;

const calculatePostPages = (blocks: any[]) => {
    if (!blocks) return [[]];
    const PAGE_CAPACITY = 9;
    const resultPages: any[][] = [];
    let currentPage: any[] = [];
    let currentWeight = 0;

    blocks.forEach((block) => {
        let weight = 1;
        if (block.type && ['image-full', 'image-double', 'image-left', 'image-right'].includes(block.type)) {
            weight = 3;
        }

        if (currentWeight + weight <= PAGE_CAPACITY) {
            currentPage.push(block);
            currentWeight += weight;
        } else {
            resultPages.push(currentPage);
            currentPage = [block];
            currentWeight = weight;
        }

        if (currentWeight === PAGE_CAPACITY) {
            resultPages.push(currentPage);
            currentPage = [];
            currentWeight = 0;
        }
    });

    if (currentPage.length > 0) {
        resultPages.push(currentPage);
    }
    if (resultPages.length === 0) return [[]];
    return resultPages;
};

const getPageItems = (items: any[], pageIdx: number) => {
    if (!items) return [];
    const startY = pageIdx * PAGE_HEIGHT;
    const endY = (pageIdx + 1) * PAGE_HEIGHT;

    return items.filter(item => {
        const y = Number(item.y ?? item.top ?? 0);
        return y >= startY && y < endY;
    }).map(item => ({
        ...item,
        y: Number(item.y ?? item.top ?? 0) - startY,
        top: Number(item.y ?? item.top ?? 0) - startY
    }));
};

import MiniPostPreview from '../components/MiniPostPreview';
import { usePostEditor } from '../hooks/usePostEditor';

interface Props {
    editor: ReturnType<typeof usePostEditor>;
}

const PostReadView: React.FC<Props> = ({ editor }) => {
    // ✨ Breadcrumb Logic
    const breadcrumbs = useBreadcrumbs(editor.selectedAlbumId, editor.customAlbums, (id) => id && editor.handleAlbumClick(id), '내 앨범', false);

    const [scale, setScale] = useState(1);
    const BASE_WIDTH = 800;

    useLayoutEffect(() => {
        const calculateScale = () => {
            const availableWidth = window.innerWidth;
            // Add some padding/margin consideration if needed
            const maxWidth = Math.min(availableWidth - 32, 1200); // 32px for padding

            let newScale = 1;
            if (maxWidth < BASE_WIDTH) {
                newScale = maxWidth / BASE_WIDTH;
            } else {
                newScale = 1;
            }
            setScale(newScale);
        };

        calculateScale();
        window.addEventListener('resize', calculateScale);
        return () => window.removeEventListener('resize', calculateScale);
    }, []);

    const handleDelete = async () => {
        if (!editor.currentPostId) return;
        await editor.handleDeletePost(editor.currentPostId);
    };

    const pages = useMemo(() => calculatePostPages(editor.blocks), [editor.blocks]);
    const verticalGap = 15; // Gap between pages

    return (
        <div className="flex flex-col h-auto min-h-[85vh] gap-6 relative items-center pb-32 ">
            {/* ✨ Breadcrumbs & Actions Header */}
            <div className="w-full max-w-[800px] flex flex-col md:flex-row justify-between items-start md:items-center py-4 px-5 md:px-0 box-border gap-2 md:gap-0 relative z-10">
                <div className="flex items-center gap-3 w-full md:w-auto overflow-hidden">
                    <button
                        onClick={() => {
                            // Smart Back Logic: Go up one level in breadcrumbs if possible?
                            // Or just use the last parent's onClick?
                            // For simplicity, let's use the second to last item's onClick (parent),
                            // or default to Album view if only 1 item.
                            if (breadcrumbs.length > 0) {
                                const parent = breadcrumbs[breadcrumbs.length - 1]; // breadcrumbs currently has [Home], [Album]...
                                parent.onClick?.();
                            } else {
                                editor.setViewMode('album');
                            }
                        }}
                        className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)] rounded-full transition-colors shrink-0"
                        title="뒤로 가기"
                    >
                        <ChevronRight className="rotate-180" size={20} />
                    </button>
                    <div className="overflow-x-auto no-scrollbar">
                        <PostBreadcrumb items={[...breadcrumbs, { label: editor.title || '제목 없음' }]} />
                    </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                        onClick={() => editor.setViewMode('editor')}
                        className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-secondary)] rounded-lg transition-all"
                        title="수정하기"
                    >
                        <PenLine size={18} />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-2 text-[var(--text-secondary)] hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="기록 삭제"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <div
                className="w-full flex flex-col items-center"
                style={{
                    gap: `${verticalGap * scale}px`, // Scaled gap
                    paddingTop: '10px'
                }}
            >
                {/* ✨ Title Paper (Short) */}
                <div
                    className="bg-white shadow-lg relative overflow-hidden"
                    style={{
                        width: `${BASE_WIDTH * scale}px`,
                        height: 'auto', // Auto height for title
                        minHeight: `${60 * scale}px`, // Minimum height
                        borderRadius: `${20 * scale}px`,
                    }}
                >
                    <div
                        style={{
                            transform: `scale(${scale})`,
                            transformOrigin: 'top left',
                            width: `${BASE_WIDTH}px`,
                            height: 'auto',
                            minHeight: '80px', // Match scaled minHeight logic in base pixels
                        }}
                    >
                        <div className="px-12 py-6 flex flex-col justify-center h-full">
                            <h1
                                style={{
                                    ...(editor.titleStyles as React.CSSProperties),
                                    wordBreak: 'break-word',
                                    whiteSpace: 'pre-wrap',
                                    margin: 0,
                                    lineHeight: 1.4,
                                }}
                            >
                                {editor.title || '제목 없음'}
                            </h1>
                        </div>
                    </div>
                </div>

                {pages.map((pageBlocks, index) => {
                    const pageStickers = getPageItems(editor.stickers || [], index);
                    const pageFloatingTexts = getPageItems(editor.floatingTexts || [], index);
                    const pageFloatingImages = getPageItems(editor.floatingImages || [], index);

                    return (
                        <div
                            key={index}
                            className="bg-white shadow-lg relative overflow-hidden"
                            style={{
                                width: `${BASE_WIDTH * scale}px`,
                                height: `${PAGE_HEIGHT * scale}px`,
                                borderRadius: `${20 * scale}px`, // Scaled border radius
                            }}
                        >
                            <div
                                style={{
                                    transform: `scale(${scale})`,
                                    transformOrigin: 'top left',
                                    width: `${BASE_WIDTH}px`,
                                    height: `${PAGE_HEIGHT}px`,
                                }}
                            >
                                <MiniPostPreview
                                    title={editor.title}
                                    titleStyles={editor.titleStyles}
                                    styles={{ ...(editor.paperStyles || {}), boxShadow: 'none', minHeight: '100%' }}
                                    blocks={pageBlocks}
                                    stickers={pageStickers}
                                    floatingTexts={pageFloatingTexts}
                                    floatingImages={pageFloatingImages}
                                    scale={1} // Internal scale is 1, wrapper handles scaling
                                    minHeight="auto"
                                    hideTitle={true} // Always hide title in MiniPostPreview since we render it manually
                                    paddingClass="px-12"
                                />

                                {/* Page Number */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-400 font-serif text-sm pointer-events-none">
                                    {index + 1}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>


        </div>
    );
};

export default PostReadView;
