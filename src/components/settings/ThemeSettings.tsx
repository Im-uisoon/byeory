// 테마 목록 선택 파일

import { useTheme, type Theme } from '../../contexts/ThemeContext';
interface Props {
  onBack: () => void;
  onClose: () => void;
  onNavigateToCustom: () => void;
}

// 테마 목록 데이터 정의
const themeOptions: { value: Theme; label: string; description: string }[] = [
  {
    value: 'default',
    label: '기본 테마',
    description: '파스텔 감성의 부드러움',
  },
  {
    value: 'light',
    label: '라이트 모드',
    description: '밝고 깔끔한 화이트 테마',
  },
  {
    value: 'dark',
    label: '다크 모드',
    description: '눈이 편한 다크 테마',
  },
  {
    value: 'custom',
    label: '개인 설정',
    description: '나만의 색상으로 꾸미기',
  },
];

export default function ThemeSettings({ onBack, onClose, onNavigateToCustom }: Props) {
  const { theme, setTheme } = useTheme();

  const handleThemeSelect = (selected: Theme) => {
    if (selected === 'custom') {
      onNavigateToCustom();
    } else {
      setTheme(selected);

      // 중요: Custom 테마에서 다른 테마로 전환 시, 인라인 스타일(커스텀 색상값) 제거
      const root = document.documentElement;
      const propertiesToRemove = ['--bg-primary', '--bg-secondary', '--text-primary', '--text-secondary', '--text-muted', '--accent-primary', '--accent-hover', '--border-color', '--nav-bg', '--button-hover-bg'];

      propertiesToRemove.forEach((prop) => root.style.removeProperty(prop));
    }
  };

  return (
    <>
      {/* 헤더 */}
      <div className="border-border mb-10 flex items-center justify-between border-b pb-5">
        <button onClick={onBack} className="text-text-muted hover:bg-button-hover rounded-full p-2 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h2 className="text-text-primary text-xl">테마 설정</h2>
        <button onClick={onClose} className="text-text-muted hover:bg-button-hover rounded-full p-2 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* 테마 목록 */}
      <div className="mb-4 space-y-5">
        {themeOptions.map((option) => (
          <button key={option.value} onClick={() => handleThemeSelect(option.value)} className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-all ${option.value === 'default' ? (theme === option.value ? 'border-2 border-pink-400 bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100' : 'border-2 border-gray-300 bg-transparent hover:border-gray-400') : option.value === 'light' ? (theme === option.value ? 'bg-button-hover border-2 border-blue-400' : 'border-2 border-gray-300 bg-transparent hover:border-gray-400') : option.value === 'dark' ? (theme === option.value ? 'bg-button-hover border-2 border-blue-400' : 'border-2 border-gray-300 bg-transparent hover:border-gray-400') : theme === option.value ? 'border-accent-primary bg-button-hover border-2' : 'border-2 border-gray-300 bg-transparent hover:border-gray-400'}`}>
            {/* 아이콘 */}
            {option.value === 'default' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={theme === option.value ? 'text-pink-500' : 'text-text-muted'}>
                <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
              </svg>
            ) : option.value === 'custom' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                <path d="M5 3v4" />
                <path d="M19 17v4" />
                <path d="M3 5h4" />
                <path d="M17 19h4" />
              </svg>
            ) : option.value === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            )}

            <span className={option.value === 'default' && theme === option.value ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent' : 'text-text-primary'}>{option.label}</span>

            {/* 우측 영역 */}
            <div className="ml-auto flex items-center gap-2">
              {option.value !== 'custom' && <span className={`text-sm ${option.value === 'default' && theme === option.value ? 'text-pink-700' : 'text-text-secondary'}`}>{option.description}</span>}

              {option.value === 'custom' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              ) : theme === option.value ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={option.value === 'default' ? 'text-pink-500' : 'text-accent-primary'}>
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : null}
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
