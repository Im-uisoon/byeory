import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL as CONFIG_API_BASE_URL } from '../api/config';

const API_BASE_URL = `${CONFIG_API_BASE_URL}/api/user`;
const SESSION_STORAGE_KEY = 'session_playtime_seconds';

export const usePlayTime = () => {
    // 새로고침 시에도 유지되도록 세션 스토리지에서 초기화
    const [playTime, setPlayTime] = useState<number>(() => {
        const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
        return stored ? parseInt(stored, 10) : 0;
    });

    const { isLoggedIn } = useAuth();
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // 플레이 타임 변경 시 세션 스토리지에 자동 저장
    useEffect(() => {
        if (playTime > 0) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, playTime.toString());
        }
    }, [playTime]);

    // 1. 하트비트 전송 (백그라운드 접속 시간 누적)
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
        } catch (error) {
            console.error('Heartbeat failed:', error);
        }
    }, [isLoggedIn]);

    // 2. 하트비트 주기적 실행 (60초마다)
    useEffect(() => {
        if (!isLoggedIn) return;

        // 백그라운드에서도 접속 시간을 누적하기 위해 주기적으로 실행
        const heartbeatInterval = setInterval(sendHeartbeat, 60000);

        return () => clearInterval(heartbeatInterval);
    }, [isLoggedIn, sendHeartbeat]);

    // 3. 화면 표시용 타이머 (1초 단위, 활성화된 탭에서만 동작)
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

        // 초기 실행: 페이지가 보일 때 타이머 시작
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
