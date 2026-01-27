import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/header/Navigation';
import MarketLayout from '../../components/market/MarketLayout';
import ItemDetailModal from '../../components/market/ItemDetailModal';
import SellModal from '../../components/market/SellModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import ScrollToTopButton from '../../components/common/ScrollToTopButton';
import { useCredits } from '../../context/CreditContext';
import { type MarketItem } from '../../types/market';

import { useMarket, useIsMobile } from '../../hooks'; // ✨
import { getMyWidgets } from '../../components/settings/widgets/customwidget/widgetApi';
import { fetchMyPostTemplatesApi, uploadImageToSupabase } from '../../components/post/api';
import { STICKERS } from '../../components/post/constants';

import MarketHeader from '../../components/market/components/MarketHeader';
import MarketTabs from '../../components/market/components/MarketTabs';
import MarketFilterBar from '../../components/market/components/MarketFilterBar';
import MarketHistoryView from '../../components/market/components/MarketHistoryView';
import MarketMyShopView from '../../components/market/components/MarketMyShopView';
import MarketProductGrid from '../../components/market/components/MarketProductGrid';
import FloatingSettingsPanel from '../../components/dashboard/components/FloatingSettingsPanel'; // ✨

const Market: React.FC = () => {
    const { credits } = useCredits();
    const navigate = useNavigate();
    const isMobile = useIsMobile(); // ✨

    const {
        marketItems,
        purchasedItems,
        buyItem,
        getPackPrice,
        sellingItems,
        isWishlisted,
        toggleWishlist,
        registerItem,
        cancelItem,
        isOwned,
        loadMore,
        search,
        hasMore,
        sort,
        filterBySeller,
        sellerId,
        filterByTag,
        selectedTags,
        updateItem,
        totalCount,
        changeSort,
        wishlistItems,
        filterByCategory,
        filterByFree,
        updateItemInState,
        wishlistDetails
    } = useMarket();

    const [activeTab, setActiveTab] = useState<'all' | 'package' | 'sticker' | 'template_widget' | 'template_post' | 'myshop' | 'wishlist' | 'history' | 'free'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [hideOwned, setHideOwned] = useState(false);
    const [isFreeFilter, setIsFreeFilter] = useState(false);
    const shouldSkipSearch = React.useRef(false);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const isFree = isFreeFilter;
        let category: string = 'all';

        if (['sticker', 'template_widget', 'template_post', 'package'].includes(activeTab)) {
            category = activeTab;
        }

        if (activeTab === 'myshop' || activeTab === 'history') {
            // No fetch needed for feed
        } else if (activeTab === 'wishlist') {
            // Wishlist view
        } else {
            filterByCategory(category);
            filterByFree(isFree);
        }
    }, [activeTab, filterByCategory, filterByFree, isFreeFilter]);

    // Debounce Search
    useEffect(() => {
        if (shouldSkipSearch.current) {
            shouldSkipSearch.current = false;
            return;
        }

        const timer = setTimeout(() => {
            search(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, search]);

    const [mySellableCandidates, setMySellableCandidates] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);

    const loadMySellableItems = React.useCallback(async () => {
        let apiWidgets: any[] = [];
        let apiTemplates: any[] = [];

        try {
            const [widgets, templates] = await Promise.all([
                getMyWidgets(),
                fetchMyPostTemplatesApi()
            ]);
            apiWidgets = widgets;
            apiTemplates = templates;
        } catch (e) {
            console.error("Failed to load sellable items", e);
        }

        const formattedWidgets = apiWidgets.map(w => ({
            ...w, // ✨ Spread original widget data (content, styles, decorations, type)
            id: w.id || w._id,
            title: w.name,
            type: 'template_widget',
            widgetType: w.type, // ✨ Map API 'type' to 'widgetType' for renderer
            description: '사용자가 직접 생성한 커스텀 위젯입니다.',
            price: 0,
            source: 'api'
        }));

        const formattedTemplates = apiTemplates
            // Exclude acquired/purchased templates (prevent resell loop)
            .filter(t => !t.tags?.includes('acquired') && !t.sourceMarketItemId)
            .map(t => ({
                ...t, // Spread all original template data (stickers, floatingTexts, styles, etc.)
                id: t.id,
                title: t.name,
                type: 'template_post',
                description: '사용자가 직접 생성한 게시물 템플릿입니다.',
                price: 0,
                source: 'api',
                originalId: t.id,
                thumbnailUrl: t.thumbnailUrl
            }));

        const allCandidates = [...formattedWidgets, ...formattedTemplates];
        const sellable = allCandidates.filter(candidate => !isOwned(candidate.id))
            .map(candidate => {
                const isAlreadySelling = sellingItems.some(s =>
                    s.referenceId === candidate.id?.toString() &&
                    s.status === 'ON_SALE'
                );
                return { ...candidate, isAlreadySelling };
            });

        setMySellableCandidates(sellable);
    }, [sellingItems, isOwned]);

    useEffect(() => {
        if (activeTab === 'myshop') {
            loadMySellableItems();
        }
    }, [activeTab, loadMySellableItems]);


    const [sellModalItem, setSellModalItem] = useState<any>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type?: 'info' | 'danger' | 'success';
        singleButton?: boolean;
        confirmText?: string;
        cancelText?: string;
    }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    const handleBuy = (item: MarketItem) => {
        if (isOwned(item.id)) return;

        // Use referenceId if available (for packs) to correctly calculate discounts based on owned components
        const effectivePrice = getPackPrice(item.referenceId || item.id, item.price);

        if (credits < effectivePrice) {
            setConfirmation({
                isOpen: true,
                title: '크레딧 부족 😢',
                message: `보유 크레딧이 부족합니다.\n(보유: ${credits.toLocaleString()} C / 필요: ${effectivePrice.toLocaleString()} C)\n\n충전 페이지로 이동하시겠습니까?`,
                type: 'danger',
                singleButton: false,
                onConfirm: () => {
                    setConfirmation(prev => ({ ...prev, isOpen: false }));
                    navigate('/charge');
                }
            });
            return;
        }

        setConfirmation({
            isOpen: true,
            title: '아이템 구매',
            message: `'${item.title}'을(를) ${effectivePrice.toLocaleString()} 크레딧에 \n구매하시겠습니까?`,
            type: 'info',
            singleButton: false,
            onConfirm: async () => {
                setConfirmation(prev => ({ ...prev, isOpen: false }));
                setConfirmation(prev => ({ ...prev, isOpen: false }));
                const success = await buyItem(item.id, effectivePrice, item);

                // Manual template cloning removed (Backend handles it)

                if (success) {
                    const packStickers = STICKERS.filter(s => s.packId === (item.referenceId || item.id));
                    const ownedStickers = packStickers.filter(s => isOwned(s.id));
                    const ownedValue = ownedStickers.reduce((sum: number, s) => sum + (s.price || 0), 0);
                    const packOriginalPrice = item.price || effectivePrice + ownedValue;
                    const discountApplied = Math.min(ownedValue, packOriginalPrice);

                    setConfirmation({
                        isOpen: true,
                        title: '구매 완료! 🎉',
                        message: `'${item.title}' 구매가 완료되었습니다.${discountApplied > 0 ? `\n(세트 효과: ${discountApplied.toLocaleString()} C 할인 적용)` : ''}\n보관함 또는 구매 내역에서 확인할 수 있습니다.`,
                        type: 'success',
                        singleButton: false,
                        confirmText: '구매 내역 보기',
                        cancelText: '닫기',
                        onConfirm: () => {
                            setConfirmation(prev => ({ ...prev, isOpen: false }));
                            setSelectedItem(null); // Close the detail modal
                            setActiveTab('history'); // Navigate to history
                        },
                    });
                    // Override cancel button text behavior via a custom prop?
                    // ConfirmationModal might strictly be confirm/cancel.
                    // Let's check ConfirmationModal, but usually confirm is the primary action.
                    // We will treat "Check History" as confirm.
                } else {
                    setConfirmation({
                        isOpen: true,
                        title: '구매 실패',
                        message: '크레딧이 부족하거나 오류가 발생했습니다.',
                        type: 'danger',
                        singleButton: true,
                        onConfirm: () => setConfirmation(prev => ({ ...prev, isOpen: false }))
                    });
                }
            }
        });
    };

    const handleSell = (item: any, isEdit: boolean = false) => {
        setSellModalItem(item);
        setIsEditMode(isEdit);
    };

    const handleRegisterSubmit = async (data: { price: number; description: string; tags: string[]; imageFile?: File | null }) => {
        if (!sellModalItem) return;

        let imageUrl = sellModalItem.imageUrl || sellModalItem.thumbnailUrl;

        if (data.imageFile) {
            const uploadedUrl = await uploadImageToSupabase(data.imageFile);
            if (uploadedUrl) {
                imageUrl = uploadedUrl;
            } else {
                alert("이미지 업로드에 실패했습니다. 기존(또는 기본) 이미지를 사용합니다.");
            }
        }

        if (['template_post', 'TEMPLATE_POST', 'template_widget', 'custom-block'].includes(sellModalItem.type) || (typeof sellModalItem.type === 'string' && sellModalItem.type.startsWith('custom-'))) {
            const templateId = isEditMode ? sellModalItem.referenceId : sellModalItem.id;
            const candidate = mySellableCandidates.find(c => String(c.id) === String(templateId));
            if (candidate?.thumbnailUrl) {
                imageUrl = candidate.thumbnailUrl;
            }
        }



        if (isEditMode) {
            const success = await updateItem(sellModalItem.id, {
                ...sellModalItem,
                price: data.price,
                description: data.description,
                tags: data.tags,
                imageUrl: imageUrl
            });

            if (success) {
                alert(`'${sellModalItem.title}' 수정 완료!`);
            }
        } else {
            await registerItem({
                ...sellModalItem,
                price: data.price,
                description: data.description,
                tags: data.tags,
                imageUrl: imageUrl
            });
            alert(`'${sellModalItem.title}'이(가) 등록되었습니다!`);
        }

        setSellModalItem(null);
        setIsEditMode(false);
    };

    // Filter logic
    const filteredItems = useMemo(() => {
        if (activeTab === 'wishlist') {
            return wishlistDetails || [];
        }

        // Tab-based Client Side fallback (Mainly for legacy mapping support)
        let items = marketItems;

        if (activeTab === 'package') {
            items = items.filter(item => item.type === 'package');
        } else if (activeTab === 'sticker') {
            items = items.filter(item => item.type === 'sticker');
        } else if (activeTab === 'template_widget') {
            items = items.filter(item => item.type === 'template_widget');
        } else if (activeTab === 'template_post') {
            items = items.filter(item => item.type === 'template_post');
        }

        if (hideOwned) {
            items = items.filter(item => !isOwned(item.id));
        }

        return items;
    }, [marketItems, hideOwned, isOwned, activeTab, wishlistDetails]);

    return (
        <MarketLayout header={<Navigation />}>
            {/* ✨ Floating Settings Panel */}
            <FloatingSettingsPanel
                defaultOpen={false}
                isMobile={isMobile}
            />
            <div className="flex flex-col gap-8 pb-20">
                <MarketHeader
                    onMyShopClick={() => setActiveTab('myshop')}
                    isMyShopActive={activeTab === 'myshop'}
                    onHistoryClick={() => setActiveTab('history')}
                    isHistoryActive={activeTab === 'history'}
                />

                <MarketTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />

                {activeTab !== 'myshop' && activeTab !== 'history' && (
                    <MarketFilterBar
                        totalCount={activeTab === 'package' ? filteredItems.length : (activeTab === 'wishlist' ? wishlistItems.length : totalCount)}
                        sellerId={sellerId}
                        sellerName={sellerId ? marketItems.find(i => String(i.sellerId) === String(sellerId))?.author : null}
                        filterBySeller={filterBySeller}
                        selectedTags={selectedTags}
                        filterByTag={filterByTag}
                        keyword={searchTerm}
                        onClearSearch={() => {
                            setSearchTerm('');
                            search('');
                        }}
                        onClearAll={() => {
                            shouldSkipSearch.current = true;
                            setSearchTerm('');
                            filterByTag(null);
                            filterBySeller(null);
                            search('');
                        }}
                        hideOwned={hideOwned}
                        setHideOwned={setHideOwned}
                        sort={sort}
                        changeSort={changeSort}
                        isFree={isFreeFilter}
                        setIsFree={setIsFreeFilter}
                    />
                )}

                {activeTab === 'history' ? (
                    <MarketHistoryView
                        purchasedItems={purchasedItems}
                        setSelectedItem={setSelectedItem}
                        onToggleWishlist={(item) => toggleWishlist(item as any)}
                        isWishlisted={isWishlisted}
                    />
                ) : activeTab === 'myshop' ? (
                    <MarketMyShopView
                        sellingItems={sellingItems}
                        mySellableCandidates={mySellableCandidates}
                        handleSell={handleSell}
                        cancelItem={cancelItem}
                    />
                ) : (
                    <MarketProductGrid
                        filteredItems={filteredItems}
                        setSelectedItem={setSelectedItem}
                        hasMore={hasMore}
                        loadMore={loadMore}
                        onBuy={handleBuy}
                        getPackPrice={getPackPrice}
                        isOwned={isOwned}
                        toggleWishlist={(item) => toggleWishlist(item as any)}
                        isWishlisted={isWishlisted}
                        marketItems={marketItems}
                        purchasedItems={purchasedItems}
                    />
                )}
            </div>

            {selectedItem && (
                <ItemDetailModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onBuy={handleBuy}
                    onToggleWishlist={(item) => toggleWishlist(item as any)}
                    checkOwned={isOwned}
                    isWishlisted={isWishlisted(selectedItem.id)}
                    effectivePrice={getPackPrice(selectedItem.referenceId || selectedItem.id, selectedItem.price)}
                    initialTab={selectedItem.initialTab}
                    onFilterBySeller={filterBySeller}
                    onSearchTag={filterByTag}
                    reviewTargetId={(() => {
                        if (!selectedItem.referenceId) return undefined;
                        const stickerDef = STICKERS.find(s => s.id === selectedItem.referenceId);
                        if (stickerDef && stickerDef.packId) {
                            const packItem = marketItems.find(m => m.referenceId === stickerDef.packId) ||
                                purchasedItems.find(p => p.referenceId === stickerDef.packId);
                            if (packItem) return packItem.id;
                        }
                        // Prevent passing non-numeric IDs (like "cat_1") to backend
                        // If selectedItem.id is numeric, use it (handled by ItemDetailModal default)
                        // So we return undefined here to let ItemDetailModal fall back to item.id
                        return undefined;
                    })()}
                    onReviewChange={(itemId, newStats) => {
                        updateItemInState(itemId, newStats);
                        setSelectedItem((prev: any) => prev ? { ...prev, ...newStats } : null);
                    }}
                    marketItems={marketItems}
                />
            )}
            {sellModalItem && (
                <SellModal
                    item={sellModalItem}
                    onClose={() => setSellModalItem(null)}
                    onSubmit={handleRegisterSubmit}
                />
            )}
            <ConfirmationModal
                isOpen={confirmation.isOpen}
                title={confirmation.title}
                message={confirmation.message}
                onConfirm={confirmation.onConfirm}
                onCancel={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
                type={confirmation.type || 'info'}
                singleButton={confirmation.singleButton}
                confirmText={confirmation.confirmText || (confirmation.singleButton ? "확인" : "구매하기")}
                cancelText={confirmation.cancelText || "취소"}
            />
            <ScrollToTopButton />
        </MarketLayout>
    );
};

export default Market;
