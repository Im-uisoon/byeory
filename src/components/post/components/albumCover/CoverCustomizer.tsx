import React, { useState } from 'react';
import { X, Check, Upload, Palette, Image as ImageIcon, Smile, Book, Type, Ban, Sliders, Layers, Droplet } from 'lucide-react';
import { COVER_COLORS, COVER_ILLUSTRATIONS, PATTERN_SHAPES, STICKER_ICONS } from './constants';
import type { AlbumCoverConfig } from './constants';
import AlbumBook from './AlbumBook';

interface Props {
    initialConfig?: AlbumCoverConfig;
    albumTitle: string;
    albumTag?: string;
    onSave: (config: AlbumCoverConfig) => void;
    onClose: () => void;
}

// Custom Color Button Component
const CustomColorButton = ({ value, onChange, size = "md" }: { value?: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, size?: "sm" | "md" | "lg" }) => {
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-9 h-9",
        lg: "w-12 h-12"
    };
    const dim = size === 'lg' ? 'aspect-square' : sizeClasses[size];

    return (
        <div className={`${dim} rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-[1px] cursor-pointer group relative overflow-hidden shrink-0`}>
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center group-hover:bg-opacity-90 transition">
                <div className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center">
                    <input
                        type="color"
                        value={value || '#ffffff'}
                        onChange={onChange}
                        className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 opacity-0 cursor-pointer"
                    />
                    <span className="text-[8px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500 relative z-10 pointer-events-none">CUSTOM</span>
                </div>
            </div>
        </div>
    );
};

