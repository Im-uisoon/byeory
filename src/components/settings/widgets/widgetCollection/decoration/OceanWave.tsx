import { useEffect, useState } from 'react';
import { WidgetWrapper } from '../../Shared';
import { useWidgetStorage } from '../SDK';
import { Sun, Moon } from 'lucide-react';

interface OceanWaveProps {
    gridSize?: { w: number; h: number };
}

export function OceanWave({ gridSize: _gridSize }: OceanWaveProps) {
    // 0: Auto, 1: Day, 2: Night
    const [mode, setMode] = useWidgetStorage('ocean-mode', 0);
    const [autoIsNight, setAutoIsNight] = useState(false);

    useEffect(() => {
        const hour = new Date().getHours();
        // Night from 6 PM (18) to 6 AM (6)
        setAutoIsNight(hour >= 18 || hour < 6);
    }, []);

    const isNight = mode === 0 ? autoIsNight : mode === 2;

    const toggleMode = () => {
        setMode((prev: number) => (prev + 1) % 3);
    };

    // Theme Configuration
    const theme = isNight ? {
        sky: 'from-indigo-950 to-slate-900',
        body: 'bg-stone-200 shadow-[0_0_40px_rgba(255,255,255,0.5)]', // Moon
        waves: [
            'fill-[#1e3a8a] opacity-40', // Deep Blue
            'fill-[#172554] opacity-70', // Darker Blue
            'fill-[#0f172a] opacity-90'  // Nearly Black
        ],
        star: true
    } : {
        sky: 'from-cyan-300 to-blue-400', // Cooler, crisper sky
        body: 'bg-yellow-100 shadow-[0_0_50px_rgba(255,255,200,0.8)]', // Brighter Sun
        waves: [
            'fill-[#67e8f9] opacity-40', // Cyan 300 (Cool/Minty)
            'fill-[#0ea5e9] opacity-60', // Sky 500 (Vibrant Blue)
            'fill-[#0284c7] opacity-90'  // Sky 600 (Deep Blue)
        ],
        star: false
    };

    return (
        <WidgetWrapper className={`border-none p-0 relative overflow-hidden transition-colors duration-1000 bg-gradient-to-b ${theme.sky} group`}>

            <button
                onClick={toggleMode}
                className="absolute top-2 right-2 z-20 text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
                {mode === 0 ? (isNight ? <Moon size={12} className="opacity-50" /> : <Sun size={12} className="opacity-50" />) : (isNight ? <Moon size={12} /> : <Sun size={12} />)}
            </button>

            {/* Celestial Body (Sun/Moon) */}
            <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full blur-md transition-all duration-1000 ${theme.body}`}></div>

            {/* Stars (Night Only) */}
            {theme.star && (
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(15)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute bg-white rounded-full animate-pulse"
                            style={{
                                width: Math.random() * 2 + 'px',
                                height: Math.random() * 2 + 'px',
                                top: Math.random() * 40 + '%',
                                left: Math.random() * 100 + '%',
                                opacity: Math.random() * 0.7,
                                animationDelay: Math.random() * 3 + 's'
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Reflection on Water */}
            <div className={`absolute top-[45%] left-1/2 -translate-x-1/2 w-8 h-32 ${isNight ? 'bg-white/5' : 'bg-yellow-200/20'} blur-xl rounded-full transform scale-x-150`}></div>


            {/* Waves Container */}
            <div className="absolute bottom-0 left-0 right-0 h-[60%] overflow-hidden">
                {/* Back Wave - Smoothest rolling */}
                <div className="absolute bottom-0 w-[200%] h-full flex animate-wave-slow pointer-events-none">
                    <svg viewBox="0 0 1440 320" className="w-1/2 h-full" preserveAspectRatio="none">
                        <path className={`transition-colors duration-1000 ${theme.waves[0]}`} d="M0,192 C320,160 420,160 720,192 C1020,224 1120,224 1440,192 L1440,320 L0,320 Z"></path>
                    </svg>
                    <svg viewBox="0 0 1440 320" className="w-1/2 h-full" preserveAspectRatio="none">
                        <path className={`transition-colors duration-1000 ${theme.waves[0]}`} d="M0,192 C320,160 420,160 720,192 C1020,224 1120,224 1440,192 L1440,320 L0,320 Z"></path>
                    </svg>
                </div>

                {/* Middle Wave - Offset phase */}
                <div className="absolute bottom-[-5%] w-[200%] h-full flex animate-wave pointer-events-none">
                    <svg viewBox="0 0 1440 320" className="w-1/2 h-full" preserveAspectRatio="none">
                        <path className={`transition-colors duration-1000 ${theme.waves[1]}`} d="M0,224 C360,256 500,256 720,224 C940,192 1080,192 1440,224 L1440,320 L0,320 Z"></path>
                    </svg>
                    <svg viewBox="0 0 1440 320" className="w-1/2 h-full" preserveAspectRatio="none">
                        <path className={`transition-colors duration-1000 ${theme.waves[1]}`} d="M0,224 C360,256 500,256 720,224 C940,192 1080,192 1440,224 L1440,320 L0,320 Z"></path>
                    </svg>
                </div>

                {/* Front Wave - Highest frequency detail */}
                <div className="absolute bottom-[-10%] w-[200%] h-full flex animate-wave-fast pointer-events-none">
                    <svg viewBox="0 0 1440 320" className="w-1/2 h-full" preserveAspectRatio="none">
                        <path className={`transition-colors duration-1000 ${theme.waves[2]}`} d="M0,256 C240,240 480,240 720,256 C960,272 1200,272 1440,256 L1440,320 L0,320 Z"></path>
                    </svg>
                    <svg viewBox="0 0 1440 320" className="w-1/2 h-full" preserveAspectRatio="none">
                        <path className={`transition-colors duration-1000 ${theme.waves[2]}`} d="M0,256 C240,240 480,240 720,256 C960,272 1200,272 1440,256 L1440,320 L0,320 Z"></path>
                    </svg>
                </div>
            </div>

            <style>{`
                @keyframes wave {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-wave { animation: wave 15s linear infinite; }
                .animate-wave-slow { animation: wave 25s linear infinite; }
                .animate-wave-fast { animation: wave 10s linear infinite; }
             `}</style>
        </WidgetWrapper>
    );
}
