import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WidgetWrapper } from '../../Shared';
import { RefreshCw, Activity } from 'lucide-react';

interface MoodItem {
    mood: string;
    percentage: number;
    emoji: string;
}

interface ComponentProps {
    className?: string;
    style?: React.CSSProperties;
    gridSize?: { w: number; h: number };
    isStickerMode?: boolean;
}

export const MoodAnalytics = ({ className, style, gridSize, isStickerMode }: ComponentProps) => {
    const navigate = useNavigate();
    const [moods, setMoods] = useState<MoodItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchPersona = async () => {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/persona", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 404) {
                setMoods([]);;
                return;
            }

            if (response.ok && response.status !== 204) {
                const json = await response.json();
                let parsedData = json;
                if (typeof json.analysisResult === "string") {
                    try {
                        parsedData = JSON.parse(json.analysisResult);
                    } catch (e) {
                        // silently ignore parsing error
                    }
                }

                if (parsedData && parsedData.moods) {
                    setMoods(parsedData.moods);
                } else {
                    setMoods([]);
                }
            } else {
                setMoods([]);
            }
        } catch (e) {
            // console.error(e);
            setError(true);
            setMoods([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPersona();
    }, []);

    const isSmall = (gridSize?.w || 2) === 1 && (gridSize?.h || 1) === 1;

    // Chart Logic
    let accumulatedPercent = 0;
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    // Updated colors to match the soft pastel look in the image
    const colors = ["#86efac", "#fde047", "#fca5a5", "#93c5fd", "#c4b5fd"];

    if (loading) {
        return (
            <WidgetWrapper className={`bg-white ${className || ''}`} style={style}>
                <div className="flex items-center justify-center h-full text-gray-400">
                    <RefreshCw className="animate-spin w-5 h-5" />
                </div>
            </WidgetWrapper>
        )
    }

    if (error || moods.length === 0) {
        return (
            <WidgetWrapper className={`bg-white ${className || ''}`} style={style} title="Moods">
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 p-4">
                    <div className="flex flex-col items-center gap-1">
                        <Activity className="w-8 h-8 text-indigo-300 opacity-50" />
                        <span className="text-xs text-gray-400 font-medium">분석된 기분이 없어요</span>
                    </div>

                    <button
                        onClick={() => !isStickerMode && navigate('/profile/analysis')}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                        분석하러 가기
                    </button>
                </div>
            </WidgetWrapper>
        );
    }

    // Design matches the reference image: Horizontal layout, Left Chart, Right List
    // 1x1: Optimized for square but keeping the horizontal flow

    return (
        <WidgetWrapper className={`bg-white ${className || ''}`} style={style}>
            <div className={`flex items-center h-full w-full ${isSmall ? 'p-2 py-3' : 'p-4 px-15 scale-110 origin-center'}`}>

                {/* Left: Donut Chart */}
                {/* Increased size for 1x1 to make it legible and 'not too small' */}
                <div className={`relative shrink-0 flex items-center justify-center ${isSmall ? 'w-[42%] aspect-square' : 'w-24 h-24 mr-4'}`}>
                    <svg viewBox="0 0 40 40" className="w-full h-full transform -rotate-90 drop-shadow-sm">
                        {moods.map((mood, idx) => {
                            const strokeDasharray = `${(mood.percentage / 100) * circumference} ${circumference}`;
                            const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                            accumulatedPercent += mood.percentage;

                            return (
                                <circle
                                    key={idx}
                                    cx="20"
                                    cy="20"
                                    r={radius}
                                    fill="transparent"
                                    stroke={colors[idx % colors.length]}
                                    strokeWidth="6" // Thicker stroke as per image
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-out"
                                />
                            );
                        })}
                    </svg>
                    {/* Emoji in center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`${isSmall ? 'text-2xl' : 'text-3xl'} pb-1`}>{moods[0]?.emoji}</span>
                    </div>
                </div>

                {/* Right: List */}
                <div className={`flex flex-col justify-center flex-1 min-w-0 ${isSmall ? 'pl-2' : ''}`}>
                    {/* Title */}
                    <div className={`font-bold text-gray-400 uppercase tracking-widest mb-1.5 ${isSmall ? 'text-[8px]' : 'text-[10px]'}`}>
                        Top Emotions
                    </div>

                    {/* List Items */}
                    <div className="flex flex-col gap-1.5 w-full">
                        {moods.slice(0, 3).map((mood, idx) => (
                            <div key={idx} className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    <span
                                        className={`rounded-full shrink-0 ${isSmall ? 'w-2 h-2' : 'w-2.5 h-2.5'}`}
                                        style={{ backgroundColor: colors[idx % colors.length] }}
                                    ></span>
                                    {/* Emotion Name - Bold and Dark */}
                                    <span className={`font-bold text-slate-700 truncate ${isSmall ? 'text-[10px]' : 'text-xs'}`}>
                                        {mood.mood}
                                    </span>
                                </div>
                                {/* Percentage - Gray */}
                                <span className={`text-gray-400 font-medium ${isSmall ? 'text-[9px]' : 'text-xs'}`}>
                                    {mood.percentage}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </WidgetWrapper>
    );
};
