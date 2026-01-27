import { useCallback, useEffect, useState, useMemo } from 'react';
import { useCredits } from '../context/CreditContext';
import { STICKERS } from '../components/post/constants';
import { API_BASE_URL as CONFIG_API_BASE_URL } from '../api/config';

const API_BASE_URL = `${CONFIG_API_BASE_URL}/api/market`;

export interface MarketItem {
    id: string;
    title: string;
    price: number;
    description: string;
    tags: string[];
    imageUrl: string;
    type: string;
    author: string;
    sellerId?: string;
    status: string;
    createdAt: string;
    salesCount: number;
    referenceId?: string;
    averageRating?: number;
    reviewCount?: number;
    isBackend?: boolean;
    isVirtual?: boolean;
    purchasedAt?: string;
    // ✨ Extended properties for Custom Widgets
    content?: any;
    decorations?: any[];
    widgetType?: string;
    defaultSize?: string;
}

// 백엔드 응답을 프론트엔드 모델로 매핑하는 헬퍼 함수
const mapBackendItemToFrontend = (i: any): MarketItem => {
    let content = { description: '', tags: [], imageUrl: '' };
    try {
        if (i.contentJson) {
            content = JSON.parse(i.contentJson);
        }
    } catch (e) {
        console.warn('Failed to parse contentJson for item', i.id);
    }

    // Check if this item is a known pack based on STICKERS constant
    const knownPackIds = new Set(STICKERS.map(s => s.packId).filter(Boolean));
    // Determine type: if it's explicitly 'start_pack' or 'package' OR if its referenceId is a known pack ID, treat as 'package'
    const isPack = ['start_pack', 'package', 'PACKAGE'].includes(i.category) || (i.referenceId && knownPackIds.has(String(i.referenceId)));

    return {
        id: String(i.id),
        title: i.name,
        price: i.price,
        description: i.description || content.description || '',
        tags: i.tags || content.tags || [],
        imageUrl: i.imageUrl || content.imageUrl || (content as any).thumbnailUrl || '', // Fallback to thumbnailUrl for Templates
        type: isPack ? 'package' : i.category,
        author: i.sellerName,
        sellerId: i.sellerId ? String(i.sellerId) : undefined,
        status: i.status,
        createdAt: i.createdAt,
        salesCount: i.salesCount || 0,
        referenceId: i.referenceId,
        averageRating: i.averageRating,
        reviewCount: i.reviewCount,
        purchasedAt: i.transactionDate, // 구매 시점에만 존재
        isBackend: true,

        // ✨ Extended properties for Custom Widgets
        content: (content as any).content,
        decorations: (content as any).decorations,
        widgetType: (content as any).widgetType,
        defaultSize: (content as any).defaultSize
    };
};

