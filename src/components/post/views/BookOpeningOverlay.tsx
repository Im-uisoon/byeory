
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react'; // ✨ Import Star Icon
import type { PostData } from '../types';
import AlbumBook from '../components/albumCover/AlbumBook'; // ✨ Added Import

interface Props {
    post?: PostData;
    album?: any; // ✨ Support Album Data
    onAnimationComplete: () => void;
    onClose: () => void; // To return to grid if user clicks background
    isLoading?: boolean; // If content is being fetched
    isClosing?: boolean; // ✨ New Prop: Closing Mode
}

type AnimationState = 'ZOOMING' | 'IDLE_CLOSED' | 'OPENING' | 'COMPLETED' | 'CLOSING_START' | 'CLOSING_END';

const BookOpeningOverlay: React.FC<Props> = ({ post, album, onAnimationComplete, onClose, isLoading: externalLoading = false, isClosing = false }) => {
    const [status, setStatus] = useState<AnimationState>(isClosing ? 'CLOSING_START' : 'ZOOMING');

    // ✨ Simplified Loading: No internal fetch needed for Star design
    const isLoading = externalLoading;

    // ✨ Lifecycle Management
    useEffect(() => {
        if (isClosing) {
            // Start Closing Animation immediately
            // But give a small delay to ensure mount?
            requestAnimationFrame(() => {
                setStatus('CLOSING_END');
            });
            setTimeout(() => {
                onAnimationComplete();
            }, 1600); // 1.5s animation + buffer
        } else {
            // Opening Logic
            const timer = setTimeout(() => {
                setStatus('IDLE_CLOSED');
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [isClosing]); // Run on mount or isClosing change

    const handleBookClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (status === 'IDLE_CLOSED' && !isLoading && !isClosing) {
            setStatus('OPENING');
            setTimeout(() => {
                setStatus('COMPLETED');
                onAnimationComplete();
            }, 1500); // 1.5s
        }
    };

    if (status === 'COMPLETED') return null;

    // Geometry Helpers
    // If Closing: We start OPEN (Wrapper x:0, Cover -180, Right 0).
    // Application: Wrapper stays 0. Right Page rotates to -180.
    const isClosingAnim = status === 'CLOSING_START' || status === 'CLOSING_END';

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative"
                style={{
                    // When closed: 520px (COVER ONLY)
                    // When open: 1040px (COVER + CONTENT)
                    // Always full spread width for correct pivot geometry
                    width: '1040px',
                    height: '760px',
                    transition: 'width 1s ease-in-out',
                    perspective: '2000px',
                    transformStyle: 'preserve-3d'
                }}
            >
                {/* 1. THE BOOK WRAPPER */}
                {/* 
                    GEOMETRY FIX:
                    - Container is 1040px.
                    - Spine is at Center (520px).
                    - Closed: Cover is at local Right (520-1040).
                    - We shift the entire container LEFT by 260px (25%) so the Closed Cover is centered on screen.
                    - Open: We shift back to 0. Cover rotates -180 to occupy Left (0-520). Right Page stays at Right (520-1040).
                 */}
                <motion.div
                    className="w-full h-full relative"
                    // layoutId removed to disable zoom from folder linkage
                    initial={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    onClick={handleBookClick}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        x: (status === 'OPENING' || status === 'COMPLETED' || status === 'CLOSING_START' || status === 'CLOSING_END') ? 0 : -260,
                        // ✨ Clip Path: Hide the Left Half (Ghost) when Closed/Zooming, Reveal when Opening
                        clipPath: (status === 'ZOOMING' || status === 'IDLE_CLOSED')
                            ? 'inset(0% 0% 0% 50%)' // Cut left 50%
                            : 'inset(0% 0% 0% 0%)'   // Show full
                    }}
                    style={{
                        transformStyle: 'preserve-3d',
                        cursor: (status === 'IDLE_CLOSED' && !isLoading) ? 'pointer' : 'default'
                    }}
                >
                    {/* === FRONT COVER (Left Side) === */}
                    <motion.div
                        className="absolute top-0 bottom-0 w-[520px] h-full z-20 origin-left"
                        style={{
                            left: '50%', // Anchor to Right Half
                            transformStyle: 'preserve-3d',
                            backfaceVisibility: 'visible', // We want to see the back (Inside Left)
                        }}
                        animate={status === 'OPENING' || isClosingAnim ? {
                            rotateY: -180, // Open (Left)
                        } : {
                            rotateY: 0 // Closed (Right)
                        }}
                        transition={{ duration: 1.5, ease: 'easeInOut' }}
                    >
                        {/* FRONT FACE: Album Art */}
                        <div
                            className="absolute inset-0 w-full h-full bg-white rounded-r-lg shadow-2xl overflow-hidden flex flex-col"
                            style={{ backfaceVisibility: 'hidden' }} // Front only
                        >
                            {/* ✨ Album Cover or Post Cover */}
                            {album ? (
                                <AlbumBook
                                    title={album.name}
                                    tag={album.tag}
                                    count={album.count}
                                    config={album.coverConfig}
                                    className="w-full h-full shadow-none"
                                />
                            ) : (
                                <div className="absolute inset-0 w-full h-full flex flex-col">
                                    {(post?.blocks && post.blocks.find(b => b.type.startsWith('image'))?.imageUrl) ? (
                                        <div className="h-2/3 w-full overflow-hidden relative">
                                            <img
                                                src={post.blocks.find(b => b.type.startsWith('image'))?.imageUrl}
                                                alt="Cover"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/10" />
                                        </div>
                                    ) : (
                                        <div className="h-2/3 w-full bg-[#f0f0f0] flex items-center justify-center">
                                            <span className="text-6xl opacity-20">📖</span>
                                        </div>
                                    )}
                                    <div className="flex-1 bg-white p-8 flex flex-col justify-center items-center text-center relative">
                                        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none" />
                                        <h1 className="text-3xl font-bold text-gray-800 mb-4 line-clamp-3 font-serif" style={post?.titleStyles}>
                                            {post?.title}
                                        </h1>
                                        <div className="w-16 h-1 bg-gray-800 mb-4" />
                                        <p className="text-sm text-gray-500 font-serif">
                                            {post?.date || new Date().toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Loading Overlay */}
                            {isLoading && status === 'IDLE_CLOSED' && (
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
                                    <div className="text-4xl animate-bounce">⏳</div>
                                </div>
                            )}

                            {/* Click Hint */}
                            {!isLoading && status === 'IDLE_CLOSED' && (
                                <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none opacity-0 animate-[fade-in_1s_ease-out_1s_forwards]">
                                    <span className="bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md">
                                        Click to open
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* BACK FACE: Inside Left Page (White Paper with Content) */}
                        <div
                            className="absolute inset-0 w-full h-full bg-white rounded-l-lg shadow-inner flex flex-col overflow-hidden transform rotate-y-180"
                            style={{
                                backfaceVisibility: 'hidden', // Back only
                                backgroundColor: '#ffffff', // ✨ Ensuring White
                                zIndex: 1
                            }}
                        >
                            {/* Inner Page Shadow */}
                            <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-black/10 to-transparent pointer-events-none z-20" />

                            {/* ✨ Inside Cover Content (Left Page - Star Design Placeholder) */}
                            <div className="flex-1 p-0 flex flex-col relative z-10 w-full h-full bg-[#f5f5f5] items-center justify-center">
                                {/* Inner Shadow */}
                                <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/5 to-transparent pointer-events-none" />

                                {/* Content */}
                                <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 delay-100">
                                    {/* ✨ 2D Star Icon */}
                                    <Star
                                        size={120}
                                        fill="#fef3c7" // ✨ Pastel Amber-100
                                        stroke="#fbbf24" // ✨ Pastel/Soft Amber-400
                                        strokeWidth={1.5}
                                        className="mb-4 drop-shadow-md opacity-90"
                                    />
                                    <span className="text-gray-400 font-serif text-lg tracking-widest opacity-80">벼리</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>


                    {/* === RIGHT PAGE (Flipping Back Page) === */}
                    <motion.div
                        className="absolute top-0 w-[520px] h-full z-10 origin-left"
                        style={{
                            left: '50%',
                            transformStyle: 'preserve-3d',
                        }}
                        animate={status === 'CLOSING_END' ? {
                            rotateY: -180
                        } : {
                            rotateY: 0
                        }}
                        transition={{ duration: 1.5, ease: 'easeInOut' }}
                    >
                        {/* FRONT FACE: Content (Page 1) */}
                        <div
                            className="absolute inset-0 w-full h-full bg-white rounded-r-lg shadow-xl overflow-hidden"
                            style={{ backfaceVisibility: 'hidden' }}
                        >
                            <div className="w-full h-full bg-[#fdfbf7] relative">
                                <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-20" />
                                <div className="p-0 h-full overflow-hidden">
                                    <div className="p-0 h-full overflow-hidden flex items-center justify-center bg-white">
                                        {/* ✨ Just White Screen (As requested) */}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BACK FACE: Back Cover (Rotated) */}
                        <div
                            className="absolute inset-0 w-full h-full bg-white rounded-l-lg shadow-2xl overflow-hidden flex flex-col transform rotate-y-180"
                            style={{
                                backfaceVisibility: 'hidden',
                                backgroundColor: '#fff',
                                transform: 'rotateY(180deg)' // Already mapped by parent rotation? No, parent rotates 0->-180. Inner needs to face opposite?
                                // If parent -180, we see Back Face.
                                // Back Face standard is 180 rotated? 
                                // Let's just use `rotateY(180deg)` relative to parent?
                                // Yes.
                            }}
                        >
                            {/* Render Album Cover Art again as Back Cover */}
                            {album ? (
                                <AlbumBook
                                    title={album.name}
                                    tag={album.tag}
                                    count={album.count}
                                    config={album.coverConfig}
                                    className="w-full h-full shadow-none"
                                />
                            ) : (
                                // Post Cover Fallback
                                <div className="w-full h-full bg-gray-800" />
                            )}
                            {/* Overlay to make it look like Back Cover (No text usually?) */}
                            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
                        </div>
                    </motion.div>

                    {/* === SPINE (3D Bar - At Center) === */}
                    <div
                        className="absolute top-0 bottom-0 w-4 bg-gray-200 z-0 origin-left"
                        style={{
                            left: '50%', // Anchor at Center
                            transform: 'rotateY(-90deg) translateX(-2px)', // Push back slightly
                        }}
                    ></div>

                </motion.div>
            </div>
        </div>
    );
};

export default BookOpeningOverlay;