const CoverCustomizer: React.FC<Props> = ({ initialConfig, albumTitle, albumTag, onSave, onClose }) => {
    const [config, setConfig] = useState<AlbumCoverConfig>(initialConfig || {
        type: 'solid',
        value: COVER_COLORS[0].value,
        spineColor: COVER_COLORS[0].spine,
        labelColor: COVER_COLORS[0].text
    });

    // Main Tabs: Design (Presets) | My Design (Builder) | Sticker
    const [mainTab, setMainTab] = useState<'design' | 'my-design' | 'sticker'>('design');

    // Sub Tabs for Design: Color | Illustration | Image
    const [designSubTab, setDesignSubTab] = useState<'color' | 'illustration' | 'image'>('color');

    // ✨ Sub Tabs for My Design: Pattern (Shapes/Settings) | Color (All Colors)
    const [myDesignSubTab, setMyDesignSubTab] = useState<'pattern' | 'color'>('pattern');

    // My Design State
    const [myDesignState, setMyDesignState] = useState({
        bg: COVER_COLORS[0].value,
        patternId: 'dots',
        patternColor: '#000000',
        spine: COVER_COLORS[0].spine,
        label: COVER_COLORS[0].text,
        scale: 100,
        posX: 0,
        posY: 0
    });

    const [lastPreset] = useState<AlbumCoverConfig>(config);

    const handleTabChange = (tab: 'design' | 'my-design' | 'sticker') => {
        setMainTab(tab);
        if (tab === 'design') {
            setConfig(lastPreset);
        }
    };

    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    // ✨ Update Config based on MyDesign State
    React.useEffect(() => {
        if (mainTab === 'my-design') {
            if (myDesignState.patternId === 'none') {
                setConfig(prev => ({
                    ...prev,
                    type: 'solid',
                    value: myDesignState.bg,
                    spineColor: myDesignState.spine,
                    labelColor: myDesignState.label,
                    backgroundColor: undefined,
                    backgroundSize: undefined,
                    patternScale: undefined,
                    patternPositionX: undefined,
                    patternPositionY: undefined
                }));
            } else {
                const shape = PATTERN_SHAPES.find(s => s.id === myDesignState.patternId);
                if (shape) {
                    const generatedValue = shape.generate(myDesignState.patternColor);
                    setConfig(prev => ({
                        ...prev,
                        type: 'pattern',
                        value: generatedValue,
                        backgroundColor: myDesignState.bg,
                        spineColor: myDesignState.spine,
                        labelColor: myDesignState.label,
                        backgroundSize: shape.size,
                        patternScale: myDesignState.scale,
                        patternPositionX: myDesignState.posX,
                        patternPositionY: myDesignState.posY
                    }));
                }
            }
        }
    }, [myDesignState, mainTab]);

    const selectColor = (color: typeof COVER_COLORS[0]) => {
        setConfig(prev => ({
            ...prev,
            type: 'solid',
            value: color.value,
            spineColor: color.spine,
            labelColor: color.text,
            backgroundColor: undefined,
            backgroundSize: undefined
        }));
    };

    const selectIllustration = (illu: typeof COVER_ILLUSTRATIONS[0]) => {
        setConfig(prev => ({
            ...prev,
            type: 'illustration',
            value: illu.value,
            spineColor: illu.spineColor,
            labelColor: illu.textColor || '#1f2937'
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setConfig(prev => ({
                    ...prev,
                    type: 'image',
                    value: '#ffffff',
                    customImage: reader.result as string,
                    spineColor: '#e5e7eb',
                    labelColor: '#1f2937'
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[var(--bg-card)] w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl flex flex-col h-[85vh] max-h-[800px] border border-[var(--border-color)] font-sans">
                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-card)] z-10 shrink-0">
                    <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 transition -ml-2">
                        <X size={24} />
                    </button>
                    <h2 className="text-[var(--text-primary)] font-bold text-lg">표지 꾸미기</h2>
                    <div className="flex items-center gap-2 -mr-2">
                        <button
                            onClick={() => onSave(config)}
                            className="text-indigo-600 hover:text-indigo-700 font-bold p-2 transition"
                        >
                            완료
                        </button>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="flex-1 bg-[var(--bg-card-secondary)] flex items-center justify-center p-8 min-h-[320px] relative overflow-hidden shrink-0">
                    <div className="w-48 h-60 relative z-30 shadow-2xl transform hover:scale-105 transition duration-500">
                        <AlbumBook config={config} title={albumTitle} tag={albumTag} className="w-full h-full" />
                    </div>
                    {/* Background decoration */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
                        style={{
                            backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }}
                    />
                </div>

                {/* Controls Area (Panel) */}
                <div className="bg-[var(--bg-card)] rounded-t-[32px] -mt-6 pt-2 pb-6 px-4 flex-1 flex flex-col min-h-[400px] shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)] relative z-20 shrink-0 h-[55%]">

                    {/* Main Category Tabs */}
                    <div className="flex justify-center gap-8 border-b border-[var(--border-color)] mb-4 shrink-0">
                        <button
                            onClick={() => handleTabChange('design')}
                            className={`pb-3 text-sm font-bold transition-all border-b-2 ${mainTab === 'design' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        >
                            디자인
                        </button>
                        <button
                            onClick={() => handleTabChange('my-design')}
                            className={`pb-3 text-sm font-bold transition-all border-b-2 ${mainTab === 'my-design' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        >
                            나만의 커스텀
                        </button>
                        <button
                            onClick={() => handleTabChange('sticker')}
                            className={`pb-3 text-sm font-bold transition-all border-b-2 ${mainTab === 'sticker' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        >
                            스티커
                        </button>
                    </div>

                    {/* Content Scroll Area */}
                    <div className="overflow-y-auto flex-1 px-1 custom-scrollbar">

                        {/* 1. Design Tab Content */}
                        {mainTab === 'design' && (
                            <>
                                <div className="flex gap-2 mb-5 overflow-x-auto pb-2 no-scrollbar px-1">
                                    {[
                                        { id: 'color', label: '색상', icon: Palette },
                                        { id: 'illustration', label: '일러스트', icon: Smile },
                                        { id: 'image', label: '사진', icon: ImageIcon }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setDesignSubTab(tab.id as any)}
                                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${designSubTab === tab.id
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                                                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)] hover:bg-[var(--bg-card-secondary)]'}`}
                                        >
                                            <tab.icon size={12} />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {designSubTab === 'color' && (
                                    <div className="grid grid-cols-5 gap-3">
                                        {COVER_COLORS.map(color => (
                                            <button
                                                key={color.name}
                                                onClick={() => selectColor(color)}
                                                className={`aspect-square rounded-full border border-black/5 relative transition-all ${config.value === color.value ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110 shadow-lg' : 'hover:scale-105'}`}
                                                style={{ backgroundColor: color.value }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                )}

                                {designSubTab === 'illustration' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        {COVER_ILLUSTRATIONS.map(illu => (
                                            <button
                                                key={illu.id}
                                                onClick={() => selectIllustration(illu)}
                                                className={`aspect-[4/3] rounded-xl overflow-hidden border border-[var(--border-color)] relative transition-all group ${config.value === illu.value ? 'ring-2 ring-indigo-500 shadow-lg scale-[1.02]' : 'hover:shadow-md hover:-translate-y-1'}`}
                                            >
                                                <div className="w-full h-full" style={{ backgroundImage: illu.value }} />
                                                <span className="absolute bottom-2 left-2 text-[10px] text-white font-bold drop-shadow-md bg-black/10 backdrop-blur-sm px-2 py-0.5 rounded-full">{illu.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {designSubTab === 'image' && (
                                    <div className="pt-2">
                                        <label className="w-full flex flex-col items-center justify-center h-40 border-2 border-dashed border-[var(--border-color)] rounded-2xl cursor-pointer hover:bg-[var(--bg-card-secondary)] hover:border-indigo-400 transition-all group bg-[var(--bg-card-secondary)]/50">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-12 h-12 rounded-full bg-[var(--bg-card)] shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                    <Upload className="w-5 h-5 text-indigo-500" />
                                                </div>
                                                <p className="text-sm text-[var(--text-primary)] font-bold">사진 업로드하기</p>
                                                <p className="text-xs text-[var(--text-secondary)] mt-1">PNG, JPG files supported</p>
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        </label>
                                        {config.customImage && (
                                            <div className="mt-4 relative rounded-xl overflow-hidden h-32 w-full border border-[var(--border-color)]">
                                                <img src={config.customImage} alt="Uploaded" className="w-full h-full object-cover" />
                                                <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                                    <Check size={10} /> 사용 중
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* 2. My Design Content (Builder) - SUB TABS */}
                        {mainTab === 'my-design' && (
                            <div className="flex flex-col h-full">
                                {/* Sub Tabs: Pattern | Color */}
                                <div className="flex bg-[var(--bg-card-secondary)] rounded-xl p-1 mb-6 mx-1 shrink-0">
                                    <button
                                        onClick={() => setMyDesignSubTab('pattern')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${myDesignSubTab === 'pattern' ? 'bg-white text-indigo-600 shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                    >
                                        <Layers size={14} />
                                        무늬 설정
                                    </button>
                                    <button
                                        onClick={() => setMyDesignSubTab('color')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${myDesignSubTab === 'color' ? 'bg-white text-indigo-600 shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                    >
                                        <Droplet size={14} />
                                        색상 설정
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-4">
                                    {/* Pattern Tab Content */}
                                    {myDesignSubTab === 'pattern' && (
                                        <div className="space-y-6">
                                            {/* Pattern Shape Grid */}
                                            <div>
                                                <h4 className="text-xs font-bold text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                                                    <Layers size={14} /> 무늬 선택
                                                </h4>
                                                <div className="grid grid-cols-4 gap-2">
                                                    <button
                                                        onClick={() => setMyDesignState(prev => ({ ...prev, patternId: 'none' }))}
                                                        className={`aspect-square flex flex-col items-center justify-center rounded-xl border transition-all ${myDesignState.patternId === 'none'
                                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md ring-1 ring-indigo-200'
                                                            : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--border-color)] hover:shadow-sm text-[var(--text-secondary)]'}`}
                                                    >
                                                        <div className="w-8 h-8 rounded-lg mb-1.5 border border-black/5 flex items-center justify-center bg-gray-50 text-gray-400">
                                                            <Ban size={16} />
                                                        </div>
                                                        <span className="text-[10px] font-bold">없음</span>
                                                    </button>

                                                    {PATTERN_SHAPES.map(shape => (
                                                        <button
                                                            key={shape.id}
                                                            onClick={() => setMyDesignState(prev => ({ ...prev, patternId: shape.id }))}
                                                            className={`aspect-square flex flex-col items-center justify-center rounded-xl border transition-all ${myDesignState.patternId === shape.id
                                                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md ring-1 ring-indigo-200'
                                                                : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--border-color)] hover:shadow-sm text-[var(--text-secondary)]'}`}
                                                        >
                                                            <div className="w-8 h-8 rounded-lg mb-1.5 border border-black/5 shadow-inner overflow-hidden"
                                                                style={{
                                                                    backgroundImage: shape.generate(myDesignState.patternColor),
                                                                    backgroundColor: myDesignState.bg
                                                                }}
                                                            />
                                                            <span className="text-[10px] font-bold">{shape.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Pattern Details Sliders (Only if pattern selected) */}
                                            {myDesignState.patternId !== 'none' && (
                                                <div className="bg-[var(--bg-card-secondary)]/50 rounded-2xl p-5 border border-[var(--border-color)]">
                                                    <h4 className="text-xs font-bold text-[var(--text-secondary)] mb-4 flex items-center gap-2">
                                                        <Sliders size={14} /> 상세 조절
                                                    </h4>
                                                    <div className="space-y-4">
                                                        {/* Scale */}
                                                        <div>
                                                            <div className="flex justify-between items-center mb-1.5">
                                                                <span className="text-[11px] font-bold text-gray-500">크기 (반복)</span>
                                                                <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{myDesignState.scale}%</span>
                                                            </div>
                                                            <input
                                                                type="range"
                                                                min="50"
                                                                max="200"
                                                                value={myDesignState.scale}
                                                                onChange={(e) => setMyDesignState(prev => ({ ...prev, scale: parseInt(e.target.value) }))}
                                                                className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                                                            />
                                                        </div>

                                                        {/* Position */}
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <div className="flex justify-between items-center mb-1.5">
                                                                    <span className="text-[11px] font-bold text-gray-500">가로 이동</span>
                                                                    <span className="text-[10px] font-mono text-indigo-600">{myDesignState.posX}%</span>
                                                                </div>
                                                                <input
                                                                    type="range"
                                                                    min="0"
                                                                    max="100"
                                                                    value={myDesignState.posX}
                                                                    onChange={(e) => setMyDesignState(prev => ({ ...prev, posX: parseInt(e.target.value) }))}
                                                                    className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="flex justify-between items-center mb-1.5">
                                                                    <span className="text-[11px] font-bold text-gray-500">세로 이동</span>
                                                                    <span className="text-[10px] font-mono text-indigo-600">{myDesignState.posY}%</span>
                                                                </div>
                                                                <input
                                                                    type="range"
                                                                    min="0"
                                                                    max="100"
                                                                    value={myDesignState.posY}
                                                                    onChange={(e) => setMyDesignState(prev => ({ ...prev, posY: parseInt(e.target.value) }))}
                                                                    className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Color Tab Content */}
                                    {myDesignSubTab === 'color' && (
                                        <div className="space-y-6">
                                            {/* Background Color */}
                                            <div>
                                                <h4 className="text-xs font-bold text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                                                    <Palette size={14} /> 배경 색상
                                                </h4>
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    {[...COVER_COLORS, { name: 'White', value: '#ffffff' }, { name: 'Black', value: '#000000' }].map(color => (
                                                        <button
                                                            key={color.value}
                                                            onClick={() => setMyDesignState(prev => ({ ...prev, bg: color.value }))}
                                                            className={`w-9 h-9 rounded-full border border-gray-200 flex-shrink-0 transition ${myDesignState.bg === color.value ? 'ring-2 ring-indigo-500 scale-110 shadow-sm' : 'hover:scale-105'}`}
                                                            style={{ backgroundColor: color.value }}
                                                        />
                                                    ))}
                                                    <CustomColorButton
                                                        value={myDesignState.bg}
                                                        onChange={(e) => setMyDesignState(prev => ({ ...prev, bg: e.target.value }))}
                                                        size="md"
                                                    />
                                                </div>
                                            </div>

                                            {/* Pattern Color (Only if pattern != none) */}
                                            {myDesignState.patternId !== 'none' && (
                                                <div>
                                                    <h4 className="text-xs font-bold text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                                                        <Layers size={14} /> 무늬 색상
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2 items-center">
                                                        {[{ name: 'Black', value: '#000000' }, { name: 'White', value: '#ffffff' }, ...COVER_COLORS].map(color => (
                                                            <button
                                                                key={color.value}
                                                                onClick={() => setMyDesignState(prev => ({ ...prev, patternColor: color.value }))}
                                                                className={`w-9 h-9 rounded-lg border border-gray-200 flex-shrink-0 transition ${myDesignState.patternColor === color.value ? 'ring-2 ring-indigo-500 scale-110 shadow-sm' : 'hover:scale-105'}`}
                                                                style={{ backgroundColor: color.value }}
                                                            />
                                                        ))}
                                                        <CustomColorButton
                                                            value={myDesignState.patternColor}
                                                            onChange={(e) => setMyDesignState(prev => ({ ...prev, patternColor: e.target.value }))}
                                                            size="md"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Spine & Label Colors */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-[var(--bg-card-secondary)]/30 p-4 rounded-xl border border-[var(--border-color)]">
                                                    <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-2">
                                                        <Book size={14} /> 책등 색상
                                                    </h4>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden relative shadow-sm hover:scale-105 transition cursor-pointer">
                                                            <input
                                                                type="color"
                                                                value={myDesignState.spine}
                                                                onChange={(e) => setMyDesignState(prev => ({ ...prev, spine: e.target.value }))}
                                                                className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer"
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-mono text-gray-500 uppercase">{myDesignState.spine}</span>
                                                    </div>
                                                </div>

                                                <div className="bg-[var(--bg-card-secondary)]/30 p-4 rounded-xl border border-[var(--border-color)]">
                                                    <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-2">
                                                        <Type size={14} /> 글자 색상
                                                    </h4>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden relative shadow-sm hover:scale-105 transition cursor-pointer">
                                                            <input
                                                                type="color"
                                                                value={myDesignState.label}
                                                                onChange={(e) => setMyDesignState(prev => ({ ...prev, label: e.target.value }))}
                                                                className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer"
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-mono text-gray-500 uppercase">{myDesignState.label}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 3. Sticker Content */}
                        {mainTab === 'sticker' && (
                            <div className="pt-2">
                                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 px-2">스티커 선택</h3>
                                <div className="grid grid-cols-5 gap-3 p-1">
                                    {STICKER_ICONS.map(sticker => (
                                        <button
                                            key={sticker}
                                            onClick={() => setConfig(prev => ({ ...prev, sticker }))}
                                            className={`aspect-square flex items-center justify-center text-2xl rounded-xl transition hover:bg-[var(--bg-card-secondary)] hover:scale-110 ${config.sticker === sticker ? 'bg-indigo-50 ring-2 ring-indigo-500' : ''}`}
                                        >
                                            {sticker}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setConfig(prev => ({ ...prev, sticker: undefined }))}
                                        className="aspect-square flex items-center justify-center rounded-xl bg-[var(--bg-card-secondary)] text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 transition border border-dashed border-[var(--border-color)]"
                                        title="스티커 제거"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                    height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 4px;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default CoverCustomizer;
