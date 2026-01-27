import React, { useState } from 'react';
import { X, Heart, ShoppingBag, Star, User, Trash2 } from 'lucide-react';
import { useCredits } from '../../context/CreditContext';
import type { MarketItem } from '../../types/market';
import { STICKERS } from '../post/constants';
import ConfirmationModal from '../common/ConfirmationModal';
import CustomWidgetPreview from '../settings/widgets/customwidget/components/CustomWidgetPreview';

import { API_BASE_URL as CONFIG_API_URL } from '../../api/config';
const API_BASE_URL = `${CONFIG_API_URL}/api`;


interface ItemDetailModalProps {
    item: MarketItem;
    onClose: () => void;
    onBuy: (item: MarketItem) => void;
    onToggleWishlist: (item: MarketItem) => void;
    checkOwned: (id: string) => boolean;
    isWishlisted: boolean;
    effectivePrice: number;
    initialTab?: 'details' | 'reviews';
    onFilterBySeller?: (sellerId: string) => void;
    onSearchTag?: (tag: string) => void;
    reviewTargetId?: string; // New prop for redirected reviews
    onReviewChange?: (itemId: string, newStats: { averageRating: number, reviewCount: number }) => void;
    marketItems?: MarketItem[]; // For looking up parent packs
}

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
    item, onClose, onBuy, onToggleWishlist, checkOwned, isWishlisted, effectivePrice, initialTab = 'details', onFilterBySeller, onSearchTag, reviewTargetId, onReviewChange, marketItems
}) => {
    const isOwned = checkOwned(item.id);
    const { userId } = useCredits();
    const [activeTab, setActiveTab] = useState<'details' | 'reviews'>(initialTab);
    const [reviews, setReviews] = useState<any[]>([]);
    const [newRating, setNewRating] = useState(5);
    const [newReviewContent, setNewReviewContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const tabsRef = React.useRef<HTMLDivElement>(null);

    // Confirmation Modal State
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'info' | 'danger' | 'success';
        singleButton: boolean;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        singleButton: true,
        onConfirm: () => { }
    });

    const showAlert = (title: string, message: string, type: 'info' | 'danger' | 'success' = 'info') => {
        setConfirmation({
            isOpen: true,
            title,
            message,
            type,
            singleButton: true,
            onConfirm: () => setConfirmation(prev => ({ ...prev, isOpen: false }))
        });
    };

    const scrollToTabs = () => {
        // Only scroll on mobile where the main container scrolls
        if (window.innerWidth < 768 && tabsRef.current) {
            // Use block: 'start' to snap it to the top
            tabsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    React.useEffect(() => {
        if (item) {
            fetchReviews();
        }
    }, [item, reviewTargetId]); // Add reviewTargetId to dependency

    // Prevent background scrolling
    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const fetchReviews = async () => {
        const token = localStorage.getItem('accessToken');
        const targetId = reviewTargetId || item.id;

        try {
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token} `;
            }

            const res = await fetch(`${API_BASE_URL}/market/reviews/${targetId}`, {
                headers
            });
            if (res.ok) {
                const data = await res.json();
                // Sort
                data.sort((a: any, b: any) => {
                    const isMyReviewA = String(a.userId) === String(userId);
                    const isMyReviewB = String(b.userId) === String(userId);
                    if (isMyReviewA && !isMyReviewB) return -1;
                    if (!isMyReviewA && isMyReviewB) return 1;
                    return b.id - a.id;
                });
                setReviews(data);
                return data; // Return data for stats calculation
            }
        } catch (e) {
            console.error("Failed to fetch reviews", e);
        }
        return null;
    };

    const handlePostReview = async () => {
        const token = localStorage.getItem('accessToken');
        const targetId = reviewTargetId || item.id;

        if (!token) {
            showAlert('로그인 필요', "로그인이 필요합니다.", 'danger');
            return;
        }

        if (!newReviewContent.trim()) {
            showAlert('내용 부족', "리뷰 내용을 입력해주세요.", 'danger');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/market/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    marketItemId: targetId,
                    content: newReviewContent,
                    rating: newRating
                })
            });

            if (res.ok) {
                await fetchReviews();
                setNewReviewContent('');
                setNewRating(5);
                showAlert('리뷰 등록 완료', "소중한 리뷰가 등록되었습니다!", 'success');

                // Calculate new stats locally or wait for re-fetch (simplest is calculate from updated list but we need to fetch first)
                // fetchReviews above already updated 'reviews' state? No, async await.
                // We need to get the updated list to calculate stats.
                const updatedReviews = await fetchReviews();
                if (updatedReviews && onReviewChange) {
                    const count = updatedReviews.length;
                    const avg = updatedReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / count;
                    onReviewChange(item.id, { averageRating: avg, reviewCount: count });
                }
            } else {
                const errorText = await res.text();
                if (res.status === 400 || res.status === 409) {
                    showAlert('리뷰 등록 실패', `${errorText || "이미 등록했거나 오류가 발생했습니다."}`, 'danger');
                } else {
                    showAlert('리뷰 등록 실패', "잠시 후 다시 시도해주세요.", 'danger');
                }
            }
        } catch (e) {
            console.error("Failed to post review", e);
            showAlert('오류 발생', "서버 통신 중 오류가 발생했습니다.", 'danger');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteReview = (reviewId: number) => {
        setConfirmation({
            isOpen: true,
            title: '리뷰 삭제',
            message: '정말로 이 리뷰를 삭제하시겠습니까?',
            type: 'danger',
            singleButton: false,
            onConfirm: async () => {
                const token = localStorage.getItem('accessToken');
                if (!token) return;

                try {
                    const res = await fetch(`${API_BASE_URL}/market/reviews/${reviewId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (res.ok) {
                        setConfirmation(prev => ({ ...prev, isOpen: false }));
                        await fetchReviews();
                        // Just show a small toast or non-blocking alert? 
                        // Or reuse showAlert (which opens another modal, might be jarring but fine).
                        // Let's just refresh. Or show success alert.
                        // setTimeout to prevent modal collision or just show success.
                        setTimeout(() => showAlert('삭제 완료', '리뷰가 삭제되었습니다.', 'success'), 300);

                        const updatedReviews = await fetchReviews();
                        if (updatedReviews && onReviewChange) {
                            const count = updatedReviews.length;
                            const avg = count > 0 ? updatedReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / count : 0;
                            onReviewChange(item.id, { averageRating: avg, reviewCount: count });
                        } else if (onReviewChange) {
                            // If no reviews left or fetch fail?
                            // Assuming fetchReviews returns updated list
                            onReviewChange(item.id, { averageRating: 0, reviewCount: 0 });
                        }
                    } else {
                        showAlert('삭제 실패', '리뷰 삭제에 실패했습니다.', 'danger');
                    }
                } catch (e) {
                    console.error("Failed to delete review", e);
                    showAlert('오류', '오류가 발생했습니다.', 'danger');
                }
            }
        });
    };

    // Pack Recommendation Logic
    const packRecommendation = React.useMemo(() => {
        if (!item || !marketItems) return null;
        const targetId = item.referenceId || item.id;
        const stickerDef = STICKERS.find(s => s.id === String(targetId));

        if (stickerDef && stickerDef.packId) {
            const packItem = marketItems.find(m => m.referenceId === stickerDef.packId);
            return packItem;
        }
        return null;
    }, [item, marketItems]);

    // Pack Contents Details
    const packContents = React.useMemo(() => {
        const typeStr = (item.type as string || '').toLowerCase();
        if (typeStr !== 'package' && typeStr !== 'start_pack') return [];

        const packRefId = item.referenceId || item.id;
        return STICKERS.filter(s => s.packId === packRefId);
    }, [item]);


    if (!item) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-[var(--bg-card)] w-full max-w-4xl h-[85vh] md:h-auto md:max-h-[90vh] rounded-t-3xl rounded-b-none md:rounded-3xl overflow-y-auto md:overflow-hidden shadow-2xl border-t md:border border-[var(--border-color)] flex flex-col md:flex-row relative animate-in slide-in-from-bottom duration-300 md:zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Left: Image Section */}
                <div className="w-full md:w-1/2 h-56 md:h-auto shrink-0 bg-[var(--bg-card-secondary)] flex items-center justify-center p-8 relative">
                    {item.imageUrl ? (
                        <img
                            src={item.imageUrl}
                            alt={item.title}
                            draggable={false}
                            className="w-full h-full object-contain drop-shadow-xl select-none"
                        />
                    ) : (item.widgetType === 'custom-block' || item.type === 'custom-block' || (typeof item.widgetType === 'string' && item.widgetType.startsWith('custom-')) || (item.type === 'template_widget' && item.content)) ? (
                        // ✨ Live Preview (Fallback if no thumbnail)
                        <div className="w-full h-full flex items-center justify-center p-2">
                            <div className="w-full h-full transform scale-150 md:scale-125 origin-center pointer-events-none select-none flex items-center justify-center">
                                <CustomWidgetPreview
                                    content={{
                                        ...item.content,
                                        decorations: item.decorations || [],
                                    }}
                                    defaultSize={item.defaultSize || '2x2'}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="text-[var(--text-secondary)] flex flex-col items-center gap-4">
                            <ShoppingBag className="w-20 h-20 opacity-20" />
                            <span className="text-xl font-bold opacity-50">이미지 없음</span>
                        </div>
                    )}
                    <div className="absolute bottom-6 left-6 flex gap-2 flex-wrap">
                        {item.tags?.map((tag: string) => (
                            <button
                                key={tag}
                                onClick={() => {
                                    if (onSearchTag) {
                                        onSearchTag(tag);
                                        onClose();
                                    }
                                }}
                                className="px-3 py-1 bg-black/10 backdrop-blur-md rounded-full text-xs font-bold text-[var(--text-secondary)] hover:bg-black/20 hover:text-white transition-colors"
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Info Section */}
                <div className="w-full md:w-1/2 flex flex-col flex-1 md:overflow-hidden md:h-full bg-[var(--bg-card)]">
                    {/* Header */}
                    <div className="p-6 md:p-8 border-b border-[var(--border-color)]">
                        <div className="flex justify-between items-start mb-2">
                            <span className="px-2 py-1 bg-[var(--bg-card-secondary)] rounded-md text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                                {(item.type as string).toLowerCase() === 'template_widget' ? '위젯 템플릿' :
                                    (item.type as string).toLowerCase() === 'template_post' ? '게시물 템플릿' :
                                        (item.type as string).toLowerCase() === 'sticker' ? '스티커' :
                                            (item.type as string).toLowerCase() === 'package' ? '패키지' :
                                                (item.type as string).toLowerCase() === 'start_pack' ? '패키지' :
                                                    (item.type as string)?.replace('_', ' ')}
                            </span>
                            {/* Dynamic Header Stats */}
                            <div
                                onClick={() => { scrollToTabs(); setActiveTab('reviews'); }}
                                className="flex items-center gap-1 text-yellow-500 font-bold text-sm cursor-pointer hover:bg-[var(--bg-card-secondary)] rounded-lg px-2 -ml-2 transition-colors py-1"
                            >
                                <Star className="w-4 h-4 fill-yellow-500" />
                                <span>
                                    {reviews.length > 0
                                        ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1)
                                        : (item.averageRating ? item.averageRating.toFixed(1) : '0.0')}
                                </span>
                                <span className="text-[var(--text-secondary)] font-normal ml-1">
                                    ({reviews.length > 0 ? reviews.length : (item.reviewCount || 0)}개 리뷰)
                                </span>
                            </div>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] mb-2 leading-tight">{item.title}</h2>
                        <div
                            onClick={() => {
                                if (onFilterBySeller) {
                                    const targetId = item.sellerId ? String(item.sellerId) : '0';
                                    onFilterBySeller(targetId);
                                    onClose();
                                }
                            }}
                            className={`flex items-center gap-2 text-[var(--text-secondary)] text-sm font-medium cursor-pointer hover:text-[var(--text-primary)] hover:underline`}
                        >
                            <User className="w-4 h-4" />
                            <span>{item.author || 'System'}</span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div ref={tabsRef} className="flex border-b border-[var(--border-color)] md:sticky md:top-0 bg-[var(--bg-card)] z-10">
                        <button
                            onClick={() => { scrollToTabs(); setActiveTab('details'); }}
                            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'details' ? 'border-[var(--btn-bg)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        >
                            상세 정보
                        </button>
                        <button
                            onClick={() => {
                                scrollToTabs();
                                setActiveTab('reviews');
                                if (reviews.length === 0) fetchReviews();
                            }}
                            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-[var(--btn-bg)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        >
                            리뷰
                        </button>
                    </div>

                    {/* Content */}
                    <div className="md:flex-1 md:overflow-y-auto p-5 md:p-8">
                        {activeTab === 'details' ? (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-[var(--text-primary)] mb-2">상품 설명</h3>
                                    <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                                        {item.description || "설명이 없습니다."}
                                    </p>
                                </div>

                                {packContents.length > 0 && (
                                    <div className="pt-4 border-t border-[var(--border-color)]">
                                        <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center justify-between">
                                            <span>패키지 구성품 ({packContents.length})</span>
                                            <span className="text-[10px] text-[var(--text-disabled)] font-normal">전체 {packContents.length}개 중 {packContents.filter(s => checkOwned(s.id)).length}개 보유</span>
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {packContents.map(sticker => {
                                                const stickerOwned = checkOwned(sticker.id);
                                                return (
                                                    <div
                                                        key={sticker.id}
                                                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${stickerOwned
                                                            ? 'bg-[var(--bg-card-secondary)] border-green-500/20 opacity-80'
                                                            : 'bg-[var(--bg-card)] border-[var(--border-color)]'
                                                            }`}
                                                    >
                                                        <div className="w-12 h-12 relative flex items-center justify-center">
                                                            <img src={sticker.url} alt={sticker.name} className="w-full h-full object-contain" />
                                                            {stickerOwned && (
                                                                <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5 shadow-sm">
                                                                    <Star className="w-2.5 h-2.5 fill-current" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-[10px] font-bold text-[var(--text-primary)] truncate max-w-full">{sticker.name}</span>
                                                            <span className={`text-[9px] font-medium ${stickerOwned ? 'text-green-500' : 'text-[var(--text-secondary)]'}`}>
                                                                {stickerOwned ? '보유 중' : '미보유'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 bg-[var(--bg-card-secondary)] rounded-xl border border-[var(--border-color)]">
                                    <h4 className="font-bold text-[var(--text-primary)] text-sm mb-2">상품 정보</h4>
                                    <div className="grid grid-cols-2 gap-4 text-xs text-[var(--text-secondary)]">
                                        <div>출시일: {new Date().toLocaleDateString()}</div>
                                        <div>버전: 1.0.0</div>
                                        <div>크기: {packContents.length > 0 ? `${(packContents.length * 0.4).toFixed(1)} MB` : '2.1 MB'}</div>
                                        <div>라이선스: 개인 사용</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-[var(--text-primary)]">구매자 리뷰</h3>
                                </div>

                                {/* Review Input Form */}
                                {isOwned && (
                                    <div className="bg-[var(--bg-card-secondary)] p-4 rounded-xl mb-4">
                                        <h4 className="text-sm font-bold mb-2">리뷰 작성하기</h4>
                                        <div className="flex gap-2 mb-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button key={star} onClick={() => setNewRating(star)}>
                                                    <Star className={`w-5 h-5 ${star <= newRating ? 'fill-yellow-500 text-yellow-500' : 'text-[var(--text-disabled)]'}`} />
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={newReviewContent}
                                            onChange={(e) => setNewReviewContent(e.target.value)}
                                            placeholder="리뷰 내용을 입력하세요..."
                                            className="w-full p-2 text-sm bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] mb-2"
                                            rows={3}
                                        />
                                        <button
                                            onClick={handlePostReview}
                                            disabled={isSubmitting}
                                            className="px-4 py-2 bg-[var(--btn-bg)] text-white text-xs font-bold rounded-lg hover:brightness-110 disabled:opacity-50"
                                        >
                                            {isSubmitting ? '등록 중...' : '리뷰 등록'}
                                        </button>
                                    </div>
                                )}

                                {/* Reviews List */}
                                {reviews.length === 0 ? (
                                    <p className="text-center text-[var(--text-secondary)] py-8">아직 작성된 리뷰가 없습니다.</p>
                                ) : (
                                    reviews.map((review) => (
                                        <div key={review.id} className="flex gap-4 border-b border-[var(--border-color)] pb-4 last:border-0">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 shrink-0 flex items-center justify-center text-white text-xs font-bold">
                                                {review.userNickname?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-sm text-[var(--text-primary)]">{review.userNickname}</span>
                                                    {String(review.userId) === String(userId) && (
                                                        <span className="px-1.5 py-0.5 bg-[var(--btn-bg)] text-white text-[10px] font-bold rounded-md ml-2">
                                                            내 리뷰
                                                        </span>
                                                    )}
                                                    <div className="flex text-yellow-500 gap-0.5 ml-auto md:ml-2">
                                                        {[...Array(5)].map((_, j) => (
                                                            <Star
                                                                key={j}
                                                                className={`w-3 h-3 ${j < review.rating ? 'fill-current' : 'text-[var(--text-disabled)] opacity-30'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                    {String(review.userId) === String(userId) && (
                                                        <button
                                                            onClick={() => handleDeleteReview(review.id)}
                                                            className="p-1 text-[var(--text-secondary)] hover:text-red-500 transition-colors ml-1"
                                                            title="리뷰 삭제"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap">
                                                    {review.content}
                                                </p>
                                                <span className="text-[10px] text-[var(--text-disabled)] mt-2 block">
                                                    {review.createdAt ? new Date(review.createdAt).toLocaleString() : new Date().toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 md:p-6 border-t border-[var(--border-color)] bg-[var(--bg-card)] flex flex-col sticky bottom-0 z-20 gap-3">
                        {/* Pack Recommendation Alert */}
                        {packRecommendation && !isOwned && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex items-center justify-between animate-in slide-in-from-bottom-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">💡</span>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">절약 팁</span>
                                        <span className="text-sm text-[var(--text-primary)]">
                                            이 아이템은 <span className="font-bold">'{packRecommendation.title}'</span>에 포함되어 있어요!
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        // Close current and open Pack (Parent needs to handle selection change?)
                                        // Since we don't have setSelectedItem here, we can't easily switch.
                                        // But we can Close and rely on user finding it? OR pass onSelect prop?
                                        // Best approach: Just Inform. Or if we pass 'onSelect', use it.
                                        // For now, simple text is MVP. 
                                        // Actually User requested "Guide/Warn".

                                        // Let's assume we want to view it. We need a way to switch item.
                                        // Since ItemDetailModal is controlled by 'selectedItem' in parent, 
                                        // we'd need onSelect(item).
                                        // For now let's just show the message clearly.
                                    }}
                                    className="hidden px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-lg hover:bg-yellow-600 transition-colors"
                                >
                                    팩 보기
                                </button>
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            {!isOwned && String(item.sellerId) !== String(userId) ? (
                                <div className="flex flex-col">
                                    {Number(effectivePrice) < Number(item.price) && (
                                        <span className="text-xs text-red-500 line-through decoration-red-500/50">
                                            {Number(item.price).toLocaleString()} C
                                        </span>
                                    )}
                                    <span className={`text-2xl font-black ${(Number(effectivePrice) < Number(item.price) && Number(effectivePrice) > 0) || Number(effectivePrice) === 0 ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
                                        {Number(effectivePrice) === 0 ? '무료' : `${Number(effectivePrice).toLocaleString()} C`}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex flex-col opacity-60">
                                    <span className="text-xs text-[var(--text-secondary)] font-medium">정가</span>
                                    <span className="text-2xl font-black text-[var(--text-secondary)]">
                                        {Number(item.price) === 0 ? '무료' : `${Number(item.price).toLocaleString()} C`}
                                    </span>
                                </div>
                            )}

                            <div className="flex-1 flex gap-3">
                                <button
                                    onClick={() => onToggleWishlist(item)}
                                    className={`p-4 rounded-xl border-2 transition-colors ${isWishlisted
                                        ? 'border-red-500/20 bg-red-500/10 text-red-500'
                                        : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--btn-bg)]'
                                        }`}
                                >
                                    <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
                                </button>
                                <button
                                    onClick={() => onBuy(item)}
                                    disabled={isOwned || String(item.sellerId) === String(userId)}
                                    className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-lg shadow-lg transition-all transform active:scale-95
                                    ${isOwned
                                            ? 'bg-green-500/10 text-green-600 border border-green-500/20 cursor-default shadow-none'
                                            : String(item.sellerId) === String(userId)
                                                ? 'bg-[var(--bg-card-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] cursor-default'
                                                : 'bg-[var(--btn-bg)] text-[var(--btn-text)] hover:brightness-110'
                                        }`}
                                >
                                    {isOwned ? '보유중' : String(item.sellerId) === String(userId) ? '내 상품' : (Number(effectivePrice) === 0 ? '무료로 받기' : '구매하기')}
                                </button>
                            </div>
                        </div>
                    </div >
                </div>

                {/* Confirmation Alert */}
                <ConfirmationModal
                    isOpen={confirmation.isOpen}
                    title={confirmation.title}
                    message={confirmation.message}
                    type={confirmation.type}
                    onConfirm={confirmation.onConfirm}
                    onCancel={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
                    singleButton={confirmation.singleButton}
                    confirmText="확인"
                />
            </div>
        </div>
    );
};

export default ItemDetailModal;
