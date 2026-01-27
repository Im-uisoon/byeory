import { useEffect, useState } from 'react';
import { Home, FileText, CheckSquare, Users, Check, ArrowLeft, X } from 'lucide-react';

interface DefaultPageSettingsProps {
    onBack?: () => void;
    onClose?: () => void;
}

const pages = [
    { id: 'home', name: 'Home', path: '/home', icon: Home },
    { id: 'post', name: '포스트', path: '/post', icon: FileText },
    { id: 'community', name: '커뮤니티', path: '/community', icon: Users },
    { id: 'market', name: '마켓', path: '/market', icon: CheckSquare },
];

export default function DefaultPageSettings({ onBack, onClose }: DefaultPageSettingsProps) {
    const [selectedPath, setSelectedPath] = useState<string>('/home');

    useEffect(() => {
        const saved = localStorage.getItem('defaultPage');
        if (saved) {
            setSelectedPath(saved);
        } else {
            // Default to /home if nothing saved
            setSelectedPath('/home');
        }
    }, []);

    const handleSelect = async (path: string) => {
        setSelectedPath(path);
        localStorage.setItem('defaultPage', path);

        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                await fetch('http://localhost:8080/api/setting/page', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ defaultPage: path })
                });
            } catch (e) {
                console.error("Failed to save default page to backend", e);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2 -ml-2 rounded-full hover:bg-black/5 theme-text-secondary transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                    )}
                    <h2 className="text-xl theme-text-primary">기본 페이지 설정</h2>
                </div>
                {onClose && (
                    <button onClick={onClose} className="theme-text-secondary hover:bg-black/5 rounded-full p-2 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {pages.map((page) => {
                    const isSelected = selectedPath === page.path;
                    return (
                        <button
                            key={page.id}
                            onClick={() => handleSelect(page.path)}
                            className={`
                                relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 gap-2
                                ${isSelected
                                    ? 'border-[color:var(--text-primary)] theme-bg-card shadow-md scale-[1.02]'
                                    : 'theme-border theme-bg-card hover:border-[color:var(--text-secondary)] hover:bg-black/5'
                                }
                            `}
                        >
                            <div className={`
                                p-3 rounded-full transition-colors
                                ${isSelected ? 'theme-btn' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}
                            `}>
                                <page.icon size={24} />
                            </div>
                            <span className={`font-medium ${isSelected ? 'theme-text-primary font-bold' : 'theme-text-secondary'}`}>
                                {page.name}
                            </span>

                            {isSelected && (
                                <div className="absolute top-3 right-3 theme-text-primary">
                                    <Check size={20} />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            <p className="text-sm theme-text-secondary text-center mt-6">
                선택한 페이지는 로고를 클릭하거나 사이트에 처음 접속할 때 표시됩니다.
            </p>
        </div>
    );
}
