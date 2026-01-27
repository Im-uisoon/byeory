import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, CheckCircle, Loader2, Send, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GoogleLoginButton from '../../components/auth/GoogleLoginButton';
import NaverLoginButton from '../../components/auth/NaverLoginButton';

function JoinPage() {
    const navigate = useNavigate();
    const { socialLogin, signup } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    // Email Verification State
    const [verificationCode, setVerificationCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const handleSendVerification = async () => {
        if (!email) {
            alert("이메일을 입력해주세요.");
            return;
        }

        setIsSending(true);
        try {
            const res = await fetch('http://localhost:8080/auth/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (res.ok) {
                const code = await res.text();
                console.log("Validation Sent:", code);
                setIsCodeSent(true);
                setIsVerified(false);
                alert("인증번호가 전송되었습니다. 이메일을 확인해주세요.");
            } else {
                alert("인증번호 전송에 실패했습니다. 다시 시도해주세요.");
            }
        } catch (error) {
            console.error("Email send error:", error);
            alert("인증번호 전송 중 오류가 발생했습니다.");
        } finally {
            setIsSending(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!verificationCode) {
            alert("인증번호를 입력해주세요.");
            return;
        }
        try {
            const res = await fetch('http://localhost:8080/auth/email/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, authNum: verificationCode })
            });

            const resultText = await res.text();
            if (resultText === 'true') {
                setIsVerified(true);
                alert("이메일 인증이 완료되었습니다.");
            } else {
                alert("인증번호가 일치하지 않습니다.");
                setIsVerified(false);
            }
        } catch (error) {
            console.error("Verification error:", error);
            alert("인증 확인 중 오류가 발생했습니다.");
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== passwordConfirm) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (!isVerified) {
            alert("이메일 인증을 완료해주세요.");
            return;
        }

        const success = await signup(email, password);
        if (success) {
            alert("회원가입이 완료되었습니다.");
            navigate('/login');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link to="/" className="mb-8 block text-center">
                    <img src="/logo.png" alt="벼리" className="mx-auto w-32 mb-4" />
                    <h1 className="theme-text-primary mb-2 text-3xl font-bold">회원가입</h1>
                    <p className="theme-text-secondary text-sm">벼리와 함께 일상을 기록해보세요</p>
                </Link>

                {/* Join Form */}
                <div className="theme-bg-card theme-border rounded-2xl border p-8 shadow-lg backdrop-blur-md">
                    <form onSubmit={handleJoin} className="space-y-6">
                        {/* Email Input */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="theme-text-primary block text-sm font-medium">
                                이메일
                            </label>
                            <div className="flex gap-2">
                                <div className="relative border rounded-lg flex-1">
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setIsVerified(false);
                                            setIsCodeSent(false);
                                        }}
                                        placeholder="example@email.com"
                                        required
                                        className="theme-border theme-text-primary placeholder:text-gray-400 w-full rounded-lg border bg-transparent px-4 py-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                    />
                                    <Mail className="theme-icon absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-70" />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSendVerification}
                                    disabled={isVerified || isSending}
                                    className={`p-4 rounded-lg font-medium transition-all flex items-center justify-center aspect-square ${isVerified
                                        ? 'bg-green-500/10 text-green-500 cursor-default'
                                        : isCodeSent
                                            ? 'theme-btn bg-green-500 border-green-500 hover:bg-green-600'
                                            : 'theme-btn'
                                        }`}
                                    title={isVerified ? "인증 완료" : (isCodeSent ? "재전송" : "인증번호 전송")}
                                >
                                    {isSending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : isVerified ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : isCodeSent ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Verification Code Input */}
                        {isCodeSent && !isVerified && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label htmlFor="verificationCode" className="theme-text-primary block text-sm font-medium">
                                    인증번호
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative border rounded-lg flex-1">
                                        <input
                                            id="verificationCode"
                                            type="text"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            placeholder="인증번호 6자리"
                                            className="theme-border theme-text-primary placeholder:text-gray-400 w-full rounded-lg border bg-transparent px-4 py-3 pl-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleVerifyCode}
                                        className="theme-btn px-4 py-2 rounded-lg font-medium whitespace-nowrap"
                                    >
                                        확인
                                    </button>
                                </div>
                            </div>
                        )}

                        {isVerified && (
                            <div className="flex items-center gap-2 text-green-500 text-sm animate-in fade-in duration-300">
                                <CheckCircle className="w-4 h-4" />
                                <span>이메일 인증이 완료되었습니다.</span>
                            </div>
                        )}

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="theme-text-primary block text-sm font-medium">
                                비밀번호
                            </label>
                            <div className="relative border rounded-lg">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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

                        {/* Password Confirm Input */}
                        <div className="space-y-2">
                            <label htmlFor="passwordConfirm" className="theme-text-primary block text-sm font-medium">
                                비밀번호 확인
                            </label>
                            <div className="relative border rounded-lg">
                                <input
                                    id="passwordConfirm"
                                    type={showPasswordConfirm ? 'text' : 'password'}
                                    value={passwordConfirm}
                                    onChange={(e) => setPasswordConfirm(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="theme-border theme-text-primary placeholder:text-gray-400 w-full rounded-lg border bg-transparent px-4 py-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                />
                                <Lock className="theme-icon absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-70" />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                    className="theme-text-secondary hover:theme-text-primary absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                >
                                    {showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!isVerified}
                            className={`w-full rounded-lg h-12 font-semibold shadow-lg transition-all ${isVerified
                                ? 'theme-btn'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                                }`}
                        >
                            회원가입
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-3">
                        <div className="theme-border flex-1 border-t"></div>
                        <span className="theme-text-secondary text-sm">또는</span>
                        <div className="theme-border flex-1 border-t"></div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="space-y-3">
                        <GoogleLoginButton
                            onSuccess={async (credential) => {
                                const success = await socialLogin(credential);
                                if (success) {
                                    navigate('/');
                                } else {
                                    alert("이미 이메일로 가입된 계정입니다.");
                                }
                            }}
                            onError={() => console.error("이미 이메일로 가입된 계정입니다.")}
                        />
                        <NaverLoginButton
                            onSuccess={async (credential) => {
                                const success = await socialLogin(credential);
                                if (success) {
                                    navigate('/');
                                } else {
                                    alert("이미 이메일로 가입된 계정입니다.");
                                }
                            }}
                            onError={() => console.error("이미 이메일로 가입된 계정입니다.")}
                        />
                    </div>

                    {/* Back to Login Link */}
                    <p className="theme-text-secondary mt-6 text-center text-sm w-full flex justify-center gap-2">
                        이미 계정이 있으신가요?{' '}
                        <Link to="/login" className="theme-text-primary font-medium hover:underline transition-colors">
                            로그인
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default JoinPage;
