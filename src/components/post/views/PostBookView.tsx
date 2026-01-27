import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { PostData } from '../types';
import MiniPostViewer from '../components/MiniPostPreview';
import { motion } from 'framer-motion';
import AlbumBook from '../components/albumCover/AlbumBook'; // ✨ Using AlbumBook for Back Cover Revert

interface PostBookViewProps {
    posts: PostData[];
    onClose: () => void;
    startIndex?: number;
    // ✨ Optional: Pass generic album info if available for Back Cover art
    currentAlbum?: any;
    onOpenList?: () => void; // ✨ Added prop
}

// ✨ Pagination Helper (Extract to reusable function if needed outside)
const calculatePostPages = (post: PostData) => {
    if (!post || !post.blocks) return [[]];

    const blocks = post.blocks;
    const PAGE_CAPACITY = 9;
    const resultPages: any[][] = [];
    let currentPage: any[] = [];
    let currentWeight = 0;

    blocks.forEach((block) => {
        let weight = 1; // Default Text/List
        if (block.type && (block.type === 'image-full' || block.type === 'image-double' || block.type === 'image-left' || block.type === 'image-right')) {
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

// ✨ Virtual Page Item
interface VirtualPage {
    post: PostData;
    pageIndex: number; // 0-based index within the post
    blocks: any[];
}

// ✨ Constant
const PAGE_HEIGHT = 930;

// ✨ Helper: Filter floating items per page
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

// ✨ Component: PageContent (Defined outside to prevent re-creation)
const PageContent = React.memo(({ page }: { page?: VirtualPage }) => {
    if (!page) return <div className="w-full h-full bg-[#fdfbf7]"></div>;

    const { post, pageIndex, blocks } = page;

    const pageStickers = useMemo(() => getPageItems(post.stickers || [], pageIndex), [post.stickers, pageIndex]);
    const pageFloatingTexts = useMemo(() => getPageItems(post.floatingTexts || [], pageIndex), [post.floatingTexts, pageIndex]);
    const pageFloatingImages = useMemo(() => getPageItems(post.floatingImages || [], pageIndex), [post.floatingImages, pageIndex]);

    return (
        <div className="w-full h-full bg-white relative overflow-hidden group flex items-start justify-center p-6">
            <div className="w-full h-full relative flex items-start justify-center overflow-hidden">
                <div style={{
                    width: '800px',
                    height: `${PAGE_HEIGHT}px`,
                    transform: 'scale(0.7)',
                    transformOrigin: 'top center',
                    position: 'absolute',
                    top: 0,
                }}>
                    <MiniPostViewer
                        title={post.title}
                        titleStyles={post.titleStyles || {}}
                        styles={{ ...(post.styles || {}), boxShadow: 'none' }}
                        blocks={blocks}
                        stickers={pageStickers}
                        floatingTexts={pageFloatingTexts}
                        floatingImages={pageFloatingImages}
                        scale={1}
                        minHeight="100%"
                        hideTitle={true} // PostBookView shows CONTENT only
                        preserveTitleSpace={false}
                        paddingClass="px-24"
                    />
                </div>
            </div>
        </div>
    );
});

const PostBookView: React.FC<PostBookViewProps> = ({ posts, onClose, startIndex = 0, currentAlbum, onOpenList }) => {
    // ✨ Global Pagination State
    const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
    // ✨ Animation State
    const [isClosing, setIsClosing] = useState(false);

    // ✨ Internal Close Handler
    const handleClose = () => {
        setIsClosing(true); // Trigger animation
        setTimeout(() => {
            onClose(); // Call parent close after animation
        }, 1500);
    };

    // ✨ Handle Open List (Bookmark Click)
    const handleOpenList = () => {
        if (onOpenList) {
            setIsClosing(true);
            setTimeout(() => {
                onOpenList();
            }, 1500);
        } else {
            handleClose(); // Fallback
        }
    };



    // ✨ Flatten All Posts into a Single Page Stream
    const allPages: VirtualPage[] = useMemo(() => {
        const pages: VirtualPage[] = [];
        posts.forEach(post => {
            const postPages = calculatePostPages(post);
            postPages.forEach((blocks, idx) => {
                pages.push({
                    post,
                    pageIndex: idx,
                    blocks
                });
            });
        });
        return pages;
    }, [posts]);

    // ✨ Initial Navigation Logic
    // Find the spread that contains the start of the requested post
    const isInitialized = React.useRef(false);
    const prevStartIndex = React.useRef(startIndex);

    React.useEffect(() => {
        if (!posts || posts.length === 0) return;

        // Only run if not initialized OR if startIndex changed
        if (isInitialized.current && prevStartIndex.current === startIndex) {
            return;
        }

        // Find index in allPages where post.id matches or simple index match if IDs unreliable for initial load
        // Let's use simple index matching since startIndex refers to posts array index
        let targetGlobalPageIndex = 0;

        // Calculate accumulated pages before the target post
        for (let i = 0; i < startIndex; i++) {
            const pPages = calculatePostPages(posts[i]);
            targetGlobalPageIndex += pPages.length;
        }

        // Convert to Spread Index (2 pages per spread)
        // If target starts at Page 5 (0-indexed), it's on Spread 2 (Pages 4,5) OR Spread 3 (Pages 6,7)?
        // Page 0,1 -> Spread 0
        // Page 2,3 -> Spread 1
        // Page 4,5 -> Spread 2
        // So Spread Index = Math.floor(targetGlobal/2)
        const newSpreadIndex = Math.floor(targetGlobalPageIndex / 2);
        setCurrentSpreadIndex(newSpreadIndex);

        isInitialized.current = true;
        prevStartIndex.current = startIndex;

    }, [startIndex, posts]); // Run when startIndex changes

    // ✨ Handle Escape Key
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose(); // ✨ Use internal handler
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]); // Dependency strictly onClose, handles wrapper logic validly

    const totalPages = allPages.length;
    const totalSpreads = Math.ceil(totalPages / 2);

    const handleNext = () => {
        if (currentSpreadIndex < totalSpreads - 1) {
            setCurrentSpreadIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentSpreadIndex > 0) {
            setCurrentSpreadIndex(prev => prev - 1);
        }
    };





    const leftPage = allPages[currentSpreadIndex * 2];
    const rightPage = allPages[currentSpreadIndex * 2 + 1];

    // Calculate current logical reference for page numbers/progress
    // We can display "Global Page X / Y" or similar.
    // Or keep the per-spread local index if desired, but continuous mode makes "Spread X" more relevant.

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300 overflow-y-auto">
            {/* ✨ Bookmark to Toggle Folder View */}
            <div
                className="absolute top-0 right-12 z-[60] cursor-pointer group transition-transform hover:translate-y-2 duration-300"
                onClick={handleOpenList} // ✨ Use new handler
            >
                <div className="w-12 h-20 bg-red-600 shadow-lg rounded-b-lg relative flex flex-col items-center justify-end pb-2">
                    {/* Ribbon Cutout effect */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />

                    <span className="text-white font-bold text-xs writing-vertical-rl mb-1 tracking-widest opacity-90 group-hover:opacity-100">
                        목록
                    </span>
                    {/* Stitching effect */}
                    <div className="absolute bottom-2 left-1 right-1 border-b-2 border-dashed border-white/30" />
                </div>
            </div>

            {/* ✨ Close Button (Top Right) - Triggers Full Exit */}
            <button
                onClick={handleClose}
                className="absolute top-6 right-6 z-[70] text-white/50 hover:text-white transition-colors bg-black/20 hover:bg-black/40 rounded-full p-2"
            >
                <X size={24} />
            </button>

            {/* Book Container */}
            <motion.div
                className="relative w-full max-w-6xl min-h-[760px] aspect-[3/2] flex shadow-2xl rounded-lg overflow-hidden"
                animate={{
                    backgroundColor: isClosing ? 'rgba(0,0,0,0)' : '#fdfbf7', // Fade out background
                    boxShadow: isClosing ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // Remove shadow
                    // ✨ Removed maxWidth animation that caused shrinking
                }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            >

                {/* Left Page (Fixed) */}
                <div className="w-1/2 h-full relative border-r border-[#e0e0e0] overflow-hidden bg-white z-0">
                    <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-black/10 to-transparent pointer-events-none z-10"></div>
                    <PageContent page={leftPage} />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-serif">
                        {currentSpreadIndex * 2 + 1}
                    </div>
                </div>

                {/* Right Page (Animates only when closing) */}
                <motion.div
                    className="absolute top-0 w-1/2 h-full z-20 origin-left"
                    style={{
                        left: '50%',
                        transformStyle: 'preserve-3d',
                    }}
                    animate={isClosing ? { rotateY: -180 } : { rotateY: 0 }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* ✨ Thickness / Page Edge (Visible during rotation) */}
                    <div
                        className="absolute inset-y-0 left-0 w-[4px] bg-[#ddd] origin-left"
                        style={{
                            transform: 'rotateY(90deg) translateX(-2px)', // Perpendicular
                            zIndex: 5
                        }}
                    />

                    {/* ✨ Moving Edge Thickness (Right Edge of page) */}
                    <div
                        className="absolute inset-y-0 right-0 w-[6px] bg-[#eee]"
                        style={{
                            transform: 'rotateY(90deg) translateX(3px)', // Edge
                            backfaceVisibility: 'hidden'
                        }}
                    />

                    {/* Front Face: Page Content */}
                    <div
                        className="absolute inset-0 w-full h-full bg-white relative overflow-hidden"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-10"></div>
                        <PageContent page={rightPage} />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-serif">
                            {currentSpreadIndex * 2 + 2}
                        </div>
                    </div>

                    {/* Back Face: Back Cover (Reverted to AlbumBook) */}
                    {isClosing && (
                        <div
                            className="absolute inset-0 w-full h-full bg-white rounded-l-lg overflow-hidden flex flex-col items-center justify-center transform rotate-y-180"
                            style={{
                                backfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)',
                                backgroundColor: '#fff',
                            }}
                        >
                            {/* Inherit Album Cover or Fallback */}
                            {currentAlbum ? (
                                <div className="w-full h-full relative">
                                    <AlbumBook
                                        title={currentAlbum.name}
                                        config={currentAlbum.coverConfig}
                                        count="" // Hide count on back cover usually
                                        className="w-full h-full shadow-none border-none"
                                    />
                                    {/* Overlay for "Back Cover" darkening */}
                                    <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                                </div>
                            ) : (
                                <div className="w-full h-full relative">
                                    <AlbumBook
                                        title="모든 기록 보관함"
                                        config={undefined} // Use default Album styling
                                        count={posts.length > 1 ? posts.length : undefined}
                                        className="w-full h-full shadow-none border-none"
                                        tag={undefined}
                                    />
                                    {/* Overlay for realism */}
                                    <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Navigation */}
                {currentSpreadIndex > 0 && (
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 rounded-full shadow-lg flex items-center justify-center hover:bg-white text-gray-800 z-20 transition-transform hover:scale-110"
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}
                {currentSpreadIndex < totalSpreads - 1 && (
                    <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 rounded-full shadow-lg flex items-center justify-center hover:bg-white text-gray-800 z-20 transition-transform hover:scale-110"
                    >
                        <ChevronRight size={24} />
                    </button>
                )}
            </motion.div>
        </div>
    );
};

export default PostBookView;
