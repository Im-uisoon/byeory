import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { WidgetWrapper } from '../Common';

// --- 5. Battery Widget (Classic Simple Design)


export const BatteryWidget = React.memo(function BatteryWidget() {
    const [level, setLevel] = useState(50);

    // 색상 상태 (단순함 유지)
    const barColor = 'bg-amber-400';
    const iconColor = 'text-amber-500';

    return (
        <WidgetWrapper className="!bg-white border-none p-0">
            {/* 전체 컨테이너를 h-full로 잡고 flex로 정중앙 정렬 */}
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                {/* 상단: 아이콘 + 텍스트 */}
                <div className="flex items-center gap-1.5 mt-1">
                    <Zap size={18} className={`${iconColor} fill-current`} />
                    <span className="text-lg font-bold text-gray-700">
                        {level}%
                    </span>
                </div>

                {/* 중간: 배터리 인디케이터 */}
                <div className="relative w-[90%] h-10 border-4 border-gray-200 rounded-xl p-1 flex items-center shrink-0">
                    <div
                        className={`h-full rounded-md transition-all duration-300 ${barColor}`}
                        style={{ width: `${level}%` }}
                    />
                    {/* 배터리 꼭지 */}
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-gray-200 rounded-r-sm" />
                </div>

                {/* 하단: 슬라이더 */}
                <div className="w-[90%] px-1 pb-1">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={level}
                        onChange={(e) => setLevel(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 block"
                    />
                </div>
            </div>
        </WidgetWrapper>
    );
});
