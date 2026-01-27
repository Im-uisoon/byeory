import { ArrowLeft, Check, Moon, Sun, Monitor, X, Settings as SettingsIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import PersonalSettings from './PersonalSettings';

interface ThemeSettingsProps {
    onBack: () => void;
    onClose: () => void;
}

type ThemeMode = 'default' | 'light' | 'dark' | 'custom' | 'manual' | string;

export default function ThemeSettings({ onBack, onClose }: ThemeSettingsProps) {
    const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(() => {
        return (localStorage.getItem('theme') as ThemeMode) || 'default';
    });
    const [showPersonalSettings, setShowPersonalSettings] = useState(false);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', selectedTheme);
        localStorage.setItem('theme', selectedTheme);

        const saveTheme = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            if (selectedTheme !== 'manual') {
                try {
                    const fontFamily = localStorage.getItem('fontFamily') || "'Noto Sans KR', sans-serif";
                    const fontSize = localStorage.getItem('fontSize') || "16px";

                    await fetch('http://localhost:8080/api/setting/theme', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            mode: selectedTheme,
                            font: {
                                family: fontFamily,
                                size: fontSize
                            },
                            manualConfig: null
                        })
                    });
                } catch (e) { console.error(e); }
            }
        };
        saveTheme();
    }, [selectedTheme]);

    const themes = [
        { id: 'default', name: '기본 모드', icon: Monitor, description: '벼리 설정에 따르는 기본 테마' },
        { id: 'light', name: '라이트 모드', icon: Sun, description: '밝고 깨끗한 화면' },
        { id: 'dark', name: '다크 모드', icon: Moon, description: '눈이 편안한 어두운 화면' },
        { id: 'personal', name: '개인 설정', icon: SettingsIcon, description: '나만의 테마와 폰트 설정' },
    ] as const;

    if (showPersonalSettings) {
        return (
            <PersonalSettings
                onBack={() => setShowPersonalSettings(false)}
                onClose={onClose}
                currentTheme={selectedTheme}
                onThemeChange={(theme) => setSelectedTheme(theme as ThemeMode)}
            />
        );
    }

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
                    <h2 className="text-xl theme-text-primary">테마 설정</h2>
                </div>
                <button onClick={onClose} className="p-2 theme-text-secondary hover:bg-black/5 rounded-full transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Theme Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {themes.map((theme) => {
                    // Check if this is the "Personal Settings" button
                    const isPersonalBtn = theme.id === 'personal';
                    // Check if the current selected theme belongs to "Personal Settings" category
                    // (custom or any custom-* themes, or 'manual' are considered personal themes)
                    const isPersonalActive = isPersonalBtn && (selectedTheme === 'custom' || selectedTheme.startsWith('custom-') || selectedTheme === 'manual');
                    // Check if this specific theme button is active (for default, light, dark)
                    const isActive = theme.id === selectedTheme || isPersonalActive;

                    return (
                        <button
                            key={theme.id}
                            onClick={() => {
                                if (isPersonalBtn) {
                                    setShowPersonalSettings(true);
                                } else {
                                    setSelectedTheme(theme.id as ThemeMode);
                                }
                            }}
                            style={{
                                borderColor: isActive ? 'var(--text-primary)' : 'var(--border-color)'
                            }}
                            className={`
                                relative flex flex-col items-start p-4 bg-white rounded-xl border-2 transition-all duration-200
                                theme-bg-card
                                ${isActive
                                    ? 'bg-black/5'
                                    : 'hover:bg-black/5'
                                }
                            `}
                        >
                            <div className={`
                                p-3 rounded-lg mb-3
                                ${isActive ? 'bg-black/10 theme-text-primary' : 'bg-black/5 theme-text-secondary'}
                            `}>
                                <theme.icon className="w-6 h-6" />
                            </div>

                            <div className="flex items-center justify-between w-full mb-1">
                                <span className={`font-bold text-base sm:text-lg whitespace-nowrap ${isActive ? 'theme-text-primary' : 'theme-text-primary'}`}>
                                    {theme.name}
                                </span>
                                {isActive && (
                                    <div className="theme-btn rounded-full p-1 ml-1 flex-shrink-0">
                                        {isPersonalBtn ? <SettingsIcon className="w-3 h-3 text-white" /> : <Check className="w-3 h-3 text-white" />}
                                    </div>
                                )}
                            </div>

                            <p className="text-sm theme-text-secondary text-left break-keep leading-tight">
                                {theme.description}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
