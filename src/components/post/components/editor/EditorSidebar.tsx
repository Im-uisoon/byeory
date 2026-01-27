import React, { useEffect, useRef, useState } from 'react';
import { STICKERS, LAYOUT_PRESETS, type StickerItemDef } from '../../constants';
import { PAPER_PRESETS } from '../../constants/paperPresets'; // ✨ Import
import { useMarket } from '../../../../hooks';
import { Save, X, Type, StickyNote, Image as ImageIcon, Sparkles, Upload, Layout, Plus, Palette, Bot, Mic, MicOff, Check, ChevronDown, Trash2, Undo2, Search, ImageDown } from 'lucide-react';
import axios from 'axios'; // ✨ Import Axios
import { compressImage } from '../../../../utils/imageUtils'; // ✨ Import Compression
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface Props {
    isSaving: boolean;
    onSave: () => void;
    onTempSave: () => void; // ✨ New Prop
    onCancel: () => void;
    onAddBlock: () => void;
    onAddFloatingText: () => void;
    onAddSticker: (url: string) => void;
    onAddFloatingImage: (file: File) => void;
    rawInput: string;
    setRawInput: (v: string) => void;
    selectedLayoutId: string;
    setSelectedLayoutId: (id: string) => void;
    tempImages: string[];
    setTempImages: (imgs: string[]) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleImagesUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAiGenerate: () => void;
    isAiProcessing: boolean;
    // New Props for Save Location
    // New Props for Save Location
    currentTags: string[];
    onTagsChange: (tags: string[]) => void;
    // ✨ Paper Props
    applyPaperPreset: (preset: any) => void;
    defaultFontColor?: string;
    onSaveAsTemplate: () => void;
    myTemplates?: any[];
    applyTemplate?: (template: any) => void;
    onDeleteTemplate?: (id: number) => void;
    containerClassName?: string;
    showActionButtons?: boolean;
    onAddWidgetSticker: (widgetType: string, props?: any) => void; // ✨ New Prop
    isPublic?: boolean;
    setIsPublic?: (v: boolean) => void;
    showHiddenTemplates?: boolean;
    setShowHiddenTemplates?: (show: boolean) => void;
    onRestoreTemplate?: (id: number) => void;
    onClearSelection?: () => void; // ✨ New: Clear selection when sidebar is clicked
}

import { useWidgetRegistry } from '../../../../components/settings/widgets/useWidgetRegistry'; // ✨ Import Registry
import { getMyWidgets } from '../../../../components/settings/widgets/customwidget/widgetApi';
import { WIDGET_COMPONENT_MAP } from '../../../../components/settings/widgets/componentMap';
import CustomWidgetPreview from '../../../../components/settings/widgets/customwidget/components/CustomWidgetPreview';
import type { WidgetConfig } from '../../../../components/settings/widgets/type';

