import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../../context/AuthContext';
import { User, Palette } from 'lucide-react';

export function WelcomeWidget({ gridSize, isStickerMode }: { gridSize?: { w: number; h: number }; isStickerMode?: boolean }) {
    const { user } = useAuth();
    const navigate = useNavigate();

    const hour = new Date().getHours();
    const greeting = hour < 12 ? '좋은 아침입니다' : hour < 18 ? '오늘 하루 어떠신가요' : '편안한 밤 되세요';

    const [nickname, setNickname] = useState<string>('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) return;

                const response = await fetch('http://localhost:8080/api/user/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.nickname) {
                        setNickname(data.nickname);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch nickname", error);
            }
        };

        fetchProfile();
    }, []);

    // Display logic: Nickname -> Email -> ''
    const displayName = nickname || (user?.email ? user.email.split('@')[0] : '');

    const openThemeSettings = () => {
        window.dispatchEvent(new CustomEvent('open-settings-modal', { detail: { view: 'theme' } }));
    };

    const isSmall = (gridSize?.w || 2) < 2 && (gridSize?.h || 2) < 2;

    if (isSmall) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center p-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm overflow-hidden text-center cursor-pointer hover:bg-white transition-colors"
                onClick={() => !isStickerMode && navigate('/profile')}>
                <span className="text-[10px] text-gray-400 font-bold uppercase mb-0.5 tracking-wider">HELLO</span>
                <span className="text-sm font-bold text-blue-500 truncate max-w-full leading-tight">{displayName}</span>
            </div>
        );
    }

    const isShort = (gridSize?.h || 2) < 2;

    return (
        <div className={`h-full flex flex-col justify-between ${isShort ? 'p-4' : 'p-6'} bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm overflow-hidden relative group`}>
            {/* Decorative Background Blob */}
            <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700 pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold tracking-wider uppercase">Welcome</span>
                </div>
                <h1 className={`font-bold text-gray-800 leading-tight ${isShort ? 'text-lg' : 'text-2xl'}`}>
                    {greeting},<br />
                    <span className="text-blue-500">{displayName}</span>님!
                </h1>
            </div>

            <div className={`flex gap-2 relative z-10 ${isShort ? 'mt-2' : 'mt-4'}`}>
                <button
                    onClick={() => !isStickerMode && navigate('/profile')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm text-sm font-medium text-gray-600 group/btn"
                >
                    <User size={14} className="text-gray-400 group-hover/btn:text-blue-500 transition-colors" />
                    {!isShort && '프로필'}
                </button>
                <button
                    onClick={() => !isStickerMode && openThemeSettings()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm text-sm font-medium text-gray-600 group/btn"
                >
                    <Palette size={14} className="text-gray-400 group-hover/btn:text-purple-500 transition-colors" />
                    {!isShort && '테마'}
                </button>
            </div>
        </div>
    );
}
