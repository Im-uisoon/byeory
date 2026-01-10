import React, { useState, useEffect, useMemo } from 'react';
import Navigation from '../../components/Header/Navigation';
import MarketLayout from '../../components/market/MarketLayout';
import MerchCard from '../../components/market/MerchCard';
import ItemDetailModal from '../../components/market/ItemDetailModal';
import SellModal from '../../components/market/SellModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useCredits } from '../../context/CreditContext';
import { useNavigate } from 'react-router-dom';
import { type MarketItem } from '../../data/mockMarketItems';
import { STICKERS } from '../post/constants';

import { useMarket } from '../../hooks/useMarket';
import { ShoppingBag, Search, Plus, Heart, FolderOpen, X, Check } from 'lucide-react';
import { getMyWidgets } from '../../components/settings/widgets/customwidget/widgetApi';
import { fetchMyPostTemplatesApi, uploadImageToSupabase, fetchPostTemplateById, createPostTemplateApi } from '../post/api';

const Market: React.FC = () => {
    const { credits } = useCredits();
    const navigate = useNavigate();

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
        refreshMarket,
        totalCount,
        changeSort,
        wishlistItems,
        wishlistDetails
    } = useMarket(); // destructured
    const [activeTab, setActiveTab] = useState<'all' | 'start_pack' | 'sticker' | 'template_widget' | 'template_post' | 'myshop' | 'wishlist' | 'history' | 'free'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [hideOwned, setHideOwned] = useState(false); // New State
    const shouldSkipSearch = React.useRef(false); // Ref to skip search effect when clearing programmatically

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on tab change

        const isFree = activeTab === 'free';
        let category: string | undefined = undefined;

        if (['sticker', 'template_widget', 'template_post', 'start_pack'].includes(activeTab)) {
            category = activeTab;
        }

        if (activeTab === 'myshop' || activeTab === 'history') {
            // No specific fetch needed for these tabs yet or handled elsewhere
        } else if (activeTab === 'wishlist') {
            // Fetch all for wishlist filtering
            refreshMarket({ isFree: false, page: 0 });
        } else {
            // For 'all', 'sticker', 'free', 'start_pack' etc.
            refreshMarket({ isFree, category, page: 0 });
        }
    }, [activeTab, refreshMarket]);

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
        // 1. Custom Widgets from API
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
            id: w.id || w._id,
            title: w.name,
            type: 'template_widget',
            description: '사용자가 직접 생성한 커스텀 위젯입니다.',
            price: 0,
            source: 'api'
        }));

        const formattedTemplates = apiTemplates
            .filter(t => !t.tags?.includes('acquired'))
            .map(t => ({
                id: t.id,
                title: t.name,
                type: 'template_post',
                description: '사용자가 직접 생성한 게시물 템플릿입니다.',
                price: 0,
                source: 'api',
                // Store necessary data to replicate the template if needed, though usually referenceId logic handles it
                originalId: t.id,
                thumbnailUrl: t.thumbnailUrl // ✨ ADDED
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

    // Load user's sellable items (Mock + Real) when Myshop tab is active
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
    }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    const handleBuy = (item: MarketItem) => {
        if (isOwned(item.id)) return;

        // Dynamic price check
        const effectivePrice = getPackPrice(item.id, item.price);

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
                const success = await buyItem(item.id, effectivePrice);

                // ✨ Auto-Clone Template to My Collection
                // If the user bought a template, fetch the original data and create a copy in their personal library.
                if (success && ['template_post', 'TEMPLATE_POST'].includes(item.type) && (item as any).referenceId) {
                    try {
                        const original = await fetchPostTemplateById((item as any).referenceId);
                        if (original) {
                            await createPostTemplateApi({
                                name: original.name,
                                paperId: original.paperId || 'default',
                                styles: original.styles,
                                defaultFontColor: original.defaultFontColor,
                                stickers: original.stickers || [],
                                floatingTexts: original.floatingTexts || [],
                                floatingImages: original.floatingImages || [],
                                thumbnailUrl: original.thumbnailUrl,
                                tags: ['acquired'] // Tag as purchased
                            });
                            console.log("Template cloned successfully");
                        }
                    } catch (e) {
                        console.error("Failed to clone purchased template", e);
                    }
                }

                setTimeout(() => {
                    if (success) {
                        setConfirmation({
                            isOpen: true,
                            title: '구매 완료! 🎉',
                            message: `'${item.title}' 구매가 완료되었습니다.\n[나의 템플릿] 보관함에 추가되었습니다.`,
                            type: 'success',
                            singleButton: true,
                            onConfirm: () => setConfirmation(prev => ({ ...prev, isOpen: false }))
                        });
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
                }, 200);
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

        // ✨ Upload thumbnail if provided
        if (data.imageFile) {
            const uploadedUrl = await uploadImageToSupabase(data.imageFile);
            if (uploadedUrl) {
                imageUrl = uploadedUrl;
            } else {
                alert("이미지 업로드에 실패했습니다. 기존(또는 기본) 이미지를 사용합니다.");
            }
        }

        // ✨ Fallback/Refresh for Templates: Use fresh thumbnail from candidates
        // This ensures that if the template has a new thumbnail, updating the market item picks it up.
        if (['template_post', 'TEMPLATE_POST'].includes(sellModalItem.type)) {
            // If manual upload is missing (which is always true for templates now), try to find the fresh URL.
            // Even if 'imageUrl' exists (old one), we might want to OVERWRITE it with the fresh one?
            // Yes, because the user might have updated the template.
            // But valid 'imageUrl' from previous save shouldn't be overwritten if the template hasn't changed?
            // Actually, if it's a template, the 'thumbnailUrl' IS the source of truth for the visual.
            // We should prioritize the candidate's thumbnail if available.

            const templateId = isEditMode ? sellModalItem.referenceId : sellModalItem.id;
            const candidate = mySellableCandidates.find(c => String(c.id) === String(templateId));
            if (candidate?.thumbnailUrl) {
                // alert(`Debug Found: ${candidate.thumbnailUrl}`);
                imageUrl = candidate.thumbnailUrl;
            } else {
                // alert(`Debug Not Found: Template ID ${templateId}\nCandidates: ${mySellableCandidates.length}`);
                // console.warn("Candidate not found for template refresh", templateId);
            }
        }

        if (isEditMode) {
            // Update Item
            const success = await updateItem(sellModalItem.id, {
                ...sellModalItem,
                price: data.price,
                description: data.description,
                tags: data.tags,
                imageUrl: imageUrl // ✨ Updated Image URL
            });

            if (success) {
                alert(`'${sellModalItem.title}' 수정 완료!`);
            }
        } else {
            // Register New Item
            await registerItem({
                ...sellModalItem,
                price: data.price,
                description: data.description,
                tags: data.tags,
                imageUrl: imageUrl // ✨ New Image URL
            });
            alert(`'${sellModalItem.title}'이(가) 등록되었습니다!`);
        }

        setSellModalItem(null);
        setIsEditMode(false);
    };

    // MERGE MOCK ITEMS + BACKEND ITEMS
    // Since we migrated mock data to DB, we should only use backend items to prevent duplicates and ID mismatches.
    const allMarketItems = [...marketItems];

    const filteredItems = useMemo(() => {
        // ✨ Use wishlistDetails as source when in wishlist tab
        const sourceItems = activeTab === 'wishlist' ? wishlistDetails : allMarketItems;

        return sourceItems.filter((item: any) => {
            // 0. Hide Owned filtering
            if (hideOwned && isOwned(item.id)) return false;

            // 1. Tab Filtering
            let matchesTab = false;
            if (activeTab === 'wishlist') {
                matchesTab = true; // ✨ Already sourced from wishlist
            } else if (activeTab === 'history' || activeTab === 'myshop') {
                return false;
            } else if (activeTab === 'all') {
                matchesTab = true;
            } else if (activeTab === 'free') {
                matchesTab = Number(item.price) === 0;
            } else {
                matchesTab = item.type === activeTab;
            }

            if (!matchesTab) return false;

            // 2. Search Filtering (Essential for Mock items and local verification)
            if (!searchTerm) return true;

            const tags = item.tags || [];
            const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

            return matchesSearch;
        });
    }, [allMarketItems, wishlistDetails, activeTab, isWishlisted, searchTerm, hideOwned, isOwned]);

    return (
        <MarketLayout header={<Navigation />}>
            <div className="flex flex-col gap-8 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-[var(--text-primary)] mb-2 tracking-tight">Market</h1>
                        <p className="text-[var(--text-secondary)]">
                            나만의 템플릿과 스티커를 거래해보세요.
                        </p>
                    </div>


                </div>

                {/* Tabs & Search */}
                <div className="flex flex-col md:flex-row gap-4 sticky top-16 md:top-20 z-40 py-4 -mx-4 px-4 transition-all mt-4 theme-bg-header backdrop-blur-xl md:items-center">
                    <div className="flex overflow-x-auto py-2 gap-3 flex-1 scrollbar-hide px-1">
                        {[
                            { id: 'all', label: '전체' },
                            { id: 'free', label: '무료' },
                            { id: 'start_pack', label: '⭐ 스타터 팩' },
                            { id: 'sticker', label: '스티커' },
                            { id: 'template_widget', label: '위젯 템플릿' },
                            { id: 'template_post', label: '게시물 템플릿' },
                            { id: 'wishlist', label: '찜 목록', icon: Heart },
                            { id: 'myshop', label: '내 상점', icon: FolderOpen },
                            { id: 'history', label: '구매 내역' } // Added History Tab
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2
                                    ${activeTab === tab.id
                                        ? 'bg-[var(--btn-bg)] text-white shadow-md transform scale-105 ml-1'
                                        : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-card-secondary)]'
                                    }`}
                            >
                                {tab.icon && <tab.icon size={16} />}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-64 shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-4 h-4" />
                        <input
                            type="text"
                            placeholder="아이템 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full theme-bg-card-secondary border border-[var(--border-color)] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)] transition-all"
                        />
                    </div>
                </div>



                {/* Sort & Filter Bar (Active) */}
                {activeTab !== 'myshop' && activeTab !== 'history' && (
                    <div className="flex flex-col gap-2 -mb-4 px-2">
                        {sellerId && (
                            <div className="flex items-center gap-2">
                                <p className="text-[var(--text-secondary)]">
                                    나만의 디지털 아이템을 거래해보세요 <span className="text-sm font-semibold opacity-70 ml-2">(Total {totalCount})</span>
                                </p>
                                <button
                                    onClick={() => filterBySeller(null)}
                                    className="flex items-center gap-1 px-2 py-1 bg-[var(--btn-bg)] text-white text-xs font-bold rounded-full hover:brightness-110"
                                >
                                    <span>필터 해제</span>
                                    <X size={12} />
                                </button>
                            </div>
                        )}
                        {selectedTags.length > 0 && (
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="text-xs font-bold text-[var(--text-secondary)] mr-1">태그:</span>
                                {selectedTags.map(tag => (
                                    <div key={tag} className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium animate-in fade-in zoom-in duration-200">
                                        <span>#{tag}</span>
                                        <button
                                            onClick={() => filterByTag(tag)}
                                            className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => {
                                        shouldSkipSearch.current = true;
                                        setSearchTerm('');
                                        filterByTag(null); // Clear all
                                    }}
                                    className="text-xs text-gray-500 hover:text-gray-700 underline ml-1"
                                >
                                    전체 해제
                                </button>
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-2 gap-3 md:gap-0">
                            <span className="text-sm font-bold text-[var(--text-secondary)]">
                                총 {activeTab === 'wishlist' ? wishlistItems.length : totalCount}개의 아이템
                            </span>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                                {/* Hide Owned Toggle */}
                                <label className="flex items-center gap-2 cursor-pointer select-none group shrink-0">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${hideOwned ? 'bg-[var(--btn-bg)] border-[var(--btn-bg)]' : 'border-[var(--text-secondary)] group-hover:border-[var(--text-primary)]'}`}>
                                        {hideOwned && <Check size={12} className="text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={hideOwned}
                                        onChange={(e) => setHideOwned(e.target.checked)}
                                        className="hidden"
                                    />
                                    <span className={`text-xs font-bold ${hideOwned ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>보유 상품 숨기기</span>
                                </label>

                                <div className="hidden sm:block h-4 w-[1px] bg-[var(--border-color)]"></div>

                                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                    {[
                                        { id: 'popular', label: '인기순' },
                                        { id: 'latest', label: '최신순' },
                                        { id: 'price_low', label: '낮은가격순' },
                                        { id: 'price_high', label: '높은가격순' }
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => changeSort(opt.id as any)}
                                            className={`flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${sort === opt.id
                                                ? 'bg-[var(--btn-bg)] text-white'
                                                : 'text-[var(--text-secondary)] bg-[var(--bg-card)] sm:bg-transparent border sm:border-0 border-[var(--border-color)] hover:bg-[var(--bg-card-secondary)]'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Grid */}
                {activeTab === 'history' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4">
                        {purchasedItems.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-[var(--text-secondary)] flex flex-col items-center">
                                <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
                                <p className="text-lg font-bold">구매 내역이 없습니다.</p>
                            </div>
                        ) : (
                            purchasedItems.map((item: any) => (
                                <MerchCard
                                    key={`history-${item.id}`}
                                    item={item}
                                    onBuy={() => { }} // No buy action for history
                                    isOwned={true}
                                    // Hide wishlist/price in history? Or just show as owned.
                                    effectivePrice={item.price}
                                    onClick={() => setSelectedItem(item)}
                                    onClickRating={() => setSelectedItem({ ...item, initialTab: 'reviews' })} // Enable review click
                                />
                            ))
                        )}
                    </div>
                ) : activeTab === 'myshop' ? (
                    <div className="flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-4">
                        {/* Dashboard */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-color)]">
                                <h3 className="text-xs text-[var(--text-secondary)] font-bold uppercase">총 수익</h3>
                                <p className="text-2xl font-black text-[var(--text-primary)] mt-1">
                                    {(sellingItems.reduce((acc, cur) => acc + (cur.price || 0) * (cur.salesCount || 0), 0)).toLocaleString()} C
                                </p>
                            </div>
                            <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-color)]">
                                <h3 className="text-xs text-[var(--text-secondary)] font-bold uppercase">판매 수</h3>
                                <p className="text-2xl font-black text-blue-500 mt-1">
                                    {sellingItems.reduce((acc, cur) => acc + (cur.salesCount || 0), 0)}
                                </p>
                            </div>
                            <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-color)]">
                                <h3 className="text-xs text-[var(--text-secondary)] font-bold uppercase">판매 중</h3>
                                <p className="text-2xl font-black text-green-500 mt-1">
                                    {sellingItems.filter(i => i.status === 'ON_SALE').length}
                                </p>
                            </div>
                        </div>

                        {/* Selling Items */}
                        <div className="flex flex-col gap-4">
                            <h2 className="text-xl font-bold px-1 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                판매 관리
                            </h2>
                            {sellingItems.length === 0 ? (
                                <p className="text-sm text-[var(--text-secondary)] px-1">판매 내역이 없습니다.</p>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                                    {[...sellingItems]
                                        .filter(item => item.status !== 'CANCELLED')
                                        .sort((a, b) => {
                                            // Date Priority: Newest First
                                            const dateA = new Date(a.createdAt || 0).getTime();
                                            const dateB = new Date(b.createdAt || 0).getTime();
                                            return dateB - dateA;
                                        })
                                        .map((item, idx) => {
                                            const status = item.status || 'ON_SALE'; // Default to ON_SALE if undefined (legacy)
                                            const isCanceled = status === 'CANCELLED';
                                            const badgeColor = isCanceled ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700' :
                                                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900';
                                            const statusText = isCanceled ? '판매 중지됨' : '판매 중';

                                            return (
                                                <div key={`${item.id}-${idx}`} className={`bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-4 flex flex-col gap-3 relative transition-colors ${!isCanceled ? 'hover:border-green-500/50' : ''} ${isCanceled ? 'opacity-60' : ''}`}>
                                                    <div className={`absolute top-3 right-3 px-2 py-1 text-[10px] font-bold rounded-full border ${badgeColor}`}>
                                                        {statusText}
                                                    </div>
                                                    <div className="aspect-video bg-[var(--bg-card-secondary)] rounded-xl flex items-center justify-center text-[var(--text-secondary)] font-bold text-xs uppercase tracking-wider overflow-hidden">
                                                        {(item.imageUrl || item.thumbnailUrl) ? (
                                                            <img src={item.imageUrl || item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            (item.type as string).toLowerCase() === 'template_widget' ? '위젯 템플릿' :
                                                                (item.type as string).toLowerCase() === 'template_post' ? '게시물 템플릿' :
                                                                    (item.type as string).toLowerCase() === 'sticker' ? '스티커' :
                                                                        (item.type as string).toLowerCase() === 'start_pack' ? '스타터 팩' :
                                                                            item.type
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-[var(--text-primary)]">{item.title}</h3>
                                                        <p className="text-xs text-[var(--text-secondary)] font-mono mt-1">{item.price} C</p>
                                                    </div>
                                                    <div className="flex gap-2 w-full mt-auto">
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`'${item.title}' 판매를 중지하시겠습니까?`)) {
                                                                    cancelItem(item.id);
                                                                }
                                                            }}
                                                            disabled={isCanceled}
                                                            className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-colors
                                                    ${isCanceled
                                                                    ? 'border-transparent text-[var(--text-disabled)] cursor-not-allowed bg-[var(--bg-card-secondary)]'
                                                                    : 'border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                                }`}
                                                        >
                                                            {isCanceled ? '판매 중지됨' : '판매 중지'}
                                                        </button>
                                                        {!isCanceled && (
                                                            <button
                                                                onClick={() => handleSell(item, true)}
                                                                className="flex-1 py-2 rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-card-secondary)] text-xs font-bold transition-colors"
                                                            >
                                                                수정
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                </div>
                            )}
                        </div>

                        {/* Register Section */}
                        <div className="flex flex-col gap-4">
                            <div className="px-1">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-[var(--btn-bg)]" />
                                    판매 등록 가능
                                </h2>
                                <p className="text-sm text-[var(--text-secondary)] mt-1">
                                    보유한 위젯 템플릿과 스티커를 마켓에 등록해보세요.
                                </p>
                            </div>

                            {mySellableCandidates.length === 0 ? (
                                <div className="py-20 text-center text-[var(--text-secondary)] bg-[var(--bg-card-secondary)] rounded-2xl border border-dashed border-[var(--border-color)]">
                                    <p className="text-sm">판매할 수 있는 아이템이 없습니다.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                    {mySellableCandidates.map((item, idx) => (
                                        <div key={`${item.source}-${item.id}-${idx}`} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-4 flex flex-col gap-3 group hover:border-[var(--btn-bg)] transition-colors relative">
                                            <div className="aspect-video bg-[var(--bg-card-secondary)] rounded-xl flex items-center justify-center text-[var(--text-secondary)] font-bold text-xs uppercase tracking-wider overflow-hidden">
                                                {(item.imageUrl || item.thumbnailUrl) ? (
                                                    <img src={item.imageUrl || item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    item.type === 'template_widget' ? '위젯 템플릿' :
                                                        item.type === 'sticker' ? '스티커' :
                                                            item.type === 'template_post' ? '게시물 템플릿' :
                                                                item.type === 'start_pack' ? '스타터 팩' :
                                                                    '로컬 아이템'
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-[var(--text-primary)]">{item.title}</h3>
                                                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-1">{item.description}</p>
                                            </div>
                                            <button
                                                onClick={() => handleSell(item)}
                                                disabled={item.isAlreadySelling}
                                                className={`mt-auto w-full py-2 rounded-lg text-xs font-bold transition-colors
                                                    ${item.isAlreadySelling
                                                        ? 'bg-[var(--bg-card-secondary)] text-[var(--text-disabled)] cursor-not-allowed border border-[var(--border-color)]'
                                                        : 'bg-[var(--bg-card-secondary)] text-[var(--text-primary)] hover:bg-[var(--btn-bg)] hover:text-white'
                                                    }`}
                                            >
                                                {item.isAlreadySelling ? '이미 등록됨' : '판매 등록하기'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4">
                        {filteredItems.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-[var(--text-secondary)] flex flex-col items-center">
                                <Search className="w-12 h-12 mb-4 opacity-20" />
                                <p className="text-lg font-bold">아이템이 없습니다.</p>
                                {activeTab === 'wishlist' && <p className="text-sm mt-1">마음에 드는 아이템에 하트를 눌러보세요!</p>}
                            </div>
                        ) : (
                            <>
                                {filteredItems.map((item: any) => {
                                    const effectivePrice = getPackPrice(item.id, item.price);

                                    // Check if this item inherits ratings from a Pack
                                    let displayItem = item;
                                    const stickerDef = STICKERS.find(s => s.id === item.referenceId);
                                    if (stickerDef && stickerDef.packId) {
                                        let packItem = marketItems.find(m => m.referenceId === stickerDef.packId);
                                        // Fallback to purchased items if not in current list (e.g. filtered)
                                        if (!packItem) {
                                            packItem = purchasedItems.find(p => p.referenceId === stickerDef.packId);
                                        }

                                        if (packItem && (packItem.reviewCount || 0) > 0) {
                                            displayItem = {
                                                ...item,
                                                averageRating: packItem.averageRating,
                                                reviewCount: packItem.reviewCount
                                            };
                                        }
                                    }

                                    return (
                                        <MerchCard
                                            key={item.id}
                                            item={displayItem}
                                            onBuy={handleBuy}
                                            onToggleWishlist={() => toggleWishlist(item.id)}
                                            isOwned={isOwned(item.id)}
                                            isWishlisted={isWishlisted(item.id)}
                                            effectivePrice={effectivePrice}

                                            onClick={() => setSelectedItem(item)}
                                            onClickRating={() => setSelectedItem({ ...item, initialTab: 'reviews' })}
                                        />
                                    );
                                })}
                                {hasMore && filteredItems.length > 0 && activeTab !== 'wishlist' && (
                                    <div className="col-span-full flex justify-center py-8">
                                        <button
                                            onClick={loadMore}
                                            className="px-8 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm flex items-center gap-2"
                                        >
                                            <Plus size={16} />
                                            더 보기
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
            {
                selectedItem && (
                    <ItemDetailModal
                        item={selectedItem}
                        onClose={() => setSelectedItem(null)}
                        onBuy={handleBuy}
                        onToggleWishlist={() => toggleWishlist(selectedItem.id)}
                        isOwned={isOwned(selectedItem.id)}
                        isWishlisted={isWishlisted(selectedItem.id)}
                        effectivePrice={getPackPrice(selectedItem.id, selectedItem.price)}
                        initialTab={selectedItem.initialTab}
                        onFilterBySeller={(id) => filterBySeller(id)}
                        onSearchTag={(tag) => filterByTag(tag)}
                        reviewTargetId={(() => {
                            // Check if this item is part of a pack
                            const stickerDef = STICKERS.find(s => s.id === selectedItem.referenceId);
                            if (stickerDef && stickerDef.packId) {
                                // 1. Try to find in current market list (filtered)
                                let packItem = marketItems.find(m => m.referenceId === stickerDef.packId);

                                // 2. If not found (e.g. filtered out), check purchased items (if I bought the pack)
                                if (!packItem) {
                                    packItem = purchasedItems.find(p => p.referenceId === stickerDef.packId);
                                }

                                if (packItem) return packItem.id;
                            }
                            return undefined;
                        })()}
                    />
                )
            }
            {
                sellModalItem && (
                    <SellModal
                        item={sellModalItem}
                        onClose={() => setSellModalItem(null)}
                        onSubmit={handleRegisterSubmit}
                    />
                )
            }
            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmation.isOpen}
                title={confirmation.title}
                message={confirmation.message}
                onConfirm={confirmation.onConfirm}
                onCancel={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
                type={confirmation.type || 'info'}
                singleButton={confirmation.singleButton}
                confirmText={confirmation.singleButton ? "확인" : "구매하기"}
            />
        </MarketLayout >
    );
};

export default Market;
