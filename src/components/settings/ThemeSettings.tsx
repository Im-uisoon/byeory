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
    description: '따뜻한 오렌지 색상의 기본 테마',
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
      <div className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="text-text-muted hover:bg-button-hover rounded-full p-2 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h2 className="text-text-primary text-2xl font-bold">테마 설정</h2>
        <button onClick={onClose} className="text-text-muted hover:bg-button-hover rounded-full p-2 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* 테마 목록 */}
      <div className="mb-4 space-y-2">
        {themeOptions.map((option) => (
          <button key={option.value} onClick={() => handleThemeSelect(option.value)} className={`w-full rounded-lg border-2 p-4 text-left transition-all ${theme === option.value ? 'border-accent-primary bg-button-hover' : 'border-border hover:border-accent-primary bg-transparent'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-text-primary font-semibold">{option.label}</div>
                <div className="text-text-secondary text-sm">{option.description}</div>
              </div>

              {/* 아이콘 표시 로직 */}
              {option.value === 'custom' ? (
                // Custom일 경우 화살표 아이콘
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              ) : theme === option.value ? (
                // 현재 선택된 테마일 경우 체크 아이콘
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-primary">
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
