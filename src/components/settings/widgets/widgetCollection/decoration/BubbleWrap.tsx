import { useState, useRef, useMemo, useLayoutEffect } from 'react';
import { WidgetWrapper } from '../Common';

export function BubbleWrap() {
    const [popped, setPopped] = useState<Set<number>>(new Set());
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // 버블 설정
    const BUBBLE_SIZE = 32; // 버블 크기
    const GAP = 8;          // 그리드 간격 (gap-2 = 8px)

    // 1. 크기 측정 (화면이 그려지기 전에 빠르게 측정)
    useLayoutEffect(() => {
        if (!containerRef.current) return;

        // 초기 크기 측정 함수
        const measure = () => {
            const el = containerRef.current;
            if (el) {
                const { offsetWidth, offsetHeight } = el;
                // 크기가 유의미하게 변했을 때만 업데이트
                setDimensions(prev => {
                    if (prev.width === offsetWidth && prev.height === offsetHeight) return prev;
                    return { width: offsetWidth, height: offsetHeight };
                });
            }
        };

        // 처음 마운트 될 때 즉시 실행
        measure();

        // 크기 변화 감지
        const resizeObserver = new ResizeObserver(() => measure());
        resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    // 2. 정확한 열(Col)과 행(Row) 계산
    const { count } = useMemo(() => {
        // 너비가 제대로 안 잡혔을 때를 대비해 최소 400px로 가정
        const safeWidth = dimensions.width || 400;
        const safeHeight = dimensions.height || 400;

        // (너비 + 간격) / (버블크기 + 간격)으로 계산
        // auto-fill 로직과 맞추기 위해 바닥 함수(floor) 사용
        const calculatedCols = Math.floor((safeWidth + GAP) / (BUBBLE_SIZE + GAP));
        const calculatedRows = Math.floor((safeHeight + GAP) / (BUBBLE_SIZE + GAP));

        // 최소 1x1 보장
        const finalCols = Math.max(1, calculatedCols);
        const finalRows = Math.max(1, calculatedRows);

        return {
            count: finalCols * finalRows
        };
    }, [dimensions]);

    const pop = (i: number) => {
        if (!popped.has(i)) {
            const next = new Set(popped);
            next.add(i);
            setPopped(next);
        }
    };

    // 3. 완료 상태 계산
    // 현재 보여지는(count) 모든 버블이 popped 상태인지 확인
    const isAllPopped = useMemo(() => {
        if (count === 0) return false;
        // 0부터 count-1까지 모든 인덱스가 popped에 있는지 확인
        for (let i = 0; i < count; i++) {
            if (!popped.has(i)) return false;
        }
        return true;
    }, [count, popped]);

    const reset = () => {
        setPopped(new Set());
    };

    return (
        <WidgetWrapper className="bg-blue-50/50 p-2 overflow-hidden flex flex-col h-full relative !items-stretch !justify-start">
            {/* 
                !items-stretch !justify-start: WidgetWrapper의 기본 center 정렬을 무력화하여 전체 영역 사용
            */}
            <div
                ref={containerRef}
                className="w-full h-full min-h-0 grid gap-2 content-start overflow-y-auto"
                style={{
                    // auto-fill을 사용하여 너비에 맞춰 자동으로 열 개수 조절
                    gridTemplateColumns: `repeat(auto-fill, minmax(${BUBBLE_SIZE}px, 1fr))`
                }}
            >
                {Array.from({ length: count }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => pop(i)}
                        className={`aspect-square rounded-full shadow-inner border transition-all w-full ${popped.has(i)
                            ? 'bg-transparent border-blue-100 scale-90'
                            : 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300 hover:scale-105 active:scale-95'
                            }`}
                    />
                ))}
            </div>

            {/* 완료 메시지 오버레이 */}
            {isAllPopped && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-fade-in p-4 text-center">
                    <div className="text-xl font-bold text-blue-600 mb-2 break-keep">고생하셨습니다! 🎉</div>
                    <button
                        onClick={reset}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md text-sm whitespace-nowrap"
                    >
                        다시 하기
                    </button>
                </div>
            )}
        </WidgetWrapper>
    );
}