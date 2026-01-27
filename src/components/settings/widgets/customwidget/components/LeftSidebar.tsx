// ... imports
import React, { useState, useRef, useEffect } from 'react'; // Ensure React hooks are imported
import axios from 'axios';
import {
    // 카테고리 대표 아이콘
    Type, Layout, Sparkles, Activity, PieChart, Wrench, GraduationCap, MousePointer2, ImageDown, // ✨ Added ImageDown
    // 블록 아이콘들
    Heading1, Quote, Minus, List, ListOrdered, CheckSquare, Sidebar as IconSidebar,
    Columns, AlignVerticalJustifyCenter, AlertCircle, Highlighter, EyeOff, Sigma,
    Play, ChevronsRight, MoreHorizontal, BarChart3, Radar,
    Grid3X3, PlusCircle, Star, Battery, Database, ArrowLeftRight,
    Link, FileText, StickyNote, Search, Map,
    Plus, X // ✨ Added Plus, X for Freepik UI
} from 'lucide-react';
import type { BlockType } from '../types';
import { BLOCK_COSTS } from '../constants';

// ... (Category type)
export type Category = 'text' | 'structure' | 'visual' | 'effect' | 'data' | 'util' | 'study' | 'interaction' | 'freepik'; // ✨ Added freepik category

interface Props {
    activeTab: Category;
    setActiveTab: (tab: Category) => void;
    onAddBlock: (type: BlockType) => void;
    onAddDecoration?: (type: any) => void;
    remainingCapacity: number;
}

