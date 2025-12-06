import { useState } from 'react';
import { Link } from 'react-router-dom';

function FindPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 실제로는 비밀번호 재설정 이메일 발송 API 호출
    if (email) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="bg-bg-primary flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <Link to="/" className="mb-8 block text-center">
          <img src="/logo.png" alt="벼리" className="mx-auto mb-4 w-32" />
          <h1 className="text-text-primary mb-2 text-3xl font-bold">비밀번호 찾기</h1>
          <p className="text-text-secondary text-sm">{isSubmitted ? '이메일을 확인해주세요' : '가입하신 이메일 주소를 입력하세요'}</p>
        </Link>

        {/* 비밀번호 찾기 폼 */}
        <div className="bg-bg-secondary border-border rounded-2xl border p-8 shadow-lg">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 안내 메시지 */}
              <div className="bg-accent-primary/10 border-accent-primary/30 rounded-lg border p-4">
                <div className="flex gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-primary mt-0.5 flex-shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                  <p className="text-text-secondary text-sm">입력하신 이메일로 비밀번호 재설정 링크를 보내드립니다.</p>
                </div>
              </div>

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

              {/* 재설정 링크 전송 버튼 */}
              <button type="submit" className="bg-accent-primary hover:bg-accent-hover w-full rounded-lg py-3 font-semibold text-white shadow-lg transition-colors">
                재설정 링크 전송
              </button>
            </form>
          ) : (
            // 전송 완료 메시지
            <div className="space-y-6 text-center">
              <div className="bg-accent-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-primary">
                  <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
                  <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-text-primary text-lg font-semibold">이메일을 확인하세요</h3>
                <p className="text-text-secondary text-sm">
                  <span className="text-accent-primary font-medium">{email}</span>
                  <br />위 주소로 비밀번호 재설정 링크를 전송했습니다.
                </p>
              </div>
              <div className="bg-bg-primary rounded-lg p-4">
                <p className="text-text-secondary text-xs">
                  이메일이 오지 않나요?
                  <br />
                  스팸 메일함을 확인하거나 다시 시도해주세요.
                </p>
              </div>
              <button onClick={() => setIsSubmitted(false)} className="text-accent-primary hover:text-accent-hover text-sm font-medium transition-colors">
                다른 이메일로 시도하기
              </button>
            </div>
          )}
        </div>

        {/* 로그인 링크 */}
        <p className="text-text-secondary mt-6 text-center text-sm">
          비밀번호가 기억나셨나요?{' '}
          <Link to="/login" className="text-accent-primary hover:text-accent-hover font-medium transition-colors">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}

export default FindPasswordPage;
