import type { WidgetInstance } from '../components/settings/widgets/type';
import { API_BASE_URL } from '../api/config';


const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

export const getWidgetSettings = async (): Promise<WidgetInstance[] | null> => {
    const response = await fetch(`${API_BASE_URL}/api/setting/all`, {
        headers: getHeaders()
    });

    if (!response.ok) {
        return null;
    }

    const data = await response.json();
    const rawWidgets = data.widget as any[];

    if (!rawWidgets) {
        return null; // Return null if date.widget is null/undefined
    }

    // Transform backend data to match WidgetInstance interface (Backward compatibility)
    return rawWidgets.map(w => {
        if (!w.layout) {
            // If flat structure (from old default or old saved data)
            return {
                id: w.id || w.i, // Backend was using "i", Frontend uses "id"
                type: w.type,
                props: w.props || {},
                layout: {
                    x: w.x || 0,
                    y: w.y || 0,
                    w: w.w || 1,
                    h: w.h || 1
                }
            };
        }
        return w;
    }) as WidgetInstance[];
};

export const updateWidgetSettings = async (widgets: WidgetInstance[]): Promise<void> => {
    if (!localStorage.getItem('accessToken')) return;

    const response = await fetch(`${API_BASE_URL}/api/setting/widgets`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(widgets)
    });

    if (!response.ok) {
        throw new Error('Failed to update widget settings');
    }
};

// --- Preset API ---

export interface WidgetPreset {
    id: number;
    name: string;
    createdAt: string;
    widgets: WidgetInstance[];
    gridSize: { cols: number; rows: number };
}

export const getPresets = async (): Promise<WidgetPreset[]> => {
    if (!localStorage.getItem('accessToken')) return [];
    const response = await fetch(`${API_BASE_URL}/api/setting/widgets/presets`, {
        headers: getHeaders()
    });
    if (!response.ok) return [];

    const data = await response.json();
    // Assuming backend returns widgets with flat structure inside presets too, 
    // we need to transform them similar to getWidgetSettings logic if needed.
    // For now assuming same structure or helper reuse.

    // Quick transform for consistency if backend uses flat structure logic defaults
    return data.map((d: any) => ({
        ...d,
        widgets: d.widgets.map((w: any) => {
            if (!w.layout) {
                return {
                    id: w.id || w.i,
                    type: w.type,
                    props: w.props || {},
                    layout: { x: w.x || 0, y: w.y || 0, w: w.w || 1, h: w.h || 1 }
                };
            }
            return w;
        })
    })) as WidgetPreset[];
};

export const createPreset = async (name: string, widgets: WidgetInstance[], gridSize: { cols: number; rows: number }) => {
    if (!localStorage.getItem('accessToken')) return;
    await fetch(`${API_BASE_URL}/api/setting/widgets/presets`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, widgets, gridSize })
    });
};

export const deletePreset = async (id: number) => {
    if (!localStorage.getItem('accessToken')) return;
    await fetch(`${API_BASE_URL}/api/setting/widgets/presets/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
};

export const updatePreset = async (id: number, widgets: WidgetInstance[], gridSize: { cols: number; rows: number }) => {
    if (!localStorage.getItem('accessToken')) return;
    await fetch(`${API_BASE_URL}/api/setting/widgets/presets/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ widgets, gridSize })
    });
};
