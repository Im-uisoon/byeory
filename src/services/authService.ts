import { API_BASE_URL } from '../api/config';

export interface SocialLoginData {
    email: string;
    providerId: string;
    provider?: string;
    name?: string;
    nickname?: string;
    profileImage?: string;
    gender?: string;
    birthday?: string;
    birthyear?: string;
    mobile?: string;
}

export const authService = {
    // 1. 이메일 중복 체크
    checkEmail: async (email: string) => {
        const response = await fetch(`${API_BASE_URL}/api/auth/check-email?email=${email}`);
        if (!response.ok) throw new Error('Failed to check email');
        return response.json();
    },

    checkPinStatus: async (token: string) => {
        const res = await fetch(`${API_BASE_URL}/api/pin/status`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to check pin status');
        return res.json();
    },

    checkPinSet: async (token: string) => {
        const res = await fetch(`${API_BASE_URL}/api/pin/check`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to check pin set');
        return res.json();
    },

    socialLogin: async (loginData: any) => {
        const response = await fetch(`${API_BASE_URL}/auth/social-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData),
        });
        if (!response.ok) throw response;
        return response.json();
    },

    localLogin: async (email: string, password: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) throw response;
        return response.json();
    },

    join: async (joinData: any) => {
        const response = await fetch(`${API_BASE_URL}/auth/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(joinData),
        });
        if (!response.ok) throw response;
        return response;
    },

    verifyProfile: async (token: string) => {
        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.ok;
    },

    validateToken: async (token: string) => {
        // Use a lightweight endpoint to check token validity
        const response = await fetch(`${API_BASE_URL}/api/pin/check`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Invalid token');
        return true;
    }
};
