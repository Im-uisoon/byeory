import { useState, useEffect } from "react";
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

interface PasswordChangeScreenProps {
    onClose: () => void;
    onSave: (oldPassword: string, newPassword: string) => void;
}

export function PasswordChangeScreen({ onClose, onSave }: PasswordChangeScreenProps) {
    const { theme } = useTheme();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [customBg, setCustomBg] = useState<string>('');

    useEffect(() => {
        if (theme === 'custom' && typeof window !== 'undefined') {
            try {
                const settingsStr = localStorage.getItem('customThemeSettings');
                if (settingsStr) {
                    const settings = JSON.parse(settingsStr);
                    const { gradient } = settings;

                    if (gradient && gradient.enabled) {
                        setCustomBg(`linear-gradient(${gradient.dir}, ${gradient.start} ${gradient.startPos}%, ${gradient.end} ${gradient.endPos}%)`);
                    } else {
                        setCustomBg('');
                    }
                }
            } catch (e) {
                console.error("Failed to load custom theme settings", e);
            }
        }
    }, [theme]);

    // Password validation
    const hasMinLength = newPassword.length >= 8;
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
    const passwordsMatch = newPassword && newPassword === confirmPassword;

    const handleSave = () => {
        if (!currentPassword) {
            alert("현재 비밀번호를 입력해주세요");
            return;
        }
        if (!newPassword) {
            alert("새 비밀번호를 입력해주세요");
            return;
        }
        if (!isPasswordValid) {
            alert("비밀번호 조건을 확인해주세요");
            return;
        }
        if (!passwordsMatch) {
            alert("새 비밀번호가 일치하지 않습니다");
            return;
        }
        if (currentPassword === newPassword) {
            alert("새 비밀번호는 현재 비밀번호와 달라야 합니다");
            return;
        }

        onSave(currentPassword, newPassword);
    };

    const ValidationItem = ({ isValid, text }: { isValid: boolean; text: string }) => (
        <div className="flex items-center gap-2">
            {isValid ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
                <XCircle className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            )}
            <span className={isValid ? "text-green-600" : ""} style={{ color: isValid ? undefined : 'var(--text-muted)' }}>
                {text}
            </span>
        </div>
    );

    const getBackground = () => {
        if (theme === 'custom') {
            if (customBg) return customBg;
            return 'var(--bg-primary)';
        }
        if (theme === 'dark') return undefined;
        return 'var(--bg-primary)';
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex flex-col ${theme === 'dark' ? 'theme-bg-gradient' : ''}`}
            style={{
                background: getBackground(),
                backgroundColor: !getBackground()?.includes('gradient') ? 'var(--bg-primary)' : undefined
            }}
        >
            {/* Header */}
            <div className="px-6 py-5 text-white" style={{ backgroundColor: 'var(--accent-primary)' }}>
                <div className="flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h2 className="font-bold text-lg">비밀번호 변경</h2>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 pb-24">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Security Notice */}
                    <div className="rounded-2xl p-5 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                        <div className="flex items-start gap-3">
                            <Lock className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: 'var(--accent-primary)' }} />
                            <div>
                                <h3 className="mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>보안 안내</h3>
                                <p className="leading-relaxed text-sm" style={{ color: 'var(--text-muted)' }}>
                                    안전한 계정 보호를 위해 정기적으로 비밀번호를 변경해주세요.
                                    타인에게 비밀번호를 공유하지 마세요.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Current Password */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                            <Lock className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                            <span>현재 비밀번호</span>
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="현재 비밀번호를 입력하세요"
                                className="w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 transition-colors"
                                style={{ color: 'var(--text-muted)' }}
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
                        <label className="flex items-center gap-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                            <Lock className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                            <span>새 비밀번호</span>
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="새 비밀번호를 입력하세요"
                                className="w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 transition-colors"
                                style={{ color: 'var(--text-muted)' }}
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
                            <div className="rounded-xl p-4 border space-y-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                                <p className="mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>비밀번호 조건:</p>
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
                        <label className="flex items-center gap-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                            <Lock className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                            <span>새 비밀번호 확인</span>
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="새 비밀번호를 다시 입력하세요"
                                className="w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 transition-colors"
                                style={{ color: 'var(--text-muted)' }}
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
                                        <span>비밀번호가 일치합니다</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-4 h-4" />
                                        <span>비밀번호가 일치하지 않습니다</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Password Strength Indicator */}
                    {newPassword && (
                        <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                            <p className="mb-3 font-medium" style={{ color: 'var(--text-primary)' }}>비밀번호 강도:</p>
                            <div className="flex gap-2 mb-2">
                                <div className={`h-2 flex-1 rounded-full ${hasMinLength ? "bg-red-500" : "bg-gray-200"
                                    }`} />
                                <div className={`h-2 flex-1 rounded-full ${hasMinLength && hasUpperCase && hasLowerCase ? "bg-amber-500" : "bg-gray-200"
                                    }`} />
                                <div className={`h-2 flex-1 rounded-full ${isPasswordValid && hasSpecialChar ? "bg-green-500" : "bg-gray-200"
                                    }`} />
                            </div>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {!hasMinLength ? "약함" :
                                    !hasUpperCase || !hasLowerCase || !hasNumber ? "보통" :
                                        hasSpecialChar ? "강함" : "보통"}
                            </p>
                        </div>
                    )}

                    {/* Save Button */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl transition-colors font-medium"
                            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!currentPassword || !isPasswordValid || !passwordsMatch}
                            className="flex-1 py-3 rounded-xl shadow-lg transition-all font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: 'var(--accent-primary)' }}
                        >
                            변경하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
