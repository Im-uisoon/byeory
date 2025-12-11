import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // A simple fake login using the entered email
        if (email && password) {
            login(email);
            navigate('/');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link to="/" className="mb-8 block text-center">
                    <img src="/logo.png" alt="벼리" className="mx-auto w-32 mb-4" />
                    <h1 className="theme-text-primary mb-2 text-3xl font-bold">환영합니다</h1>
                    <p className="theme-text-secondary text-sm">벼리에 로그인하여 일상을 기록하세요</p>
                </Link>

                {/* Login Form */}
                <div className="theme-bg-card theme-border rounded-2xl border p-8 shadow-lg backdrop-blur-md">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Email Input */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="theme-text-primary block text-sm font-medium">
                                이메일
                            </label>
                            <div className="relative border rounded-lg">
                                <input
                                    id="email"
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

                        {/* Keep Signed In & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="accent-blue-500 h-4 w-4 rounded" />
                                <span className="theme-text-secondary text-sm">로그인 유지</span>
                            </label>
                            <Link to="/find-password" className="theme-text-primary hover:underline text-sm transition-colors">
                                비밀번호 찾기
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className="theme-btn w-full rounded-lg py-3 font-semibold shadow-lg">
                            로그인
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-3">
                        <div className="theme-border flex-1 border-t"></div>
                        <span className="theme-text-secondary text-sm">또는</span>
                        <div className="theme-border flex-1 border-t"></div>
                    </div>

                    {/* Social Login Buttons (Mock) */}
                    <div className="space-y-3 border rounded-lg">
                        <button className="theme-border hover:bg-black/5 flex w-full items-center justify-center gap-3 rounded-lg border bg-transparent py-3 transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="theme-text-primary font-medium">Google로 계속하기</span>
                        </button>
                    </div>

                    {/* Sign Up Link */}
                    <p className="theme-text-secondary mt-6 text-center text-sm">
                        계정이 없으신가요?{' '}
                        <Link to="/join" className="theme-text-primary font-medium hover:underline transition-colors">
                            회원가입
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
