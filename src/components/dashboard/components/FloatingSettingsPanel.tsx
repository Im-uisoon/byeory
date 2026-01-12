import React, { useEffect, useState } from 'react';
import { Palette, Menu, Home, Layout, Plus, RefreshCw, AlignStartVertical, FolderOpen, ChevronLeft, ChevronRight } from 'lucide-react';

interface FloatingSettingsPanelProps {
    isWidgetEditMode: boolean;
    setIsWidgetEditMode: (value: boolean) => void;
    setIsCatalogOpen: (value: boolean) => void;
    setIsBuilderOpen: (value: boolean) => void;
    setIsArrangeConfirmOpen: (value: boolean) => void;
    setIsPresetManagerOpen: (value: boolean) => void;
    resetWidgets: () => void;
}

const FloatingSettingsPanel: React.FC<FloatingSettingsPanelProps> = ({
    isWidgetEditMode,
    setIsWidgetEditMode,
    setIsCatalogOpen,
    setIsBuilderOpen,
    setIsArrangeConfirmOpen,
    setIsPresetManagerOpen,
    resetWidgets
}) => {
    const [isOpen, setIsOpen] = useState(true);

    // Initial check for screen size - auto collapse on small screens
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 1280) {
            setIsOpen(false);
        }
    }, []);

    const openSettings = (view: string) => {
        window.dispatchEvent(new CustomEvent('open-settings-modal', { detail: { view } }));
    };

    return (
        <>
            {/* Mobile/Tablet Backdrop (Visible when open on small screens) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 xl:hidden animate-in fade-in duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className="fixed right-0 top-24 z-40 flex flex-col items-end gap-2 text-left pointer-events-none">
                {/* Toggle Button Wrapper (Always Pointer Events On) */}
                <div className={`relative transition-all duration-300 pointer-events-auto ${isOpen ? 'opacity-0 translate-x-10 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="py-3 pl-3 pr-2 bg-[var(--bg-card)]/80 backdrop-blur-md border-y border-l border-[var(--border-color)] rounded-l-2xl shadow-lg hover:bg-[var(--bg-card-secondary)] transition-all group absolute right-0 top-0"
                        title="설정 패널 열기"
                    >
                        <ChevronLeft className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" />
                    </button>
                </div>

                {/* Panel Content Wrapper */}
                <div
                    className={`w-64 mr-6 flex flex-col gap-4 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-right pointer-events-auto
                    ${isOpen ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-20 opacity-0 scale-95 pointer-events-none'}`}
                >
                    {/* Main Settings Card */}
                    <div className="bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border-color)] rounded-2xl shadow-xl p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between mb-2 px-1">
                            <h3 className="text-sm font-bold text-[var(--text-secondary)]">설정</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-full hover:bg-[var(--bg-card-secondary)] text-[var(--text-secondary)] transition-colors"
                                title="패널 접기"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        <button
                            onClick={() => openSettings('theme')}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-card-secondary)] transition-all group text-left"
                        >
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 group-hover:scale-110 transition-transform">
                                <Palette size={18} />
                            </div>
                            <div>
                                <div className="font-bold text-[var(--text-primary)] text-sm">테마 설정</div>
                                <div className="text-[10px] text-[var(--text-secondary)]">나만의 디자인 꾸미기</div>
                            </div>
                        </button>

                        <button
                            onClick={() => openSettings('menu')}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-card-secondary)] transition-all group text-left"
                        >
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 group-hover:scale-110 transition-transform">
                                <Menu size={18} />
                            </div>
                            <div>
                                <div className="font-bold text-[var(--text-primary)] text-sm">메뉴 편집</div>
                                <div className="text-[10px] text-[var(--text-secondary)]">네비게이션 순서 변경</div>
                            </div>
                        </button>

                        <button
                            onClick={() => openSettings('defaultPage')}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-card-secondary)] transition-all group text-left"
                        >
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 group-hover:scale-110 transition-transform">
                                <Home size={18} />
                            </div>
                            <div>
                                <div className="font-bold text-[var(--text-primary)] text-sm">기본 페이지</div>
                                <div className="text-[10px] text-[var(--text-secondary)]">시작 화면 설정</div>
                            </div>
                        </button>

                        {/* Widget Edit Toggle */}
                        <button
                            onClick={() => setIsWidgetEditMode(!isWidgetEditMode)}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all group text-left ${isWidgetEditMode ? 'bg-[var(--btn-bg)]/10 border border-[var(--btn-bg)]' : 'hover:bg-[var(--bg-card-secondary)]'}`}
                        >
                            <div className={`p-2 rounded-lg group-hover:scale-110 transition-transform ${isWidgetEditMode ? 'bg-[var(--btn-bg)] text-white' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300'}`}>
                                <Layout size={18} />
                            </div>
                            <div>
                                <div className={`font-bold text-sm ${isWidgetEditMode ? 'text-[var(--btn-bg)]' : 'text-[var(--text-primary)]'}`}>위젯 편집</div>
                                <div className="text-[10px] text-[var(--text-secondary)]">{isWidgetEditMode ? '편집 모드 종료' : '위젯 배치 및 설정'}</div>
                            </div>
                        </button>
                    </div>

                    {/* Widget Tools (Visible only when Edit Mode is ON) */}
                    {isWidgetEditMode && (
                        <div className="bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border-color)] rounded-2xl shadow-xl p-4 flex flex-col gap-2 animate-in slide-in-from-right-5 fade-in duration-300">
                            <h3 className="text-sm font-bold text-[var(--text-secondary)] mb-2 px-1">위젯 도구</h3>

                            <button onClick={() => setIsCatalogOpen(true)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-card-secondary)] transition-colors text-left group">
                                <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] group-hover:bg-[var(--btn-bg)] group-hover:text-white transition-colors">
                                    <Plus size={16} />
                                </div>
                                <span className="text-sm font-medium text-[var(--text-primary)]">위젯 추가</span>
                            </button>

                            <button onClick={() => setIsBuilderOpen(true)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-card-secondary)] transition-colors text-left group">
                                <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] group-hover:bg-[var(--btn-bg)] group-hover:text-white transition-colors">
                                    <span className="text-[10px] font-bold">New</span>
                                </div>
                                <span className="text-sm font-medium text-[var(--text-primary)]">새 버튼 만들기</span>
                            </button>

                            <button onClick={() => setIsPresetManagerOpen(true)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-card-secondary)] transition-colors text-left group">
                                <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] group-hover:bg-[var(--btn-bg)] group-hover:text-white transition-colors">
                                    <FolderOpen size={16} />
                                </div>
                                <span className="text-sm font-medium text-[var(--text-primary)]">프리셋 불러오기</span>
                            </button>

                            <div className="h-px bg-[var(--border-color)] my-1" />

                            <button onClick={() => setIsArrangeConfirmOpen(true)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-card-secondary)] transition-colors text-left group">
                                <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] group-hover:bg-[var(--btn-bg)] group-hover:text-white transition-colors">
                                    <AlignStartVertical size={16} />
                                </div>
                                <span className="text-sm font-medium text-[var(--text-primary)]">자동 정렬</span>
                            </button>

                            <button onClick={resetWidgets} className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left group">
                                <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-red-400 group-hover:text-red-500 transition-colors">
                                    <RefreshCw size={16} />
                                </div>
                                <span className="text-sm font-medium text-red-500">레이아웃 초기화</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default FloatingSettingsPanel;
