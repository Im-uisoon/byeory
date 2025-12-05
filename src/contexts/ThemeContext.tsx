import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
// getColorValue 다시 추가 (자동 모드 복구용)
import { getColorValue, adjustColorBrightness, type ColorName } from '../utils/themeUtils';

export type Theme = 'default' | 'light' | 'dark' | 'custom';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'default';
    }
    return 'default';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    const root = document.documentElement;

    if (theme === 'custom') {
      // ---------------------------------------------------------
      // 1. 수동 설정(Manual)이 있는지 먼저 확인
      // ---------------------------------------------------------
      const savedSettingsStr = localStorage.getItem('customThemeSettings');
      let isManualApplied = false;

      if (savedSettingsStr) {
        try {
          const settings = JSON.parse(savedSettingsStr);
          const { baseColor, gradient, text, textColorName = 'slate' } = settings;

          // (1) 기본 테마 색상 적용
          if (baseColor) {
            root.style.setProperty('--accent-primary', baseColor);
            root.style.setProperty('--accent-hover', adjustColorBrightness(baseColor, -0.1));
            root.style.setProperty('--border-color', adjustColorBrightness(baseColor, 0.4));
            root.style.setProperty('--button-hover-bg', adjustColorBrightness(baseColor, 0.85));
            root.style.setProperty('--text-secondary', getColorValue(textColorName, 600));
            root.style.setProperty('--text-muted', getColorValue(textColorName, 400));
          }

          // (2) 배경 적용 (그라데이션 vs 단색)
          if (gradient && gradient.enabled) {
            // 1. 그라데이션을 root 배경으로 설정
            root.style.background = `linear-gradient(${gradient.dir}, ${gradient.start} ${gradient.startPos}%, ${gradient.end} ${gradient.endPos}%)`;

            // 2. [핵심 수정] 그라데이션이 보일 수 있도록, 단색 배경 변수를 '투명'으로 설정
            root.style.setProperty('--bg-primary', 'transparent');

            // 혹시 body에 직접 색이 지정되어 있을 경우를 대비해 초기화
            root.style.backgroundColor = 'transparent';
          } else if (baseColor) {
            // 그라데이션 끄기
            root.style.background = '';

            // 단색 배경 복구
            const solidBg = adjustColorBrightness(baseColor, 0.9);
            root.style.setProperty('--bg-primary', solidBg);
            root.style.backgroundColor = solidBg;
          }

          // (3) 텍스트 적용
          if (text) {
            if (text.computedColor) root.style.setProperty('--text-primary', text.computedColor);
            if (text.fontFamily) document.body.style.fontFamily = text.fontFamily;
            if (text.fontSize) document.body.style.fontSize = `${text.fontSize}px`;
          }

          isManualApplied = true; // 수동 적용 성공
        } catch (e) {
          console.error('Failed to parse custom settings', e);
        }
      }

      // ---------------------------------------------------------
      // 2. 수동 설정이 없다면 -> 자동 설정(Auto) 복구 시도
      // ---------------------------------------------------------
      if (!isManualApplied) {
        const savedAutoColor = localStorage.getItem('customThemeColor') as ColorName;

        if (savedAutoColor) {
          // 배경 초기화 (그라데이션 제거)
          root.style.background = '';

          root.style.setProperty('--bg-primary', getColorValue(savedAutoColor, 50));
          root.style.setProperty('--bg-secondary', 'rgb(255 255 255)');
          root.style.setProperty('--text-primary', 'rgb(0 0 0)');
          root.style.setProperty('--text-secondary', getColorValue(savedAutoColor, 600));
          root.style.setProperty('--text-muted', getColorValue(savedAutoColor, 400));
          root.style.setProperty('--accent-primary', getColorValue(savedAutoColor, 500));
          root.style.setProperty('--accent-hover', getColorValue(savedAutoColor, 600));
          root.style.setProperty('--border-color', getColorValue(savedAutoColor, 300));
          root.style.setProperty('--button-hover-bg', getColorValue(savedAutoColor, 100));

          // 폰트 초기화
          document.body.style.fontFamily = "'Noto Sans KR', sans-serif";
          document.body.style.fontSize = '16px';
        }
      }
    } else {
      // Custom이 아닐 때 청소
      root.style.background = '';
      const propsToRemove = ['--bg-primary', '--bg-secondary', '--text-primary', '--text-secondary', '--text-muted', '--accent-primary', '--accent-hover', '--border-color', '--nav-bg', '--button-hover-bg'];
      propsToRemove.forEach((p) => root.style.removeProperty(p));
      document.body.style.fontFamily = '';
      document.body.style.fontSize = '';
    }
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) throw new Error('useTheme error');
  return context;
}
