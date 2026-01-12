import React, { Suspense } from 'react';
import { useDragLayer } from 'react-dnd';
import { WIDGET_COMPONENT_MAP } from "./componentMap.ts";
// 1. 기존 Registry import 제거하고, ComponentMap을 import 하세요.

const layerStyles: React.CSSProperties = {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 100,
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
};

function getItemStyles(initialOffset: any, currentOffset: any) {
    if (!initialOffset || !currentOffset) {
        return { display: 'none' };
    }
    let { x, y } = currentOffset;
    const transform = `translate(${x}px, ${y}px)`;
    return {
        transform,
        WebkitTransform: transform,
    };
}

export const CustomDragLayer = () => {
    const { itemType, isDragging, item, initialOffset, currentOffset } = useDragLayer((monitor) => ({
        item: monitor.getItem(),
        itemType: monitor.getItemType(),
        initialOffset: monitor.getInitialSourceClientOffset(),
        currentOffset: monitor.getSourceClientOffset(),
        isDragging: monitor.isDragging(),
    }));

    if (!isDragging || itemType === 'MENU_SORT_ITEM') {
        return null;
    }

    // 2. item.type(위젯 타입)을 이용해 맵에서 컴포넌트를 찾습니다.
    // (드래그 아이템 구조에 따라 item.type 혹은 item.widgetType 일 수 있음)
    const WidgetComponent = WIDGET_COMPONENT_MAP[item.type];

    return (
        <div style={layerStyles}>
            <div style={getItemStyles(initialOffset, currentOffset)}>
                {/* 3. Lazy 컴포넌트이므로 Suspense가 필수입니다. */}
                <Suspense fallback={<div className="bg-white/50 w-full h-full" />}>
                    {itemType === 'MENU_ITEM' ? (
                        <div className="flex items-center justify-center bg-[var(--bg-card)] rounded-lg shadow-lg border border-[var(--border-color)] opacity-90"
                            style={{
                                width: item.initialWidth,
                                height: item.initialHeight,
                            }}
                        >
                            <span className="font-bold theme-text-primary text-lg">{item.label}</span>
                        </div>
                    ) : WidgetComponent ? (
                        /* 드래그 중인 미리보기는 보통 스타일을 좀 다르게 주거나 그대로 보여줍니다 */
                        <div style={{
                            width: item.initialWidth || item.w * 100, // 캡처된 크기 사용, 없으면 기존 로직 폴백
                            height: item.initialHeight || item.h * 100
                        }}>
                            <WidgetComponent {...item.props} />
                        </div>
                    ) : (
                        /* 컴포넌트를 못 찾았을 때의 폴백 */
                        <div className="bg-gray-200 p-2 rounded">
                            {item.label || 'Unknown Widget'}
                        </div>
                    )}
                </Suspense>
            </div>
        </div>
    );
};