export const useMarket = () => {
    const { credits, refreshCredits, userId, addCredits } = useCredits();

    // 데이터 상태
    const [purchasedItems, setPurchasedItems] = useState<MarketItem[]>([]);
    const [sellingItems, setSellingItems] = useState<MarketItem[]>([]);
    const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
    const [wishlistItems, setWishlistItems] = useState<string[]>([]);
    const [wishlistDetails, setWishlistDetails] = useState<MarketItem[]>([]);

    // 필터 및 정렬 상태
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [sort, setSort] = useState<'popular' | 'latest' | 'price_low' | 'price_high'>('popular');
    const [totalCount, setTotalCount] = useState(0);
    const [sellerId, setSellerId] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [category, setCategory] = useState<string>('all');
    const [isFree, setIsFree] = useState(false);

    // --- 사용자 데이터 조회 (구매, 판매, 위시리스트) ---
    const fetchUserData = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            // 1. 구매 내역 상세 조회 (팩 포함)
            const purchasedRes = await fetch(`${API_BASE_URL}/purchased`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (purchasedRes.ok) {
                const items = await purchasedRes.json();

                // 팩 상품일 경우, 포함된 가상 스티커들도 목록에 추가
                const expandedItems = items.flatMap((i: any) => {
                    const mainItem = mapBackendItemToFrontend(i);
                    const virtualItems: MarketItem[] = [];

                    if (mainItem.referenceId) {
                        const packContents = STICKERS.filter(s => s.packId === mainItem.referenceId);
                        packContents.forEach(sticker => {
                            virtualItems.push({
                                id: sticker.id,
                                title: sticker.name || '포함된 스티커',
                                imageUrl: sticker.url,
                                price: sticker.price || 0, // Show original individual price
                                type: 'sticker',
                                author: mainItem.author,
                                purchasedAt: mainItem.purchasedAt,
                                status: 'OWNED',
                                referenceId: sticker.id,
                                isVirtual: true,
                                description: `${mainItem.title}에 포함됨`,
                                tags: ['Pack Content'],
                                averageRating: mainItem.averageRating,
                                reviewCount: mainItem.reviewCount,
                                createdAt: mainItem.createdAt,
                                salesCount: mainItem.salesCount
                            });
                        });
                    }
                    return [mainItem, ...virtualItems];
                });

                // 가상 아이템과 실제 구매 아이템 중 가상 아이템 우선 (중복 제거)
                const uniqueItems = expandedItems.filter((item: MarketItem, _: number, self: MarketItem[]) => {
                    if (!item.isVirtual && item.referenceId) {
                        const hasVirtual = self.some(other => other.isVirtual && other.referenceId === item.referenceId);
                        if (hasVirtual) return false;
                    }
                    return true;
                });
                setPurchasedItems(uniqueItems);
            }

            // 2. 내 판매 목록 조회
            const sellingRes = await fetch(`${API_BASE_URL}/my-items`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (sellingRes.ok) {
                const items = await sellingRes.json();
                setSellingItems(items.map(mapBackendItemToFrontend));
            }

            // 3. 위시리스트 조회
            const wishRes = await fetch(`${API_BASE_URL}/wishlist`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (wishRes.ok) {
                const items = await wishRes.json();
                const mapped = items.map(mapBackendItemToFrontend);
                setWishlistDetails(mapped);
                setWishlistItems(mapped.map((i: MarketItem) => i.id));
            }

        } catch (e) {
            console.error("Failed to fetch user market data", e);
        }
    }, [userId]);

    // --- 마켓 피드 조회 ---
    const fetchMarketFeed = useCallback(async (isLoadMore = false) => {
        const token = localStorage.getItem('accessToken');

        const targetPage = isLoadMore ? page + 1 : 0;
        if (!isLoadMore) setPage(0);

        let sortParam = 'salesCount,desc';
        if (sort === 'latest') sortParam = 'createdAt,desc';
        if (sort === 'price_low') sortParam = 'price,asc';
        if (sort === 'price_high') sortParam = 'price,desc';

        const query = new URLSearchParams({
            page: String(targetPage),
            size: '12',
            sort: sortParam
        });

        if (keyword) query.append('keyword', keyword);
        if (sellerId) query.append('sellerId', sellerId);
        if (selectedTags.length > 0) selectedTags.forEach(t => query.append('tags', t));
        if (category && category !== 'all') query.append('category', category);
        if (isFree) query.append('isFree', 'true');

        try {
            const res = await fetch(`${API_BASE_URL}/items?${query.toString()}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });

            if (res.ok) {
                const data = await res.json();
                let total = data.page?.totalElements ?? data.totalElements ?? 0;

                setTotalCount(total);

                const fetchedItems = data.content.map(mapBackendItemToFrontend);

                // 본인 상품 제외 또는 필터링 로직
                let visibleItems = fetchedItems;
                if (userId && sellerId === String(userId)) {
                    // 내 상점 보기 모드일 때만 필터링 (일반 피드는 내 물건도 표시)
                    visibleItems = fetchedItems.filter((i: MarketItem) => String(i.sellerId) === String(userId));
                }

                if (isLoadMore) {
                    setMarketItems(prev => {
                        const existingIds = new Set(prev.map(p => p.id));
                        const newUnique = visibleItems.filter((i: MarketItem) => !existingIds.has(i.id));
                        return [...prev, ...newUnique];
                    });
                    setPage(targetPage);
                } else {
                    setMarketItems(visibleItems);
                }
                setHasMore(!data.last);
            }
        } catch (e) {
            console.error("Failed to fetch market feed", e);
        }
    }, [page, sort, keyword, sellerId, selectedTags, category, isFree, userId, sellingItems.length]);


    // --- 초기 로드 및 효과 Hooks ---

    // 1. 사용자 데이터 로드
    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    // 2. 피드 데이터 조건 변경 시 로드
    useEffect(() => {
        fetchMarketFeed(false);
    }, [sort, keyword, sellerId, selectedTags, category, isFree]); // page is handled in loadMore 함수에서 처리

    // 통합 새로고침 함수
    const refreshMarket = useCallback(async (options: { isLoadMore?: boolean } = {}) => {
        if (options.isLoadMore) {
            await fetchMarketFeed(true);
        } else {
            await Promise.all([fetchUserData(), fetchMarketFeed(false)]);
        }
    }, [fetchUserData, fetchMarketFeed]);


    // --- 액션 핸들러 ---

    const loadMore = useCallback(() => {
        if (!hasMore) return;
        fetchMarketFeed(true);
    }, [hasMore, fetchMarketFeed]);

    const filterBySeller = useCallback((id: string | null) => {
        setSellerId(id);
        setKeyword('');
        setPage(0);
    }, []);

    const filterByTag = useCallback((tag: string | null) => {
        if (tag === null) setSelectedTags([]);
        else setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
        setKeyword('');
        setPage(0);
    }, []);

    const search = useCallback((kw: string) => {
        setKeyword(kw);
        setSellerId(null);
        setSelectedTags([]);
        setPage(0);
    }, []);

    const toggleWishlist = useCallback(async (itemOrId: string | MarketItem) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        const itemId = typeof itemOrId === 'string' ? itemOrId : itemOrId.id;

        try {
            const res = await fetch(`${API_BASE_URL}/wishlist/${itemId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setWishlistItems(prev => {
                    const isAdded = data.added;
                    if (isAdded) return [...prev, String(itemId)];
                    return prev.filter(id => id !== String(itemId));
                });

                // details 업데이트 (위시리스트 탭 즉시 반영용)
                setWishlistDetails(prev => {
                    if (data.added) {
                        // 1. 넘겨받은 파라미터가 객체라면 우선적으로 사용
                        if (typeof itemOrId !== 'string') {
                            return [...prev, itemOrId];
                        }

                        // 2. 문자열이라면 기존 리스트에서 탐색
                        const itemToAdd = marketItems.find(i => String(i.id) === String(itemId)) ||
                            purchasedItems.find(i => String(i.id) === String(itemId)) ||
                            sellingItems.find(i => String(i.id) === String(itemId));

                        if (itemToAdd) {
                            return [...prev, itemToAdd];
                        }
                        // 3. 그래도 없으면 리스트 갱신 필요 (여기서는 생략)
                        return prev;
                    } else {
                        return prev.filter(item => String(item.id) !== String(itemId));
                    }
                });
            }
        } catch (e) {
            console.error("Failed to toggle wishlist", e);
        }
    }, [marketItems, purchasedItems, sellingItems]);

    const updateItemInState = useCallback((itemId: string, updates: Partial<MarketItem>) => {
        setMarketItems(prev => prev.map(item =>
            String(item.id) === String(itemId) ? { ...item, ...updates } : item
        ));
        // 필요한 경우 sellingItems, wishlistDetails 등도 업데이트
        setSellingItems(prev => prev.map(item =>
            String(item.id) === String(itemId) ? { ...item, ...updates } : item
        ));
        setWishlistDetails(prev => prev.map(item =>
            String(item.id) === String(itemId) ? { ...item, ...updates } : item
        ));
    }, []);

    const registerItem = useCallback(async (item: any) => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            let contentJson = '';

            // Handle Templates specifically (Backend requires PostTemplateDto structure in contentJson)
            if (['template_post', 'TEMPLATE_POST'].includes(item.type)) {
                contentJson = JSON.stringify({
                    // Required DTO fields
                    name: item.name || item.title, // Template Name
                    styles: item.styles || {},
                    defaultFontColor: item.defaultFontColor || '#000000',
                    stickers: (item.stickers || []).map((s: any) => {
                        const { widgetType, ...safeSticker } = s;
                        return safeSticker;
                    }),
                    floatingTexts: item.floatingTexts || [],
                    floatingImages: item.floatingImages || [],
                    thumbnailUrl: item.imageUrl,
                    tags: item.tags || []
                    // Note: 'description' and 'paperId' are OMITTED as backend DTO throws UnrecognizedPropertyException
                });
            } else if (item.type === 'template_widget' || item.type === 'custom-block' || (typeof item.type === 'string' && item.type.startsWith('custom-'))) {
                // ✨ Custom Widget: Save full content for preview
                contentJson = JSON.stringify({
                    description: item.description,
                    imageUrl: item.imageUrl,
                    tags: item.tags,
                    // Widget Data
                    content: item.content,
                    decorations: item.decorations,
                    styles: item.styles,
                    widgetType: item.widgetType || (item.type === 'template_widget' ? 'custom-block' : item.type),
                    defaultSize: item.defaultSize
                });
            } else {
                // Standard Item (Sticker, Widget, etc.)
                contentJson = JSON.stringify({
                    description: item.description,
                    imageUrl: item.imageUrl,
                    tags: item.tags
                });
            }

            const payload = {
                name: item.title,
                price: item.price,
                category: item.type || 'sticker',
                description: item.description,
                imageUrl: item.imageUrl, // Added top-level imageUrl
                contentJson: contentJson,
                referenceId: item.originalId?.toString() || item.id?.toString()
            };


            const response = await fetch(`${API_BASE_URL}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                await Promise.all([fetchUserData(), fetchMarketFeed(false), refreshCredits()]);
            } else {
                alert("아이템 등록 실패");
            }
        } catch (e) {
            console.error(e);
            alert("아이템 등록 중 오류 발생");
        }
    }, [fetchUserData, fetchMarketFeed, refreshCredits]);

    const updateItem = useCallback(async (itemId: string, itemData: any) => {
        const token = localStorage.getItem('accessToken');
        if (!token) { alert('로그인이 필요합니다.'); return false; }

        try {
            let contentJson = '';

            // Handle Templates specifically (Backend requires PostTemplateDto structure in contentJson)
            if (['template_post', 'TEMPLATE_POST'].includes(itemData.type)) {
                contentJson = JSON.stringify({
                    // Required DTO fields
                    name: itemData.name || itemData.title, // Template Name
                    styles: itemData.styles || {},
                    defaultFontColor: itemData.defaultFontColor || '#000000',
                    stickers: (itemData.stickers || []).map((s: any) => {
                        const { widgetType, ...safeSticker } = s;
                        return safeSticker;
                    }),
                    floatingTexts: itemData.floatingTexts || [],
                    floatingImages: itemData.floatingImages || [],
                    thumbnailUrl: itemData.imageUrl, // Use the updated imageUrl
                    tags: itemData.tags || []
                });
            } else if (itemData.type === 'template_widget' || itemData.type === 'custom-block' || (typeof itemData.type === 'string' && itemData.type.startsWith('custom-'))) {
                // ✨ Custom Widget: Save full content for preview
                contentJson = JSON.stringify({
                    description: itemData.description,
                    imageUrl: itemData.imageUrl,
                    tags: itemData.tags,
                    // Widget Data
                    content: itemData.content,
                    decorations: itemData.decorations,
                    styles: itemData.styles,
                    widgetType: itemData.widgetType || (itemData.type === 'template_widget' ? 'custom-block' : itemData.type),
                    defaultSize: itemData.defaultSize
                });
            } else {
                // Standard Item (Sticker, Widget, etc.)
                contentJson = JSON.stringify({
                    description: itemData.description,
                    imageUrl: itemData.imageUrl,
                    tags: itemData.tags
                });
            }

            const body = {
                name: itemData.title,
                price: itemData.price,
                category: itemData.type,
                description: itemData.description,
                contentJson: contentJson
            };

            const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                await fetchUserData();
                return true;
            } else {
                const errorText = await response.text();
                alert(`수정 실패: ${errorText}`);
                return false;
            }
        } catch (error) {
            console.error("Failed to update item", error);
            alert('수정 중 오류가 발생했습니다.');
            return false;
        }
    }, [fetchUserData]);

    const cancelItem = useCallback(async (itemId: string) => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/cancel/${itemId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                await Promise.all([fetchUserData(), fetchMarketFeed(false)]);
            } else {
                alert("판매 취소 실패");
            }
        } catch (e) {
            console.error(e);
        }
    }, [fetchUserData, fetchMarketFeed]);

    const isOwned = useCallback((itemId: string) => {
        const checkId = String(itemId);

        // 1. Direct ID check
        if (purchasedItems.some(i => String(i.id) === checkId)) return true;

        // 2. Reference ID check (Stable identity)
        const itemDef = marketItems.find(i => String(i.id) === checkId) ||
            sellingItems.find(i => String(i.id) === checkId) ||
            wishlistDetails.find(i => String(i.id) === checkId);

        const refId = itemDef?.referenceId || checkId; // If looking up by refId directly

        // Check if we own any item with this referenceId
        // We match if BOTH are system items (sticker/pack) OR BOTH are templates
        // This prevents ID collision between different types
        const targetIsTemplate = itemDef ? ['template_post', 'TEMPLATE_POST'].includes(itemDef.type) : false;

        if (purchasedItems.some(p => {
            const pRefId = String(p.referenceId);
            const pId = String(p.id);
            const isRefMatch = pRefId === refId || pId === refId;
            if (!isRefMatch) return false;

            // Type safety check
            const pIsTemplate = ['template_post', 'TEMPLATE_POST'].includes(p.type);
            return pIsTemplate === targetIsTemplate;
        })) {
            return true;
        }

        // 3. Parent Pack check (if this is a component sticker)
        const stickerDef = STICKERS.find(s => s.id === refId);
        if (stickerDef && stickerDef.packId) {
            if (purchasedItems.some(i => String(i.referenceId) === stickerDef.packId)) return true;
        }

        return false;
    }, [purchasedItems, marketItems, sellingItems, wishlistDetails]);

    const isWishlisted = useCallback((itemId: string) => wishlistItems.includes(String(itemId)), [wishlistItems]);

    const getPackPrice = useCallback((packId: string, originalPrice: number) => {
        const packStickers = STICKERS.filter(s => s.packId === packId);
        if (packStickers.length === 0) return originalPrice;
        const ownedStickers = packStickers.filter(s => isOwned(s.id));
        const ownedValue = ownedStickers.reduce((sum, s) => sum + (s.price || 0), 0);
        return Math.max(0, originalPrice - ownedValue);
    }, [isOwned]);

    const buyItem = useCallback(async (itemId: string, cost: number, itemObject?: MarketItem) => {
        const token = localStorage.getItem('accessToken');
        if (!token) return false;

        // 1. Identify Target Item & Reference (Pack Logic)
        const targetItem = itemObject ||
            marketItems.find(i => String(i.id) === String(itemId)) ||
            sellingItems.find(i => String(i.id) === String(itemId)) ||
            wishlistDetails.find(i => String(i.id) === String(itemId));

        const packId = targetItem?.referenceId;
        const packStickers = packId ? STICKERS.filter(s => s.packId === packId) : [];

        // 2. Pre-flight Check: Already Owned? (Full Pack or Single Item)
        if (isOwned(itemId)) {
            alert("이미 보유한 아이템입니다.");
            return false;
        }

        // 3. Logic Branch: Pack Purchase (System Packs Only)
        // Only trigger 'Pack Logic' if it is actually a defined System Pack
        const isSystemPack = packId && packStickers.length > 0 && STICKERS.some(s => s.packId === packId);

        if (isSystemPack) {
            const unownedComponents = packStickers.filter(s => !isOwned(s.id));

            if (unownedComponents.length === 0) {
                alert("이미 모든 구성품을 보유하고 있습니다.");
                return true;
            }

            // Discount Injection Strategy (Pre-Purchase Grant):
            // 1. Calculate the Discount Amount = PackPrice - TargetPrice (Owned Value).
            // 2. Grant this amount to the user BEFORE purchase.
            // 3. Buy the PACK item directly (at full price).
            // Result: User pays Full Price from wallet, but a grant was just given. Net Cost = Target Price.

            // 1. Calculate Owned Value
            const ownedStickers = packStickers.filter(s => isOwned(s.id));
            const ownedValue = ownedStickers.reduce((sum, s) => sum + (s.price || 0), 0);

            // 2. Identify Pack Item & Prices
            const packOriginalPrice = targetItem?.price || cost + ownedValue; // Heuristic fallback

            const targetDiscountedPrice = Math.max(0, packOriginalPrice - ownedValue);
            const discountGrantAmount = Math.min(ownedValue, packOriginalPrice); // Cap discount to pack price

            // 3. User Balance Check (Net Price check)
            if (credits < targetDiscountedPrice) {
                alert(`크레딧이 부족합니다. (필요: ${targetDiscountedPrice})`);
                return false;
            }

            // 4. Inject Discount Credits
            if (discountGrantAmount > 0) {
                try {
                    await addCredits(discountGrantAmount);
                } catch (e) {
                    console.error("Failed to inject discount", e);
                    alert("할인 적용 중 오류가 발생했습니다.");
                    return false;
                }
            }

            // 5. Execute Purchase (Pack Item)
            // Use referenceId (packId) for purchase if available, or itemId
            const purchaseTargetId = targetItem?.referenceId || itemId;
            let buyUrl = `${API_BASE_URL}/buy/ref/${purchaseTargetId}`;

            // Fallback: If it's a real item ID, use /buy/ID. Reference ID usually implies Special/Pack.
            if (!targetItem?.referenceId && !isNaN(Number(itemId))) {
                buyUrl = `${API_BASE_URL}/buy/${itemId}`;
            }

            try {
                // Send standard request (Backend charges full PackPrice)
                const res = await fetch(buyUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ price: packOriginalPrice })
                });

                if (res.ok) {
                    await fetchUserData();
                    await refreshCredits();
                    return true;
                } else {
                    // Purchase Failed - ROLLBACK Grant

                    const errorText = await res.text();

                    if (discountGrantAmount > 0) {
                        try {
                            await addCredits(-discountGrantAmount);
                        } catch (rollbackError) {

                        }
                    }
                    alert(`구매 실패: ${errorText}`);
                    return false;
                }
            } catch (e) {
                console.error("Error buying pack", e);
                // Rollback on network error too
                if (discountGrantAmount > 0) {
                    await addCredits(-discountGrantAmount);
                }
                return false;
            }

        } else {
            // Standard Single Item / User Item Purchase
            const finalCost = cost;
            // Diagnostic logging


            if (userId && targetItem?.sellerId && String(userId) === String(targetItem.sellerId)) {
                alert("자신의 상품은 구매할 수 없습니다.");
                return false;
            }

            if (credits < finalCost) {
                alert("크레딧이 부족합니다.");
                return false;
            }

            let url = '';
            // Strategy: Use specific Listing ID by default for User Items.
            // Only use Ref for strictly defined System Items if needed.
            // Templates (User Items) must be bought by Listing ID.
            url = `${API_BASE_URL}/buy/${itemId}`;

            // Remove query params to avoid conflicts. Send data in Body only.
            // url += `?price=${Math.max(0, finalCost)}&amount=1`; 

            const payload = {
                price: Math.max(0, finalCost),
                amount: 1, // Quantity is 1
                finalPrice: Math.max(0, finalCost),
                paymentAmount: Math.max(0, finalCost)
                // referenceId & category removed: Backend should identify item by ID (19). 
                // Sending them might trigger incorrect "System Item" or "Original Post" validation logic.
            };



            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    await fetchUserData();
                    await refreshCredits();
                    return true;
                } else {
                    const errorText = await response.text();
                    console.error(`Purchase Failed: Status ${response.status}`);
                    alert(`구매 실패 (${response.status}): ${errorText || '알 수 없는 오류'}`);
                    return false;
                }
            } catch (e) {
                console.error(e);
                return false;
            }
        }
    }, [credits, refreshCredits, fetchUserData, isOwned, marketItems, sellingItems, wishlistDetails, addCredits]);

    const getMarketItem = useCallback(async (itemId: string) => {
        const token = localStorage.getItem('accessToken');
        if (!token) return null;
        try {
            const res = await fetch(`${API_BASE_URL}/items/${itemId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const i = await res.json();
                return mapBackendItemToFrontend(i);
            }
            return null;
        } catch (e) {
            console.error("Failed to fetch market item", e);
            return null;
        }
    }, []);

    return useMemo(() => ({
        // 데이터
        marketItems,
        purchasedItems,
        sellingItems,
        wishlistItems,
        wishlistDetails,
        totalCount,
        hasMore,
        isSearching: !!keyword,

        // 필터 및 검색
        sort,
        changeSort: setSort,
        keyword,
        search,
        sellerId,
        filterBySeller,
        selectedTags,
        filterByTag,
        category,
        filterByCategory: setCategory,
        isFree,
        filterByFree: setIsFree,

        // 액션
        refreshMarket,
        loadMore,
        buyItem,
        registerItem,
        updateItem,
        cancelItem,
        toggleWishlist,
        updateItemInState,

        // 헬퍼
        isOwned,
        isWishlisted,
        getPackPrice,
        getMarketItem
    }), [
        marketItems, purchasedItems, sellingItems, wishlistItems, wishlistDetails,
        totalCount, hasMore, keyword, sort, sellerId, selectedTags, category, isFree,
        refreshMarket, loadMore, buyItem, registerItem, updateItem, cancelItem, toggleWishlist,
        isOwned, isWishlisted, getPackPrice, getMarketItem, search, filterBySeller, filterByTag
    ]);
};
