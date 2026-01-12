import React, { useState, useEffect } from 'react';
import FloatingSettingsPanel from '../components/dashboard/components/FloatingSettingsPanel';
import Navigation from '../components/header/Navigation';
import { useMenu } from '../components/settings/menu/MenuSettings';
import { WidgetGallery } from '../components/settings/widgets/WidgetGallery';
import { X, ArrowUp } from 'lucide-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { compactLayout } from '../components/settings/widgets/layoutUtils';
import { CustomDragLayer } from '../components/settings/widgets/CustomDragLayer';
import WidgetBuilder from "../components/settings/widgets/customwidget/WidgetBuilder";
import { WidgetInfoModal } from '../components/settings/widgets/WidgetInfoModal';
import { PresetManager } from '../components/settings/widgets/PresetManager';
import { useIsMobile, useAutoScroll } from '../hooks';
import type { WidgetInstance } from "../components/settings/widgets/type.ts";

// Refactored Components
import DashboardHeader from '../components/dashboard/components/DashboardHeader';
import DashboardGrid from '../components/dashboard/components/DashboardGrid';
import { useDashboardLogic } from '../components/dashboard/hooks/useDashboardLogic';

const DEFAULT_GRID_SIZE = { cols: 4, rows: 1 };

const MainPage: React.FC = () => {
    useAutoScroll(); // Enable auto-scrolling during drag
    const isMobile = useIsMobile();
    const { isEditMode: isMenuEditMode } = useMenu();

    const {
        isWidgetEditMode, setIsWidgetEditMode,
        widgets, setWidgets,
        gridSize, setGridSize,
        widgetSnapshot,
        layoutPreview, setLayoutPreview,
        isDragging, setIsDragging,
        registry,
        addWidget,
        removeWidget,
        resetWidgets,
        updateWidgetPosition,
        updateLayout,
        handleUpdateWidgetData,
        onCellHover,
        ensureMobileConstraints,
        addWidgets // 추가
    } = useDashboardLogic(isMobile);

    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const [isArrangeConfirmOpen, setIsArrangeConfirmOpen] = useState(false);
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [isPresetManagerOpen, setIsPresetManagerOpen] = useState(false);
    const [editingWidgetData, setEditingWidgetData] = useState<any>(null);
    const [infoWidget, setInfoWidget] = useState<any>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);

    // Body Scroll Lock
    useEffect(() => {
        if (isCatalogOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isCatalogOpen]);

    // Scroll Listener
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) setShowScrollTop(true);
            else setShowScrollTop(false);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Global Click for Selection
    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest('.global-physics-widget')) {
                setSelectedWidgetId(null);
            }
        };
        if (isWidgetEditMode) {
            window.addEventListener('click', handleGlobalClick);
        }
        return () => window.removeEventListener('click', handleGlobalClick);
    }, [isWidgetEditMode]);

    const handleReset = () => {
        resetWidgets();
        setIsResetConfirmOpen(false);
    };

    const handleArrange = () => {
        setWidgets(prev => {
            const sorted = [...prev].sort((a, b) => {
                if (a.layout.y === b.layout.y) return a.layout.x - b.layout.x;
                return a.layout.y - b.layout.y;
            });
            return compactLayout(sorted);
        });
        setIsArrangeConfirmOpen(false);
    };

    const handleShowHelp = (widget: WidgetInstance) => {
        let info: any = null;
        if (widget.type === 'custom-block' || widget.type === 'custom') {
            info = {
                type: widget.type,
                label: (widget.props as any).title || 'Custom Widget',
                category: 'My Saved',
                isSaved: true,
                data: { ...widget, name: (widget.props as any).title }
            };
        } else {
            const regItem = registry[widget.type];
            if (regItem) {
                info = {
                    ...regItem,
                    type: widget.type,
                    isSaved: false
                };
            }
        }
        if (info) setInfoWidget(info);
    };

    const handleLoadPreset = (newWidgets: WidgetInstance[], newGridSize: { cols: number; rows: number }) => {
        setWidgets(newWidgets);
        setGridSize(newGridSize);
        setIsPresetManagerOpen(false);
    };

    // Calculations for Grid
    const currentDisplayWidgets = layoutPreview || widgets;
    const widgetsToRender = isMobile ? ensureMobileConstraints(currentDisplayWidgets) : currentDisplayWidgets;
    const maxWidgetY = widgetsToRender.reduce((max, w) => Math.max(max, w.layout.y + w.layout.h), 0);
    const displayRows = Math.max(gridSize.rows, maxWidgetY, DEFAULT_GRID_SIZE.rows);
    const finalRows = displayRows + (isDragging ? 4 : 0);

    if (isBuilderOpen) {
        return (
            <WidgetBuilder
                initialData={editingWidgetData}
                onExit={() => {
                    setIsBuilderOpen(false);
                    setEditingWidgetData(null);
                }}
                onSave={(savedData) => {
                    setEditingWidgetData(savedData);
                }}
            />
        );
    }

    return (
        <DndProvider
            backend={isMobile ? TouchBackend : HTML5Backend}
            options={isMobile ? { delayTouchStart: 800, enableMouseEvents: true } : undefined}
            key={isMobile ? "mobile" : "desktop"}
        >
            <CustomDragLayer />
            <div className="min-h-screen pb-20">
                <Navigation />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Controls Header */}
                    <DashboardHeader
                        isMenuEditMode={isMenuEditMode}
                        isWidgetEditMode={isWidgetEditMode}
                        isMobile={isMobile}
                        widgetSnapshot={widgetSnapshot}
                        setIsWidgetEditMode={setIsWidgetEditMode}
                        setWidgets={setWidgets}
                        setIsCatalogOpen={setIsCatalogOpen}
                        setIsBuilderOpen={setIsBuilderOpen}
                        setIsArrangeConfirmOpen={setIsArrangeConfirmOpen}
                        setIsPresetManagerOpen={setIsPresetManagerOpen}
                        resetWidgets={() => setIsResetConfirmOpen(true)}
                    />

                    {/* Dashboard Grid */}


                    <DashboardGrid
                        isMobile={isMobile}
                        isMenuEditMode={isMenuEditMode}
                        isWidgetEditMode={isWidgetEditMode}
                        gridSize={gridSize}
                        finalRows={finalRows}
                        widgetsToRender={widgetsToRender}
                        registry={registry}
                        selectedWidgetId={selectedWidgetId}
                        removeWidget={removeWidget}
                        updateLayout={updateLayout}
                        setIsDragging={setIsDragging}
                        setLayoutPreview={setLayoutPreview}
                        onCellHover={onCellHover}
                        updateWidgetPosition={updateWidgetPosition}
                        setSelectedWidgetId={setSelectedWidgetId}
                        handleShowHelp={handleShowHelp}
                        handleUpdateWidgetData={handleUpdateWidgetData}
                    />
                </div>

                {/* Floating Settings Panel (Right Side) */}
                <FloatingSettingsPanel
                    isWidgetEditMode={isWidgetEditMode}
                    setIsWidgetEditMode={setIsWidgetEditMode}
                    setIsCatalogOpen={setIsCatalogOpen}
                    setIsBuilderOpen={setIsBuilderOpen}
                    setIsArrangeConfirmOpen={setIsArrangeConfirmOpen}
                    setIsPresetManagerOpen={setIsPresetManagerOpen}
                    resetWidgets={() => setIsResetConfirmOpen(true)}
                />

                {/* --- Modals Section --- */}

                {/* Widget Catalog Modal */}
                {isCatalogOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-[var(--bg-card)] w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-200">
                            <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-card-secondary)]">
                                <h3 className="text-lg font-bold text-[var(--text-primary)]">위젯 보관함</h3>
                                <button onClick={() => setIsCatalogOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><X /></button>
                            </div>
                            <div className="flex-1 min-h-0 flex flex-col relative">
                                <WidgetGallery
                                    onSelect={(item) => addWidget(item, setIsCatalogOpen)}
                                    onMultiSelect={(items) => addWidgets(items, setIsCatalogOpen)}
                                    onEdit={(data) => {
                                        setEditingWidgetData(data);
                                        setIsBuilderOpen(true);
                                        setIsCatalogOpen(false);
                                    }}
                                    onCreate={() => {
                                        setEditingWidgetData(null); // Create mode
                                        setIsBuilderOpen(true);
                                        setIsCatalogOpen(false);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Arrange Confirm Modal */}
                {isArrangeConfirmOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-[var(--bg-card)] w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in duration-200">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">위젯 정렬</h3>
                            <p className="text-[var(--text-secondary)] mb-6">정렬시 빈칸없이 전부 채워집니다.</p>
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setIsArrangeConfirmOpen(false)} className="px-4 py-2 rounded-lg text-sm font-bold bg-[var(--bg-card-secondary)] text-[var(--text-secondary)] hover:bg-gray-200 transition-colors">아니요</button>
                                <button onClick={handleArrange} className="px-4 py-2 rounded-lg text-sm font-bold bg-[var(--btn-bg)] text-white hover:opacity-90 transition-colors">예, 정렬합니다</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Preset Manager Modal */}
                {isPresetManagerOpen && (
                    <PresetManager
                        currentWidgets={widgets}
                        currentGridSize={gridSize}
                        onLoad={handleLoadPreset}
                        onClose={() => setIsPresetManagerOpen(false)}
                    />
                )}

                {/* Reset Confirm Modal */}
                {isResetConfirmOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-[var(--bg-card)] w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in duration-200">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">레이아웃 초기화</h3>
                            <p className="text-[var(--text-secondary)] mb-6">모든 위젯 설정이 초기화됩니다. 계속하시겠습니까?</p>
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setIsResetConfirmOpen(false)} className="px-4 py-2 rounded-lg text-sm font-bold bg-[var(--bg-card-secondary)] text-[var(--text-secondary)] hover:bg-gray-200 transition-colors">취소</button>
                                <button onClick={handleReset} className="px-4 py-2 rounded-lg text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors">초기화</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Widget Builder Modal (Overlay) */}
                {isBuilderOpen && (
                    <div className="fixed inset-0 z-50 bg-[#1F1F1F] animate-in slide-in-from-bottom-5 duration-300">
                        <WidgetBuilder
                            onExit={() => {
                                setIsBuilderOpen(false);
                                setEditingWidgetData(null);
                            }}
                            initialData={editingWidgetData}
                            onSave={(savedData) => {
                                setEditingWidgetData(savedData);
                            }}
                        />
                    </div>
                )}

                {/* Info Modal */}
                {infoWidget && (
                    <WidgetInfoModal
                        widget={infoWidget}
                        onClose={() => setInfoWidget(null)}
                        showAction={false}
                    />
                )}

                {/* Scroll To Top Button */}
                <button
                    onClick={scrollToTop}
                    className={`fixed bottom-24 md:bottom-8 right-8 p-3 rounded-full bg-[var(--btn-bg)] text-white shadow-lg transition-all duration-300 z-40 hover:scale-110 active:scale-95 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
                    aria-label="Scroll to top"
                >
                    <ArrowUp size={24} />
                </button>
            </div>
        </DndProvider>
    );
};

export default MainPage;