import { useState, useEffect } from 'react';
import axios from 'axios';
import type { WidgetConfig, WidgetDefinition } from "./type.ts";
import { WIDGET_COMPONENT_MAP } from "./componentMap.ts";
import { getMyWidgets } from './customwidget/widgetApi.ts';
import CustomWidgetPreview from './customwidget/components/CustomWidgetPreview.tsx';

// 백엔드 주소 상수 정의
const BASE_URL = 'http://localhost:8080';
const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

// 🌟 Helper: Create a fallback component wrapper
// This avoids defining the component inline inside the loop, preventing syntax/parser issues.
const createFallbackComponent = (defaultSize: string) => {
    return (props: any) => (
        <CustomWidgetPreview content={{ ...props.content, decorations: props.decorations || [] }
        } defaultSize={defaultSize} />
    );
};

export const useWidgetRegistry = (userId?: number) => {
    const [registry, setRegistry] = useState<Record<string, WidgetConfig>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchWidgets = async () => {
        setIsLoading(true);
        try {
            const params = userId ? { userId } : {};
            const headers = getAuthHeaders();

            // 1. 기본 위젯 정의 가져오기 (병렬 처리)
            const [standardRes, customRes] = await Promise.allSettled([
                axios.get<WidgetDefinition[]>(`${BASE_URL}/api/widgets`, { params, headers }),
                getMyWidgets() // 2. 커스텀 위젯 가져오기
            ]);

            // 데이터 병합용 객체
            const mergedRegistry: Record<string, WidgetConfig> = {};

            // A. 표준 위젯 처리
            if (standardRes.status === 'fulfilled' && Array.isArray(standardRes.value.data)) {
                standardRes.value.data.forEach((def) => {
                    const Component = WIDGET_COMPONENT_MAP[def.widgetType];
                    if (Component) {
                        mergedRegistry[def.widgetType] = { ...def, component: Component };
                    }
                });
            } else {
                console.error('표준 위젯 로드 실패 또는 데이터 형식 오류');
            }

            // Helper to parse JSON if string
            const safeParse = (data: any) => {
                if (typeof data === 'string') {
                    try { return JSON.parse(data); } catch (e) { console.warn('JSON parse failed', e); return {}; }
                }
                return data || {};
            };

            // B. 커스텀 위젯 처리 (표준 위젯 기반)
            if (customRes.status === 'fulfilled' && Array.isArray(customRes.value)) {
                customRes.value.forEach((item: any) => {
                    // 커스텀 위젯의 원본 타입(예: 'todo-list')으로 컴포넌트 찾기
                    const baseType = item.type;
                    let Component = WIDGET_COMPONENT_MAP[baseType];

                    // 🌟 'custom-block' 폴백 처리
                    if (!Component && baseType === 'custom-block') {
                        // Use helper to create component
                        Component = createFallbackComponent(item.defaultSize || '2x2');
                    }

                    // 컴포넌트가 존재하는 경우에만 등록
                    if (Component) {
                        // 고유 ID 생성 (예: 'custom-123')
                        const customType = `custom-${item.id}`;

                        // Parse data safely
                        const parsedContent = safeParse(item.content);
                        const parsedStyles = safeParse(item.styles);
                        const parsedDecorations = typeof item.decorations === 'string'
                            ? (JSON.parse(item.decorations) || [])
                            : (item.decorations || []);

                        mergedRegistry[customType] = {
                            id: item.id,
                            widgetType: customType, // 고유 식별자
                            label: item.name || '제목 없음',
                            description: `Custom ${baseType} widget`,
                            category: 'My Saved', // 커스텀 위젯 카테고리 고정
                            keywords: ['custom', baseType],
                            defaultSize: '1x1', // 기본값
                            validSizes: [[1, 1], [1, 2], [2, 1], [2, 2]],
                            defaultProps: {
                                content: parsedContent, // 저장된 콘텐츠
                                styles: parsedStyles,    // component expects styles
                                style: parsedStyles,     // component expects style (alias)
                                decorations: parsedDecorations // decorations 포함
                            },
                            isSystem: false,
                            thumbnail: undefined,
                            component: Component,
                        };
                    }
                });
            }

            // 타임머신 / 웰컴 위젯 등 강제 사이즈 설정
            if (mergedRegistry['time-machine']) {
                const currentSizes = mergedRegistry['time-machine'].validSizes || [];
                if (!currentSizes.some(([w, h]) => w === 1 && h === 1)) {
                    mergedRegistry['time-machine'].validSizes = [[1, 1], ...currentSizes];
                }
            }

            setRegistry(mergedRegistry);
        } catch (err) {
            console.error('Failed to fetch widget definitions:', err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWidgets();
    }, [userId]);

    return { registry, isLoading, error, refresh: fetchWidgets };
};