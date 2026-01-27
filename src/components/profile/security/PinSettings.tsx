import React, { useState, useEffect } from 'react';
import { Lock, ChevronDown, Shield, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import PinInputModal from '../../security/PinInputModal';
import { API_BASE_URL } from '../../../api/config';

interface PinSettingsProps {
    confirmModal: (config: {
        isOpen: boolean;
        title: string;
        message: string;
        type?: 'info' | 'danger' | 'success';
        singleButton?: boolean;
        onConfirm: () => void;
    }) => void;
    closeConfirmModal: () => void;
}

const PinSettings: React.FC<PinSettingsProps> = ({ confirmModal, closeConfirmModal }) => {
    const { checkPinStatus, unlockRequest, unlockVerify } = useAuth();
    const [usePin, setUsePin] = useState(false);
    const [isPinExpanded, setIsPinExpanded] = useState(false);

    // PIN Modal State
    const [showPinInputModal, setShowPinInputModal] = useState(false);
    const [tempNewPin, setTempNewPin] = useState<string>('');
    const [pinModalConfig, setPinModalConfig] = useState<{
        title: string;
        subtitle: string;
        mode: 'REGISTER' | 'VERIFY_OLD' | 'SET_NEW' | 'CONFIRM_NEW' | 'DISABLE' | 'LOCKED_EMAIL_VERIFY';
    }>({
        title: 'PIN 설정',
        subtitle: '6자리 숫자를 입력하세요',
        mode: 'REGISTER'
    });

    useEffect(() => {
        const initPinStatus = async () => {
            const status = await checkPinStatus();
            setUsePin(status);
        };
        initPinStatus();
    }, [checkPinStatus]);

    const openPinModal = (mode: 'REGISTER' | 'VERIFY_OLD' | 'SET_NEW' | 'CONFIRM_NEW' | 'DISABLE' | 'LOCKED_EMAIL_VERIFY') => {
        let title = 'PIN 설정';
        let subtitle = '6자리 숫자를 입력하세요';

        switch (mode) {
            case 'REGISTER':
                title = 'PIN 설정';
                subtitle = '잠금 해제에 사용할 6자리 숫자를 입력하세요';
                break;
            case 'VERIFY_OLD':
                title = '기존 PIN 입력';
                subtitle = '현재 설정된 6자리 PIN을 입력하세요';
                break;
            case 'SET_NEW':
                title = '새 PIN 입력';
                subtitle = '변경할 6자리 숫자를 입력하세요';
                break;
            case 'CONFIRM_NEW':
                title = 'PIN 확인';
                subtitle = '한 번 더 입력해 주세요';
                break;
            case 'DISABLE':
                title = 'PIN 해제';
                subtitle = '현재 설정된 6자리 PIN을 입력하세요';
                break;
            case 'LOCKED_EMAIL_VERIFY':
                title = '인증코드 입력';
                subtitle = '가입하신 메일을 통해 받은 인증코드를 입력해주세요';
                break;
        }

        setPinModalConfig({ title, subtitle, mode });
        setShowPinInputModal(true);
    };

    const handlePinSubmit = async (pin: string): Promise<string | null> => {
        const token = localStorage.getItem('accessToken');

        try {
            if (pinModalConfig.mode === 'REGISTER') {
                const response = await fetch('${API_BASE_URL}/api/pin/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ pin })
                });

                if (response.ok) {
                    setUsePin(true);
                    setShowPinInputModal(false);
                    return null;
                } else {
                    return 'PIN 등록에 실패했습니다.';
                }

            } else if (pinModalConfig.mode === 'VERIFY_OLD') {
                const response = await fetch('${API_BASE_URL}/api/pin/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ pin })
                });

                const isCorrect = await response.json();
                if (isCorrect === true) {
                    openPinModal('SET_NEW');
                    return null;
                } else {
                    const statusRes = await fetch('${API_BASE_URL}/api/pin/status', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (statusRes.ok) {
                        const status = await statusRes.json();
                        if (status.locked) {
                            openPinModal('LOCKED_EMAIL_VERIFY');
                            return '계정이 잠겼습니다. 이메일 인증을 진행해주세요.';
                        }
                        return `PIN이 일치하지 않습니다. (${status.failureCount}/5)`;
                    }
                    return 'PIN이 일치하지 않습니다.';
                }

            } else if (pinModalConfig.mode === 'SET_NEW') {
                setTempNewPin(pin);
                openPinModal('CONFIRM_NEW');
                return null;

            } else if (pinModalConfig.mode === 'CONFIRM_NEW') {
                if (pin === tempNewPin) {
                    const response = await fetch('${API_BASE_URL}/api/pin/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ pin })
                    });

                    if (response.ok) {
                        setShowPinInputModal(false);
                        setTempNewPin('');
                        return null;
                    } else {
                        return 'PIN 변경 실패. 다시 시도해주세요.';
                    }
                } else {
                    return 'PIN 번호가 일치하지 않습니다.';
                }
            } else if (pinModalConfig.mode === 'DISABLE') {
                const verifyResponse = await fetch('${API_BASE_URL}/api/pin/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ pin })
                });

                const isCorrect = await verifyResponse.json();
                if (isCorrect === true) {
                    const deleteResponse = await fetch('${API_BASE_URL}/api/pin', {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (deleteResponse.ok) {
                        setUsePin(false);
                        setShowPinInputModal(false);
                        return null;
                    } else {
                        return 'PIN 해제에 실패했습니다.';
                    }
                } else {
                    const statusRes = await fetch('${API_BASE_URL}/api/pin/status', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (statusRes.ok) {
                        const status = await statusRes.json();
                        if (status.locked) {
                            openPinModal('LOCKED_EMAIL_VERIFY');
                            return '계정이 잠겼습니다. 이메일 인증을 진행해주세요.';
                        }
                        return `PIN이 일치하지 않습니다. (${status.failureCount}/5)`;
                    }
                    return 'PIN이 일치하지 않습니다.';
                }
            } else if (pinModalConfig.mode === 'LOCKED_EMAIL_VERIFY') {
                const error = await unlockVerify(pin);
                if (!error) {
                    setShowPinInputModal(false);
                    setUsePin(false);
                    confirmModal({
                        isOpen: true,
                        title: "PIN 해제",
                        message: "PIN 잠금이 해제되었으며, PIN 기능이 비활성화되었습니다.",
                        type: 'success',
                        singleButton: true,
                        onConfirm: closeConfirmModal
                    });
                    return null;
                }
                return error;
            }
        } catch (error) {
            console.error("PIN processing error", error);
            return "오류가 발생했습니다.";
        }
        return "알 수 없는 오류";
    };

    return (
        <div className="border-b theme-border">
            <button
                onClick={() => setIsPinExpanded(!isPinExpanded)}
                className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between hover:opacity-80"
            >
                <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 theme-text-secondary" />
                    <div>
                        <span className="block theme-text-primary">PIN 기능</span>
                        <span className="text-sm theme-text-secondary">앱 잠금 및 보안 설정</span>
                    </div>
                </div>
                <ChevronDown className={`w-5 h-5 theme-text-secondary transition-transform duration-200 ${isPinExpanded ? 'transform rotate-180' : ''}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ${isPinExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <button className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-t theme-border hover:opacity-80 pl-10">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 theme-text-secondary" />
                        <div>
                            <span className="block theme-text-primary">PIN 사용</span>
                            <span className="text-sm theme-text-secondary">앱 실행 시 PIN으로 잠금 해제</span>
                        </div>
                    </div>
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!usePin) {
                                openPinModal('REGISTER');
                            } else {
                                openPinModal('DISABLE');
                            }
                        }}
                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${usePin ? 'bg-[var(--btn-bg)]' : 'bg-gray-300'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${usePin ? 'right-1' : 'left-1'}`}></div>
                    </div>
                </button>

                {usePin && (
                    <button
                        onClick={() => openPinModal('VERIFY_OLD')}
                        className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-t theme-border hover:opacity-80 pl-10"
                    >
                        <div className="flex items-center gap-3">
                            <RefreshCw className="w-5 h-5 theme-text-secondary" />
                            <div>
                                <span className="block theme-text-primary">PIN 번호 변경</span>
                                <span className="text-sm theme-text-secondary">기존 PIN 입력 후 재설정</span>
                            </div>
                        </div>
                        <span className="theme-text-secondary">→</span>
                    </button>
                )}
            </div>

            {showPinInputModal && (
                <PinInputModal
                    title={pinModalConfig.title}
                    subtitle={pinModalConfig.subtitle}
                    isLocked={pinModalConfig.mode === 'LOCKED_EMAIL_VERIFY'}
                    onClose={() => setShowPinInputModal(false)}
                    onSubmit={handlePinSubmit}
                    onUnlockRequest={unlockRequest}
                />
            )}
        </div>
    );
};

export default PinSettings;
