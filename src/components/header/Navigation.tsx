import React, { useState, useRef, useEffect } from 'react';
import SettingsModal from '../settings/Settings';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Settings, Coins, Palette } from 'lucide-react';
import { useCredits } from '../../context/CreditContext';
import { useMenu } from '../settings/menu/MenuSettings';
import { useAuth } from '../../context/AuthContext';
import { usePlayTime } from '../../hooks';
import DailyQuestModal from '../credit/DailyQuestModal';
import { useDrag, useDrop } from 'react-dnd';
import { useHeaderSettings } from '../../hooks/useHeaderSettings';

interface DraggableMenuItemProps {
    id: string;
    index: number;
    moveMenuItem: (dragIndex: number, hoverIndex: number) => void;
    children: React.ReactNode;
    isEditMode: boolean;
    label: string; // 라벨 추가
}

const DraggableMenuItem: React.FC<DraggableMenuItemProps> = ({ id, index, moveMenuItem, children, isEditMode, label }) => {
    const ref = useRef<HTMLDivElement>(null);

    interface DragItem {
        index: number;
        id: string;
        type: string;
        label?: string;
        initialWidth?: number;
        initialHeight?: number;
    }

    const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: any }>({
        accept: 'MENU_ITEM',
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        hover(item: DragItem, monitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;

            // 자기 자신과는 교체하지 않음
            if (dragIndex === hoverIndex) {
                return;
            }

            // 화면상 사각형 위치 계산
            const hoverBoundingRect = ref.current?.getBoundingClientRect();

            // 수직 중앙 계산
            const hoverMiddleX =
                (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

            // 마우스 위치 결정
            const clientOffset = monitor.getClientOffset();

            // 왼쪽 픽셀 계산
            const hoverClientX = (clientOffset as any).x - hoverBoundingRect.left;

            // 마우스가 아이템 너비의 절반을 넘었을 때만 이동 수행
            if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
                return;
            }

            if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
                return;
            }

            // 실제 이동 수행
            moveMenuItem(dragIndex, hoverIndex);

            // 모니터 아이템 변경
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: 'MENU_ITEM',
        item: () => {
            // 크기 캡처
            const { offsetWidth, offsetHeight } = ref.current || { offsetWidth: 0, offsetHeight: 0 };
            return {
                id,
                index,
                label, // 라벨 전달
                initialWidth: offsetWidth, // 크기 전달
                initialHeight: offsetHeight
            };
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        canDrag: isEditMode,
    });

    // 드래그 앤 드롭 연결
    drag(drop(ref));

    const opacity = isDragging ? 0.3 : 1;

    return (
        <div
            ref={ref}
            style={{ opacity }}
            data-handler-id={handlerId}
            className={`relative rounded-lg transition-all duration-200 md:w-32 md:flex-none flex-1 flex justify-center items-center py-0 md:py-2 mx-1 ${isEditMode
                ? 'border-2 border-dashed border-primary/50 cursor-grab active:cursor-grabbing hover:bg-primary/5'
                : ''
                }`}
        >
            {children}
        </div>
    );
};

