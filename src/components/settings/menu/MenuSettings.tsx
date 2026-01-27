import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Home, FileText, ShoppingBag, Users, Save, XCircle, MousePointerClick } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../api/config';

/* -------------------------------------------------------------------------------------------------
 * Menu Context & Provider Logic
 * -----------------------------------------------------------------------------------------------*/

export interface MenuItem {
    id: string;
    name: string;
    path: string;
    icon: LucideIcon;
}

const DEFAULT_ITEMS: MenuItem[] = [
    { name: 'Home', path: '/home', icon: Home, id: '/home' },
    { name: 'Post', path: '/post', icon: FileText, id: '/post' },
    { name: 'Community', path: '/community', icon: Users, id: '/community' },
    { name: 'Market', path: '/market', icon: ShoppingBag, id: '/market' },
];

interface MenuContextType {
    menuItems: MenuItem[];
    setMenuItems: (items: MenuItem[]) => void;
    isEditMode: boolean;
    setIsEditMode: (isEdit: boolean) => void;
    saveMenuOrder: () => void;
    cancelMenuOrder: () => void;
    moveMenuItem: (dragIndex: number, hoverIndex: number) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isLoggedIn } = useAuth();
    const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_ITEMS);
    const [isEditMode, setIsEditMode] = useState(false);
    const [originalItems, setOriginalItems] = useState<MenuItem[]>(DEFAULT_ITEMS);

    const applyMenuOrder = (orderIds: string[]) => {
        const reordered = orderIds
            .map(id => DEFAULT_ITEMS.find(item => item.id === id))
            .filter((item): item is MenuItem => item !== undefined);

        if (reordered.length === DEFAULT_ITEMS.length) {
            setMenuItems(reordered);
            setOriginalItems(reordered);
        }
    };

    // Initialize from localStorage immediately
    useEffect(() => {
        const savedOrder = localStorage.getItem('menuOrder');
        if (savedOrder) {
            try {
                const orderIds = JSON.parse(savedOrder) as string[];
                applyMenuOrder(orderIds);
            } catch (e) {
                console.error("Failed to parse local menu order", e);
            }
        }
    }, []);

    // Fetch from backend when logged in
    useEffect(() => {
        const fetchMenuOrder = async () => {
            if (!isLoggedIn) return;

            const token = localStorage.getItem('accessToken');
            if (!token) return;

            try {
                const response = await fetch(`${API_BASE_URL}/api/setting/menu`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.menuOrder && Array.isArray(data.menuOrder)) {
                        applyMenuOrder(data.menuOrder);
                        localStorage.setItem('menuOrder', JSON.stringify(data.menuOrder));
                    }
                }
            } catch (e) {
                console.error("Failed to fetch menu order", e);
            }
        };

        fetchMenuOrder();
    }, [isLoggedIn]);

    const saveMenuOrder = async () => {
        const orderIds = menuItems.map(item => item.id);

        // 1. Save to Local
        localStorage.setItem('menuOrder', JSON.stringify(orderIds));
        setOriginalItems(menuItems);
        setIsEditMode(false);

        // 2. Save to Backend
        const token = localStorage.getItem('accessToken');
        if (token) {
            const orderData = menuItems.map((item, index) => ({
                id: item.id,
                order: index
            }));

            try {
                await fetch(`${API_BASE_URL}/api/setting/menu`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ menuOrder: orderData })
                });
            } catch (e) {
                console.error("Failed to save menu order to backend", e);
            }
        }
    };

    const cancelMenuOrder = () => {
        setMenuItems(originalItems); // Revert to original
        setIsEditMode(false);
    };

    // When entering edit mode, snapshot the current state
    const handleSetEditMode = (mode: boolean) => {
        if (mode) {
            setOriginalItems([...menuItems]);
        }
        setIsEditMode(mode);
    }

    const moveMenuItem = (dragIndex: number, hoverIndex: number) => {
        const updatedItems = [...menuItems];
        const [draggedItem] = updatedItems.splice(dragIndex, 1);
        updatedItems.splice(hoverIndex, 0, draggedItem);
        setMenuItems(updatedItems);
    };

    return (
        <MenuContext.Provider value={{
            menuItems,
            setMenuItems,
            isEditMode,
            setIsEditMode: handleSetEditMode,
            saveMenuOrder,
            cancelMenuOrder,
            moveMenuItem
        }}>
            {children}
        </MenuContext.Provider>
    );
};

export const useMenu = () => {
    const context = useContext(MenuContext);
    if (!context) {
        throw new Error('useMenu must be used within a MenuProvider');
    }
    return context;
};


/* -------------------------------------------------------------------------------------------------
 * Menu Settings Component (UI for Edit Mode)
 * -----------------------------------------------------------------------------------------------*/

const MenuSettings: React.FC = () => {
    const { saveMenuOrder, cancelMenuOrder } = useMenu();

    return (
        <div className="flex flex-col items-center justify-start p-4 md:p-8 text-center animate-fade-in pb-10 md:pb-8 w-full">
            {/* 아이콘 및 헤더 */}
            <div className="mb-4 md:mb-6 relative">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/10 flex items-center justify-center theme-text-primary mb-2 md:mb-4 animate-bounce-slow">
                    <MousePointerClick className="w-8 h-8 md:w-10 md:h-10" />
                </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold theme-text-primary mb-2 md:mb-4">
                메뉴 순서 편집
            </h2>

            <p className="theme-text-secondary text-base md:text-lg max-w-lg mb-6 md:mb-8 leading-relaxed">
                <span className="md:inline hidden">상단 네비게이션의 </span>
                <span className="md:hidden inline">하단 네비게이션의 </span>
                메뉴를 <span className="theme-text-primary font-bold">드래그</span>하여 원하는 위치로 이동시키세요.<br />
                편집이 완료되면 저장 버튼을 눌러주세요.
            </p>

            {/* 액션 버튼 */}
            <div className="flex gap-3 md:gap-4">
                <button
                    onClick={cancelMenuOrder}
                    className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-xl theme-bg-card theme-border border hover:bg-black/5 transition-all duration-300 font-medium text-sm md:text-base theme-text-secondary hover:theme-text-primary hover:shadow-md"
                >
                    <XCircle className="w-4 h-4 md:w-5 md:h-5" />
                    <span>취소</span>
                </button>

                <button
                    onClick={saveMenuOrder}
                    className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-xl theme-bg-primary text-white shadow-lg hover:opacity-90 transition-all duration-300 font-bold text-sm md:text-base hover:shadow-primary/30 hover:-translate-y-1 border"
                >
                    <Save className="w-4 h-4 md:w-5 md:h-5" />
                    <span>설정 저장</span>
                </button>
            </div>

            {/* 시각적 힌트 */}
            <div className="mt-12 p-4 rounded-xl theme-bg-card-secondary theme-border border max-w-md w-full">
                <div className="flex items-center justify-center gap-2 text-sm theme-text-secondary">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="md:inline hidden">상단 메뉴바가 점선으로 표시되면 편집 가능 상태입니다.</span>
                    <span className="md:hidden inline">하단 아이콘을 꾹 눌러 이동하세요.</span>
                </div>
            </div>
        </div>
    );
};

export default MenuSettings;
