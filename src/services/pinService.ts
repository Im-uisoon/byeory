import { API_BASE_URL } from '../api/config';

export const pinService = {
    registerPin: async (pin: string) => {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/api/pin/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ pin })
        });
        if (!response.ok) throw response;
        return response.json();
    },

    verifyPin: async (token: string, pin: string) => {
        const response = await fetch(`${API_BASE_URL}/api/pin/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ pin })
        });
        if (!response.ok) throw response;
        return response.json();
    },

    requestUnlock: async (token: string) => {
        const response = await fetch(`${API_BASE_URL}/unlock-request`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.ok;
    },

    verifyUnlockCode: async (token: string, code: string) => {
        const response = await fetch(`${API_BASE_URL}/unlock`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ code })
        });
        if (!response.ok) throw response;
        return response.ok;
    },

    // AuthContext used raw fetch for getting status in failure loop logic
    getStatus: async (token: string) => {
        const response = await fetch(`${API_BASE_URL}/status`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) return response.json();
        throw new Error("Failed to get status");
    }
};
