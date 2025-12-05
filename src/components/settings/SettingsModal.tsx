import { useState } from 'react';
import ThemeSettings from './ThemeSettings';
import CustomThemeSettings from './CustomThemeSettings';

type SettingsView = 'main' | 'theme' | 'custom';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [currentView, setCurrentView] = useState<SettingsView>('main');

  if (!isOpen) return null;

  // 뷰 초기화 핸들러 (모달 닫을 때 메인으로 리셋)
  const handleClose = () => {
    setCurrentView('main');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={handleClose}>
      {/*
        1. max-h-[85vh]: 화면 높이의 85%까지만 차지하도록 제한 (위아래 잘림 방지)
        2. overflow-y-auto: 내용이 넘치면 스크롤 생성
        3. w-full max-w-md: 가로 폭 유지
        4. p-4 sm:p-6: 모바일에서 내부 여백을 줄여 공간 확보
      */}
      <div className="bg-bg-secondary border-border max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg border p-4 shadow-xl sm:p-6" onClick={(e) => e.stopPropagation()}>
        {/* 1. 메인 메뉴 뷰 */}
        {currentView === 'main' && (
          <>
            {/* 헤더 */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-text-primary text-2xl font-bold">설정</h2>
              <button onClick={handleClose} className="text-text-muted hover:bg-button-hover rounded-full p-2 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* 메뉴 그리드 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 테마 설정 버튼 */}
              <button onClick={() => setCurrentView('theme')} className="group border-border bg-bg-secondary hover:border-accent-primary flex flex-col items-center justify-center gap-3 rounded-lg border-2 p-6 transition-all hover:scale-105">
                <div className="text-accent-primary group-hover:text-accent-hover transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                  </svg>
                </div>
                <span className="text-text-primary font-semibold">테마 설정</span>
              </button>

              {/* 메뉴 편집 버튼 (예시) */}
              <button className="group border-border bg-bg-secondary hover:border-accent-primary flex flex-col items-center justify-center gap-3 rounded-lg border-2 p-6 transition-all hover:scale-105">
                <div className="text-accent-primary group-hover:text-accent-hover transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="6" x2="20" y2="6"></line>
                    <line x1="4" y1="12" x2="20" y2="12"></line>
                    <line x1="4" y1="18" x2="20" y2="18"></line>
                  </svg>
                </div>
                <span className="text-text-primary font-semibold">메뉴 편집</span>
              </button>
            </div>
          </>
        )}

        {/* 2. 테마 선택 뷰 */}
        {currentView === 'theme' && <ThemeSettings onBack={() => setCurrentView('main')} onClose={handleClose} onNavigateToCustom={() => setCurrentView('custom')} />}

        {/* 3. 커스텀 색상 뷰 */}
        {currentView === 'custom' && <CustomThemeSettings onBack={() => setCurrentView('theme')} onClose={handleClose} />}
      </div>
    </div>
  );
}
