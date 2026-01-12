import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Palette, Menu, Home, Layout } from 'lucide-react';
import ThemeSettings from './theme/ThemeSettings';
import DefaultPageSettings from './default/DefaultPageSettings';
import { MenuOrderEditor } from './menu/MenuOrderEditor';

type SettingsView = 'main' | 'theme' | 'custom' | 'defaultPage' | 'widget' | 'menu';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    // onMenuEditMode?: () => void; // Deprecated
    initialView?: SettingsView;
}

export default function SettingsModal({ isOpen, onClose, initialView = 'main' }: SettingsModalProps) {
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState<SettingsView>('main');
    const [isExpanded, setIsExpanded] = useState(false);

    // Reset or set initial view when opening
    useEffect(() => {
        if (isOpen) {
            setCurrentView(initialView);
        }
    }, [isOpen, initialView]);

    // Reset expansion when view or modal changes
    useEffect(() => {
        setIsExpanded(false);
    }, [currentView, isOpen]);

    if (!isOpen) return null;

    // 뷰 초기화 핸들러 (모달 닫을 때 메인으로 리셋)
    const handleClose = () => {
        setCurrentView('main');
        onClose();
    };

    const isAtRoot = currentView === initialView;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={handleClose}>
            <div className={`theme-bg-modal theme-border w-full max-w-2xl overflow-hidden rounded-lg border p-6 shadow-xl transition-all duration-300 flex flex-col ${isExpanded ? 'h-[750px]' : 'h-[450px]'} max-h-[90vh]`} onClick={(e) => e.stopPropagation()}>
                {/* 1. 메인 메뉴 뷰 */}
                {currentView === 'main' && (
                    <div className="flex flex-col h-full">
                        {/* 헤더 */}
                        <div className="mb-4 flex items-center justify-between shrink-0">
                            <h2 className="theme-text-primary text-xl">설정</h2>
                            <button onClick={handleClose} className="theme-text-secondary hover:bg-black/5 rounded-full p-2 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* 메뉴 그리드 */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
                            <div className="grid grid-cols-2 gap-3">
                                {/* 테마 설정 버튼 */}
                                <button onClick={() => setCurrentView('theme')} className="group theme-border theme-bg-card hover:border-[color:var(--text-primary)] flex flex-col items-center justify-center gap-3 rounded-lg border-2 py-8 transition-all hover:scale-105 hover:shadow-md">
                                    <div className="theme-text-primary transition-colors">
                                        <Palette className="w-8 h-8" />
                                    </div>
                                    <span className="theme-text-primary font-medium">테마 설정</span>
                                </button>

                                {/* 메뉴 편집 버튼 */}
                                <button
                                    onClick={() => {
                                        setCurrentView('menu');
                                    }}
                                    className="group theme-border theme-bg-card hover:border-[color:var(--text-primary)] flex flex-col items-center justify-center gap-3 rounded-lg border-2 py-8 transition-all hover:scale-105 hover:shadow-md"
                                >
                                    <div className="theme-text-primary transition-colors">
                                        <Menu className="w-8 h-8" />
                                    </div>
                                    <span className="theme-text-primary font-medium">메뉴 편집</span>
                                </button>

                                {/* 기본 페이지 설정 버튼 */}
                                <button onClick={() => setCurrentView('defaultPage')} className="group theme-border theme-bg-card hover:border-[color:var(--text-primary)] flex flex-col items-center justify-center gap-3 rounded-lg border-2 py-8 transition-all hover:scale-105 hover:shadow-md">
                                    <div className="theme-text-primary transition-colors">
                                        <Home className="w-8 h-8" />
                                    </div>
                                    <span className="theme-text-primary font-medium">기본 페이지</span>
                                </button>

                                {/* 위젯 편집 버튼 */}
                                <button
                                    onClick={() => {
                                        navigate('/home?editMode=widget');
                                        handleClose();
                                    }}
                                    className="group theme-border theme-bg-card hover:border-[color:var(--text-primary)] flex flex-col items-center justify-center gap-3 rounded-lg border-2 py-8 transition-all hover:scale-105 hover:shadow-md"
                                >
                                    <div className="theme-text-primary transition-colors">
                                        <Layout className="w-8 h-8" />
                                    </div>
                                    <span className="theme-text-primary font-medium">위젯 편집</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. 테마 설정 뷰 */}
                {currentView === 'theme' && (
                    <ThemeSettings
                        onBack={isAtRoot ? undefined : () => setCurrentView('main')}
                        onClose={handleClose}
                        onExpand={setIsExpanded}
                    />
                )}

                {/* 3. 기본 페이지 설정 뷰 */}
                {currentView === 'defaultPage' && (
                    <DefaultPageSettings
                        onBack={isAtRoot ? undefined : () => setCurrentView('main')}
                        onClose={handleClose}
                    />
                )}

                {/* 4. 메뉴 순서 편집 뷰 */}
                {currentView === 'menu' && (
                    <MenuOrderEditor
                        onBack={isAtRoot ? undefined : () => setCurrentView('main')}
                        onClose={handleClose}
                    />
                )}
            </div>
        </div>
    );
}
