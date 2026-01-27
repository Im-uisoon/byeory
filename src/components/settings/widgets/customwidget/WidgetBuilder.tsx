import React, { useState, useEffect } from 'react';
import { ArrowLeft, PanelLeft, PanelRight, Trash2, Play, Pause, Clock, Plus } from 'lucide-react';
import type { WidgetBlock, BlockType, WidgetDecoration, DecorationType, WidgetScene } from './types';
import { WIDGET_SIZES, BLOCK_COSTS } from './constants';
import { getDefaultContent, getLabelByType, generateBlobPoints } from './utils';

// 분리된 컴포넌트 임포트
import LeftSidebar, { type Category } from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import Canvas from './components/Canvas';
import { saveWidget, updateWidget, deleteWidget } from "./widgetApi.ts";
import { domToPng } from 'modern-screenshot'; // ✨
import { uploadImageToSupabase } from '../../../post/api/index.ts'; // ✨

interface Props {
    onExit: () => void;
    initialData?: any; // 🌟 수정 시 데이터 주입
    onSave?: (savedData: any) => void; // 🌟 저장 완료 콜백 추가
}

const WidgetBuilder: React.FC<Props> = ({ onExit, initialData, onSave }) => {
    const [currentSizeKey, setCurrentSizeKey] = useState<keyof typeof WIDGET_SIZES>('2x2');

    // 🌟 [Modified] Blocks are now derived from scenes
    // const [blocks, setBlocks] = useState<WidgetBlock[]>([]); // REMOVED
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [clipboard, setClipboard] = useState<WidgetDecoration | null>(null); // 🌟 [NEW] Clipboard
    const [croppingId, setCroppingId] = useState<string | null>(null); // ✨ [NEW] Cropping State

    // 🌟 [NEW] Scene Management
    const [scenes, setScenes] = useState<WidgetScene[]>([
        { id: 'scene-1', decorations: [], blocks: [], duration: 1 }
    ]);
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [customSize, setCustomSize] = useState({ w: WIDGET_SIZES['2x2'].w, h: WIDGET_SIZES['2x2'].h }); // ✨ NEW: Custom Size

    // ✨ Sync custom size with preset
    useEffect(() => {
        setCustomSize({
            w: WIDGET_SIZES[currentSizeKey].w,
            h: WIDGET_SIZES[currentSizeKey].h
        });
    }, [currentSizeKey]);

    // ✨ Playback Logic
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (isPlaying && scenes && scenes.length > 1) {
            const currentDuration = scenes[currentSceneIndex].duration || 1;
            timer = setTimeout(() => {
                const nextIndex = (currentSceneIndex + 1) % scenes.length;
                setCurrentSceneIndex(nextIndex);
            }, currentDuration * 1000);
        }
        return () => clearTimeout(timer);
    }, [isPlaying, scenes.length, currentSceneIndex, scenes]);

    // Derived state for current decorations & blocks
    const decorations = scenes[currentSceneIndex]?.decorations || [];
    const blocks = scenes[currentSceneIndex]?.blocks || [];

    // Helper: Update current scene's decorations
    const setDecorations = (newDecorations: WidgetDecoration[] | ((prev: WidgetDecoration[]) => WidgetDecoration[])) => {
        setScenes(prev => {
            const next = [...prev];
            const currentScene = { ...next[currentSceneIndex] };

            if (typeof newDecorations === 'function') {
                currentScene.decorations = newDecorations(currentScene.decorations);
            } else {
                currentScene.decorations = newDecorations;
            }

            next[currentSceneIndex] = currentScene;
            return next;
        });
    };

    // Helper: Update current scene's blocks
    const setBlocks = (newBlocks: WidgetBlock[] | ((prev: WidgetBlock[]) => WidgetBlock[])) => {
        setScenes(prev => {
            const next = [...prev];
            const currentScene = { ...next[currentSceneIndex] };

            if (typeof newBlocks === 'function') {
                currentScene.blocks = newBlocks(currentScene.blocks || []);
            } else {
                currentScene.blocks = newBlocks;
            }

            next[currentSceneIndex] = currentScene;
            return next;
        });
    };

    const [selectedDecorationId, setSelectedDecorationId] = useState<string | null>(null);

    // 데코레이션 선택 핸들러
    const handleSelectDecoration = (id: string | null) => {
        setSelectedDecorationId(id);
        if (id) {
            setSelectedBlockId(null); // 블록 선택 해제
            // setIsRightOpen(true); // 🌟 [수정] 클릭 시 오픈 방지
        }
    };



    // 🌟 블록 선택 시 오른쪽 사이드바 자동 열림 (모바일/데스크탑 모두)
    // 🌟 블록 선택 시 오른쪽 사이드바 자동 열림 (모바일/데스크탑 모두)
    // 🌟 [수정] 블록 선택 시 오른쪽 사이드바 자동 열림 제거
    // 더블 클릭 시에만 setIsRightOpen(true) 호출하도록 변경
    useEffect(() => {
        if (!selectedBlockId && !selectedDecorationId) {
            setIsRightOpen(false); // 선택 해제 시에는 닫음 (유지)
        }
    }, [selectedBlockId, selectedDecorationId]);

    // 🌟 [NEW] 설정 패널 열기 핸들러 (더블 클릭용)
    const handleOpenSettings = () => {
        setIsRightOpen(true);
    };

    // 🌟 [NEW] Handle Backspace/Delete to remove selected items
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Backspace' || e.key === 'Delete') {
                // Ignore if typing in an input
                const isWriting = (e.target as HTMLElement).tagName.match(/INPUT|TEXTAREA|SELECT|DIV/i) && (e.target as HTMLElement).isContentEditable;
                const isInput = (e.target as HTMLElement).tagName.match(/INPUT|TEXTAREA|SELECT/i);

                if (isWriting || isInput) return;

                if (selectedBlockId) {
                    removeBlock(selectedBlockId);
                } else if (selectedDecorationId) {
                    removeDecoration(selectedDecorationId);
                }
            }

            // 🌟 [NEW] Copy (Ctrl+C)
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                const isWriting = (e.target as HTMLElement).tagName.match(/INPUT|TEXTAREA|SELECT|DIV/i) && (e.target as HTMLElement).isContentEditable;
                const isInput = (e.target as HTMLElement).tagName.match(/INPUT|TEXTAREA|SELECT/i);
                if (isWriting || isInput) return;

                if (selectedDecorationId) {
                    const deco = decorations.find(d => d.id === selectedDecorationId);
                    if (deco) {
                        setClipboard(deco);
                        // alert('복사되었습니다!'); 
                    }
                }
            }

            // 🌟 [NEW] Paste (Ctrl+V)
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                const isWriting = (e.target as HTMLElement).tagName.match(/INPUT|TEXTAREA|SELECT|DIV/i) && (e.target as HTMLElement).isContentEditable;
                const isInput = (e.target as HTMLElement).tagName.match(/INPUT|TEXTAREA|SELECT/i);
                if (isWriting || isInput) return;

                if (clipboard) {
                    const newDeco: WidgetDecoration = {
                        ...clipboard,
                        id: `deco-${Date.now()}`,
                        x: clipboard.x + 5,
                        y: clipboard.y + 5,
                    };
                    // Ensure it stays within reasonable bounds (optional)
                    if (newDeco.x > 90) newDeco.x = 10;
                    if (newDeco.y > 90) newDeco.y = 10;

                    setDecorations(prev => [...prev, newDeco]);
                    handleSelectDecoration(newDeco.id);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedBlockId, selectedDecorationId, blocks, decorations]); // Dependencies for remove functions if they use state
    // 🌟 [Sync] Sync decorations to current scene
    // This ensures that changes to 'decorations' state (drag/drop) are reflected in 'scenes' state which is used for saving.
    useEffect(() => {
        setScenes(prev => {
            const newScenes = [...prev];
            if (newScenes[currentSceneIndex]) {
                newScenes[currentSceneIndex] = {
                    ...newScenes[currentSceneIndex],
                    decorations: decorations
                };
            }
            return newScenes;
        });
    }, [decorations, currentSceneIndex]);

    // 🌟 initialData가 변경되면 상태 동기화 (Edit 모드 버그 수정)
    useEffect(() => {
        if (initialData) {
            // 🌟 Composite Widget(다중 블록) 로드 확인
            // 🌟 [Fix] 'custom-block' 타입이면 무조건 로드 시도 (children 없어도 됨)
            if (initialData.type === 'custom-block') {
                // 🌟 [Fix] Restore saved size if available
                if (initialData.defaultSize) {
                    setCurrentSizeKey(initialData.defaultSize);
                }

                // setBlocks(initialData.content.children); // REMOVED: Managed via setScenes below
                // 🌟 데코레이션 로드 (Scene 지원)
                if (initialData.content?.scenes) {
                    // Safe Parse Scenes
                    const parsedScenes = initialData.content.scenes.map((s: any) => ({
                        ...s,
                        decorations: (s.decorations || []).map((d: any) => ({
                            ...d,
                            // 🌟 [Critical Fix] Ensure d.x is not null/undefined before checking isNaN
                            // Number(null) is 0, so we must check for nullness explicitly
                            x: (d.x !== null && d.x !== undefined && !isNaN(Number(d.x))) ? Number(d.x) : 50,
                            y: (d.y !== null && d.y !== undefined && !isNaN(Number(d.y))) ? Number(d.y) : 50,
                            w: (d.w !== null && d.w !== undefined && !isNaN(Number(d.w))) ? Number(d.w) : 100,
                            h: (d.h !== null && d.h !== undefined && !isNaN(Number(d.h))) ? Number(d.h) : 100,
                            type: (typeof d.type === 'object' && d.type.type) ? d.type.type : d.type
                        }))
                    }));
                    setScenes(parsedScenes);
                    setCurrentSceneIndex(0);
                } else {
                    // Legacy support: Convert single decoration/block array to Scene 1
                    // 🌟 [Fix] Check both content.decorations AND root decorations
                    const rawDecorations = initialData.content?.decorations || initialData.decorations || [];

                    const legacyDecos = rawDecorations.map((d: any) => ({
                        ...d,
                        // 🌟 [Critical Fix] Same here
                        x: (d.x !== null && d.x !== undefined && !isNaN(Number(d.x))) ? Number(d.x) : 50,
                        y: (d.y !== null && d.y !== undefined && !isNaN(Number(d.y))) ? Number(d.y) : 50,
                        w: (d.w !== null && d.w !== undefined && !isNaN(Number(d.w))) ? Number(d.w) : 100,
                        h: (d.h !== null && d.h !== undefined && !isNaN(Number(d.h))) ? Number(d.h) : 100,
                        type: (typeof d.type === 'object' && d.type.type) ? d.type.type : d.type
                    }));

                    setScenes([{
                        id: 'scene-1',
                        decorations: legacyDecos,
                        blocks: initialData.content?.children || initialData.content?.blocks || [],
                        duration: 1
                    }]);
                }
            } else {
                // 단일 블록 로드 -> Scene 1
                const loadedBlock: WidgetBlock = {
                    id: initialData.id || initialData._id || `blk-${Date.now()}`,
                    type: initialData.type,
                    content: initialData.content || {},
                    styles: initialData.styles || {}
                };
                setScenes([{ id: 'scene-1', decorations: [], blocks: [loadedBlock], duration: 1 }]);
                setSelectedBlockId(loadedBlock.id);
            }
        } else {
            // 초기 상태 (빈 캔버스)
        }
    }, [initialData]);

    const currentSize = WIDGET_SIZES[currentSizeKey];

    // --- Helper Functions ---

    const selectedBlock = selectedBlockId ? blocks.find(b => b.id === selectedBlockId) : undefined;

    const calculateCapacity = (items: WidgetBlock[]): number => {
        return items.reduce((sum, block) => {
            let cost = BLOCK_COSTS[block.type] || 1;
            if (block.type === 'columns' && block.content.layout) {
                block.content.layout.forEach((col: WidgetBlock[]) => {
                    cost += calculateCapacity(col);
                });
            }
            return sum + cost;
        }, 0);
    };

    const usedCapacity = calculateCapacity(blocks);
    const remainingCapacity = currentSize.capacity - usedCapacity;

    // --- Handlers ---
    const addBlock = (type: BlockType) => {
        const cost = BLOCK_COSTS[type] || 1;
        if (cost > remainingCapacity) { alert("공간 부족!"); return; }

        // ✨ [Fix] Use 1x1 size (180px) as default for better grid fit
        // Charts specifically requested to match standard sizes
        let defaultW = WIDGET_SIZES['1x1'].w; // 180
        let defaultH: string | number = 'auto';

        if (type.startsWith('chart-')) {
            defaultH = WIDGET_SIZES['1x1'].h;
        } else if (type === 'database') {
            defaultW = WIDGET_SIZES['2x2'].w;
            defaultH = 250;
        }

        const newBlock: WidgetBlock = {
            id: `blk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            type,
            content: getDefaultContent(type),
            styles: { color: '#1e293b', align: 'left', fontSize: 14 },
            layout: { x: 50, y: 50, w: defaultW, h: defaultH, rotation: 0, zIndex: 1 }
        };

        setBlocks([newBlock, ...blocks]);
        setSelectedBlockId(newBlock.id);
    };

    const removeBlock = (id: string) => {
        setBlocks(prev => prev.filter(item => item.id !== id));
        if (selectedBlockId === id) setSelectedBlockId(null);
    };

    const updateBlock = (id: string, updates: any) => {
        setBlocks(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    // --- Decoration Handlers ---
    const addDecoration = (typeOrDecoration: DecorationType | Partial<WidgetDecoration>) => {
        let newDecoration: WidgetDecoration;

        if (typeof typeOrDecoration === 'string') {
            const type = typeOrDecoration;
            const points = type === 'blob' ? generateBlobPoints() : undefined;

            const canvasW = currentSize.w || 320;
            const canvasH = currentSize.h || 320; // Default fallback

            // ✨ Calculate size
            const targetSize = 150;
            let w = targetSize;
            let h = targetSize;

            if (type === 'line') {
                w = 100;
                h = 5;
            }

            // ✨ Center it
            // x, y are percentages. Center (50%) minus half width/height in %
            const x = 50 - ((w / 2) / canvasW * 100);
            const y = 50 - ((h / 2) / canvasH * 100);

            newDecoration = {
                id: `deco-${Date.now()}`,
                type,
                x,
                y,
                w,
                h,
                color: '#e0e7ff',
                opacity: 1,
                zIndex: 0,
                rotation: 0,
                points
            };
        } else {
            newDecoration = {
                id: `deco-${Date.now()}`,
                type: 'shape',
                x: 50, // default center-ish
                y: 50,
                w: 100,
                h: 100,
                color: '#e0e7ff',
                opacity: 1,
                zIndex: 0,
                rotation: 0,
                ...typeOrDecoration
            } as WidgetDecoration;
        }

        setDecorations([...decorations, newDecoration]);
        setSelectedDecorationId(newDecoration.id);
        setSelectedBlockId(null);
        setIsRightOpen(true);
    };

    const updateDecoration = (id: string, updates: Partial<WidgetDecoration>) => {
        setDecorations(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    };

    const removeDecoration = (id: string) => {
        setDecorations(prev => prev.filter(d => d.id !== id));
        if (selectedDecorationId === id) setSelectedDecorationId(null);
    };

    // ✨ Switch Crop Mode
    const handleCropToggle = () => {
        if (!selectedDecorationId) return;

        // Toggle state
        const isEnabling = croppingId !== selectedDecorationId;
        setCroppingId(prev => (prev === selectedDecorationId ? null : selectedDecorationId));

        // If enabling, ensure we have initial crop data
        if (isEnabling) {
            const deco = decorations.find(d => d.id === selectedDecorationId);
            if (deco && !deco.crop) {
                // Initialize default crop (full image)
                updateDecoration(selectedDecorationId, {
                    crop: {
                        contentX: 0,
                        contentY: 0,
                        contentW: deco.w || 100, // Fallback if w missing? (Should allow number)
                        contentH: deco.h || 100
                    }
                });
            }
        }
    };


    // 🌟 저장 로직 핸들러
    const handleSaveToCloud = async () => {
        if (blocks.length === 0 && decorations.length === 0) {
            alert('빈 위젯은 저장할 수 없습니다. 블록이나 꾸미기 요소를 추가해주세요.');
            return;
        }

        // 🌟 다중 블록이면 'custom-block'으로 랩핑하여 저장
        let blockToSave: WidgetBlock;

        try {
            // 🌟 저장 전 Scene 데이터 정제 (Type 오염 방지)
            // 🌟 저장 전 Scene 데이터 정제 (Type 오염 방지 및 숫자 포맷팅)
            // 🌟 [Image Upload] Helper to process decorations
            const processDecorations = async (decos: WidgetDecoration[]) => {
                return Promise.all(decos.map(async (d) => {
                    let imageUrl = d.imageUrl;
                    // If it's a blob, upload it
                    if (imageUrl && imageUrl.startsWith('blob:')) {
                        try {
                            const response = await fetch(imageUrl);
                            const blob = await response.blob();
                            const file = new File([blob], `image-${Date.now()}.png`, { type: blob.type });
                            const uploadedUrl = await uploadImageToSupabase(file);
                            if (uploadedUrl) {
                                imageUrl = uploadedUrl;
                            }
                        } catch (e) {
                            console.error("Failed to upload blob:", e);
                        }
                    }

                    // [Data Normalization]
                    let safeType = d.type;
                    if (typeof safeType === 'object' && (safeType as any).type) {
                        safeType = (safeType as any).type;
                    }
                    return {
                        ...d,
                        type: safeType,
                        imageUrl, // Updated URL
                        x: Number(d.x) || 0, // 🌟 Explicit Number with fallback
                        y: Number(d.y) || 0,
                        w: Number(d.w) || 100,
                        h: Number(d.h) || 100
                    };
                }));
            };

            // 🌟 [Scene Processing] Upload images for all scenes
            const processedScenes = await Promise.all(scenes.map(async (scene) => ({
                ...scene,
                decorations: await processDecorations(scene.decorations)
            })));

            // 🌟 [Root Decoration Processing]
            const processedRootDecorations = await processDecorations(decorations);

            // 🌟 수정된 로직: 블록이 1개면 그대로 저장
            // 🌟 항상 'custom-block'으로 통일하여 저장 (데이터 일관성 유지)
            blockToSave = {
                id: `group-${Date.now()}`,
                type: 'custom-block',
                content: {
                    children: blocks,
                    scenes: processedScenes // 🌟 Validated & Uploaded Scenes
                },
                decorations: processedRootDecorations,
                styles: {},
                defaultSize: currentSizeKey, // 🌟 [NEW] 사이즈 저장
            } as any;

            const defaultName = initialData?.name || (blocks.length > 1 ? 'Composite Widget' : getLabelByType(blockToSave.type));
            const name = prompt("이 위젯을 저장할 이름을 입력하세요:", defaultName);
            if (!name) return;

            // ✨ 썸네일 자동 생성 및 업로드
            let thumbnailUrl: string | undefined;
            const canvasElement = document.getElementById('widget-canvas-container'); // Canvas 컴포넌트에 ID 부여 필요
            if (canvasElement) {
                try {
                    const dataUrl = await domToPng(canvasElement, {
                        scale: 2,
                        backgroundColor: '#ffffff', // 배경색 보장
                    });
                    const blob = await (await fetch(dataUrl)).blob();
                    const file = new File([blob], `thumb-${Date.now()}.png`, { type: "image/png" });

                    // Post API의 uploadImageToSupabase 재사용 (import 필요)
                    const uploadedUrl = await uploadImageToSupabase(file);
                    thumbnailUrl = uploadedUrl || undefined;
                } catch (imgError) {
                    console.warn("썸네일 생성 실패:", imgError);
                    // 썸네일 실패해도 저장은 진행
                }
            }

            // DB ID 호환성 처리 (_id vs id)
            const targetId = initialData?.id || initialData?._id;
            let result;

            if (targetId) {
                // 수정
                result = await updateWidget(targetId, {
                    ...blockToSave,
                    thumbnailUrl // ✨ 썸네일 URL 추가
                }, name);
                alert(`'${name}' 위젯이 업데이트되었습니다! ☁️`);
            } else {
                // 신규 저장
                result = await saveWidget({
                    ...blockToSave,
                    thumbnailUrl // ✨ 썸네일 URL 추가
                }, name);
                alert(`'${name}' 위젯이 서버에 저장되었습니다! ☁️`);
            }

            // 🌟 저장 후 부모에게 알림 (데이터 갱신용)
            if (onSave && result) {
                onSave(result);
            }

        } catch (e) {
            console.error(e);
            alert('저장에 실패했습니다.');
        }
    };

    // 🌟 삭제 로직 핸들러
    const handleDeleteWidget = async () => {
        if (!initialData || (!initialData.id && !initialData._id)) return;

        if (!confirm('정말 이 위젯을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.')) return;

        try {
            const targetId = initialData.id || initialData._id;
            await deleteWidget(targetId);
            alert('위젯이 삭제되었습니다.');
            onExit(); // 목록으로 돌아가기
        } catch (e) {
            console.error(e);
            alert('삭제 실패');
        }
    };

    const [isLeftOpen, setIsLeftOpen] = useState(true);
    const [isRightOpen, setIsRightOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<Category>('text'); // LeftSidebar에 필요한 상태
    const handleRemoveBlock = removeBlock; // Canvas에 필요한 함수
    const handleUpdateBlock = updateBlock; // Canvas, RightSidebar에 필요한 함수


    return (
        <div className="h-screen bg-[var(--bg-primary)] flex flex-col text-[var(--text-primary)] font-sans transition-colors">
            <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-between px-[3%] w-full shadow-md z-20 gap-2">
                <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                    <button onClick={onExit} className="p-2 hover:bg-[var(--bg-card-secondary)] rounded-full transition text-[var(--text-secondary)]">
                        <ArrowLeft size={20} className="max-md:w-5 max-md:h-5" />
                    </button>
                    <h1 className="text-lg font-bold max-md:text-sm whitespace-nowrap">커스텀 위젯</h1>
                </div>

                {/* 🌟 사이즈 선택 (그룹 분리) */}
                <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide flex-shrink min-w-0">
                    {/* 1. Standard Sizes (Square-ish) */}
                    <div className="flex bg-[var(--bg-card-secondary)] p-1 rounded-lg gap-1">
                        {['1x1', '2x2', '3x3', '4x4'].map((key) => {
                            const val = WIDGET_SIZES[key];
                            if (!val) return null;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setCurrentSizeKey(key as any)}
                                    className={`px-3 py-1 text-xs font-bold rounded transition-colors whitespace-nowrap
max-md:px-2 max-md:text-[10px] max-md:py-1
                                        ${currentSizeKey === key ? 'bg-indigo-600 text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
`}
                                >
                                    {val.label}
                                </button>
                            );
                        })}
                    </div>
                    {/* 2. Irregular Sizes (List) */}
                    <div className="flex bg-[var(--bg-card-secondary)]/50 p-1 rounded-lg border border-dashed border-[var(--border-color)] gap-1">
                        <span className="text-[10px] text-[var(--text-secondary)] self-center px-1 font-bold">ETC</span>
                        {['1x2', '2x1', '2x3', '2x4'].map((key) => {
                            const val = WIDGET_SIZES[key];
                            if (!val) return null;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setCurrentSizeKey(key as any)}
                                    className={`px-2 py-1 text-[10px] font-bold rounded transition-colors whitespace-nowrap
                                        ${currentSizeKey === key ? 'bg-indigo-500 text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
`}
                                >
                                    {val.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* ✨ Custom Size Inputs */}
                    <div className="flex items-center gap-1 bg-[var(--bg-card-secondary)] p-1 rounded-lg border border-[var(--border-color)]">
                        <label className="flex items-center gap-1 px-1">
                            <span className="text-[10px] font-bold text-[var(--text-secondary)]">W</span>
                            <input
                                type="number"
                                value={customSize.w}
                                onChange={(e) => setCustomSize(prev => ({ ...prev, w: Number(e.target.value) }))}
                                className="w-12 bg-transparent text-xs font-bold text-center outline-none border-b border-transparent focus:border-indigo-500 transition-colors"
                            />
                        </label>
                        <div className="w-px h-3 bg-[var(--border-color)] mx-1" />
                        <label className="flex items-center gap-1 px-1">
                            <span className="text-[10px] font-bold text-[var(--text-secondary)]">H</span>
                            <input
                                type="number"
                                value={customSize.h}
                                onChange={(e) => setCustomSize(prev => ({ ...prev, h: Number(e.target.value) }))}
                                className="w-12 bg-transparent text-xs font-bold text-center outline-none border-b border-transparent focus:border-indigo-500 transition-colors"
                            />
                        </label>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                    <button onClick={handleSaveToCloud} className="px-5 py-2 bg-[var(--btn-bg)] hover:brightness-110 text-[var(--btn-text)] text-sm font-bold rounded-lg transition shadow-lg max-md:px-3 max-md:text-xs whitespace-nowrap">
                        <span className="max-md:hidden">{initialData ? '수정 저장' : '저장하기'}</span>
                        <span className="md:hidden">저장</span>
                    </button>
                    {/* 🌟 삭제 버튼 (수정 모드일 때만 표시) */}
                    {initialData && (
                        <button
                            onClick={handleDeleteWidget}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition"
                            title="위젯 삭제"
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                {/* 왼쪽 사이드바 토글 버튼 (중앙 배치 / 모바일: 하단 플로팅) */}
                <button
                    onClick={() => setIsLeftOpen(!isLeftOpen)}
                    className="absolute top-1/2 -translate-y-1/2 z-50 bg-[var(--bg-card)] border border-[var(--border-color)] p-1.5 rounded-full shadow-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-secondary)] transition-all duration-300
                        max-md:fixed max-md:left-4 max-md:top-auto max-md:translate-y-0
                    "
                    style={{
                        left: isLeftOpen ? '270px' : '10px',
                        bottom: isLeftOpen ? 'calc(30vh + 10px)' : '20px' // 모바일: 시트 높이(30vh) + 10px / 닫힘: 20px
                    }}
                    title={isLeftOpen ? "왼쪽 사이드바 접기" : "왼쪽 사이드바 펼치기"}
                >
                    {isLeftOpen ? <PanelLeft size={16} /> : <PanelLeft size={16} />}
                </button>

                <div className={`transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0
                    ${isLeftOpen
                        ? 'w-[280px] opacity-100 max-md:fixed max-md:bottom-0 max-md:left-0 max-md:w-full max-md:h-[30vh] max-md:z-40 max-md:translate-y-0 max-md:border-t max-md:border-[var(--border-color)] max-md:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]'
                        : 'w-0 opacity-0 max-md:fixed max-md:bottom-0 max-md:left-0 max-md:w-full max-md:h-[30vh] max-md:translate-y-full max-md:opacity-100 max-md:z-40'
                    }
                `}>
                    <LeftSidebar
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        onAddBlock={addBlock}
                        onAddDecoration={addDecoration} // [NEW]
                        remainingCapacity={remainingCapacity}
                    />
                </div>
                <div className="flex-1 relative overflow-auto flex items-center justify-center p-8 bg-[var(--bg-primary)]/50" id="widget-canvas-container">
                    <div className="shadow-2xl rounded-3xl overflow-hidden ring-4 ring-black/5 transition-all duration-300 transform-gpu bg-[var(--bg-card)]"
                        style={{
                            width: customSize.w,
                            height: customSize.h,
                        }}
                    >
                        <Canvas
                            blocks={blocks}
                            decorations={decorations}
                            selectedBlockId={selectedBlockId}
                            selectedDecorationId={selectedDecorationId}
                            onSelectBlock={(id) => {
                                setSelectedBlockId(id);
                                setSelectedDecorationId(null);
                            }}
                            onSelectDecoration={handleSelectDecoration}
                            onUpdateBlock={updateBlock}
                            updateDecoration={updateDecoration}
                            currentSize={{
                                ...WIDGET_SIZES[currentSizeKey],
                                w: customSize.w,
                                h: customSize.h
                            }}
                            onRemoveBlock={handleRemoveBlock}
                            onOpenSettings={handleOpenSettings}
                            croppingId={croppingId}
                        />
                    </div>

                    {/* 🌟 Animation Timeline Controls (Moved Outside Canvas) */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-[500px] flex flex-col gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-2 shadow-xl z-50">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1">
                                <Clock size={12} /> ANIMATION TIMELINE
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className={`p-1.5 rounded hover:bg-[var(--bg-card-secondary)] transition-colors ${isPlaying ? 'text-indigo-500' : 'text-[var(--text-primary)]'}`}
                                >
                                    {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                                </button>
                                <div className="flex items-center gap-1 bg-[var(--bg-site)] px-2 py-1 rounded text-[10px] border border-[var(--border-color)]">
                                    <span className="text-[var(--text-secondary)]">Duration:</span>
                                    <input
                                        type="number"
                                        min="0.1"
                                        step="0.1"
                                        value={scenes[currentSceneIndex]?.duration || 1}
                                        onChange={(e) => {
                                            const duration = parseFloat(e.target.value);
                                            setScenes(prev => {
                                                const next = [...prev];
                                                next[currentSceneIndex] = { ...next[currentSceneIndex], duration };
                                                return next;
                                            });
                                        }}
                                        className="w-8 bg-transparent text-right outline-none font-bold"
                                    />
                                    <span className="text-[var(--text-secondary)]">s</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                            {scenes.map((scene, idx) => (
                                <div
                                    key={scene.id}
                                    onClick={() => { setCurrentSceneIndex(idx); setIsPlaying(false); }}
                                    className={`flex-shrink-0 w-16 h-12 rounded border cursor-pointer relative group flex flex-col items-center justify-center gap-1 transition-all ${currentSceneIndex === idx ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500' : 'border-[var(--border-color)] hover:border-[var(--text-secondary)] bg-[var(--bg-site)]'}`}
                                >
                                    <span className="text-[10px] font-bold text-[var(--text-secondary)]">Frame {idx + 1}</span>
                                    {scenes.length > 1 && currentSceneIndex === idx && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (scenes.length <= 1) return;
                                                setScenes(prev => prev.filter((_, i) => i !== idx));
                                                if (currentSceneIndex >= idx && currentSceneIndex > 0) {
                                                    setCurrentSceneIndex(currentSceneIndex - 1);
                                                }
                                            }}
                                            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={8} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={() => {
                                    setScenes(prev => [
                                        ...prev,
                                        {
                                            id: `scene-${Date.now()}`,
                                            decorations: JSON.parse(JSON.stringify(prev[currentSceneIndex].decorations || [])),
                                            blocks: JSON.parse(JSON.stringify(prev[currentSceneIndex].blocks || [])),
                                            duration: prev[currentSceneIndex].duration
                                        }
                                    ]);
                                    setCurrentSceneIndex(scenes.length);
                                    setIsPlaying(false);
                                }}
                                className="flex-shrink-0 w-8 h-12 rounded border border-dashed border-[var(--border-color)] hover:border-indigo-500 hover:text-indigo-500 flex items-center justify-center transition-colors text-[var(--text-secondary)]"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                </div>


                {/* 🌟 모바일용 백드롭 (팝업 뒤 어두운 배경) */}
                {isRightOpen && (
                    <div
                        className="md:hidden fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsRightOpen(false)}
                    />
                )}

                <div className={`transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0
                    ${isRightOpen
                        ? 'w-80 opacity-100 max-md:fixed max-md:top-1/2 max-md:left-1/2 max-md:-translate-x-1/2 max-md:-translate-y-1/2 max-md:w-[90%] max-md:h-[80%] max-md:z-[100] max-md:rounded-2xl max-md:shadow-2xl max-md:border max-md:border-white/20'
                        : 'w-0 opacity-0 max-md:hidden'}
                `}>
                    <RightSidebar
                        selectedBlock={selectedBlock}
                        onUpdateBlock={handleUpdateBlock}
                        onClose={() => {
                            setSelectedBlockId(null);
                            setSelectedDecorationId(null);
                        }}
                        selectedDecoration={decorations.find(d => d.id === selectedDecorationId)}
                        onUpdateDecoration={updateDecoration}
                        onDeleteDecoration={removeDecoration}
                        onCropToggle={handleCropToggle} // ✨ NEW
                        isCropping={croppingId === selectedDecorationId} // ✨ NEW
                    />
                </div>

                {/* 오른쪽 사이드바 토글 버튼 (중앙 배치) - 모바일에서는 숨김 (팝업 오버레이가 덮거나 닫기 버튼으로 대체) */}
                <button
                    onClick={() => setIsRightOpen(!isRightOpen)}
                    className="max-md:hidden absolute top-1/2 -translate-y-1/2 z-50 bg-[var(--bg-card)] border border-[var(--border-color)] p-1.5 rounded-full shadow-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-secondary)] transition-all duration-300"
                    style={{ right: isRightOpen ? '310px' : '10px' }}
                    title={isRightOpen ? "오른쪽 사이드바 접기" : "오른쪽 사이드바 펼치기"}
                >
                    {isRightOpen ? <PanelRight size={16} /> : <PanelRight size={16} />}
                </button>
            </div>
        </div>
    );
};

export default WidgetBuilder;
