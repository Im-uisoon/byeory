import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { WidgetWrapper } from '../../Shared';
import { Shuffle, BookOpen, RefreshCw, X, ChevronRight, FileText } from 'lucide-react';
import { fetchPostsFromApi } from '../../../../post/api';

interface PostData {
    id: number;
    title: string;
    blocks?: any[];
    date?: string;
    tags?: string[];
}

interface ComponentProps {
    className?: string;
    style?: React.CSSProperties;
    gridSize?: { w: number; h: number };
    isStickerMode?: boolean;
}

export const RandomDiary = ({ className, style, gridSize, isStickerMode }: ComponentProps) => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<PostData[]>([]);
    const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isDrawn, setIsDrawn] = useState(false);

    const isLarge = (gridSize?.w || 1) >= 2 && (gridSize?.h || 1) >= 2;

    // Fetch posts on mount
    useEffect(() => {
        const loadPosts = async () => {
            setLoading(true);
            try {
                const data = await fetchPostsFromApi();
                setPosts(data);
            } catch (e) {
                console.error('Failed to load posts:', e);
            } finally {
                setLoading(false);
            }
        };
        loadPosts();
    }, []);

    // Pick a random post
    const pickRandom = useCallback(() => {
        if (posts.length === 0) return;
        const randomIndex = Math.floor(Math.random() * posts.length);
        setSelectedPost(posts[randomIndex]);

        if (isLarge) {
            // 2x2: 위젯 내부에 결과 표시
            setIsDrawn(true);
        } else {
            // 1x1: 모달로 표시 (위젯 상태 변경 없음)
            setShowModal(true);
        }
    }, [posts, isLarge]);

    // Navigate to post detail
    const goToPost = () => {
        if (selectedPost && !isStickerMode) {
            setShowModal(false);
            navigate(`/post?id=${selectedPost.id}`);
        }
    };

    // Get excerpt from blocks
    const getExcerpt = (post: PostData) => {
        if (!post.blocks || post.blocks.length === 0) return '';
        const textBlock = post.blocks.find(b => b.type === 'text' || b.type === 'paragraph');
        if (textBlock?.text) {
            return textBlock.text.slice(0, 80) + (textBlock.text.length > 80 ? '...' : '');
        }
        return '';
    };

    // Format date
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // === MODAL (for 1x1) - Portal로 렌더링 ===
    const ModalContent = () => (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowModal(false)}
        >
            <div
                className="rounded-2xl shadow-2xl max-w-sm w-[90%] mx-4 overflow-hidden"
                style={{
                    backgroundColor: 'var(--bg-modal)',
                    backdropFilter: 'blur(10px)'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-4 py-3"
                    style={{
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-card-secondary)'
                    }}
                >
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" style={{ color: 'var(--icon-color)' }} />
                        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>뽑힌 일기</span>
                    </div>
                    <button
                        onClick={() => setShowModal(false)}
                        className="p-1 rounded-lg transition-colors hover:opacity-70"
                    >
                        <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {selectedPost ? (
                        <div className="space-y-3">
                            <div>
                                <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
                                    {selectedPost.title || '제목 없음'}
                                </h3>
                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                    {formatDate(selectedPost.date)}
                                </p>
                            </div>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                {getExcerpt(selectedPost) || '내용 미리보기가 없습니다.'}
                            </p>
                            {selectedPost.tags && selectedPost.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {selectedPost.tags.slice(0, 3).map((tag, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-0.5 text-[10px] rounded-full"
                                            style={{
                                                backgroundColor: 'var(--btn-bg)',
                                                color: 'var(--btn-text)',
                                                opacity: 0.8
                                            }}
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>선택된 일기가 없습니다.</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 p-4 pt-0">
                    <button
                        onClick={pickRandom}
                        className="flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        style={{
                            backgroundColor: 'var(--bg-card-secondary)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        <RefreshCw className="w-4 h-4" />
                        다시 뽑기
                    </button>
                    <button
                        onClick={goToPost}
                        className="flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 hover:opacity-90"
                        style={{
                            backgroundColor: 'var(--btn-bg)',
                            color: 'var(--btn-text)'
                        }}
                    >
                        보러가기
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );

    // === LOADING STATE ===
    if (loading) {
        return (
            <WidgetWrapper className={`theme-bg-card ${className || ''}`} style={style}>
                <div className="flex items-center justify-center h-full">
                    <RefreshCw className="w-5 h-5 animate-spin" style={{ color: 'var(--text-secondary)' }} />
                </div>
            </WidgetWrapper>
        );
    }

    // === EMPTY STATE ===
    if (posts.length === 0) {
        return (
            <WidgetWrapper className={`theme-bg-card ${className || ''}`} style={style}>
                <div className="flex flex-col items-center justify-center h-full gap-2 p-4 text-center">
                    <FileText className="w-8 h-8 opacity-50" style={{ color: 'var(--text-secondary)' }} />
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>아직 작성된 일기가 없어요</p>
                </div>
            </WidgetWrapper>
        );
    }

    // === 1x1 LAYOUT - 항상 뽑기 버튼만 표시 ===
    if (!isLarge) {
        return (
            <>
                <WidgetWrapper className={`theme-bg-card ${className || ''}`} style={style}>
                    <div className="flex flex-col items-center justify-center h-full gap-3 p-3">
                        <div className="text-center">
                            <Shuffle className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--icon-color)' }} />
                            <p className="text-[10px] leading-tight" style={{ color: 'var(--text-secondary)' }}>
                                무작위로<br />일기를 뽑아봐요
                            </p>
                        </div>
                        <button
                            onClick={pickRandom}
                            className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 hover:opacity-90"
                            style={{
                                backgroundColor: 'var(--btn-bg)',
                                color: 'var(--btn-text)'
                            }}
                        >
                            뽑기
                        </button>
                    </div>
                </WidgetWrapper>
                {showModal && ReactDOM.createPortal(<ModalContent />, document.body)}
            </>
        );
    }

    // === 2x2 LAYOUT ===
    return (
        <WidgetWrapper className={`theme-bg-card ${className || ''}`} style={style}>
            <div className="flex flex-col h-full p-4">
                {!isDrawn ? (
                    // Initial State - Draw button
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <div
                            className="p-4 rounded-full"
                            style={{ backgroundColor: 'color-mix(in srgb, var(--btn-bg) 15%, transparent)' }}
                        >
                            <Shuffle className="w-10 h-10" style={{ color: 'var(--icon-color)' }} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                                과거의 기록을 꺼내볼까요?
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                {posts.length}개의 일기 중 하나를 뽑아드려요
                            </p>
                        </div>
                        <button
                            onClick={pickRandom}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg hover:opacity-90"
                            style={{
                                backgroundColor: 'var(--btn-bg)',
                                color: 'var(--btn-text)'
                            }}
                        >
                            뽑기
                        </button>
                    </div>
                ) : (
                    // Result State
                    <div className="flex flex-col h-full">
                        {/* Result Card */}
                        <div className="flex-1 flex flex-col justify-center">
                            <p className="text-xs mb-3 text-center" style={{ color: 'var(--text-secondary)' }}>
                                전에 써둔 기록물을 검토해보세요
                            </p>
                            <div
                                className="p-4 rounded-xl"
                                style={{
                                    backgroundColor: 'var(--bg-card-secondary)',
                                    border: '1px solid var(--border-color)'
                                }}
                            >
                                <h3 className="font-bold text-sm mb-1 truncate" style={{ color: 'var(--text-primary)' }}>
                                    {selectedPost?.title || '제목 없음'}
                                </h3>
                                <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                                    {formatDate(selectedPost?.date)}
                                </p>
                                <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                                    {getExcerpt(selectedPost!) || '내용 미리보기가 없습니다.'}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={pickRandom}
                                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                style={{
                                    backgroundColor: 'var(--bg-card-secondary)',
                                    color: 'var(--text-secondary)',
                                    border: '1px solid var(--border-color)'
                                }}
                            >
                                <RefreshCw className="w-4 h-4" />
                                다시뽑기
                            </button>
                            <button
                                onClick={goToPost}
                                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 hover:opacity-90"
                                style={{
                                    backgroundColor: 'var(--btn-bg)',
                                    color: 'var(--btn-text)'
                                }}
                            >
                                <BookOpen className="w-4 h-4" />
                                보기
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
};
