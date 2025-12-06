import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // 간단한 로그인 처리 (실제로는 API 호출)
    if (email && password) {
      login(email);
      navigate('/profile');
    }
  };

  return (
    <div className="bg-bg-primary flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <Link to="/" className="mb-8 block text-center">
          <img src="/logo.png" alt="벼리" className="mx-auto w-32" />
          <h1 className="text-text-primary mb-2 text-3xl font-bold">환영합니다</h1>
          <p className="text-text-secondary text-sm">벼리에 로그인하여 일상을 기록하세요</p>
        </Link>

        {/* 로그인 폼 */}
        <div className="bg-bg-secondary border-border rounded-2xl border p-8 shadow-lg">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* 이메일 입력 */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-text-primary block text-sm font-medium">
                이메일
              </label>
              <div className="relative">
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" required className="border-border text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:ring-accent-primary/20 w-full rounded-lg border bg-transparent px-4 py-3 focus:ring-2 focus:outline-none" />
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted absolute top-1/2 right-3 -translate-y-1/2">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
            </div>

            {/* 비밀번호 입력 */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-text-primary block text-sm font-medium">
                비밀번호
              </label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="border-border text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:ring-accent-primary/20 w-full rounded-lg border bg-transparent px-4 py-3 focus:ring-2 focus:outline-none" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-text-muted hover:text-text-secondary absolute top-1/2 right-3 -translate-y-1/2 transition-colors">
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
                      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
                      <path d="m2 2 20 20" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* 로그인 유지 & 비밀번호 찾기 */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-accent-primary h-4 w-4 rounded" />
                <span className="text-text-secondary text-sm">로그인 유지</span>
              </label>
              <Link to="/forgot-password" className="text-accent-primary hover:text-accent-hover text-sm transition-colors">
                비밀번호 찾기
              </Link>
            </div>

            {/* 로그인 버튼 */}
            <button type="submit" className="bg-accent-primary hover:bg-accent-hover w-full rounded-lg py-3 font-semibold text-white shadow-lg transition-colors">
              로그인
            </button>
          </form>

          {/* 구분선 */}
          <div className="my-6 flex items-center gap-3">
            <div className="border-border flex-1 border-t"></div>
            <span className="text-text-muted text-sm">또는</span>
            <div className="border-border flex-1 border-t"></div>
          </div>

          {/* 소셜 로그인 */}
          <div className="space-y-3">
            <button className="border-border hover:bg-button-hover flex w-full items-center justify-center gap-3 rounded-lg border bg-transparent py-3 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-text-primary font-medium">Google로 계속하기</span>
            </button>

            <button className="border-border hover:bg-button-hover flex w-full items-center justify-center gap-3 rounded-lg border bg-transparent py-3 transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="10" fill="#03C75A" />
                <text x="10" y="15" fontSize="14" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">
                  N
                </text>
              </svg>
              <span className="text-text-primary font-medium">Naver 로 계속하기</span>
            </button>
          </div>
        </div>

        {/* 회원가입 링크 */}
        <p className="text-text-secondary mt-6 text-center text-sm">
          계정이 없으신가요?{' '}
          <Link to="/join" className="text-accent-primary hover:text-accent-hover font-medium transition-colors">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