const LeftSidebar: React.FC<Props> = ({ activeTab, setActiveTab, onAddBlock, onAddDecoration, remainingCapacity }) => {

    // ✨ Freepik State
    const [freepikQuery, setFreepikQuery] = useState('');
    const [freepikResults, setFreepikResults] = useState<{ url: string; downloadUrl: string; id: string | number }[]>([]);
    const [freepikFilter, setFreepikFilter] = useState<'all' | 'photo' | 'vector' | 'icon'>('all');
    const [freepikPage, setFreepikPage] = useState(1);
    const [isFreepikLoading, setIsFreepikLoading] = useState(false);
    const freepikScrollRef = useRef<HTMLDivElement>(null);

    // ✨ Freepik Search Handler (Copied & Adapted)
    const handleFreepikSearch = async (targetPage: number = 1) => {
        if (!freepikQuery.trim()) return;
        setIsFreepikLoading(true);

        const apiKey = import.meta.env.VITE_API_FREEPIK;
        if (!apiKey) {
            alert('Freepik API Key가 설정되지 않았습니다.');
            setIsFreepikLoading(false);
            return;
        }

        try {
            const isIconSearch = freepikFilter === 'icon';
            const endpoint = isIconSearch ? '/v1/icons' : '/v1/resources';

            const params: Record<string, string> = {
                limit: '24',
                page: targetPage.toString(),
                term: freepikQuery,
            };

            if (!isIconSearch) {
                params.locale = 'ko-KR';
                if (freepikFilter === 'photo') params['filters[content_type][photo]'] = '1';
                else if (freepikFilter === 'vector') params['filters[content_type][vector]'] = '1';
            }

            // Using proxy path
            const response = await axios.get<{ data: any[], meta: any }>(`/freepik-api${endpoint}`, {
                params: params,
                headers: {
                    'Accept-Language': 'ko-KR',
                    'x-freepik-api-key': apiKey
                }
            });

            const data = response.data;
            const resources = data.data;

            if (!resources || resources.length === 0) {
                if (targetPage === 1) alert('검색 결과가 없습니다.');
                setIsFreepikLoading(false);
                return;
            }

            const results = resources.map((item: any) => {
                let previewUrl = '';
                let downloadUrl = '';

                if (isIconSearch) {
                    previewUrl = item.thumbnails?.[1]?.url || item.thumbnails?.[0]?.url || item.image?.preview?.url || '';
                    downloadUrl = item.image?.png?.url || item.image?.svg?.url || previewUrl;
                } else {
                    const sourceUrl = item.image?.source?.url;
                    previewUrl = item.image?.preview?.url || item.preview?.url || sourceUrl || '';
                    downloadUrl = sourceUrl || previewUrl;
                }

                return {
                    id: item.id || `f-${Math.random()}`,
                    url: previewUrl,
                    downloadUrl: downloadUrl
                };
            }).filter((res: any) => !!res.url);

            if (targetPage === 1) {
                setFreepikResults(results);
                setFreepikPage(1);
                if (freepikScrollRef.current) freepikScrollRef.current.scrollTop = 0;
            } else {
                setFreepikResults(prev => [...prev, ...results]);
                setFreepikPage(targetPage);
            }
        } catch (error) {
            console.error("Freepik Search Error:", error);
            const msg = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
            alert(msg);
        } finally {
            setIsFreepikLoading(false);
        }
    };

    const handleFreepikScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollTop + clientHeight >= scrollHeight - 50) {
            if (!isFreepikLoading && freepikResults.length > 0) {
                handleFreepikSearch(freepikPage + 1);
            }
        }
    };

    const handleFreepikImageClick = async (item: { url: string; downloadUrl: string }) => {
        // Add as image decoration
        onAddDecoration?.({
            type: 'image',
            imageUrl: item.downloadUrl || item.url,
            w: 150, // Default size for image
            h: 150
        });
    };


    // 헬퍼: 버튼 렌더링
    const renderBtn = (icon: React.ReactNode, label: string, type: BlockType) => {
        const cost = BLOCK_COSTS[type] || 1;
        const isDisabled = cost > remainingCapacity;

        return (
            <button
                key={type}
                onClick={() => !isDisabled && onAddBlock(type)}
                disabled={isDisabled}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all group relative text-left mb-1
                    ${isDisabled
                        ? 'opacity-40 cursor-not-allowed bg-transparent'
                        : 'hover:bg-[var(--bg-card-secondary)] hover:text-[var(--text-primary)] cursor-pointer text-[var(--text-secondary)] bg-[var(--bg-card-secondary)]/50 border border-[var(--border-color)] hover:border-indigo-500'
                    }
                `}
            >
                <div className={isDisabled ? '' : 'group-hover:text-indigo-400 text-[var(--text-secondary)]'}>{icon}</div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
                    <span className="text-[10px] text-[var(--text-secondary)]">비용: {cost}</span>
                </div>

                {isDisabled && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-red-400 font-bold border border-red-900/50 bg-red-900/20 px-1.5 py-0.5 rounded">
                        Full
                    </span>
                )}
            </button>
        );
    };

    // 🌟 데코레이션 버튼 렌더링 (비용 없음)
    const renderDecoBtn = (icon: React.ReactNode, label: string, decoType: any) => (
        <button
            key={decoType}
            onClick={() => {
                const decoration: any = {
                    id: `deco-${Date.now()}`,
                    type: decoType,
                    x: 50, // Center X (%)
                    y: 50, // Center Y (%)
                    w: 200,
                    h: 200,
                    color: '#e0e7ff', // indigo-100
                    opacity: 1,
                    zIndex: 0,
                    rotation: 0,
                };

                if (decoType === 'blob') {
                    // Default points will be handled by WidgetBuilder now, or we can pass undefined
                    // But for safety, let's just pass basic props, WidgetBuilder handles generation if points missing for 'blob'
                }

                onAddDecoration?.(decoration);
            }}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg transition-all text-left mb-1
                hover:bg-[var(--bg-card-secondary)] hover:text-[var(--text-primary)] cursor-pointer text-[var(--text-secondary)] bg-[var(--bg-card-secondary)]/50 border border-[var(--border-color)] hover:border-indigo-500"
        >
            <div className="group-hover:text-indigo-400 text-[var(--text-secondary)]">{icon}</div>
            <div className="flex flex-col">
                <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
                <span className="text-[10px] text-[var(--text-secondary)]">배경 꾸미기</span>
            </div>
        </button>
    );

    return (
        <aside className="h-full flex bg-white/80 backdrop-blur-md border-r border-[var(--border-color)]">

            {/* 1. 1단계: 카테고리 탭 (아이콘 메뉴) */}
            <div className="w-16 h-full flex flex-col items-center py-4 gap-2 border-r border-[var(--border-color)] bg-white/50 overflow-y-auto scrollbar-hide">
                <TabButton
                    active={activeTab === 'text'}
                    onClick={() => setActiveTab('text')}
                    icon={<Type size={20} />}
                    label="기본"
                />
                <TabButton
                    active={activeTab === 'structure'}
                    onClick={() => setActiveTab('structure')}
                    icon={<Layout size={20} />}
                    label="구조"
                />
                <TabButton
                    active={activeTab === 'visual'}
                    onClick={() => setActiveTab('visual')}
                    icon={<Sparkles size={20} />}
                    label="꾸미기"
                />
                {/* ✨ Freepik Tab */}
                <TabButton
                    active={activeTab === 'freepik'}
                    onClick={() => setActiveTab('freepik')} // Need to update Category type
                    icon={<ImageDown size={20} />}
                    label="이미지"
                />
                <TabButton
                    active={activeTab === 'effect'}
                    onClick={() => setActiveTab('effect')}
                    icon={<Activity size={20} />}
                    label="효과"
                />
                <div className="w-8 h-px bg-[var(--border-color)] my-1"></div>
                <TabButton
                    active={activeTab === 'data'}
                    onClick={() => setActiveTab('data')}
                    icon={<PieChart size={20} />}
                    label="데이터"
                />
                <TabButton
                    active={activeTab === 'util'}
                    onClick={() => setActiveTab('util')}
                    icon={<Wrench size={20} />}
                    label="도구"
                />
                <TabButton
                    active={activeTab === 'study'}
                    onClick={() => setActiveTab('study')}
                    icon={<GraduationCap size={20} />}
                    label="학습"
                />
                <TabButton
                    active={activeTab === 'interaction'}
                    onClick={() => setActiveTab('interaction')}
                    icon={<MousePointer2 size={20} />}
                    label="동작"
                />
            </div>

            {/* 2. 2단계: 선택된 카테고리의 기능 목록 (스크롤 영역) */}
            <div className="w-52 h-full flex flex-col max-md:flex-1">
                {/* 상단: 남은 용량 표시 */}
                <div className="p-2 border-b border-[var(--border-color)] bg-transparent">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <span className="font-bold whitespace-nowrap">남은 공간</span>
                        <div className="flex-1 h-1.5 bg-[var(--bg-card-secondary)] rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-300 ${remainingCapacity < 2 ? 'bg-red-500' : 'bg-indigo-500'}`}
                                style={{ width: `${Math.min(100, remainingCapacity * 10)}%` }}
                            ></div>
                        </div>
                        <span className={`whitespace-nowrap ${remainingCapacity < 2 ? 'text-red-400 font-bold' : 'text-indigo-400 font-mono'}`}>
                            {remainingCapacity.toFixed(1)}
                        </span>
                    </div>
                </div>

                {/* 기능 버튼 목록 */}
                <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-[var(--border-color)] scrollbar-track-transparent">
                    <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3 px-1">
                        {/* {getCategoryTitle(activeTab)} */}
                    </h3>

                    <div className="space-y-1">
                        {activeTab === 'text' && (
                            <>
                                {renderBtn(<Heading1 size={18} />, "헤딩 (H1~H3)", 'heading1')}
                                {renderBtn(<Type size={18} />, "기본 텍스트", 'text')}
                                {renderBtn(<Quote size={18} />, "인용구", 'quote')}
                                {renderBtn(<Minus size={18} />, "구분선", 'divider')}
                            </>
                        )}

                        {activeTab === 'structure' && (
                            <>
                                {renderBtn(<List size={18} />, "글머리 목록", 'bullet-list')}
                                {renderBtn(<ListOrdered size={18} />, "번호 목록", 'number-list')}
                                {renderBtn(<CheckSquare size={18} />, "할 일 목록", 'todo-list')}
                                {renderBtn(<IconSidebar size={18} className="rotate-90" />, "토글 목록", 'toggle-list')}
                                {renderBtn(<Columns size={18} />, "다단 컬럼", 'columns')}
                                {renderBtn(<AlignVerticalJustifyCenter size={18} />, "아코디언", 'accordion')}
                            </>
                        )}

                        {activeTab === 'visual' && (
                            <>
                                {/* 기존 시각 효과 */}
                                {renderBtn(<AlertCircle size={18} />, "콜아웃 (Callout)", 'callout')}
                                {renderBtn(<Highlighter size={18} />, "형광펜 강조", 'highlight')}
                                {renderBtn(<EyeOff size={18} />, "스포일러 방지", 'spoiler')}

                                <div className="my-2 border-t border-dashed border-[var(--border-color)]" />
                                <h4 className="text-[10px] font-bold text-[var(--text-secondary)] mb-2 px-1">배경 도형</h4>

                                {renderDecoBtn(<Minus size={18} />, "선 (Line)", 'line')}

                                {/* 🌟 배경 도형 추가 버튼 */}
                                {renderDecoBtn(<div className="w-4 h-4 rounded-full border-2 border-current" />, "원형 (Circle)", 'circle')}
                                {renderDecoBtn(<div className="w-4 h-4 border-2 border-current" />, "사각형 (Square)", 'square')}
                                {renderDecoBtn(<Star size={18} />, "별 모양 (Star)", 'star')}
                                {renderDecoBtn(<Sparkles size={18} />, "유기적 도형 (Blob)", 'blob')}
                                {renderDecoBtn(<ImageDown size={18} />, "사진 (Image)", 'image')}
                            </>
                        )}

                        {/* ✨ Freepik Search UI */}
                        {activeTab === 'freepik' && (
                            <div className="flex flex-col h-full">
                                <h4 className="text-[10px] font-bold text-[var(--text-secondary)] mb-2 px-1">Freepik 이미지 검색</h4>

                                {/* Filter */}
                                <div className="flex gap-1 overflow-x-auto pb-2 no-scrollbar mb-2">
                                    {['all', 'photo', 'vector', 'icon'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setFreepikFilter(type as any)}
                                            className={`px-2 py-1 text-[10px] font-bold rounded-md border transition-all whitespace-nowrap
                                                ${freepikFilter === type
                                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                                                    : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)]'
                                                }`}
                                        >
                                            {type === 'all' && '전체'}
                                            {type === 'photo' && '사진'}
                                            {type === 'vector' && '일러스트'}
                                            {type === 'icon' && '아이콘'}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-1 mb-3">
                                    <input
                                        type="text"
                                        value={freepikQuery}
                                        onChange={(e) => setFreepikQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleFreepikSearch(1)}
                                        placeholder="검색어 입력..."
                                        className="flex-1 min-w-0 px-2 py-1.5 bg-[var(--bg-card-secondary)] border border-[var(--border-color)] rounded-lg text-xs outline-none focus:border-indigo-500 transition-colors"
                                    />
                                    <button
                                        onClick={() => handleFreepikSearch(1)}
                                        disabled={isFreepikLoading}
                                        className="shrink-0 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center w-8"
                                    >
                                        <Search size={14} />
                                    </button>
                                </div>

                                {/* Results Grid */}
                                {isFreepikLoading ? (
                                    <div className="py-8 text-center text-[var(--text-secondary)] text-xs flex flex-col items-center gap-2">
                                        <Sparkles className="animate-spin text-indigo-500" size={16} />
                                        <span>이미지 찾는 중...</span>
                                    </div>
                                ) : (
                                    <div
                                        ref={freepikScrollRef}
                                        onScroll={handleFreepikScroll}
                                        className="grid grid-cols-2 gap-2 overflow-y-auto pb-4 custom-scrollbar pr-1 flex-1 min-h-0"
                                    >
                                        {freepikResults.length > 0 ? (
                                            freepikResults.map((res) => (
                                                <button
                                                    key={res.id}
                                                    onClick={() => handleFreepikImageClick(res)}
                                                    className="relative aspect-square rounded-lg overflow-hidden border border-[var(--border-color)] hover:border-indigo-500 transition-all group hover:opacity-90 bg-white"
                                                >
                                                    <img
                                                        src={res.url}
                                                        alt="result"
                                                        className={`w-full h-full ${freepikFilter === 'icon' ? 'object-contain p-1' : 'object-cover'}`}
                                                    />
                                                </button>
                                            ))
                                        ) : (
                                            <div className="col-span-2 py-8 text-center text-[var(--text-secondary)] text-[10px] opacity-70">
                                                검색 결과가 없습니다
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'effect' && (
                            <>
                                {renderBtn(<Play size={18} />, "타이핑 효과", 'typing-text')}
                                {renderBtn(<ChevronsRight size={18} />, "스크롤 텍스트", 'scroll-text')}
                            </>
                        )}


                        {activeTab === 'data' && (
                            <>
                                {renderBtn(<PieChart size={18} />, "원형 차트", 'chart-pie')}
                                {renderBtn(<BarChart3 size={18} />, "막대/선 그래프", 'chart-bar')}
                                {renderBtn(<Radar size={18} />, "방사형 차트", 'chart-radar')}
                                {renderBtn(<Grid3X3 size={18} />, "히트맵 (잔디)", 'heatmap')}
                                {renderBtn(<PlusCircle size={18} />, "카운터", 'counter')}
                                {renderBtn(<Star size={18} />, "별점/평점", 'rating')}
                                {renderBtn(<Battery size={18} />, "진행 게이지", 'progress-bar')}
                                {renderBtn(<Database size={18} />, "데이터베이스", 'database')}
                            </>
                        )}

                        {activeTab === 'util' && (
                            <>
                                {renderBtn(<ArrowLeftRight size={18} />, "단위 변환기", 'unit-converter')}
                                {renderBtn(<Link size={18} />, "링크 북마크", 'link-bookmark')}
                                {renderBtn(<FileText size={18} />, "PDF 뷰어", 'pdf-viewer')}
                                {renderBtn(<Map size={18} />, "여행 플래너", 'travel-plan')}
                            </>
                        )}

                        {activeTab === 'study' && (
                            <>
                                {renderBtn(<StickyNote size={18} />, "플래시 카드", 'flashcards')}
                                {renderBtn(<Search size={18} />, "책 정보 검색", 'book-info')}
                                {renderBtn(<Search size={18} />, "영화 정보 검색", 'movie-ticket')}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </aside >
    );
};

// 탭 버튼 컴포넌트
const TabButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`w-12 h-12 flex flex-col items-center justify-center rounded-lg transition-all gap-0.5
            ${active
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-secondary)]'
            }
        `}
        title={label}
    >
        {icon}
        <span className="text-[9px] font-medium">{label}</span>
    </button>
);

const getCategoryTitle = (cat: Category) => {
    switch (cat) {
        case 'text': return '기본 텍스트';
        case 'structure': return '구조 및 목록';
        case 'visual': return '시각적 강조';
        case 'effect': return '애니메이션';
        case 'data': return '데이터 시각화';
        case 'util': return '유틸리티 도구';
        case 'study': return '지식 및 학습';
        case 'interaction': return '상호작용';
        default: return '';
    }
};

export default LeftSidebar;
