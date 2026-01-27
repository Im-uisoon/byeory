import React, { useState } from 'react';
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/header/Navigation';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { API_BASE_URL } from '../../api/config';

const PasswordChangePage: React.FC = () => {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type?: 'info' | 'danger' | 'success';
        singleButton?: boolean;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    const closeConfirmModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

    const showModal = (title: string, message: string, type: 'info' | 'danger' | 'success' = 'info', onConfirm?: () => void) => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            type,
            singleButton: true,
            onConfirm: onConfirm || closeConfirmModal
        });
    };

    // Password validation regex
    const hasMinLength = newPassword.length >= 8;
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
    const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

    const handleSave = async () => {
        if (!currentPassword) {
            showModal("입력 오류", "현재 비밀번호를 입력해주세요", 'danger');
            return;
        }
        if (!isPasswordValid) {
            showModal("입력 오류", "비밀번호 조건을 충족해주세요", 'danger');
            return;
        }
        if (!passwordsMatch) {
            showModal("입력 오류", "비밀번호가 일치하지 않습니다", 'danger');
            return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
            showModal("알림", "로그인 정보가 없습니다.", 'danger', () => navigate('/login'));
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword
                })
            });

            if (response.ok) {
                showModal("성공", "비밀번호가 변경되었습니다.", 'success', () => navigate('/profile'));
            } else {
                showModal("변경 실패", "현재 비밀번호가 일치하지 않습니다", 'danger');
            }
        } catch (error) {
            console.error("Error changing password:", error);
            showModal("오류", "서버와 통신 중 오류가 발생했습니다.", 'danger');
        }
    };

    const ValidationItem = ({ isValid, text }: { isValid: boolean; text: string }) => (
        <div className="flex items-center gap-2 text-sm transition-colors">
            {isValid ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
                <XCircle className="w-4 h-4 theme-text-secondary" />
            )}
            <span className={isValid ? "text-green-600" : "theme-text-secondary"}>
                {text}
            </span>
        </div>
    );

    return (
        <div className="min-h-screen">
            <Navigation />

            <div className="pt-16 pb-24 md:pt-20 md:pb-20">
                <div className="max-w-2xl mx-auto px-4">
                    {/* Header */}
                    <div className="mb-6 flex items-center gap-4">
                        <button
                            onClick={() => navigate('/profile')}
                            className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 theme-text-primary" />
                        </button>
                        <h1 className="text-xl font-bold theme-text-primary">비밀번호 변경</h1>
                    </div>

                    <div className="rounded-2xl p-6 shadow-sm border theme-bg-card theme-border space-y-6">
                        {/* Security Notice */}
                        <div className="rounded-2xl p-5 border theme-bg-card-secondary theme-border">
                            <div className="flex items-start gap-3">
                                <Lock className="w-6 h-6 flex-shrink-0 mt-1 theme-icon" />
                                <div>
                                    <h3 className="mb-2 font-medium theme-text-primary">보안 안내</h3>
                                    <p className="leading-relaxed text-sm theme-text-secondary">
                                        안전한 계정 보호를 위해 정기적으로 비밀번호를 변경해주세요.
                                        타인에게 비밀번호를 공유하지 마세요.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Current Password */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 font-medium theme-text-primary">
                                <Lock className="w-5 h-5 theme-icon" />
                                <span>현재 비밀번호</span>
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="현재 비밀번호를 입력하세요"
                                    className="w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all theme-bg-card theme-border theme-text-primary"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 transition-colors theme-text-secondary"
                                >
                                    {showCurrentPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 font-medium theme-text-primary">
                                <Lock className="w-5 h-5 theme-icon" />
                                <span>새 비밀번호</span>
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="새 비밀번호를 입력하세요"
                                    className="w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all theme-bg-card theme-border theme-text-primary"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 transition-colors theme-text-secondary"
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            {/* Password Requirements */}
                            {newPassword && (
                                <div className="rounded-xl p-4 border space-y-2 theme-bg-card-secondary theme-border">
                                    <p className="mb-2 font-medium theme-text-primary">비밀번호 조건:</p>
                                    <ValidationItem isValid={hasMinLength} text="8자 이상" />
                                    <ValidationItem isValid={hasUpperCase} text="대문자 포함" />
                                    <ValidationItem isValid={hasLowerCase} text="소문자 포함" />
                                    <ValidationItem isValid={hasNumber} text="숫자 포함" />
                                    <ValidationItem
                                        isValid={hasSpecialChar}
                                        text="특수문자 포함 (선택사항)"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 font-medium theme-text-primary">
                                <Lock className="w-5 h-5 theme-icon" />
                                <span>새 비밀번호 확인</span>
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="새 비밀번호를 다시 입력하세요"
                                    className="w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all theme-bg-card theme-border theme-text-primary"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 transition-colors theme-text-secondary"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            {/* Password Match Indicator */}
                            {confirmPassword && (
                                <div className={`flex items-center gap-2 ${passwordsMatch ? "text-green-600" : "text-red-500"
                                    }`}>
                                    {passwordsMatch ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span className="text-sm">비밀번호가 일치합니다</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-4 h-4" />
                                            <span className="text-sm">비밀번호가 일치하지 않습니다</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Password Strength Indicator */}
                        {newPassword && (
                            <div className="rounded-xl p-4 border theme-bg-card-secondary theme-border">
                                <p className="mb-3 font-medium theme-text-primary">비밀번호 강도:</p>
                                <div className="flex gap-2 mb-2">
                                    <div className={`h-2 flex-1 rounded-full ${hasMinLength ? "bg-red-500" : "bg-gray-200"
                                        }`} />
                                    <div className={`h-2 flex-1 rounded-full ${hasMinLength && hasUpperCase && hasLowerCase ? "bg-amber-500" : "bg-gray-200"
                                        }`} />
                                    <div className={`h-2 flex-1 rounded-full ${isPasswordValid && hasSpecialChar ? "bg-green-500" : "bg-gray-200"
                                        }`} />
                                </div>
                                <p className="text-sm theme-text-secondary">
                                    {!hasMinLength ? "약함" :
                                        !hasUpperCase || !hasLowerCase || !hasNumber ? "보통" :
                                            hasSpecialChar ? "강함" : "보통"}
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => navigate('/profile')}
                                className="flex-1 py-3 rounded-xl transition-colors font-medium theme-bg-card theme-text-primary border theme-border"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!currentPassword || !isPasswordValid || !passwordsMatch}
                                className="flex-1 py-3 rounded-xl shadow-lg transition-all font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed theme-btn"
                            >
                                변경하기
                            </button>
                        </div>
                    </div>
                </div>

                <ConfirmationModal
                    isOpen={confirmModal.isOpen}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    type={confirmModal.type}
                    singleButton={confirmModal.singleButton}
                    onConfirm={() => {
                        confirmModal.onConfirm();
                        if (confirmModal.singleButton) closeConfirmModal();
                    }}
                    onCancel={closeConfirmModal}
                />
            </div>
        </div>
    );
}

export default PasswordChangePage;
