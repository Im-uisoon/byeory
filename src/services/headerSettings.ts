import { API_BASE_URL } from '../api/config';

export interface HeaderSettings {
    showTimer: boolean;
    showCredit: boolean;
    showWidgetZoom: boolean;
    showFloatingPanel: boolean; // ✨ Now persistent
}

const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

export const getHeaderSettings = async (): Promise<HeaderSettings | null> => {
    const response = await fetch(`${API_BASE_URL}/api/setting/all`, {
        headers: getHeaders()
    });

    if (!response.ok) {
        if (response.status === 401) return null; // Not logged in
        return null; // Handle error gracefully or throw
    }

    const data = await response.json();
    return data.header || null;
};

export const updateHeaderSettings = async (settings: HeaderSettings): Promise<void> => {
    // Only update if logged in
    if (!localStorage.getItem('accessToken')) return;

    const response = await fetch(`${API_BASE_URL}/api/setting/header`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(settings)
    });

    if (!response.ok) {
        throw new Error('Failed to update header settings');
    }
};
