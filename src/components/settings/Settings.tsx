import { useState } from 'react';
import { X, Palette, Menu, Home, Layout } from 'lucide-react';
import ThemeSettings from './theme/ThemeSettings';
import DefaultPageSettings from './default/DefaultPageSettings';

type SettingsView = 'main' | 'theme' | 'custom' | 'defaultPage' | 'widget';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMenuEditMode?: () => void;
}

export default function SettingsModal({ isOpen, onClose, onMenuEditMode }: SettingsModalProps) {
    const [currentView, setCurrentView] = useState<SettingsView>('main');

    if (!isOpen) return null;

    // 뷰 초기화 핸들러 (모달 닫을 때 메인으로 리셋)
    const handleClose = () => {
        setCurrentView('main');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={handleClose}>
            <div className="theme-bg-modal theme-border max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg border p-4 shadow-xl sm:p-6 transition-colors duration-300" onClick={(e) => e.stopPropagation()}>
                {/* 1. 메인 메뉴 뷰 */}
                {currentView === 'main' && (
                    <>
                        {/* 헤더 */}
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="theme-text-primary text-xl">설정</h2>
                            <button onClick={handleClose} className="theme-text-secondary hover:bg-black/5 rounded-full p-2 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* 메뉴 그리드 */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* 테마 설정 버튼 */}
                            <button onClick={() => setCurrentView('theme')} className="group theme-border theme-bg-card hover:border-[color:var(--text-primary)] flex flex-col items-center justify-center gap-3 rounded-lg border-2 py-12 transition-all hover:scale-105 hover:shadow-md">
                                <div className="theme-text-primary transition-colors">
                                    <Palette className="w-8 h-8" />
                                </div>
                                <span className="theme-text-primary font-medium">테마 설정</span>
                            </button>

                            {/* 메뉴 편집 버튼 */}
                            <button
                                onClick={() => {
                                    onMenuEditMode?.();
                                    handleClose();
                                }}
                                className="group theme-border theme-bg-card hover:border-[color:var(--text-primary)] flex flex-col items-center justify-center gap-3 rounded-lg border-2 py-12 transition-all hover:scale-105 hover:shadow-md"
                            >
                                <div className="theme-text-primary transition-colors">
                                    <Menu className="w-8 h-8" />
                                </div>
                                <span className="theme-text-primary font-medium">메뉴 편집</span>
                            </button>

                            {/* 기본 페이지 설정 버튼 */}
                            <button onClick={() => setCurrentView('defaultPage')} className="group theme-border theme-bg-card hover:border-[color:var(--text-primary)] flex flex-col items-center justify-center gap-3 rounded-lg border-2 py-12 transition-all hover:scale-105 hover:shadow-md">
                                <div className="theme-text-primary transition-colors">
                                    <Home className="w-8 h-8" />
                                </div>
                                <span className="theme-text-primary font-medium">기본 페이지</span>
                            </button>

                            {/* 위젯 편집 버튼 */}
                            <button onClick={() => setCurrentView('widget')} className="group theme-border theme-bg-card hover:border-[color:var(--text-primary)] flex flex-col items-center justify-center gap-3 rounded-lg border-2 py-12 transition-all hover:scale-105 hover:shadow-md">
                                <div className="theme-text-primary transition-colors">
                                    <Layout className="w-8 h-8" />
                                </div>
                                <span className="theme-text-primary font-medium">위젯 편집</span>
                            </button>
                        </div>
                    </>
                )}

                {/* 2. 테마 설정 뷰 */}
                {currentView === 'theme' && (
                    <ThemeSettings
                        onBack={() => setCurrentView('main')}
                        onClose={handleClose}
                    />
                )}

                {/* 3. 기본 페이지 설정 뷰 */}
                {currentView === 'defaultPage' && (
                    <DefaultPageSettings
                        onBack={() => setCurrentView('main')}
                        onClose={handleClose}
                    />
                )}
            </div>
        </div>
    );
}
