import {
    ArrowLeft, Check, X, Type, Star, PenTool, RotateCcw, ChevronDown, Palette,
    ArrowUp, ArrowUpRight, ArrowRight, ArrowDownRight, ArrowDown, ArrowDownLeft, ArrowLeft as ArrowLeftIcon, ArrowUpLeft, Image as ImageIcon
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface PersonalSettingsProps {
    onBack: () => void;
    onClose: () => void;
    currentTheme: string;
    onThemeChange: (theme: string) => void;
}

type Tab = 'font' | 'recommended' | 'manual';
type ManualSubTab = 'text' | 'colors' | 'image';

const fontFamilies = [
    { name: 'Noto Sans KR (기본)', value: "'Noto Sans KR', sans-serif" },
    { name: 'Nanum Gothic (나눔고딕)', value: "'Nanum Gothic', sans-serif" },
    { name: 'Nanum Myeongjo (나눔명조)', value: "'Nanum Myeongjo', serif" },
    { name: 'Gowun Dodum (고운돋움)', value: "'Gowun Dodum', sans-serif" },
    { name: 'Gowun Batang (고운바탕)', value: "'Gowun Batang', serif" },
    { name: 'Song Myung (송명)', value: "'Song Myung', serif" },
    { name: 'Black Han Sans (검은고딕)', value: "'Black Han Sans', sans-serif" },
    { name: 'Do Hyeon (도현)', value: "'Do Hyeon', sans-serif" },
    { name: 'Jua (주아)', value: "'Jua', sans-serif" },
    { name: 'Yeon Sung (연성)', value: "'Yeon Sung', cursive" },
    { name: 'Sunflower (해바라기)', value: "'Sunflower', sans-serif" },
    { name: 'Gothic A1 (고딕 A1)', value: "'Gothic A1', sans-serif" },
    { name: 'Hi Melody (하이멜로디)', value: "'Hi Melody', cursive" },
    { name: 'Gamja Flower (감자꽃)', value: "'Gamja Flower', cursive" },
    { name: 'Poor Story (서툰이야기)', value: "'Poor Story', cursive" },
    { name: 'IBM Plex Sans KR', value: "'IBM Plex Sans KR', sans-serif" },
    { name: 'Bagel Fat One (베이글)', value: "'Bagel Fat One', cursive" },
    { name: 'Dongle (동글)', value: "'Dongle', sans-serif" },
    { name: 'Single Day (싱글데이)', value: "'Single Day', cursive" },
    { name: 'Roboto', value: "'Roboto', sans-serif" },
    { name: 'System Default', value: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" },
];

const DEFAULT_FONT_FAMILY = "'Noto Sans KR', sans-serif";
const DEFAULT_FONT_SIZE = 16;

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

export default function PersonalSettings({ onBack, onClose, currentTheme, onThemeChange }: PersonalSettingsProps) {
    const [activeTab, setActiveTab] = useState<Tab>('font');
    const [manualSubTab, setManualSubTab] = useState<ManualSubTab>('text');

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
    const [manualCardColor, setManualCardColor] = useState(() => localStorage.getItem('manualCardColor') || '#ffffff'); // Card Color
    const [manualBgImage, setManualBgImage] = useState(() => localStorage.getItem('manualBgImage') || '');
    const [manualBgSize, setManualBgSize] = useState(() => localStorage.getItem('manualBgSize') || 'cover'); // 'cover' or 'repeat'

    // Manual Theme State - Button
    const [manualBtnColor, setManualBtnColor] = useState(() => localStorage.getItem('manualBtnColor') || '#2563eb');
    const [manualBtnTextColor, setManualBtnTextColor] = useState(() => localStorage.getItem('manualBtnTextColor') || '#ffffff');

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

    const saveThemeToBackend = async (mode: string, fontData: { family: string, size: string }, manualData?: any) => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const payload = {
            mode: mode,
            font: fontData,
            manualConfig: mode === 'manual' ? manualData : null
        };

        try {
            await fetch('http://localhost:8080/api/setting/theme', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
        } catch (e) {
            console.error("Failed to save theme to backend", e);
        }
    };

    const getManualConfig = () => {
        return {
            text: {
                color: manualTextColor,
                intensity: manualTextIntensity
            },
            background: {
                isGradient: isGradient,
                color: manualBgColor,
                intensity: manualBgIntensity,
                gradientDirection: gradientDirection,
                gradientStart: gradientStartColor,
                gradientEnd: gradientEndColor,
                image: manualBgImage,
                size: manualBgSize
            },
            component: {
                cardColor: manualCardColor,
                btnColor: manualBtnColor,
                btnTextColor: manualBtnTextColor
            }
        };
    };

    const handleSaveFont = () => {
        document.documentElement.style.setProperty('--font-family', fontFamily);
        document.documentElement.style.setProperty('--font-size', `${fontSize}px`);
        localStorage.setItem('fontFamily', fontFamily);
        localStorage.setItem('fontSize', `${fontSize}px`);

        const manualConfig = getManualConfig();
        saveThemeToBackend(currentTheme, { family: fontFamily, size: `${fontSize}px` }, manualConfig);
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
        if (manualBgImage) {
            document.documentElement.style.setProperty('--manual-gradient', `url(${manualBgImage})`);
            document.documentElement.style.setProperty('--manual-bg-intensity', '0');
            localStorage.setItem('manualBgImage', manualBgImage);

            document.documentElement.style.setProperty('--manual-bg-size', manualBgSize === 'repeat' ? 'auto' : manualBgSize);
            document.documentElement.style.setProperty('--manual-bg-repeat', manualBgSize === 'repeat' ? 'repeat' : 'no-repeat');
        } else if (isGradient) {
            document.documentElement.style.setProperty('--manual-gradient', `linear-gradient(${gradientDirection}, ${gradientStartColor}, ${gradientEndColor})`);
            document.documentElement.style.setProperty('--manual-bg-intensity', '1');
            document.documentElement.style.setProperty('--manual-bg-size', 'cover');
            document.documentElement.style.setProperty('--manual-bg-repeat', 'no-repeat');
        } else {
            document.documentElement.style.setProperty('--manual-gradient', 'none');
            const r = parseInt(manualBgColor.slice(1, 3), 16);
            const g = parseInt(manualBgColor.slice(3, 5), 16);
            const b = parseInt(manualBgColor.slice(5, 7), 16);
            document.documentElement.style.setProperty('--manual-bg-color', `${r}, ${g}, ${b}`);
            document.documentElement.style.setProperty('--manual-bg-intensity', `${manualBgIntensity / 100}`);
            document.documentElement.style.setProperty('--manual-bg-size', 'cover');
            document.documentElement.style.setProperty('--manual-bg-repeat', 'no-repeat');
        }

        // Apply Card Settings
        const cr = parseInt(manualCardColor.slice(1, 3), 16);
        const cg = parseInt(manualCardColor.slice(3, 5), 16);
        const cb = parseInt(manualCardColor.slice(5, 7), 16);
        document.documentElement.style.setProperty('--manual-card-color', `${cr}, ${cg}, ${cb}`);
        localStorage.setItem('manualCardColor', manualCardColor);

        // Apply Button Settings
        document.documentElement.style.setProperty('--manual-btn-bg', manualBtnColor);
        document.documentElement.style.setProperty('--manual-btn-text', manualBtnTextColor);

        // Save to localStorage
        localStorage.setItem('manualTextColor', manualTextColor);
        localStorage.setItem('manualTextIntensity', manualTextIntensity.toString());
        localStorage.setItem('manualIsGradient', isGradient.toString());
        localStorage.setItem('manualBgColor', manualBgColor);
        localStorage.setItem('manualBgIntensity', manualBgIntensity.toString());
        localStorage.setItem('manualGradientDirection', gradientDirection);
        localStorage.setItem('manualGradientStartColor', gradientStartColor);
        localStorage.setItem('manualGradientEndColor', gradientEndColor);
        localStorage.setItem('manualBtnColor', manualBtnColor);
        localStorage.setItem('manualBtnTextColor', manualBtnTextColor);
        localStorage.setItem('manualBgImage', manualBgImage);
        localStorage.setItem('manualBgSize', manualBgSize);

        // Save to Backend
        const manualConfig = getManualConfig();

        saveThemeToBackend('manual', { family: fontFamily, size: `${fontSize}px` }, manualConfig);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // 1. Check file size (limit to 3MB)
            if (file.size > 3 * 1024 * 1024) {
                alert('이미지 용량이 너무 큽니다. 3MB  이하의 이미지를 사용해주세요.\n(브라우저 저장소 제한으로 인해 고화질 이미지는 저장이 불가능할 수 있습니다.)');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                try {
                    // Try saving to localStorage immediately to test quota
                    localStorage.setItem('temp_test_storage', base64String);
                    localStorage.removeItem('temp_test_storage');

                    setManualBgImage(base64String);
                } catch (error) {
                    console.error('Storage quota exceeded', error);
                    alert('브라우저 저장 공간이 부족하여 이미지를 저장할 수 없습니다.\n더 작은 용량의 이미지를 사용하거나, 브라우저 캐시를 정리해주세요.');
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleResetManualTheme = () => {
        setManualTextColor('#1a1a1a');
        setManualTextIntensity(100);
        setIsGradient(false);
        setManualBgColor('#ffffff');
        setManualBgIntensity(100);
        setManualCardColor('#ffffff');
        setManualBtnColor('#2563eb');
        setManualBtnTextColor('#ffffff');
        setManualBgImage(''); // Reset image
        setManualBgSize('cover');
        setGradientDirection('to bottom right');
        setGradientStartColor('#ffffff');
        setGradientEndColor('#3b82f6');
    };



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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                                Colors & Buttons
                            </button>
                            <button
                                onClick={() => setManualSubTab('image')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${manualSubTab === 'image'
                                    ? 'theme-bg-card theme-text-primary shadow-sm'
                                    : 'theme-text-secondary hover:bg-black/5'
                                    }`}
                            >
                                Image
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

                        {/* Colors Section (Background & Buttons) */}
                        {manualSubTab === 'colors' && (
                            <div className="space-y-6">
                                {/* Preview Box */}
                                <div
                                    className="relative rounded-xl p-8 min-h-[120px] flex flex-col justify-between transition-all duration-200 shadow-inner"
                                    style={{
                                        background: isGradient
                                            ? `linear-gradient(${gradientDirection}, ${gradientStartColor}, ${gradientEndColor})`
                                            : `rgba(${parseInt(manualBgColor.slice(1, 3), 16)}, ${parseInt(manualBgColor.slice(3, 5), 16)}, ${parseInt(manualBgColor.slice(5, 7), 16)}, ${manualBgIntensity / 100})`,
                                        borderColor: isGradient ? gradientEndColor : manualBgColor
                                    }}
                                >
                                    <div>
                                        <p className="font-bold mb-2 theme-text-primary">다람쥐 헌 쳇바퀴에 타고파</p>
                                        <p className="theme-text-secondary">The quick brown fox jumps over the lazy dog.</p>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        <button
                                            className="px-4 py-2 rounded-lg font-medium text-sm"
                                            style={{
                                                backgroundColor: manualBtnColor,
                                                color: manualBtnTextColor
                                            }}
                                        >
                                            Button
                                        </button>
                                    </div>

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

                                <div className="border-t theme-border pt-4">
                                    <ColorPicker
                                        label="카드/모달 색상 (Card Color)"
                                        color={manualCardColor}
                                        onChange={setManualCardColor}
                                        colors={BG_COLORS}
                                    />
                                </div>

                                <div className="border-t theme-border pt-4">
                                    <ColorPicker
                                        label="버튼 색상 (Button Color)"
                                        color={manualBtnColor}
                                        onChange={setManualBtnColor}
                                        colors={TEXT_COLORS} // Reusing bright colors
                                    />

                                    <div className="mt-4">
                                        <ColorPicker
                                            label="버튼 텍스트 색상 (Button Text Color)"
                                            color={manualBtnTextColor}
                                            onChange={setManualBtnTextColor}
                                            colors={['#ffffff', '#000000', ...TEXT_COLORS.slice(2)]}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Image Section */}
                        {manualSubTab === 'image' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="space-y-4">
                                    <label className="text-sm font-medium theme-text-primary block mb-4">배경 이미지 (Background Image)</label>

                                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 transition-colors hover:border-blue-500 bg-gray-50/50 mb-4">
                                        {manualBgImage ? (
                                            <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-md group bg-gray-100 border border-gray-200">
                                                {/* Live Preview Area */}
                                                <div
                                                    className="w-full h-full transition-all duration-300"
                                                    style={{
                                                        backgroundImage: `url(${manualBgImage})`,
                                                        backgroundSize: manualBgSize === 'repeat' ? '25%' : 'cover',
                                                        backgroundRepeat: manualBgSize === 'repeat' ? 'repeat' : 'no-repeat',
                                                        backgroundPosition: 'center'
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        onClick={() => setManualBgImage('')}
                                                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center cursor-pointer w-full h-full">
                                                <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-500 font-medium">이미지 업로드 (Click to Upload)</span>
                                                <span className="text-xs text-gray-400 mt-1">Supported: PNG, JPG, GIF</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                    </div>

                                    {manualBgImage && (
                                        <div className="space-y-2">
                                            <p className="text-xs text-center theme-text-secondary mb-4">
                                                이미지가 설정되면 그라데이션 및 단색 배경보다 우선 적용됩니다.
                                            </p>

                                            <div className="space-y-3">
                                                <label className="text-sm font-medium theme-text-primary block mb-4">배경 크기 (Background Size)</label>
                                                <div className="flex gap-4 px-2">
                                                    <button
                                                        onClick={() => setManualBgSize('cover')}
                                                        className={`flex-1 py-3 text-sm font-medium rounded-xl border transition-all ${manualBgSize === 'cover'
                                                            ? 'theme-bg-card theme-border border-blue-500 text-blue-500 ring-2 ring-blue-500 ring-offset-2'
                                                            : 'theme-bg-card-secondary border-transparent theme-text-secondary hover:bg-black/5'
                                                            }`}
                                                    >
                                                        화면 채우기 (Cover)
                                                    </button>
                                                    <button
                                                        onClick={() => setManualBgSize('repeat')}
                                                        className={`flex-1 py-3 text-sm font-medium rounded-xl border transition-all ${manualBgSize === 'repeat'
                                                            ? 'theme-bg-card theme-border border-blue-500 text-blue-500 ring-2 ring-blue-500 ring-offset-2'
                                                            : 'theme-bg-card-secondary border-transparent theme-text-secondary hover:bg-black/5'
                                                            }`}
                                                    >
                                                        반복 (Repeat)
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
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
