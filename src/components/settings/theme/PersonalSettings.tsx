import {
    ArrowLeft, Check, X, Type, Star, PenTool, RotateCcw, ChevronDown, Palette,
    ArrowUp, ArrowUpRight, ArrowRight, ArrowDownRight, ArrowDown, ArrowDownLeft, ArrowLeft as ArrowLeftIcon, ArrowUpLeft
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface PersonalSettingsProps {
    onBack: () => void;
    onClose: () => void;
    currentTheme: string;
    onThemeChange: (theme: string) => void;
}

type Tab = 'font' | 'recommended' | 'manual';
type ManualSubTab = 'text' | 'colors';

const fontFamilies = [
    { name: 'Noto Sans KR', value: "'Noto Sans KR', sans-serif" },
    { name: 'Jua', value: "'Jua', sans-serif" },
    { name: 'Nanum Gothic', value: "'Nanum Gothic', sans-serif" },
    { name: 'Roboto', value: "'Roboto', sans-serif" },
    { name: 'System Default', value: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" },
];

const DEFAULT_FONT_FAMILY = "'Noto Sans KR', sans-serif";
const DEFAULT_FONT_SIZE = 16;

// Simplified directions for UI (User picks where it points TO)
const DIRECTIONS = [
    { value: 'to top left', icon: ArrowUpLeft },
    { value: 'to top', icon: ArrowUp },
    { value: 'to top right', icon: ArrowUpRight },
    { value: 'to left', icon: ArrowLeftIcon },
    { value: 'to right', icon: ArrowRight },
    { value: 'to bottom left', icon: ArrowDownLeft },
    { value: 'to bottom', icon: ArrowDown },
    { value: 'to bottom right', icon: ArrowDownRight },
];

const TEXT_COLORS = [
    '#000000', // Black
    '#333333', // Dark Gray
    '#555555', // Gray
    '#ef4444', // Red
    '#3b82f6', // Blue
    '#22c55e', // Green
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
];

const BG_COLORS = [
    '#ffffff', '#f8fafc', '#f0f9ff', '#f0fdf4',
    '#fefce8', '#fff7ed', '#fef2f2', '#faf5ff'
];

export default function PersonalSettings({ onBack, onClose, currentTheme, onThemeChange }: PersonalSettingsProps) {
    const [activeTab, setActiveTab] = useState<Tab>('manual');
    const [manualSubTab, setManualSubTab] = useState<ManualSubTab>('colors');

    // Font State
    const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('fontFamily') || DEFAULT_FONT_FAMILY);
    const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem('fontSize') || String(DEFAULT_FONT_SIZE)));
    const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Manual Theme State - Text
    const [manualTextColor, setManualTextColor] = useState(() => localStorage.getItem('manualTextColor') || '#1a1a1a');
    const [manualTextIntensity, setManualTextIntensity] = useState(() => parseInt(localStorage.getItem('manualTextIntensity') || '100'));

    // Manual Theme State - Background
    const [isGradient, setIsGradient] = useState(() => localStorage.getItem('manualIsGradient') === 'true');
    const [manualBgColor, setManualBgColor] = useState(() => localStorage.getItem('manualBgColor') || '#ffffff'); // Solid Base
    const [manualBgIntensity, setManualBgIntensity] = useState(() => parseInt(localStorage.getItem('manualBgIntensity') || '100')); // Solid Intensity

    // Gradient State
    const [gradientDirection, setGradientDirection] = useState(() => localStorage.getItem('manualGradientDirection') || 'to bottom right');
    const [gradientStartColor, setGradientStartColor] = useState(() => localStorage.getItem('manualGradientStartColor') || '#ffffff');
    const [gradientEndColor, setGradientEndColor] = useState(() => localStorage.getItem('manualGradientEndColor') || '#3b82f6');

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsFontDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const recommendedThemes = [
        { id: 'custom-purple', name: 'Purple', previewClass: 'bg-gradient-to-br from-[#e0c3fc] to-[#8ec5fc]' },
        { id: 'custom-green', name: 'Green', previewClass: 'bg-gradient-to-br from-[#d4fc79] to-[#96e6a1]' },
        { id: 'custom-blue', name: 'Blue', previewClass: 'bg-gradient-to-br from-[#89f7fe] to-[#66a6ff]' },
        { id: 'custom-red', name: 'Red', previewClass: 'bg-gradient-to-br from-[#ff9a9e] to-[#fecfef]' },
        { id: 'custom-orange', name: 'Orange', previewClass: 'bg-gradient-to-br from-[#f6d365] to-[#fda085]' },
        { id: 'custom-pink', name: 'Pink', previewClass: 'bg-gradient-to-br from-[#ffc3a0] to-[#ffafbd]' },
        { id: 'custom-teal', name: 'Teal', previewClass: 'bg-gradient-to-br from-[#84fab0] to-[#8fd3f4]' },
        { id: 'custom-indigo', name: 'Indigo', previewClass: 'bg-gradient-to-br from-[#a18cd1] to-[#fbc2eb]' },
        { id: 'custom-gray', name: 'Gray', previewClass: 'bg-gradient-to-t from-[#cfd9df] to-[#e2ebf0]' },
        { id: 'custom-sunset', name: 'Sunset', previewClass: 'bg-gradient-to-br from-[#fa709a] to-[#fee140]' },
        { id: 'custom-ocean', name: 'Ocean', previewClass: 'bg-gradient-to-t from-[#48c6ef] to-[#6f86d6]' },
        { id: 'custom-forest', name: 'Forest', previewClass: 'bg-gradient-to-br from-[#f093fb] to-[#f5576c]' },
    ];

    const handleSaveFont = () => {
        document.documentElement.style.setProperty('--font-family', fontFamily);
        document.documentElement.style.setProperty('--font-size', `${fontSize}px`);
        localStorage.setItem('fontFamily', fontFamily);
        localStorage.setItem('fontSize', `${fontSize}px`);
    };

    const handleResetFont = () => {
        setFontFamily(DEFAULT_FONT_FAMILY);
        setFontSize(DEFAULT_FONT_SIZE);
    };

    const getFontName = (value: string) => {
        return fontFamilies.find(f => f.value === value)?.name || 'Custom Font';
    };

    const applyManualTheme = () => {
        onThemeChange('manual');

        // Apply Text Settings
        const tr = parseInt(manualTextColor.slice(1, 3), 16);
        const tg = parseInt(manualTextColor.slice(3, 5), 16);
        const tb = parseInt(manualTextColor.slice(5, 7), 16);
        document.documentElement.style.setProperty('--manual-text-color', `${tr}, ${tg}, ${tb}`);
        document.documentElement.style.setProperty('--manual-text-intensity', `${manualTextIntensity / 100}`);
        localStorage.setItem('manualTextColor', manualTextColor);
        localStorage.setItem('manualTextIntensity', String(manualTextIntensity));

        // Apply Background Settings
        localStorage.setItem('manualIsGradient', String(isGradient));

        if (isGradient) {
            const gradientValue = `linear-gradient(${gradientDirection}, ${gradientStartColor}, ${gradientEndColor})`;
            document.documentElement.style.setProperty('--manual-gradient', gradientValue);
            document.documentElement.style.setProperty('--manual-bg-intensity', '0'); // Hide solid bg

            localStorage.setItem('manualGradientDirection', gradientDirection);
            localStorage.setItem('manualGradientStartColor', gradientStartColor);
            localStorage.setItem('manualGradientEndColor', gradientEndColor);
        } else {
            document.documentElement.style.setProperty('--manual-gradient', 'none');

            const br = parseInt(manualBgColor.slice(1, 3), 16);
            const bg = parseInt(manualBgColor.slice(3, 5), 16);
            const bb = parseInt(manualBgColor.slice(5, 7), 16);
            document.documentElement.style.setProperty('--manual-bg-color', `${br}, ${bg}, ${bb}`);
            document.documentElement.style.setProperty('--manual-bg-intensity', `${manualBgIntensity / 100}`);

            localStorage.setItem('manualBgColor', manualBgColor);
            localStorage.setItem('manualBgIntensity', String(manualBgIntensity));
        }
    };

    const handleResetManualTheme = () => {
        setManualTextColor('#1a1a1a');
        setManualTextIntensity(100);
        setIsGradient(false);
        setManualBgColor('#ffffff');
        setManualBgIntensity(100);
        setGradientDirection('to bottom right');
        setGradientStartColor('#ffffff');
        setGradientEndColor('#3b82f6');
    };

    const ColorPicker = ({ label, color, onChange, colors }: { label: string, color: string, onChange: (c: string) => void, colors: string[] }) => (
        <div className="space-y-3">
            <label className="text-sm font-medium theme-text-primary">{label}</label>
            <div className="flex flex-wrap gap-3 p-2">
                {colors.map((c) => (
                    <button
                        key={c}
                        onClick={() => onChange(c)}
                        className={`
                            w-10 h-10 rounded-full shadow-sm transition-transform hover:scale-110 focus:outline-none border border-gray-200
                            ${color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}
                        `}
                        style={{ backgroundColor: c }}
                    />
                ))}
                <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm transition-transform hover:scale-110 cursor-pointer ring-1 ring-gray-200">
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                    />
                    <Palette className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 theme-text-secondary hover:bg-black/5 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl theme-text-primary">개인 설정</h2>
                </div>
                <button onClick={onClose} className="p-2 theme-text-secondary hover:bg-black/5 rounded-full transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 theme-bg-card-secondary p-1 rounded-xl mb-6">
                <button
                    onClick={() => setActiveTab('font')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'font'
                        ? 'theme-bg-card theme-text-primary shadow-sm'
                        : 'theme-text-secondary hover:bg-black/5'
                        }`}
                >
                    <Type className="w-4 h-4" />
                    폰트
                </button>
                <button
                    onClick={() => setActiveTab('recommended')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'recommended'
                        ? 'theme-bg-card theme-text-primary shadow-sm'
                        : 'theme-text-secondary hover:bg-black/5'
                        }`}
                >
                    <Star className="w-4 h-4" />
                    추천 테마
                </button>
                <button
                    onClick={() => setActiveTab('manual')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'manual'
                        ? 'theme-bg-card theme-text-primary shadow-sm'
                        : 'theme-text-secondary hover:bg-black/5'
                        }`}
                >
                    <PenTool className="w-4 h-4" />
                    수동 테마
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'font' && (
                    <div className="space-y-6">
                        {/* Preview Box */}
                        <div className="relative theme-bg-card-secondary rounded-xl p-8 min-h-[120px] flex flex-col justify-center transition-all duration-200"
                            style={{ fontFamily: fontFamily, fontSize: `${fontSize}px` }}>

                            <p className="theme-text-primary font-bold mb-2">다람쥐 헌 쳇바퀴에 타고파</p>
                            <p className="theme-text-secondary">The quick brown fox jumps over the lazy dog.</p>

                            {/* "미리보기" Label Positioned Bottom Right inside the box */}
                            <span className="absolute bottom-3 right-4 text-xs theme-text-secondary opacity-60 font-sans">
                                미리보기
                            </span>
                        </div>

                        {/* Font Family Dropdown */}
                        <div className="space-y-3" ref={dropdownRef}>
                            <label className="text-sm font-medium theme-text-primary">폰트 종류</label>
                            <div className="relative">
                                <button
                                    onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
                                    className="w-full flex items-center justify-between p-3 rounded-lg theme-border border theme-bg-card theme-text-primary hover:bg-black/5 transition-colors"
                                >
                                    <span style={{ fontFamily: fontFamily }}>{getFontName(fontFamily)}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isFontDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isFontDropdownOpen && (
                                    <div className="absolute z-10 w-full mt-1 theme-bg-card theme-border border rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                                        {fontFamilies.map((font) => (
                                            <button
                                                key={font.name}
                                                onClick={() => {
                                                    setFontFamily(font.value);
                                                    setIsFontDropdownOpen(false);
                                                }}
                                                className={`
                                                    w-full flex items-center justify-between p-3 text-left hover:bg-black/5 transition-colors
                                                    ${fontFamily === font.value ? 'bg-black/5 theme-text-primary font-bold' : 'theme-text-secondary'}
                                                `}
                                            >
                                                <span style={{ fontFamily: font.value }}>{font.name}</span>
                                                {fontFamily === font.value && <Check className="w-4 h-4 theme-text-primary" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Font Size Selection */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium theme-text-primary">폰트 크기</label>
                                <span className="text-sm theme-text-primary font-bold">{fontSize}px</span>
                            </div>
                            <input
                                type="range"
                                min="12"
                                max="24"
                                step="1"
                                value={fontSize}
                                onChange={(e) => setFontSize(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[color:var(--btn-bg)]"
                            />
                            <div className="flex justify-between text-xs theme-text-secondary">
                                <span>작게</span>
                                <span>보통</span>
                                <span>크게</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-8 pt-4 border-t theme-border">
                            <button
                                onClick={handleResetFont}
                                className="flex-1 py-3 rounded-xl font-medium theme-bg-card theme-border border theme-text-secondary hover:bg-black/5 flex items-center justify-center gap-2 transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" />
                                초기화
                            </button>
                            <button
                                onClick={handleSaveFont}
                                className="flex-1 py-3 rounded-xl font-bold theme-btn flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
                            >
                                <Check className="w-4 h-4" />
                                완료
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'recommended' && (
                    <div className="grid grid-cols-3 gap-3">
                        {recommendedThemes.map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => onThemeChange(theme.id)}
                                style={{
                                    borderColor: currentTheme === theme.id ? 'var(--text-primary)' : 'var(--border-color)'
                                }}
                                className={`
                                    relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200
                                    theme-bg-card
                                    ${currentTheme === theme.id ? 'bg-black/5' : 'hover:bg-black/5'}
                                `}
                            >
                                {/* Preview Circle */}
                                <div className={`w-10 h-10 rounded-full mb-2 shadow-inner ${theme.previewClass}`} />

                                <span className={`text-sm font-medium ${currentTheme === theme.id ? 'theme-text-primary' : 'theme-text-secondary'}`}>
                                    {theme.name}
                                </span>

                                {currentTheme === theme.id && (
                                    <div className="absolute top-2 right-2 theme-btn rounded-full p-0.5">
                                        <Check className="w-2 h-2 text-white" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {activeTab === 'manual' && (
                    <div className="space-y-6">
                        {/* Sub-tabs for Manual Settings */}
                        <div className="flex p-1 theme-bg-card-secondary rounded-lg mb-4">
                            <button
                                onClick={() => setManualSubTab('text')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${manualSubTab === 'text'
                                    ? 'theme-bg-card theme-text-primary shadow-sm'
                                    : 'theme-text-secondary hover:bg-black/5'
                                    }`}
                            >
                                Text
                            </button>
                            <button
                                onClick={() => setManualSubTab('colors')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${manualSubTab === 'colors'
                                    ? 'theme-bg-card theme-text-primary shadow-sm'
                                    : 'theme-text-secondary hover:bg-black/5'
                                    }`}
                            >
                                Colors
                            </button>
                        </div>

                        {/* Text Section */}
                        {manualSubTab === 'text' && (
                            <div className="space-y-6">
                                {/* Preview Box */}
                                <div
                                    className="relative rounded-xl p-8 min-h-[120px] flex flex-col justify-center transition-all duration-200 shadow-inner theme-bg-card-secondary"
                                >
                                    <p className="font-bold mb-2 text-xl" style={{
                                        color: `rgba(${parseInt(manualTextColor.slice(1, 3), 16)}, ${parseInt(manualTextColor.slice(3, 5), 16)}, ${parseInt(manualTextColor.slice(5, 7), 16)}, ${manualTextIntensity / 100})`
                                    }}>
                                        다람쥐 헌 쳇바퀴에 타고파
                                    </p>
                                    <p className="theme-text-secondary">The quick brown fox jumps over the lazy dog.</p>
                                    <span className="absolute bottom-3 right-4 text-xs theme-text-secondary opacity-60 font-sans">
                                        미리보기
                                    </span>
                                </div>

                                {/* Color Selection */}
                                <ColorPicker
                                    label="텍스트 색상 (Text Color)"
                                    color={manualTextColor}
                                    onChange={setManualTextColor}
                                    colors={TEXT_COLORS}
                                />

                                {/* Intensity Slider */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium theme-text-primary">투명도 (Opacity)</label>
                                        <span className="text-sm theme-text-primary font-bold">{manualTextIntensity}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={manualTextIntensity}
                                        onChange={(e) => setManualTextIntensity(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[color:var(--btn-bg)]"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Colors Section (Background) */}
                        {manualSubTab === 'colors' && (
                            <div className="space-y-6">
                                {/* Preview Box */}
                                <div
                                    className="relative rounded-xl p-8 min-h-[120px] flex flex-col justify-center transition-all duration-200 shadow-inner"
                                    style={{
                                        background: isGradient
                                            ? `linear-gradient(${gradientDirection}, ${gradientStartColor}, ${gradientEndColor})`
                                            : `rgba(${parseInt(manualBgColor.slice(1, 3), 16)}, ${parseInt(manualBgColor.slice(3, 5), 16)}, ${parseInt(manualBgColor.slice(5, 7), 16)}, ${manualBgIntensity / 100})`,
                                        borderColor: isGradient ? gradientEndColor : manualBgColor
                                    }}
                                >
                                    <p className="font-bold mb-2 theme-text-primary">다람쥐 헌 쳇바퀴에 타고파</p>
                                    <p className="theme-text-secondary">The quick brown fox jumps over the lazy dog.</p>
                                    <span className="absolute bottom-3 right-4 text-xs theme-text-secondary opacity-60 font-sans">
                                        미리보기
                                    </span>
                                </div>

                                {/* Mode Toggle */}
                                <div className="flex items-center justify-between p-3 rounded-xl theme-bg-card-secondary">
                                    <span className="font-medium theme-text-primary">그라데이션 사용</span>
                                    <button
                                        onClick={() => setIsGradient(!isGradient)}
                                        className={`
                                            relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
                                            ${isGradient ? 'bg-blue-600' : 'bg-gray-200'}
                                        `}
                                    >
                                        <span
                                            className={`
                                                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                                ${isGradient ? 'translate-x-6' : 'translate-x-1'}
                                            `}
                                        />
                                    </button>
                                </div>

                                {!isGradient ? (
                                    <>
                                        {/* Solid Color Selection */}
                                        <ColorPicker
                                            label="배경 색상 (Base Color)"
                                            color={manualBgColor}
                                            onChange={setManualBgColor}
                                            colors={BG_COLORS}
                                        />

                                        {/* Intensity Slider */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <label className="text-sm font-medium theme-text-primary">투명도 (Opacity)</label>
                                                <span className="text-sm theme-text-primary font-bold">{manualBgIntensity}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="1"
                                                value={manualBgIntensity}
                                                onChange={(e) => setManualBgIntensity(parseInt(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[color:var(--btn-bg)]"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Gradient Direction */}
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium theme-text-primary">방향 (Direction)</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {DIRECTIONS.map((dir) => (
                                                    <button
                                                        key={dir.value}
                                                        onClick={() => setGradientDirection(dir.value)}
                                                        className={`
                                                            flex items-center justify-center p-2 rounded-lg border transition-all
                                                            ${gradientDirection === dir.value
                                                                ? 'theme-bg-card theme-border border-blue-500 text-blue-500 shadow-sm'
                                                                : 'theme-bg-card-secondary border-transparent theme-text-secondary hover:bg-black/5'}
                                                        `}
                                                    >
                                                        <dir.icon className="w-5 h-5" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Start Color */}
                                        <ColorPicker
                                            label="시작 색상 (Start Color)"
                                            color={gradientStartColor}
                                            onChange={setGradientStartColor}
                                            colors={BG_COLORS}
                                        />

                                        {/* End Color */}
                                        <ColorPicker
                                            label="끝 색상 (End Color)"
                                            color={gradientEndColor}
                                            onChange={setGradientEndColor}
                                            colors={BG_COLORS}
                                        />
                                    </>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-8 pt-4 border-t theme-border">
                            <button
                                onClick={handleResetManualTheme}
                                className="flex-1 py-3 rounded-xl font-medium theme-bg-card theme-border border theme-text-secondary hover:bg-black/5 flex items-center justify-center gap-2 transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" />
                                초기화
                            </button>
                            <button
                                onClick={applyManualTheme}
                                className="flex-1 py-3 rounded-xl font-bold theme-btn flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
                            >
                                <Check className="w-4 h-4" />
                                완료
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