const Navigation: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isQuestModalOpen, setIsQuestModalOpen] = useState(false); // 모달 상태
    const { isLoggedIn } = useAuth();
    const { credits } = useCredits();

    // 메뉴 컨텍스트
    const { menuItems, isEditMode, setIsEditMode, moveMenuItem } = useMenu();

    const [settingsInitialView, setSettingsInitialView] = useState<'main' | 'theme' | 'custom' | 'defaultPage' | 'widget'>('main');

    // 설정 모달 열기 커스텀 이벤트 리스너
    React.useEffect(() => {
        const handleOpenSettings = (e: CustomEvent) => {
            const view = e.detail?.view || 'main';
            setSettingsInitialView(view);
            setIsSettingsOpen(true);
        };

        window.addEventListener('open-settings-modal', handleOpenSettings as EventListener);
        return () => window.removeEventListener('open-settings-modal', handleOpenSettings as EventListener);
    }, []);

    const isActive = (path: string) => {
        if (path === '/' && location.pathname !== '/') return false;
        return location.pathname.startsWith(path);
    };

    // 헤더 설정 훅 사용 (Timer, Credit)
    const { settings } = useHeaderSettings();
    // settings.showTimer, settings.showCredit 사용

    const playTime = usePlayTime();
    const [formattedPlayTime, setFormattedPlayTime] = useState<string>('');

    useEffect(() => {
        if (!settings.showTimer) {
            setFormattedPlayTime('');
            return;
        }

        const hours = Math.floor(playTime / 3600);
        const minutes = Math.floor((playTime % 3600) / 60);
        const seconds = playTime % 60;

        setFormattedPlayTime(
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
    }, [settings.showTimer, playTime]);

    return (
        <>
            {/* 상단 헤더 */}
            <header className={`sticky top-0 z-50 flex h-16 md:h-20 md:grid md:grid-cols-3 justify-between items-center px-4 md:px-6 py-0 theme-bg-header shadow-sm border-b theme-border transition-colors duration-300`}>
                {/* 로고 */}
                <div
                    className={`flex items-center justify-self-start ${isEditMode ? 'cursor-default opacity-50' : 'cursor-pointer'}`}
                    onClick={() => !isEditMode && navigate('/')}
                >
                    <img src="/logo.png" alt="Logo" className="w-18 md:w-20" />
                </div>

                {/* 데스크탑 중앙 네비게이션 */}
                <nav className="hidden md:flex items-center justify-center justify-self-center">
                    {menuItems.map((item, index) => {
                        return (
                            <DraggableMenuItem
                                key={`nav-item-${item.id || 'none'}-${index}`}
                                index={index}
                                id={item.id}
                                moveMenuItem={moveMenuItem}
                                isEditMode={isEditMode}
                                label={item.name} // 라벨 전달
                            >
                                <Link
                                    to={item.path}
                                    onClick={(e) => {
                                        if (isEditMode) {
                                            e.preventDefault();
                                            return;
                                        }
                                        // 게시판 탭 클릭 시 커스텀 로직: 이미 /post에 있다면 이벤트 발생
                                        if (item.path === '/post' && isActive('/post')) {
                                            e.preventDefault();
                                            window.dispatchEvent(new CustomEvent('post-tab-click'));
                                        }
                                    }}
                                    className={`text-lg font-medium transition-colors duration-200 block ${isActive(item.path)
                                        ? 'theme-text-primary font-bold'
                                        : 'theme-text-secondary hover:theme-text-primary'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            </DraggableMenuItem>
                        )
                    })}
                </nav>

                {/* 우측 아이콘 */}
                <div className="flex items-center space-x-2 md:space-x-4 theme-text-secondary justify-self-end">
                    {settings.showTimer && formattedPlayTime && (
                        <div className={`font-mono text-xs md:text-sm font-medium mr-2 theme-text-primary bg-[var(--bg-secondary)] px-2 md:px-3 py-1 md:py-1.5 rounded-full border theme-border whitespace-nowrap ${isEditMode ? 'opacity-50 cursor-not-allowed select-none' : ''}`}>
                            {formattedPlayTime}
                        </div>
                    )}

                    {settings.showCredit && (
                        <div
                            className={`flex items-center space-x-1 font-mono text-xs md:text-sm font-medium mr-2 theme-text-primary bg-[var(--bg-secondary)] px-2 md:px-3 py-1 md:py-1.5 rounded-full border theme-border whitespace-nowrap transition-transform ${isEditMode
                                ? 'opacity-50 cursor-not-allowed select-none'
                                : 'cursor-pointer hover:scale-105 active:scale-95'
                                }`}
                            title="Daily Quests & Rewards"
                            onClick={() => !isEditMode && setIsQuestModalOpen(true)}
                        >
                            <Coins className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-yellow-500/20" />
                            <span>{credits.toLocaleString()}</span>
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        <button
                            className={`p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors w-10 h-10 flex items-center justify-center ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => {
                                if (isEditMode) return;
                                setSettingsInitialView('main');
                                setIsSettingsOpen(true);
                            }}
                            disabled={isEditMode}
                            title="설정"
                        >
                            <Palette className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <button
                            className={`p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors w-10 h-10 flex items-center justify-center ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => {
                                if (isEditMode) return;
                                isLoggedIn ? navigate('/profile') : navigate('/login');
                            }}
                            disabled={isEditMode}
                            title={isLoggedIn ? "프로필" : "로그인"}
                        >
                            <Settings className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                    </div>
                </div>
            </header>

            {/* 모바일 하단 네비게이션 */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 theme-bg-header border-t theme-border z-50 pb-safe transition-colors duration-300">
                <div className="flex justify-around items-center h-16 w-full">
                    {menuItems.map((item, index) => {
                        const active = isActive(item.path);
                        const Icon = item.icon;
                        return (
                            <DraggableMenuItem
                                key={`nav-mobile-${item.id || 'none'}-${index}`}
                                index={index}
                                id={item.id}
                                moveMenuItem={moveMenuItem}
                                isEditMode={isEditMode}
                                label={item.name} // 라벨 전달
                            >
                                <div className={`flex flex-col items-center justify-center w-full h-full space-y-1 p-2 ${active ? 'theme-text-primary' : 'theme-text-secondary'}`}>
                                    <Link
                                        to={item.path}
                                        onClick={(e) => {
                                            if (isEditMode) {
                                                e.preventDefault();
                                                return;
                                            }
                                            if (item.path === '/post' && isActive('/post')) {
                                                e.preventDefault();
                                                window.dispatchEvent(new CustomEvent('post-tab-click'));
                                            }
                                        }}
                                        className="flex flex-col items-center"
                                    >
                                        <Icon className="w-6 h-6" />
                                        <span className="text-[10px] font-medium">{item.name}</span>
                                    </Link>
                                </div>
                            </DraggableMenuItem>
                        );
                    })}
                </div>
            </nav>
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                initialView={settingsInitialView}
                onMenuEditMode={() => {
                    setIsEditMode(true);
                    navigate('/home');
                }}
            />
            {/* 일일 퀘스트 모달 */}
            <DailyQuestModal
                isOpen={isQuestModalOpen}
                onClose={() => setIsQuestModalOpen(false)}
            />
        </>
    );
};

export default Navigation;
