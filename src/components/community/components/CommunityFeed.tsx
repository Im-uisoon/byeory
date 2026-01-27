import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { CommunityResponse } from '../types';
import { getCommunities, getCommunitycardDetail, toggleCommunityLike } from '../api';
import CommunityCard from './CommunityCard';
import CommunityDetailModal from './CommunityDetailModal';

interface CommunityFeedProps {
    currentUserId?: number;
    selectedTag?: string | null;
}

const CommunityFeed: React.FC<CommunityFeedProps> = ({ currentUserId, selectedTag }) => {
    const [posts, setPosts] = useState<CommunityResponse[]>([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [selectedPost, setSelectedPost] = useState<CommunityResponse | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [initialModalView, setInitialModalView] = useState<'content' | 'comments'>('content'); // ✨ New State

    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const fetchPosts = async () => {
        if (!hasMore && page > 0) return; // ✨ Prevent fetching if no more data

        setLoading(true);
        try {
            const response = await getCommunities(page, 12, currentUserId, selectedTag || undefined);

            // ✨ Filter out private/draft posts
            const publicPosts = response.content.filter(p => p.isPublic);

            setPosts(prev => {
                if (page === 0) return publicPosts;
                const existingIds = new Set(prev.map(p => p.postId));
                const newPosts = publicPosts.filter(p => !existingIds.has(p.postId));
                return [...prev, ...newPosts];
            });

            // Robust check for hasMore
            const isLast = response.last === undefined
                ? (response.content.length < 12) // Fallback if 'last' is missing
                : response.last;

            // If content is empty, it's definitely the last page
            const isEmpty = response.content.length === 0;

            setHasMore(!isLast && !isEmpty);
        } catch (error) {
            console.error("Failed to fetch communities:", error);
            setHasMore(false); // ✨ Stop infinite loop on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [page, currentUserId, selectedTag]);

    useEffect(() => {
        setPosts([]);
        setPage(0);
        setHasMore(true);
    }, [currentUserId, selectedTag]);

    const handleCardClick = async (post: CommunityResponse, view: 'content' | 'comments' = 'content') => {
        try {
            const detail = await getCommunitycardDetail(post.postId, currentUserId);
            setSelectedPost(detail);
            setInitialModalView(view); // ✨ Set initial view (content or comments)
            setIsModalOpen(true);

            setPosts(prev => prev.map(p =>
                p.postId === post.postId
                    ? { ...p, viewCount: detail.viewCount }
                    : p
            ));
        } catch (error) {
            console.error("Failed to open detail:", error);
        }
    };

    const handleCardLikeClick = async (post: CommunityResponse) => {
        if (!currentUserId) {
            alert("로그인이 필요한 서비스입니다.");
            return;
        }

        // Optimistic Update
        const newIsLiked = !post.isLiked;
        const newCount = newIsLiked ? post.likeCount + 1 : post.likeCount - 1;

        setPosts(prev => prev.map(p => {
            if (p.postId === post.postId) {
                return { ...p, isLiked: newIsLiked, likeCount: newCount };
            }
            return p;
        }));

        try {
            await toggleCommunityLike(post.postId, currentUserId);
        } catch (error) {
            console.error("Failed to toggle like:", error);
            // Revert on error
            setPosts(prev => prev.map(p => {
                if (p.postId === post.postId) {
                    return { ...p, isLiked: !newIsLiked, likeCount: post.likeCount };
                }
                return p;
            }));
        }
    };

    const handleLikeToggle = (newStatus: boolean) => {
        if (!selectedPost) return;
        setPosts(prev => prev.map(p => {
            if (p.postId === selectedPost.postId) {
                return {
                    ...p,
                    isLiked: newStatus,
                    likeCount: newStatus ? p.likeCount + 1 : p.likeCount - 1
                };
            }
            return p;
        }));
    };

    return (
        <div className="space-y-8">
            {/* Posts Display */}
            <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">
                    탐색 ({posts.length})
                </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 w-full">
                {posts.map((post, index) => (
                    <div key={`post-${post.postId || 'none'}-${index}`} className="w-full">
                        <CommunityCard
                            data={post}
                            onClick={() => handleCardClick(post, 'content')} // Default click opens content
                            onLike={() => handleCardLikeClick(post)}          // ✨ Like handler
                            onComment={() => handleCardClick(post, 'comments')} // ✨ Comment handler opens modal at comments
                        />
                    </div>
                ))}
            </div>

            {/* ✨ Sentinel for Infinite Scroll (Separate from Card) */}
            <div ref={lastElementRef} className="h-4" />

            {/* Loading Spinner Removed as per User Request */}
            {/* {loading && ( ... )} */}

            {!loading && !hasMore && posts.length > 0 && (
                <div className="text-center py-8 flex items-center justify-center">
                    <span className="px-4 py-1.5 rounded-full bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/30 shadow-sm text-sm font-medium theme-text-secondary flex items-center gap-2">
                        ✨ 모든 게시글을 확인했습니다
                    </span>
                </div>
            )}

            {!loading && !hasMore && posts.length === 0 && (
                <div className="text-center py-20 text-gray-600 dark:text-gray-300">
                    <p className="text-xl font-light">아직 등록된 게시글이 없습니다. 첫 글을 작성해보세요!</p>
                </div>
            )}

            {selectedPost && (
                <CommunityDetailModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    data={selectedPost}
                    currentUserId={currentUserId}
                    onLikeToggle={handleLikeToggle}
                    initialView={initialModalView} // ✨ Pass initialView
                />
            )}
        </div>
    );
};

export default CommunityFeed;
