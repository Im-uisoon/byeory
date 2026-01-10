import { useState, useEffect } from 'react';
import axios from 'axios';
import type { WidgetConfig, WidgetDefinition } from "./type.ts";
import { WIDGET_COMPONENT_MAP } from "./componentMap.ts";

import { API_BASE_URL } from "@/config";
// 🌟 [변경 1] 백엔드 주소 상수 정의 (다른 파일에 있다면 import 해서 쓰셔도 됩니다)
const BASE_URL = API_BASE_URL;
const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};
export const useWidgetRegistry = (userId?: number) => {
    const [registry, setRegistry] = useState<Record<string, WidgetConfig>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        const fetchWidgets = async () => {
            try {
                const params = userId ? { userId } : {};
                // 🌟 [추가 2] 헤더 가져오기
                const headers = getAuthHeaders();
                // 🌟 [변경 2] 전체 URL(Full URL)을 적어줍니다.
                // 이제 Vite 서버(5173)가 아니라 백엔드(8080)로 바로 꽂힙니다.
                // 🌟 [추가 3] axios 요청에 headers 포함
                const response = await axios.get<WidgetDefinition[]>(`${BASE_URL}/api/widgets`, {
                    params,
                    headers // 여기에 헤더 추가
                });
                const widgetDefinitions = response.data;

                // 방어 코드 (배열 체크)
                if (!Array.isArray(widgetDefinitions)) {
                    console.error('서버 응답이 배열이 아닙니다:', widgetDefinitions);
                    setRegistry({});
                    setIsLoading(false);
                    return;
                }

                // 데이터 병합 로직
                const mergedRegistry: Record<string, WidgetConfig> = {};

                widgetDefinitions.forEach((def) => {
                    const Component = WIDGET_COMPONENT_MAP[def.widgetType];

                    if (Component) {
                        mergedRegistry[def.widgetType] = {
                            ...def,
                            component: Component,
                        };
                    }
                });

                setRegistry(mergedRegistry);
            } catch (err) {
                console.error('Failed to fetch widget definitions:', err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWidgets();
    }, [userId]);

    return { registry, isLoading, error };
};