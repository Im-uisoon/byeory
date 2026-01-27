import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

function FindPasswordPage() {
    const [step, setStep] = useState<'email' | 'verify' | 'reset' | 'complete'>('email');
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState('');

    // UI States
    const [showPassword, setShowPassword] = useState(false);
    const [timer, setTimer] = useState(180); // 3min

    useEffect(() => {
        let interval: any;
        if (step === 'verify' && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Step 1: Send Email Code
    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8080/auth/password-reset/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                setStep('verify');
                setTimer(180);
            } else if (response.status === 404) {
                alert('가입되지 않은 이메일입니다.');
            } else if (response.status === 400 && data.code === 'SOCIAL_ACCOUNT') {
                alert('Google 소셜 로그인으로 가입된 계정입니다.\nGoogle 로그인을 이용해주세요.');
            } else {
                alert(data.message || '인증번호 전송에 실패했습니다.');
            }
        } catch (error) {
            console.error('Email send error:', error);
            alert('서버 연결 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify Code
    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8080/auth/password-reset/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                if (data.resetToken) {
                    setResetToken(data.resetToken);
                }
                setStep('reset');
            } else {
                alert(data.message || '인증번호가 올바르지 않습니다.');
            }
        } catch (error) {
            console.error('Verification error:', error);
            alert('인증 확인 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8080/auth/password-reset/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    resetToken
                }),
            });

            if (response.ok) {
                setStep('complete');
            } else {
                const data = await response.json().catch(() => ({}));
                alert(data.message || '비밀번호 변경에 실패했습니다.');
            }
        } catch (error) {
            console.error('Password reset error:', error);
            alert('비밀번호 변경 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo & Title */}
                <div className="mb-8 text-center">
                    <Link to="/login" className="mb-4 inline-block">
                        <img src="/logo.png" alt="벼리" className="mx-auto w-32" />
                    </Link>
                    <h1 className="theme-text-primary mb-2 text-2xl font-bold">비밀번호 찾기</h1>
                    <p className="theme-text-secondary text-sm">
                        {step === 'email' && '가입 시 등록한 이메일을 입력해주세요.'}
                        {step === 'verify' && '이메일로 전송된 인증번호를 입력해주세요.'}
                        {step === 'reset' && '새로운 비밀번호를 설정해주세요.'}
                        {step === 'complete' && '비밀번호가 성공적으로 변경되었습니다.'}
                    </p>
                </div>

                {/* Card Container */}
                <div className="theme-bg-card theme-border rounded-2xl border p-8 shadow-lg backdrop-blur-md relative overflow-hidden">

                    {/* Step 1: Email Input */}
                    {step === 'email' && (
                        <form onSubmit={handleSendCode} className="space-y-6">
                            <div className="space-y-2">
                                <label className="theme-text-primary block text-sm font-medium">이메일</label>
                                <div className="relative border rounded-lg">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="example@email.com"
                                        required
                                        className="theme-border theme-text-primary placeholder:text-gray-400 w-full rounded-lg border bg-transparent px-4 py-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                    />
                                    <Mail className="theme-icon absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-70" />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="theme-btn w-full rounded-lg py-3 font-semibold shadow-lg flex items-center justify-center gap-2"
                            >
                                {isLoading ? '전송 중...' : '인증번호 보내기'}
                                {!isLoading && <ArrowRight className="w-4 h-4" />}
                            </button>
                            <div className="mt-6 text-center">
                                <Link to="/login" className="theme-text-secondary hover:theme-text-primary text-sm inline-flex items-center gap-2 transition-colors">
                                    <ArrowLeft className="w-4 h-4" />
                                    로그인으로 돌아가기
                                </Link>
                            </div>
                        </form>
                    )}

                    {/* Step 2: Verification Code */}
                    {step === 'verify' && (
                        <form onSubmit={handleVerifyCode} className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="theme-text-primary block text-sm font-medium">인증번호</label>
                                    <span className="text-red-500 text-sm font-medium">{formatTime(timer)}</span>
                                </div>
                                <div className="relative border rounded-lg">
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="6자리 인증번호"
                                        maxLength={6}
                                        required
                                        className="theme-border theme-text-primary placeholder:text-gray-400 w-full rounded-lg border bg-transparent px-4 py-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all tracking-widest"
                                    />
                                    <CheckCircle className="theme-icon absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-70" />
                                </div>
                                <p className="text-xs theme-text-secondary mt-1">
                                    이메일을 받지 못하셨나요?{' '}
                                    <button type="button" onClick={() => {
                                        setTimer(180);
                                        // Optional: Trigger resend API explicitly here
                                        handleSendCode({ preventDefault: () => { } } as React.FormEvent);
                                    }} className="theme-text-primary underline hover:opacity-80">
                                        재전송
                                    </button>
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="theme-btn w-full rounded-lg py-3 font-semibold shadow-lg flex items-center justify-center gap-2"
                            >
                                {isLoading ? '확인 중...' : '인증하기'}
                            </button>
                        </form>
                    )}

                    {/* Step 3: Reset Password */}
                    {step === 'reset' && (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div className="space-y-2">
                                <label className="theme-text-primary block text-sm font-medium">새 비밀번호</label>
                                <div className="relative border rounded-lg">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="theme-border theme-text-primary placeholder:text-gray-400 w-full rounded-lg border bg-transparent px-4 py-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                    />
                                    <Lock className="theme-icon absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-70" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="theme-text-primary block text-sm font-medium">비밀번호 확인</label>
                                <div className="relative border rounded-lg">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="theme-border theme-text-primary placeholder:text-gray-400 w-full rounded-lg border bg-transparent px-4 py-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                    />
                                    <Lock className="theme-icon absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-70" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="theme-text-secondary hover:theme-text-primary absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="theme-btn w-full rounded-lg py-3 font-semibold shadow-lg"
                            >
                                {isLoading ? '변경 중...' : '비밀번호 변경'}
                            </button>
                        </form>
                    )}

                    {/* Step 4: Complete */}
                    {step === 'complete' && (
                        <div className="text-center py-6">
                            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="theme-text-primary text-lg font-bold mb-2">변경 완료!</h3>
                            <p className="theme-text-secondary text-sm mb-6">
                                비밀번호가 성공적으로 변경되었습니다.<br />
                                새로운 비밀번호로 로그인해주세요.
                            </p>
                            <Link
                                to="/login"
                                className="theme-btn w-full rounded-lg py-3 font-semibold shadow-lg block"
                            >
                                로그인하러 가기
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FindPasswordPage;
