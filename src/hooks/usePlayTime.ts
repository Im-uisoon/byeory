import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

import { API_BASE_URL as CONFIG_URL } from "@/config";

const API_BASE_URL = `${CONFIG_URL}/api/user`;
const SESSION_STORAGE_KEY = 'session_playtime_seconds';

export const usePlayTime = () => {
    // Initialize from sessionStorage to survive refreshes
    const [playTime, setPlayTime] = useState<number>(() => {
        const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
        return stored ? parseInt(stored, 10) : 0;
    });

    const { isLoggedIn } = useAuth();
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Save to sessionStorage whenever playTime changes
    useEffect(() => {
        if (playTime > 0) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, playTime.toString());
        }
    }, [playTime]);

    // Note: We removed the auto-cleanup on !isLoggedIn here to prevent race conditions on page refresh.
    // Instead, we will explicitly clear sessionStorage in the logout function in AuthContext.

    // 1. Heartbeat Request (POST /api/user/heartbeat) - Background Process
    const sendHeartbeat = useCallback(async () => {
        if (!isLoggedIn) return;

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            await axios.post(`${API_BASE_URL}/heartbeat`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // Background sync success
        } catch (error) {
            console.error('Heartbeat failed:', error);
        }
    }, [isLoggedIn]);

    // 2. Heartbeat Loop (Every 60 seconds)
    useEffect(() => {
        if (!isLoggedIn) return;

        // Execute heartbeat regardless of visibility (it's "Background" info)
        // Or should we only send heartbeat if active? 
        // User said: "백엔드에 보내거나 받는 자료는 분 단위로 누적 접속시간을 체크하는 것이고, 백그라운드 정보임"
        // Usually heartbeats are sent while the session is alive.
        const heartbeatInterval = setInterval(sendHeartbeat, 60000); // 60 seconds

        return () => clearInterval(heartbeatInterval);
    }, [isLoggedIn, sendHeartbeat]);

    // 3. Session Timer Loop (1s) - Only when Visible
    useEffect(() => {
        if (!isLoggedIn) return;

        const startTimer = () => {
            if (timerRef.current) return;
            timerRef.current = setInterval(() => {
                setPlayTime(prev => prev + 1);
            }, 1000);
        };

        const stopTimer = () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                startTimer();
            } else {
                stopTimer();
            }
        };

        // Initial check
        if (document.visibilityState === 'visible') {
            startTimer();
        }

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            stopTimer();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isLoggedIn]);

    return playTime;
};
