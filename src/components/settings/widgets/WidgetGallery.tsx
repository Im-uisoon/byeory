import { useState, useEffect } from 'react'; // React import
import { useWidgetRegistry } from "./useWidgetRegistry";
import type { WidgetConfig } from "./type.ts";
import { X, Check, ChevronDown } from 'lucide-react'; // Icon imports
import { motion, AnimatePresence } from 'framer-motion';

import { deleteWidget } from './customwidget/widgetApi.ts'; // Import API
import { searchWidget } from '../../../utils/searchUtils'; // ✨ Import search utility

// MainPage에서 넘겨주는 props 이름(onSelect, onEdit)과 일치시킵니다.
interface WidgetGalleryProps {
    onSelect: (widgetType: string, props?: any) => void; // 문자열(ID)을 넘기도록 수정. props 추가
    onMultiSelect?: (items: WidgetConfig[]) => void; // 다중 선택 처리를 위한 prop 추가
    onEdit?: (data: WidgetConfig) => void; // MainPage에서 onEdit도 넘겨주고 있으므로 추가
    onCreate?: () => void; // 커스텀 위젯 만들기 버튼 동작
}

export const WidgetGallery = ({ onSelect, onMultiSelect, onEdit, onCreate }: WidgetGalleryProps) => {
    // 훅을 통해 DB에서 위젯 정보를 가져옴
    const { registry, isLoading: isRegistryLoading, error, refresh } = useWidgetRegistry();
    // 🌟 [수정] customWidgets 상태 제거 (useWidgetRegistry에서 통합 관리)

    // 🌟 삭제 핸들러
    const handleDelete = async (widgetId: string, widgetName: string) => {
        if (!confirm(`정말 '${widgetName}' 위젯을 삭제하시겠습니까?`)) return;

        try {
            await deleteWidget(widgetId);
            // 목록 갱신: 리프레시 호출
            refresh();
            alert('삭제되었습니다.');
        } catch (e) {
            console.error('삭제 실패', e);
            alert('삭제에 실패했습니다.');
        }
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWidgets, setSelectedWidgets] = useState<WidgetConfig[]>([]); // 장바구니 상태
    // 기본적으로 'My Saved' (커스텀 위젯) 카테고리는 펼쳐둠
    const [expandedCategories, setExpandedCategories] = useState<string[]>(['My Saved']);

    const handleCardClick = (widget: WidgetConfig) => {
        setSelectedWidgets(prev => [...prev, widget]);
    };

    const handleRemoveFromCart = (index: number) => {
        setSelectedWidgets(prev => prev.filter((_, i) => i !== index));
    };

    const handleApply = () => {
        if (selectedWidgets.length === 0) return;

        if (onMultiSelect) {
            onMultiSelect(selectedWidgets);
        } else {
            // Fallback: onSelect는 widgetType만 받음
            selectedWidgets.forEach(widget => {
                onSelect(widget.widgetType);
            });
        }
    };

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    // registry 객체를 배열로 변환
    const allWidgets = registry ? Object.values(registry) : [];

    // ✨ 고급 검색 적용
    const widgets = allWidgets.filter(widget => searchWidget(searchTerm, widget));

    // 카테고리 순서 정의
    const CATEGORY_ORDER = [
        'My Saved', // 커스텀 위젯이 최상단 (Utility 위)
        'Utility',
        'Diary & Emotion',
        'Interactive',
        'Data & Logic',
        'Decoration & Collection',
        'Global Controllers',
        'Uncategorized'
    ];

    // 위젯을 카테고리별로 그룹화
    const groupedWidgets = widgets.reduce((acc, widget) => {
        const category = widget.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(widget);
        return acc;
    }, {} as Record<string, WidgetConfig[]>);

    // 검색 시 관련 카테고리 자동 펼침
    useEffect(() => {
        if (searchTerm) {
            const categoriesWithResults = Object.keys(groupedWidgets);
            // 검색 시에는 모든 결과 카테고리를 펼침, 'My Saved'는 원래 펼쳐져 있을 수 있음
            setExpandedCategories(prev => {
                const unique = new Set([...prev, ...categoriesWithResults]);
                return Array.from(unique);
            });
        } else {
            setExpandedCategories(['My Saved']); // 검색어 지우면 기본 상태로 리셋 ('My Saved'만 오픈)
        }
    }, [searchTerm, widgets.length]);

    // Render Logic with Early Returns
    const isLoading = isRegistryLoading;
    if (isLoading) {
        return <div className="p-4 text-center text-gray-500">위젯 목록을 불러오는 중...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-500">위젯 목록 로딩 실패</div>;
    }

    return (
        <div className="flex flex-col h-full bg-[var(--bg-primary)]">
            {/* 검색 입력창 고정 영역 */}
            <div className="border-b border-[var(--border-color)] bg-[var(--bg-card)] sticky top-0 z-20 shadow-sm">
                <div className="p-4 pb-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search widgets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition-all"
                        />
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--icon-color)]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* 장바구니 (Selected Widgets) 영역 */}
                <div className="px-4 pb-4">
                    <div className="bg-[var(--bg-card-secondary)]/50 rounded-xl border border-[var(--border-color)] p-3 transition-all">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <span>추가 할 위젯</span>
                                <span className="bg-[var(--btn-bg)] text-white text-[10px] px-1.5 py-0.5 rounded-full">{selectedWidgets.length}</span>
                            </h3>
                            {selectedWidgets.length > 0 && (
                                <button
                                    onClick={handleApply}
                                    className="bg-[var(--btn-bg)] hover:brightness-110 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-sm active:scale-95"
                                >
                                    <Check size={12} />
                                    적용하기
                                </button>
                            )}
                        </div>

                        {selectedWidgets.length === 0 ? (
                            <div className="text-xs text-[var(--text-secondary)] py-2 text-center opacity-70">
                                아래 목록에서 위젯을 선택하여 담아보세요.
                            </div>
                        ) : (
                            <div className="flex gap-2 overflow-x-auto custom-scrollbar p-3 pt-4">
                                {selectedWidgets.map((widget, idx) => (
                                    <div key={`${widget.widgetType}-${idx}`} className="flex-shrink-0 relative group">
                                        <div className="w-16 h-16 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] flex flex-col items-center justify-center p-1 overflow-hidden">
                                            {widget.thumbnail ? (
                                                <img src={widget.thumbnail} alt={widget.label} className="w-full h-full object-contain opacity-80" />
                                            ) : (
                                                <div className="text-[10px] text-center break-all leading-tight text-[var(--text-secondary)]">{widget.label}</div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleRemoveFromCart(idx)}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:scale-110 transition-transform"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 스크롤 가능한 위젯 목록 영역 */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-20 flex flex-col gap-4">
                {CATEGORY_ORDER.map((category) => {
                    // 'My Saved' 카테고리를 항상 렌더링하도록 하되, 위젯이 없어도 빈 배열로 처리할지는 선택.
                    // 요구사항: "커스텀 위젯" 섹션이 존재해야 함. 위젯이 없어도 '만들기' 버튼을 보여주기 위해 렌더링 필요할 수 있음.
                    // 하지만 현재 로직은 위젯 없으면 null 리턴. 'My Saved'는 예외처리 필요.

                    let categoryWidgets = groupedWidgets[category];
                    const isCustomWidgetSection = category === 'My Saved';

                    if (isCustomWidgetSection && !categoryWidgets) {
                        categoryWidgets = []; // 커스텀 위젯 섹션은 비어있어도 보여줌 (만들기 버튼 때문)
                    } else if (!categoryWidgets || categoryWidgets.length === 0) {
                        return null;
                    }

                    // 커스텀 위젯 섹션 조건: 3개 이하면 항상 펼침(접을 수 없음), 3개 초과면 접을 수 있음
                    // 기본적으로는 펼쳐져 있음 (initial state 'My Saved')
                    const isFoldable = !isCustomWidgetSection || categoryWidgets.length > 3;
                    const forcedExpanded = isCustomWidgetSection && categoryWidgets.length <= 3;

                    const isExpanded = forcedExpanded || expandedCategories.includes(category);

                    const displayName = isCustomWidgetSection ? "커스텀 위젯" : category;

                    return (
                        <div key={category} className="bg-[var(--bg-card-secondary)] rounded-2xl border border-[var(--border-color)]">
                            <button
                                onClick={() => {
                                    if (isFoldable) toggleCategory(category);
                                }}
                                className={`w-full px-6 py-4 flex items-center justify-between transition-colors rounded-2xl ${isFoldable ? 'hover:bg-[var(--bg-card)] cursor-pointer' : 'cursor-default'}`}
                            >
                                <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-3">
                                    <span className={`w-1.5 h-6 rounded-full bg-[var(--btn-bg)] inline-block transition-transform duration-300 ${isExpanded ? 'scale-y-100' : 'scale-y-75 opacity-50'}`}></span>
                                    {displayName}
                                    <span className="text-xs font-normal text-[var(--text-secondary)] ml-2 bg-[var(--bg-card)] px-2 py-0.5 rounded-full border border-[var(--border-color)]">
                                        {categoryWidgets.length}
                                    </span>
                                </h2>

                                <div className="flex items-center gap-3">
                                    {isCustomWidgetSection && onCreate && (
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation(); // 아코디언 토글 방지
                                                onCreate();
                                            }}
                                            className="px-3 py-1.5 bg-[var(--btn-bg)] hover:brightness-110 text-white text-xs font-bold rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1"
                                        >
                                            <span className="text-lg leading-none">+</span>
                                            만들기
                                        </div>
                                    )}

                                    {isFoldable && (
                                        <div className={`text-[var(--text-secondary)] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                            <ChevronDown size={20} />
                                        </div>
                                    )}
                                </div>
                            </button>

                            <AnimatePresence initial={false}>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "circOut" }}
                                        style={{ overflow: "hidden" }}
                                    >
                                        <div className="p-6 pt-0 border-t border-[var(--border-color)]/30">
                                            {categoryWidgets.length === 0 ? (
                                                <div className="py-8 text-center text-[var(--text-secondary)] text-sm opacity-70">
                                                    아직 만들어진 위젯이 없습니다.<br />
                                                    '만들기' 버튼을 눌러 나만의 위젯을 만들어보세요!
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                                                    {categoryWidgets.map((widget) => {
                                                        // 현재 장바구니에 이 위젯이 몇 개 담겼는지 카운트
                                                        const selectedCount = selectedWidgets.filter(w => w.widgetType === widget.widgetType).length;

                                                        return (
                                                            <div
                                                                key={widget.widgetType}
                                                                className={`border rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 shadow-sm group flex flex-col relative
                                                                ${selectedCount > 0
                                                                        ? 'border-[var(--btn-bg)] bg-[var(--bg-card)] ring-1 ring-[var(--btn-bg)]'
                                                                        : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-secondary)]'}`}
                                                                onClick={() => handleCardClick(widget)}
                                                            >
                                                                {/* 선택된 개수 뱃지 */}
                                                                {selectedCount > 0 && (
                                                                    <div className="absolute top-3 right-3 bg-[var(--btn-bg)] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md animate-in zoom-in duration-200 z-10">
                                                                        {selectedCount}
                                                                    </div>
                                                                )}

                                                                {widget.thumbnail ? (
                                                                    <div className="w-full bg-[var(--bg-card-secondary)] rounded-lg mb-4 overflow-hidden border border-[var(--border-color)] flex items-center justify-center">
                                                                        <img
                                                                            src={widget.thumbnail}
                                                                            alt={widget.label}
                                                                            className="w-full h-auto object-contain max-h-48"
                                                                            onError={(e) => {
                                                                                (e.target as HTMLImageElement).style.display = 'none'; // 이미지 로드 실패 시 숨김
                                                                            }}
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    // 🌟 [수정] 썸네일 없으면 컴포넌트 프리뷰 렌더링 (decorations 포함)
                                                                    <div className="w-full aspect-video bg-[var(--bg-card-secondary)] rounded-lg mb-4 overflow-hidden border border-[var(--border-color)] relative">
                                                                        <div className="w-full h-full pointer-events-none select-none transform scale-[0.9] origin-center">
                                                                            {/* defaultProps(content, decorations 포함) 전달 */}
                                                                            <widget.component {...widget.defaultProps} />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div className="w-full flex justify-between items-start mb-2">
                                                                    <h3 className="font-bold text-lg text-[var(--text-primary)] w-full">{widget.label}</h3>

                                                                    {/* 편집 가능한 위젯인 경우 Edit 버튼 표시 (onEdit이 있을 때만) */}
                                                                    {onEdit && !widget.isSystem && (
                                                                        <>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation(); // 부모 클릭 방지
                                                                                    onEdit(widget);
                                                                                }}
                                                                                className="text-xs px-2 py-1 bg-[var(--bg-card-secondary)] rounded hover:brightness-95 text-[var(--text-secondary)] border border-[var(--border-color)] transition-all z-20"
                                                                            >
                                                                                Edit
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    if (widget.id) handleDelete(String(widget.id), widget.label);
                                                                                }}
                                                                                className="ml-1 text-xs px-2 py-1 bg-red-100 rounded hover:bg-red-200 text-red-600 border border-red-200 transition-all z-20"
                                                                            >
                                                                                Del
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>

                                                                <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2 h-10 w-full text-left">
                                                                    {widget.description}
                                                                </p>

                                                                <div className="flex gap-2 text-xs flex-wrap w-full justify-start">
                                                                    {widget.validSizes && widget.validSizes.length > 5 ? (
                                                                        <span className="px-2 py-1 bg-[var(--bg-card-secondary)] text-[var(--btn-bg)] rounded border border-[var(--border-color)] font-medium opacity-90">
                                                                            다양한 크기
                                                                        </span>
                                                                    ) : (
                                                                        (widget.validSizes || [[1, 1]]).map(([w, h], idx) => (
                                                                            <span
                                                                                key={idx}
                                                                                className="px-2 py-1 bg-[var(--bg-card-secondary)] text-[var(--btn-bg)] rounded border border-[var(--border-color)] font-medium opacity-90"
                                                                            >
                                                                                {w}x{h}
                                                                            </span>
                                                                        ))
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}

                {widgets.length === 0 && (
                    <div className="text-center py-10 text-[var(--text-secondary)]">
                        No widgets found matching "{searchTerm}"
                    </div>
                )}
            </div>
        </div>
    );
};