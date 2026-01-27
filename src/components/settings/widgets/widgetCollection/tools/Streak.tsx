import React, { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { WidgetWrapper } from '../../Shared';
import axios from 'axios';

interface StreakWidgetProps {
    gridSize?: { w: number; h: number };
}

// 17. Streak Widget (연속 기록)
export const StreakWidget = React.memo(function StreakWidget({ gridSize }: StreakWidgetProps) {
    const isSmall = (gridSize?.w || 2) < 2; // 1x1 check
    const [streakDays, setStreakDays] = useState<number>(0);

    useEffect(() => {
        const fetchStreak = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                if (!token) return;

                const response = await axios.get("http://localhost:8080/api/user/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && typeof response.data.streakDays === 'number') {
                    setStreakDays(response.data.streakDays);
                }
            } catch (error) {
                console.error("Failed to fetch streak data:", error);
            } finally {
                // Loading state removed
            }
        };

        fetchStreak();
    }, []);

    // 7단계 게이지 로직
    const maxGauge = 7;
    const filledGauge = Math.min(streakDays, maxGauge);
    const isOverWeek = streakDays > maxGauge;

    // 1x1 Size Render
    if (isSmall) {
        return (
            <WidgetWrapper className="bg-gradient-to-br from-orange-400 to-orange-600 border-none p-0">
                <div className="w-full h-full flex flex-col items-center justify-center text-white relative">
                    <Flame
                        className={`w-8 h-8 mb-1 transition-all duration-300 ${streakDays > 0 ? "animate-pulse fill-white" : "opacity-50"}`}
                    />
                    {/* 1x1에서는 심플하게 숫자 강조 */}
                    <div className="flex items-baseline gap-0.5">
                        <span className="text-3xl font-black leading-none tracking-tighter shadow-sm">
                            {streakDays}
                        </span>
                        {isOverWeek && <span className="text-[10px] font-bold">+</span>}
                    </div>
                    <span className="text-[9px] opacity-80 font-bold uppercase mt-0.5">Days</span>

                    {/* 1x1용 미니 게이지 (하단에 작게) */}
                    <div className="absolute bottom-3 w-3/4 flex gap-0.5 h-1">
                        {[...Array(maxGauge)].map((_, i) => (
                            <div
                                key={i}
                                className={`flex-1 rounded-full transition-colors duration-300 ${i < filledGauge
                                    ? "bg-white"
                                    : "bg-black/10"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </WidgetWrapper>
        );
    }

    // 2x1, 2x2 Size Render (Orange Theme Applied)
    // 기존 흰색 배경 로직을 오렌지 스타일로 변경
    return (
        <WidgetWrapper className="bg-gradient-to-br from-orange-400 to-orange-600 border-none">
            <div className="w-full h-full flex flex-row items-center justify-between px-6 py-2 text-white">
                {/* Left: Icon & Count */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Flame
                            className={`w-10 h-10 transition-colors duration-300 ${streakDays > 0 ? "animate-pulse fill-white" : "opacity-50"}`}
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold opacity-80 uppercase">Streak</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black leading-none tracking-tighter shadow-sm">
                                {streakDays}
                            </span>
                            <span className="text-sm font-bold opacity-90">Days</span>
                        </div>
                    </div>
                </div>

                {/* Right: 7-Segment Gauge */}
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold opacity-75">Target 7 Days</span>
                    <div className="flex gap-1">
                        {[...Array(maxGauge)].map((_, i) => {
                            const isFilled = i < filledGauge;
                            // 오렌지 배경 위이므로, 채워진건 흰색/밝은노랑, 안채워진건 반투명 검정/흰색
                            let bgColor = 'bg-black/10'; // Empty
                            if (isFilled) {
                                // 단계별 밝기 조절 or just white
                                if (i < 2) bgColor = 'bg-white/60';
                                else if (i < 4) bgColor = 'bg-white/80';
                                else bgColor = 'bg-white';
                            }
                            return (
                                <div
                                    key={i}
                                    className={`w-2 h-6 rounded-sm transition-colors duration-300 ${bgColor}`}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </WidgetWrapper>
    );
});