// Helper Component for safe image loading
const WidgetButton = ({ widget, onAdd }: { widget: any, onAdd: (type: string, props?: any) => void }) => {
    const [imgError, setImgError] = React.useState(false);
    const thumbnailUrl = `/thumbnails/${widget.widgetType}.png`;

    return (
        <div key={widget.widgetType} className="group relative">
            <div
                role="button"
                tabIndex={0}
                onClick={() => onAdd(widget.widgetType, widget.defaultProps)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        onAdd(widget.widgetType, widget.defaultProps);
                    }
                }}
                className="w-full aspect-square rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-card-secondary)] hover:border-[var(--accent-color)] transition-all flex items-center justify-center bg-white shadow-sm overflow-hidden p-1.5 cursor-pointer"
            >
                {!imgError ? (
                    <img
                        src={thumbnailUrl}
                        alt={widget.label}
                        className="w-full h-full object-contain"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full overflow-hidden relative bg-[var(--bg-card-secondary)] rounded-lg">
                        {/* 🌟 썸네일 로드 실패 시 컴포넌트 렌더링 시도 */}
                        <div className="w-full h-full pointer-events-none select-none transform scale-[0.4] origin-top-left" style={{ width: '250%', height: '250%' }}>
                            {/* width/height 250% + scale 0.4 = 100% fit (approx) */}
                            {widget.component ? (
                                <widget.component {...(widget.defaultProps || {})} />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-[var(--accent-color)]">
                                    <span className="text-xl">🧩</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Hover Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {widget.label}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
            </div>
        </div>
    );
};

// ✨ Accordion Component
const SidebarAccordion = ({
    title,
    icon: Icon,
    children,
    defaultOpen = false
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full p-4 flex items-center justify-between transition-colors ${isOpen ? 'bg-[var(--bg-card-secondary)]/30 border-b border-[var(--border-color)]' : 'hover:bg-[var(--bg-card-secondary)]/50'}`}
            >
                <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
                    <Icon size={18} className="text-[var(--text-secondary)]" />
                    {title}
                </div>
                <ChevronDown
                    size={16}
                    className={`text-[var(--text-secondary)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <div
                className={`transition-all duration-300 ease-in-out scrollbar-hide ${isOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}
                style={{ overflow: isOpen ? 'visible' : 'hidden' }}
            >
                {children}
            </div>
        </div>
    );
};

const EditorSidebar: React.FC<Props> = ({
    isSaving, onSave, onTempSave, onCancel,
    onAddBlock, onAddFloatingText, onAddSticker, onAddFloatingImage,
    rawInput, setRawInput, selectedLayoutId, setSelectedLayoutId,
    tempImages, fileInputRef, handleImagesUpload, onAiGenerate, isAiProcessing,
    currentTags, onTagsChange, applyPaperPreset, onSaveAsTemplate,
    myTemplates = [], applyTemplate, containerClassName = "xl:w-80", showActionButtons = true,
    onAddWidgetSticker = (type) => console.warn("onAddWidgetSticker missing", type), // ✨ Destructure with default
    isPublic = true, setIsPublic, // ✨ Destructure
    onDeleteTemplate, // ✨ Destructure
    showHiddenTemplates = false, setShowHiddenTemplates, onRestoreTemplate, // ✨ New Props
    onClearSelection // ✨ Destructure
}) => {
    // ✨ Freepik Search State
    const [freepikQuery, setFreepikQuery] = useState('');
    const [freepikResults, setFreepikResults] = useState<{ url: string; downloadUrl: string; id: string | number }[]>([]);
    const [freepikFilter, setFreepikFilter] = useState<'all' | 'photo' | 'vector' | 'icon'>('all'); // ✨ Filter State
    const [freepikPage, setFreepikPage] = useState(1); // ✨ Page State
    const [isFreepikLoading, setIsFreepikLoading] = useState(false);
    // ✨ Mobile Sheet State
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const freepikScrollRef = useRef<HTMLDivElement>(null); // ✨ Scroll Ref

    // ✨ Real Freepik Search
    const handleFreepikSearch = async (targetPage: number = 1) => {
        if (!freepikQuery.trim()) return;
        setIsFreepikLoading(true);

        const apiKey = import.meta.env.VITE_API_FREEPIK;
        console.log("Freepik API Key Loaded:", apiKey ? "Yes (" + apiKey.slice(0, 4) + "...)" : "No");

        if (!apiKey) {
            alert('Freepik API Key가 설정되지 않았습니다. (.env 파일을 확인해주세요)');
            setIsFreepikLoading(false);
            return;
        }

        try {
            const isIconSearch = freepikFilter === 'icon';
            const endpoint = isIconSearch ? '/v1/icons' : '/v1/resources';

            // Construct params for axios
            const params: Record<string, string> = {
                limit: '24',
                page: targetPage.toString(),
                term: freepikQuery,
            };

            if (!isIconSearch) {
                params.locale = 'ko-KR';
                if (freepikFilter === 'photo') {
                    params['filters[content_type][photo]'] = '1';
                } else if (freepikFilter === 'vector') {
                    params['filters[content_type][vector]'] = '1';
                }
            }

            console.log(`Freepik Request (Axios): ${endpoint}`, params);

            // Use Axios with Proxy Path
            // Using /freepik-api/... to proxy request to https://api.freepik.com
            const response = await axios.get<{ data: any[], meta: any }>(`/freepik-api${endpoint}`, {
                params: params,
                headers: {
                    'Accept-Language': 'ko-KR',
                    'x-freepik-api-key': apiKey // Lowercase as requested
                }
            });

            const data = response.data;
            const resources = data.data; // Freepik response structure: { data: [...] }

            if (!resources || resources.length === 0) {
                if (targetPage === 1) {
                    alert('검색 결과가 없습니다.');
                }
                setIsFreepikLoading(false);
                return;
            }

            // Extract Image URLs
            const results = resources.map((item: any) => {
                let previewUrl = '';
                let downloadUrl = '';

                if (isIconSearch) {
                    // Icons API: Prioritize PNG/SVG for true transparency
                    previewUrl = item.thumbnails?.[1]?.url || item.thumbnails?.[0]?.url || item.image?.preview?.url || '';
                    downloadUrl = item.image?.png?.url || item.image?.svg?.url || previewUrl;
                } else {
                    // Resources API
                    // Prioritize source url for best quality, fallback to preview
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
            setFreepikResults([]);
        } finally {
            setIsFreepikLoading(false);
        }
    };

    // ✨ Scroll Handler for Infinite Loading
    const handleFreepikScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollTop + clientHeight >= scrollHeight - 50) {
            if (!isFreepikLoading && freepikResults.length > 0) {
                handleFreepikSearch(freepikPage + 1);
            }
        }
    };

    const handleFreepikImageClick = async (item: { url: string; downloadUrl: string }) => {
        try {
            const url = item.downloadUrl || item.url;
            // Try to fetch as blob first
            const response = await fetch(url.replace('http://', 'https://'), { mode: 'cors' });
            if (!response.ok) throw new Error("Image fetch failed");

            const blob = await response.blob();
            // Detect extension from mime type
            const mimeType = blob.type;
            let extension = 'jpg';
            if (mimeType === 'image/png') extension = 'png';
            else if (mimeType === 'image/svg+xml') extension = 'svg';
            else if (mimeType === 'image/gif') extension = 'gif';

            const file = new File([blob], `freepik-${Date.now()}.${extension}`, { type: blob.type });

            // ✨ Compress before upload
            try {
                // Resize to max 1200px, 0.8 quality
                const compressedFile = await compressImage(file, 1200, 0.8);
                onAddFloatingImage(compressedFile);
            } catch (err) {
                console.warn("Compression failed, using original:", err);
                onAddFloatingImage(file);
            }
        } catch (error) {
            console.warn("Blob fetch failed, falling back to URL sticker:", error);
            onAddSticker(item.url);
        }
    };

    // ... existing ...

    // ✨ Widget Registry
    const { registry: widgetRegistry } = useWidgetRegistry();
    const [customWidgets, setCustomWidgets] = useState<WidgetConfig[]>([]);

    // 🌟 [NEW] 커스텀 위젯 직접 Fetching (WidgetGallery 로직 복사)
    useEffect(() => {
        const fetchCustomWidgets = async () => {
            try {
                const data = await getMyWidgets();
                if (Array.isArray(data)) {
                    const refinedConfigs: WidgetConfig[] = data.map((item: any) => {
                        const baseType = item.type;
                        let Component = WIDGET_COMPONENT_MAP[baseType];

                        // 'custom-block' 폴백 처리
                        if (!Component && baseType === 'custom-block') {
                            Component = (props: any) => (
                                <CustomWidgetPreview
                                    content={{
                                        ...props.content,
                                        decorations: props.decorations || [],
                                    }}
                                    defaultSize={item.defaultSize || '2x2'}
                                />
                            );
                        }

                        if (!Component) return null;

                        return {
                            id: item.id,
                            widgetType: `custom-${item.id}`,
                            label: item.name || '제목 없음',
                            description: `Custom ${baseType} widget`,
                            category: 'My Saved',
                            keywords: ['custom', baseType],
                            defaultSize: item.defaultSize || '1x1',
                            validSizes: [[1, 1], [1, 2], [2, 1], [2, 2]],
                            defaultProps: {
                                content: item.content,
                                styles: item.styles,
                                decorations: item.decorations
                            },
                            isSystem: false,
                            thumbnail: undefined,
                            component: Component,
                        } as WidgetConfig;
                    }).filter((w): w is WidgetConfig => w !== null);

                    setCustomWidgets(refinedConfigs);

                }
            } catch (e) {
                console.error("Failed to load custom widgets in Sidebar:", e);
            }
        };

        fetchCustomWidgets();
    }, []);

    // ✨ 중복 제거 로직 추가 (Console Error Fix)
    const allWidgets = React.useMemo(() => {
        const combined = [...Object.values(widgetRegistry), ...customWidgets];
        const uniqueMap = new Map();

        combined.forEach(w => {
            if (!uniqueMap.has(w.widgetType)) {
                uniqueMap.set(w.widgetType, w);
            }
        });

        return Array.from(uniqueMap.values());
    }, [widgetRegistry, customWidgets]);



    const { isOwned, buyItem, getMarketItem, getPackPrice } = useMarket();

    // ... existing speech recognition code ...
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    // 사이드바 전용 녹음 상태 관리
    const [isRecordingSidebar, setIsRecordingSidebar] = useState(false);
    const baseInputRef = useRef(rawInput); // 녹음 시작 전 텍스트 저장용

    // ✨ 음성 인식 텍스트 동기화
    useEffect(() => {
        if (listening && isRecordingSidebar) {
            // 기존 텍스트 + 공백 + 인식된 텍스트
            const newText = `${baseInputRef.current} ${transcript}`.trim();
            setRawInput(newText);
        }
    }, [transcript, listening, isRecordingSidebar, setRawInput]);

    // ✨ 녹음 토글 함수
    const toggleRecording = () => {
        if (!browserSupportsSpeechRecognition) {
            alert("이 브라우저는 음성 인식을 지원하지 않습니다. Chrome을 사용해주세요.");
            return;
        }

        if (listening) {
            SpeechRecognition.stopListening();
            setIsRecordingSidebar(false);
        } else {
            baseInputRef.current = rawInput || ''; // 현재 입력된 값 저장
            resetTranscript();
            setIsRecordingSidebar(true);
            SpeechRecognition.startListening({ continuous: true, language: 'ko-KR' });
        }
    };

    // Confirmation Modal State
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'info' | 'success' | 'danger';
        onConfirm: () => void;
        onSecondary?: () => void; // for Dual Option
        secondaryLabel?: string;
        confirmLabel?: string;
        singleButton?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => { },
    });

    const triggerFileClick = () => fileInputRef.current?.click();

    // 자유 사진용 input ref
    const floatingImgRef = useRef<HTMLInputElement>(null);
    const handleFloatingImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            onAddFloatingImage(e.target.files[0]);
            e.target.value = ''; // 초기화
        }
    };

    const handleStickerClick = async (sticker: StickerItemDef) => {
        // Check ownership
        const owned = !sticker.isPremium || isOwned(sticker.id) || (sticker.packId && isOwned(sticker.packId));
        if (owned) {
            onAddSticker(sticker.url);
            return;
        }

        // It is locked. Check if it belongs to a pack.
        if (sticker.packId) {
            const packItem = await getMarketItem(sticker.packId);
            if (packItem) {
                // Calculate Dynamic Price
                const packPrice = packItem.price;
                const dynamicPrice = getPackPrice(sticker.packId, packPrice);
                const discount = packPrice - dynamicPrice;

                setConfirmation({
                    isOpen: true,
                    title: '구매 옵션 선택',
                    message: `이 스티커는 '${packItem.title}'에 포함되어 있습니다.\n${discount > 0 ? `(기존 구매분 ${discount} C 할인됨!)\n` : ''}어떻게 구매하시겠습니까?`,
                    type: 'info',
                    singleButton: false,
                    confirmLabel: `이 팩 구매하기 (${dynamicPrice} C)`,
                    secondaryLabel: `이 스티커만 구매 (${sticker.price || 100} C)`,
                    onConfirm: async () => {
                        // Buy Pack
                        setConfirmation(prev => ({ ...prev, isOpen: false }));
                        if (await buyItem(packItem.id, dynamicPrice)) {
                            // alert('팩 구매가 완료되었습니다!'); // Using modal instead? or just silent refresh?
                            // Let's use a success modal
                            setTimeout(() => setConfirmation({
                                isOpen: true,
                                title: '구매 완료',
                                message: `'${packItem.title}' 구매가 완료되었습니다!`,
                                type: 'success',
                                onConfirm: () => setConfirmation(prev => ({ ...prev, isOpen: false })),
                                singleButton: true
                            }), 300);
                        } else {
                            setTimeout(() => setConfirmation({
                                isOpen: true,
                                title: '구매 실패',
                                message: '크레딧이 부족하거나 오류가 발생했습니다.',
                                type: 'danger',
                                onConfirm: () => setConfirmation(prev => ({ ...prev, isOpen: false })),
                                singleButton: true
                            }), 300);
                        }
                    },
                    onSecondary: async () => {
                        // Buy Individual
                        setConfirmation(prev => ({ ...prev, isOpen: false }));
                        if (await buyItem(sticker.id, sticker.price || 100)) {
                            setTimeout(() => setConfirmation({
                                isOpen: true,
                                title: '구매 완료',
                                message: '스티커 구매가 완료되었습니다!',
                                type: 'success',
                                onConfirm: () => setConfirmation(prev => ({ ...prev, isOpen: false })),
                                singleButton: true
                            }), 300);
                        } else {
                            setTimeout(() => setConfirmation({
                                isOpen: true,
                                title: '구매 실패',
                                message: '크레딧이 부족하거나 오류가 발생했습니다.',
                                type: 'danger',
                                onConfirm: () => setConfirmation(prev => ({ ...prev, isOpen: false })),
                                singleButton: true
                            }), 300);
                        }
                    }
                });
                return;
            }
        }

        // No pack or fetch failed, fallback to individual purchase
        setConfirmation({
            isOpen: true,
            title: '스티커 구매',
            message: `이 스티커를 ${sticker.price || 100} 크레딧에 구매하시겠습니까?`,
            type: 'info',
            singleButton: false,
            confirmLabel: '구매하기',
            onConfirm: async () => {
                setConfirmation(prev => ({ ...prev, isOpen: false }));
                if (await buyItem(sticker.id, sticker.price || 100)) {
                    setTimeout(() => setConfirmation({
                        isOpen: true,
                        title: '구매 완료',
                        message: '스티커 구매가 완료되었습니다!',
                        type: 'success',
                        onConfirm: () => setConfirmation(prev => ({ ...prev, isOpen: false })),
                        singleButton: true
                    }), 300);
                } else {
                    setTimeout(() => setConfirmation({
                        isOpen: true,
                        title: '구매 실패',
                        message: '크레딧이 부족합니다.',
                        type: 'danger',
                        onConfirm: () => setConfirmation(prev => ({ ...prev, isOpen: false })),
                        singleButton: true
                    }), 300);
                }
            }
        });
    };


    return (
        <div
            className={`
            fixed bottom-0 left-0 right-0 z-[200] bg-white/90 backdrop-blur-xl rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out
            md:relative md:transform-none md:shadow-none md:rounded-none md:z-0 md:bg-transparent
            ${isMobileOpen ? 'translate-y-0' : 'translate-y-[calc(100%-44px)]'} md:translate-y-0
            ${containerClassName} flex flex-col gap-5 h-[85vh] md:h-full overflow-y-auto py-0 md:py-8 pr-1 pb-10
        `}
            onClick={() => onClearSelection?.()} // ✨ Clear selection when sidebar is clicked
        >
            {/* ✨ Mobile Handle */}
            <div
                className="md:hidden w-full min-h-[32px] flex flex-col items-center justify-center cursor-pointer touch-pan-u hover:bg-white/50 active:bg-white/80 transition-colors gap-0.5 pt-1.5 pb-1"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                <div className="w-8 h-1 bg-gray-300/80 rounded-full" />
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 scale-90">
                    <ChevronDown size={8} className={`transition-transform duration-300 ${isMobileOpen ? '' : 'rotate-180'}`} />
                    MENU
                </div>
            </div>

            <div className="px-4 md:px-0 flex flex-col gap-5">
                {/* 상단 액션 버튼 */}
                {showActionButtons && (
                    <div className="flex flex-col gap-3">
                        {/* ✨ 커뮤니티 공개 토글 */}
                        {setIsPublic && (
                            <div className="flex items-center justify-between px-1">
                                <label className="text-sm font-bold text-[var(--text-secondary)] flex items-center gap-1.5 cursor-pointer select-none">
                                    <span className="text-lg">{isPublic ? '🌐' : '🔒'}</span>
                                    {isPublic ? '커뮤니티 공개' : '나만 보기'}
                                </label>
                                <button
                                    onClick={() => setIsPublic(!isPublic)}
                                    className={`
                                    relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                                    ${isPublic ? 'bg-indigo-600' : 'bg-gray-300'}
                                `}
                                >
                                    <span
                                        className={`
                                        absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm
                                        ${isPublic ? 'translate-x-5' : 'translate-x-0'}
                                    `}
                                    />
                                </button>
                            </div>
                        )}

                        {/* Row 1: Cancel & Complete (Taller, 5:5) */}
                        <div className="flex gap-2 w-full">
                            <button
                                onClick={onCancel}
                                className="flex-1 py-4 px-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)] transition-all flex items-center justify-center gap-2"
                                title="취소"
                            >
                                <X size={20} />
                                <span>취소</span>
                            </button>
                            <button
                                onClick={onSave}
                                disabled={isSaving}
                                className="flex-1 py-4 px-3 bg-[var(--btn-bg)] text-[var(--btn-text)] rounded-xl font-bold hover:opacity-90 transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Check size={20} />
                                <span>{isSaving ? "저장 중..." : "완료"}</span>
                            </button>
                        </div>

                        {/* Row 2: Temp Save (Thinner, Full Width) */}
                        <button
                            onClick={onTempSave}
                            disabled={isSaving}
                            className="w-full py-2.5 px-3 bg-white border border-indigo-200 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                        >
                            <Save size={14} />
                            <span>{isSaving ? "..." : "임시 저장"}</span>
                        </button>
                    </div>
                )}

                {/* SaveLocationWidget Removed - Moved to Modal */}

                {/* AI 기록 도우미 */}
                <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-card-secondary)]/30 flex items-center justify-between">
                        <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                            <Bot size={18} className="text-[var(--text-secondary)]" />
                            AI 기록 도우미
                        </h3>

                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold border border-indigo-100">BETA</span>
                    </div>

                    <div className="p-4 flex flex-col gap-4">
                        <div className={`
                        relative w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-secondary)]
                        focus-within:ring-2 focus-within:ring-[var(--btn-bg)] focus-within:border-transparent transition-all
                    `}>
                            <textarea
                                value={rawInput}
                                onChange={e => setRawInput(e.target.value)}
                                // textarea 자체의 테두리(border)는 없애고(bg-transparent border-none), 부모 div가 테두리 역할을 합니다.
                                className="w-full h-28 p-3 pr-10 bg-transparent border-none outline-none resize-none placeholder-gray-400 text-sm"
                                placeholder="오늘 하루는 어떠셨나요? 키워드나 짧은 문장을 입력하시면 AI가 멋진 일기를 만들어드려요."
                            />
                            {/* 버튼은 Wrapper Div 안에 절대 위치로 고정됩니다 */}
                            <button
                                onClick={toggleRecording}
                                className={`absolute bottom-2 right-2 p-1.5 rounded-full transition-all duration-200
                                ${listening && isRecordingSidebar
                                        ? 'text-red-500 bg-red-50 animate-pulse'
                                        : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-200/50'
                                    }
                            `}
                                title={listening ? "음성 인식 중지" : "음성으로 말하기"}
                            >
                                {listening && isRecordingSidebar ? <MicOff size={16} /> : <Mic size={16} />}
                            </button>
                        </div>

                        <div>
                            <span className="text-xs font-bold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">Layout Style</span>
                            <div className="grid grid-cols-2 gap-2">
                                {LAYOUT_PRESETS.map(l => (
                                    <button
                                        key={l.id}
                                        onClick={() => setSelectedLayoutId(l.id)}
                                        className={`text-xs px-3 py-4 rounded-lg border transition-all flex items-center justify-center gap-1.5
                                        ${selectedLayoutId === l.id
                                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold ring-1 ring-indigo-200'
                                                : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)]'
                                            }`}
                                    >
                                        {l.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={triggerFileClick}
                            className="w-full py-3 border border-dashed border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--btn-bg)] hover:border-[var(--btn-bg)] hover:bg-indigo-50/30 transition-all text-xs font-medium flex flex-col items-center justify-center gap-1"
                        >
                            <Upload size={16} />
                            <span>AI 참조 사진 업로드 ({tempImages.length}장 선택됨)</span>
                        </button>

                        <button
                            onClick={onAiGenerate}
                            disabled={isAiProcessing}
                            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
                        >
                            <Sparkles size={18} className={isAiProcessing ? "animate-spin" : ""} />
                            {isAiProcessing ? "AI가 이야기를 만드는 중..." : "AI로 일기 생성하기"}
                        </button>
                        <input type="file" hidden ref={fileInputRef} onChange={handleImagesUpload} multiple accept="image/*" />
                    </div>
                </div>

                {/* ✨ Tags Section (Real-time Visualization) */}
                <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
                    <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-card-secondary)]/30">
                        <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                            <span className="text-lg">🏷️</span>
                            태그
                        </h3>
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                        <div className="flex flex-wrap gap-1">
                            {currentTags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-[var(--btn-bg)] text-[var(--btn-text)] text-xs rounded-full flex items-center gap-1 opacity-90">
                                    #{tag}
                                    <button onClick={() => onTagsChange(currentTags.filter(t => t !== tag))} className="hover:text-red-200"><X size={12} /></button>
                                </span>
                            ))}
                        </div>
                        <input
                            placeholder="태그 입력 (Space/Ent)"
                            className="w-full p-2 bg-[var(--bg-card-secondary)] border border-[var(--border-color)] rounded-lg text-sm outline-none focus:border-[var(--btn-bg)] transition-colors"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    const val = e.currentTarget.value.trim();
                                    if (val) {
                                        // Remove # if present
                                        const tag = val.replace(/^#/, '');
                                        if (!currentTags.includes(tag)) {
                                            onTagsChange([...currentTags, tag]);
                                        }
                                        e.currentTarget.value = '';
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* 꾸미기 도구 섹션 */}
                <SidebarAccordion title="꾸미기 도구" icon={Palette} defaultOpen={false}>
                    <div className="p-4 flex flex-col gap-3">
                        <button
                            onClick={onAddBlock}
                            className="w-full py-3 px-4 border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-card-secondary)] hover:border-indigo-200 transition-all text-sm font-medium text-[var(--text-primary)] flex items-center gap-3 group bg-white/50"
                        >
                            <div className="p-1.5 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                <Type size={18} />
                            </div>
                            <span className="flex-1 text-left">줄글 상자 추가</span>
                            <Plus size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
                        </button>

                        <button
                            onClick={onAddFloatingText}
                            className="w-full py-3 px-4 border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-card-secondary)] hover:border-yellow-200 transition-all text-sm font-medium text-[var(--text-primary)] flex items-center gap-3 group bg-white/50"
                        >
                            <div className="p-1.5 rounded-lg bg-yellow-50 text-yellow-600 group-hover:bg-yellow-100 transition-colors">
                                <StickyNote size={18} />
                            </div>
                            <span className="flex-1 text-left">포스트잇 붙이기</span>
                            <Plus size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-yellow-400" />
                        </button>

                        <button
                            onClick={() => floatingImgRef.current?.click()}
                            className="w-full py-3 px-4 border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-card-secondary)] hover:border-blue-200 transition-all text-sm font-medium text-[var(--text-primary)] flex items-center gap-3 group bg-white/50"
                        >
                            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                                <ImageIcon size={18} />
                            </div>
                            <span className="flex-1 text-left">자유 사진 붙이기</span>
                            <Plus size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                        </button>
                        <input type="file" hidden ref={floatingImgRef} onChange={handleFloatingImgChange} accept="image/*" />
                    </div>

                    <div className="px-4 pb-4 pt-2 border-t border-[var(--border-color)]">
                        <h4 className="text-xs font-bold text-[var(--text-secondary)] mb-3 mt-2 uppercase tracking-wider flex justify-between items-center">
                            Stickers
                            <a href="/market" className="text-[10px] text-indigo-500 hover:underline">Get more</a>
                        </h4>
                        <div className="grid grid-cols-4 gap-2">
                            {STICKERS.map((sticker) => {
                                // Check ownership
                                const owned = !sticker.isPremium || isOwned(sticker.id) || (sticker.packId && isOwned(sticker.packId));
                                const isLocked = !owned;

                                return (
                                    <button
                                        key={sticker.id}
                                        title={isLocked ? `구매하기 (${sticker.price} C)` : '사용하기'}
                                        onClick={() => handleStickerClick(sticker)}
                                        className={`relative aspect-square hover:bg-[var(--bg-card-secondary)] p-1.5 rounded-xl border border-transparent hover:border-[var(--border-color)] transition-all active:scale-95 ${isLocked ? 'grayscale opacity-70' : ''}`}
                                    >
                                        <img src={sticker.url} className="w-full h-full object-contain filter drop-shadow-sm" alt="sticker" />
                                        {isLocked && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 rounded-xl text-white drop-shadow-md">
                                                <span className="text-xs">🔒</span>
                                                <span className="text-[10px] font-bold">{sticker.price}</span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </SidebarAccordion>

                {/* ✨ Freepik Search Section */}
                <SidebarAccordion title="Freepik 이미지 검색" icon={ImageDown} defaultOpen={false}>
                    <div className="p-4 flex flex-col gap-3">
                        {/* ✨ Filter Options */}
                        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                            {['all', 'photo', 'vector', 'icon'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFreepikFilter(type as any)}
                                    className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all whitespace-nowrap
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

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={freepikQuery}
                                onChange={(e) => setFreepikQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFreepikSearch(1)}
                                placeholder={
                                    freepikFilter === 'vector' ? "일러스트 검색 (예: 꽃)" :
                                        freepikFilter === 'icon' ? "아이콘 검색 (예: 집)" :
                                            "이미지 검색 (예: 바다)"
                                }
                                className="flex-1 min-w-0 px-3 py-2 bg-[var(--bg-card-secondary)] border border-[var(--border-color)] rounded-xl text-sm outline-none focus:border-indigo-500 transition-colors"
                            />
                            <button
                                onClick={() => handleFreepikSearch(1)}
                                disabled={isFreepikLoading}
                                className="shrink-0 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center w-10"
                            >
                                <Search size={18} />
                            </button>
                        </div>

                        {isFreepikLoading ? (
                            <div className="py-8 text-center text-[var(--text-secondary)] text-sm flex flex-col items-center gap-2">
                                <Sparkles className="animate-spin text-indigo-500" size={24} />
                                <span>
                                    {freepikFilter === 'vector' ? '멋진 일러스트를 찾는 중...' :
                                        freepikFilter === 'icon' ? '귀여운 아이콘을 찾는 중...' :
                                            '열심히 찾는 중...'}
                                </span>
                            </div>
                        ) : (
                            <div
                                ref={freepikScrollRef}
                                onScroll={handleFreepikScroll}
                                className="grid grid-cols-6 gap-2 max-h-[400px] overflow-y-auto px-1 py-4 custom-scrollbar overflow-x-visible"
                            >
                                {freepikResults.length > 0 ? (
                                    freepikResults.map((res) => (
                                        <button
                                            key={res.id}
                                            onClick={() => handleFreepikImageClick(res)}
                                            className={`
                                            relative rounded-lg overflow-visible border border-[var(--border-color)] 
                                            hover:border-indigo-500 transition-all duration-200 group
                                            hover:scale-[1.5] hover:z-[100] hover:shadow-xl
                                            active:scale-[1.8] active:z-[101]
                                            aspect-square
                                        `}
                                            style={{
                                                backgroundImage: 'conic-gradient(#f1f5f9 90deg, #fff 90deg 180deg, #f1f5f9 180deg 270deg, #fff 270deg)',
                                                backgroundSize: '12px 12px'
                                            }}
                                        >
                                            <img
                                                src={res.url}
                                                alt="Freepik Result"
                                                className={`w-full h-full rounded-lg ${freepikFilter === 'icon' ? 'object-contain p-1' : 'object-cover'}`}
                                            />
                                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg pointer-events-none">
                                                <Plus className="text-white drop-shadow-md opacity-50" size={10} />
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="col-span-6 py-8 text-center text-[var(--text-secondary)] text-xs">
                                        <p className="mb-2">
                                            {freepikFilter === 'vector' ? '🎨 감각적인 일러스트를' :
                                                freepikFilter === 'icon' ? '🧩 직관적인 아이콘을' :
                                                    '🖼️ 독창적인 이미지를'}
                                        </p>
                                        검색하여 포스터를 꾸며보세요!
                                        <div className="mt-1 opacity-50 text-[10px]">Powered by Freepik</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </SidebarAccordion>

                {/* ✨ 종이 디자인 섹션 */}
                <SidebarAccordion title="배경 디자인" icon={Layout} defaultOpen={false}>
                    <div className="p-4 grid grid-cols-2 gap-2">
                        {Object.values(PAPER_PRESETS).map((preset: any) => {
                            // ✨ Label Formatting Logic
                            const isSpecial = preset.id !== 'default' && preset.id !== 'hanji';
                            let displayName: React.ReactNode = preset.name;

                            if (isSpecial && preset.name.includes('(')) {
                                const [main, sub] = preset.name.split('(');
                                displayName = (
                                    <>
                                        <span>{main.trim()}</span>
                                        <span className="text-[10px] opacity-80">({sub}</span>
                                    </>
                                );
                            }

                            return (
                                <button
                                    key={preset.id}
                                    onClick={() => applyPaperPreset(preset)}
                                    className="h-15 p-2 border border-[var(--border-color)] rounded-lg text-xs hover:bg-[var(--bg-card-secondary)] hover:border-indigo-200 transition text-[var(--text-secondary)] font-medium flex flex-col items-center justify-center gap-0.5 leading-tight"
                                    style={{
                                        backgroundColor: preset.styles.backgroundColor || '#fff',
                                        color: preset.defaultFontColor || '#000'
                                    }}
                                >
                                    {displayName}
                                </button>
                            );
                        })}

                        <button
                            onClick={onSaveAsTemplate}
                            className="col-span-2 h-12 border-2 border-dashed border-indigo-300 rounded-lg text-xs hover:bg-indigo-50 hover:border-indigo-500 transition text-indigo-600 font-bold flex items-center justify-center gap-2 bg-white/50"
                        >
                            <Save size={16} />
                            템플릿 저장 (현재 디자인 저장)
                        </button>
                    </div>
                </SidebarAccordion>

                {/* ✨ 나의 템플릿 섹션 */}
                <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
                    <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-card-secondary)]/30">
                        <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                            <Save size={18} className="text-[var(--text-secondary)]" />
                            나의 템플릿
                            {setShowHiddenTemplates && (
                                <button
                                    onClick={() => setShowHiddenTemplates(!showHiddenTemplates)}
                                    className={`ml-auto p-1 rounded-full transition-colors ${showHiddenTemplates ? 'bg-red-100 text-red-500' : 'hover:bg-gray-100 text-gray-400'}`}
                                    title={showHiddenTemplates ? "숨긴 템플릿 닫기" : "휴지통 보기"}
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </h3>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-2">
                        {myTemplates.length > 0 ? (
                            myTemplates.map((template: any) => (
                                <div
                                    key={template.id}
                                    onClick={() => applyTemplate && applyTemplate(template)}
                                    className="p-2 border border-[var(--border-color)] rounded-lg text-xs hover:bg-[var(--bg-card-secondary)] hover:border-indigo-200 transition text-[var(--text-secondary)] font-medium flex flex-col items-center gap-1 overflow-hidden relative group cursor-pointer"
                                    style={{
                                        backgroundColor: template.styles?.backgroundColor || '#fff'
                                    }}
                                >
                                    <span
                                        className="truncate w-full text-center relative z-10"
                                        style={{
                                            color: (() => {
                                                const bg = template.styles?.backgroundColor || '#ffffff';
                                                // Simple brightness check
                                                if (bg.startsWith('#')) {
                                                    const r = parseInt(bg.substring(1, 3), 16);
                                                    const g = parseInt(bg.substring(3, 5), 16);
                                                    const b = parseInt(bg.substring(5, 7), 16);
                                                    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                                                    return brightness > 125 ? '#000000' : '#ffffff';
                                                }
                                                return '#000000';
                                            })()
                                        }}
                                    >
                                        {template.name}
                                    </span>
                                    {showHiddenTemplates ? (
                                        onRestoreTemplate && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onRestoreTemplate(template.id);
                                                }}
                                                className="absolute top-1 right-1 p-1 rounded-full bg-black/10 hover:bg-green-500 hover:text-white transition-colors text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 z-20"
                                                title="템플릿 복원"
                                            >
                                                <Undo2 size={12} />
                                            </button>
                                        )
                                    ) : (
                                        onDeleteTemplate && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteTemplate(template.id);
                                                }}
                                                className="absolute top-1 right-1 p-1 rounded-full bg-black/10 hover:bg-red-500 hover:text-white transition-colors text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 z-20"
                                                title="템플릿 삭제"
                                            >
                                                <X size={12} />
                                            </button>
                                        )
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 text-center text-xs text-gray-400 py-2">
                                {showHiddenTemplates ? "휴지통이 비었습니다." : "저장된 템플릿이 없습니다."}
                            </div>
                        )}
                    </div>
                </div >

                {/* ✨ Widgets Section */}
                < SidebarAccordion title="위젯" icon={() => <span className="text-lg">🧩</span>} defaultOpen={false} >
                    <div className="p-4 flex flex-col gap-4">
                        {/* 1. 기본 위젯 */}
                        <div>
                            <h4 className="text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">기본 위젯</h4>
                            <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto custom-scrollbar">
                                {allWidgets.filter(w => !w.widgetType.startsWith('custom-')).map((widget) => (
                                    <WidgetButton key={widget.widgetType} widget={widget} onAdd={onAddWidgetSticker} />
                                ))}
                            </div>
                        </div>

                        {/* 2. 나의 위젯 (커스텀) */}
                        <div className="pt-2 border-t border-[var(--border-color)]">
                            <h4 className="text-xs font-bold text-[var(--text-secondary)] mb-2 mt-2 uppercase tracking-wider flex items-center gap-2">
                                나의 위젯
                                <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold">Custom</span>
                            </h4>
                            <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto custom-scrollbar">
                                {allWidgets.filter(w => w.widgetType.startsWith('custom-')).length > 0 ? (
                                    allWidgets.filter(w => w.widgetType.startsWith('custom-')).map((widget) => (
                                        <WidgetButton key={widget.widgetType} widget={widget} onAdd={onAddWidgetSticker} />
                                    ))
                                ) : (
                                    <div className="col-span-2 py-4 flex flex-col items-center justify-center text-center text-gray-400 gap-1 bg-[var(--bg-card-secondary)]/30 rounded-lg border border-dashed border-[var(--border-color)]">
                                        <span className="text-xl">📭</span>
                                        <span className="text-xs">저장된 위젯이 없습니다.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </SidebarAccordion >

                <ConfirmationModal
                    isOpen={confirmation.isOpen}
                    onClose={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
                    onConfirm={confirmation.onConfirm}
                    onCancel={confirmation.onSecondary || (() => setConfirmation(prev => ({ ...prev, isOpen: false })))}
                    title={confirmation.title}
                    message={confirmation.message}
                    type={confirmation.type}
                    singleButton={confirmation.singleButton}
                    confirmText={confirmation.confirmLabel}
                    cancelText={confirmation.secondaryLabel}
                />
            </div>
        </div>
    );
};

export default EditorSidebar;