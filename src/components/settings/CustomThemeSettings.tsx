import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getColorValue, adjustColorBrightness, type ColorName, type ColorShade } from '../../utils/themeUtils';

interface Props {
  onBack: () => void;
  onClose: () => void;
}

// 자동 탭 및 텍스트 색상 선택용
const COLORS: ColorName[] = ['rose', 'orange', 'yellow', 'lime', 'emerald', 'indigo', 'purple', 'pink', 'slate'];

const FONT_OPTIONS = [
  { label: 'Noto Sans KR (기본)', value: "'Noto Sans KR', sans-serif" },
  { label: 'Jua (주아)', value: "'Jua', sans-serif" },
  { label: 'Serif (명조)', value: 'serif' },
  { label: 'Monospace (고정폭)', value: 'monospace' },
];

const GRADIENT_DIRECTIONS = [
  { label: 'To Top', value: 'to top', icon: '↑' },
  { label: 'To Top Right', value: 'to top right', icon: '↗' },
  { label: 'To Right', value: 'to right', icon: '→' },
  { label: 'To Bottom Right', value: 'to bottom right', icon: '↘' },
  { label: 'To Bottom', value: 'to bottom', icon: '↓' },
  { label: 'To Bottom Left', value: 'to bottom left', icon: '↙' },
  { label: 'To Left', value: 'to left', icon: '←' },
  { label: 'To Top Left', value: 'to top left', icon: '↖' },
];

export default function CustomThemeSettings({ onBack, onClose }: Props) {
  const { theme, setTheme } = useTheme();
  const [customTab, setCustomTab] = useState<'auto' | 'manual'>('auto');

  // 자동 모드 선택 상태
  const [selectedAutoColor, setSelectedAutoColor] = useState<ColorName | null>(null);

  // LocalStorage 읽기 헬퍼
  const getSavedSetting = <T,>(key: string, fallback: T): T => {
    const saved = localStorage.getItem('customThemeSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed[key] !== undefined ? parsed[key] : fallback;
      } catch {
        return fallback;
      }
    }
    return fallback;
  };

  // --- State 초기화 ---
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  // 텍스트 설정
  const [textColorName, setTextColorName] = useState<ColorName>(() => getSavedSetting('textColorName', 'slate'));
  const [textSaturation, setTextSaturation] = useState<number>(() => getSavedSetting('textSaturation', 100));
  const [fontSize, setFontSize] = useState<number>(() => getSavedSetting('fontSize', 16));
  const [fontFamily, setFontFamily] = useState<string>(() => getSavedSetting('fontFamily', "'Noto Sans KR', sans-serif"));

  // 배경/테마 설정
  const [customBaseColor, setCustomBaseColor] = useState<string>(() => getSavedSetting('customBaseColor', '#3b82f6'));
  const [isGradientEnabled, setIsGradientEnabled] = useState<boolean>(() => getSavedSetting('isGradientEnabled', false));
  const [gradientDir, setGradientDir] = useState<string>(() => getSavedSetting('gradientDir', 'to bottom right'));
  const [startColor, setStartColor] = useState<string>(() => getSavedSetting('startColor', '#ffffff'));
  const [endColor, setEndColor] = useState<string>(() => getSavedSetting('endColor', '#000000'));
  const [startPos, setStartPos] = useState<number>(() => getSavedSetting('startPos', 0));
  const [endPos, setEndPos] = useState<number>(() => getSavedSetting('endPos', 100));

  // 1. 초기 로드 (자동 탭 선택 상태 복구)
  useEffect(() => {
    const savedAuto = localStorage.getItem('customThemeColor') as ColorName | null;
    if (savedAuto) setSelectedAutoColor(savedAuto);
  }, []);

  // 2. [Auto] 로직
  const applyAutoColorPalette = (colorName: ColorName) => {
    const root = document.documentElement;
    root.style.background = ''; // 그라데이션 초기화

    // 자동 모드는 Tailwind 색상 변수 사용
    root.style.setProperty('--bg-primary', getColorValue(colorName, 50));
    root.style.setProperty('--bg-secondary', 'rgb(255 255 255)');
    root.style.setProperty('--text-primary', 'rgb(0 0 0)');
    root.style.setProperty('--text-secondary', getColorValue(colorName, 600));
    root.style.setProperty('--text-muted', getColorValue(colorName, 400));
    root.style.setProperty('--accent-primary', getColorValue(colorName, 500));
    root.style.setProperty('--accent-hover', getColorValue(colorName, 600));
    root.style.setProperty('--border-color', getColorValue(colorName, 300));
    root.style.setProperty('--button-hover-bg', getColorValue(colorName, 100));

    // 폰트 초기화
    document.body.style.fontFamily = "'Noto Sans KR', sans-serif";
    document.body.style.fontSize = '16px';

    setIsGradientEnabled(false);
    setSelectedAutoColor(colorName);

    // 수동 설정이 남아있으면 방해되므로 삭제
    localStorage.removeItem('customThemeSettings');

    if (theme !== 'custom') setTheme('custom');
    localStorage.setItem('customThemeColor', colorName);
  };

  // 3. [Manual] 통합 로직 (텍스트 + 배경 + 저장)
  useEffect(() => {
    if (customTab === 'manual') {
      const root = document.documentElement;

      // (1) 텍스트 색상 계산
      let textFinalColor = '';
      if (textSaturation === 0) {
        textFinalColor = '#ffffff';
      } else {
        const shades: ColorShade[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
        const shadeIndex = Math.floor((textSaturation / 100) * (shades.length - 1));
        const shade = shades[shadeIndex] ?? 500;
        textFinalColor = getColorValue(textColorName, shade);
      }

      // (2) 텍스트 스타일 적용
      root.style.setProperty('--text-primary', textFinalColor);
      document.body.style.fontFamily = fontFamily;
      document.body.style.fontSize = `${fontSize}px`;

      // (3) 테마 베이스 색상 적용 (버튼, 보더 등)
      root.style.setProperty('--accent-primary', customBaseColor);
      root.style.setProperty('--accent-hover', adjustColorBrightness(customBaseColor, -0.1));
      root.style.setProperty('--border-color', adjustColorBrightness(customBaseColor, 0.4));
      root.style.setProperty('--button-hover-bg', adjustColorBrightness(customBaseColor, 0.85));
      root.style.setProperty('--text-secondary', getColorValue(textColorName, 600));
      root.style.setProperty('--text-muted', getColorValue(textColorName, 400));

      // (4) 배경 적용 (그라데이션 vs 단색)
      if (isGradientEnabled) {
        // [ON] 그라데이션 적용
        const gradientValue = `linear-gradient(${gradientDir}, ${startColor} ${startPos}%, ${endColor} ${endPos}%)`;
        root.style.background = gradientValue;

        // [핵심 수정] 배경 변수를 투명하게 만들어서 그라데이션이 비치게 함
        root.style.setProperty('--bg-primary', 'transparent');
      } else {
        // [OFF] 단색 배경 적용
        root.style.background = ''; // 그라데이션 제거

        const solidBgColor = adjustColorBrightness(customBaseColor, 0.9);
        root.style.setProperty('--bg-primary', solidBgColor);
        root.style.backgroundColor = solidBgColor;
      }

      // (5) 설정 저장
      const settingsToSave = {
        customBaseColor,
        textColorName,
        textSaturation,
        fontSize,
        fontFamily,
        isGradientEnabled,
        gradientDir,
        startColor,
        endColor,
        startPos,
        endPos,
        text: { computedColor: textFinalColor, fontFamily, fontSize },
        gradient: { enabled: isGradientEnabled, dir: gradientDir, start: startColor, end: endColor, startPos, endPos },
        baseColor: customBaseColor,
      };

      localStorage.setItem('customThemeSettings', JSON.stringify(settingsToSave));

      if (theme !== 'custom') setTheme('custom');
    }
  }, [customTab, theme, setTheme, customBaseColor, textColorName, textSaturation, fontSize, fontFamily, isGradientEnabled, gradientDir, startColor, endColor, startPos, endPos]);

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
        <h2 className="text-text-primary text-2xl font-bold">개인 설정</h2>
        <button onClick={onClose} className="text-text-muted hover:bg-button-hover rounded-full p-2 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* 탭 버튼 */}
      <div className="bg-button-hover mb-6 flex gap-2 rounded-lg p-1">
        <button onClick={() => setCustomTab('auto')} className={`flex-1 rounded-md py-2 font-medium transition-all ${customTab === 'auto' ? 'bg-bg-secondary text-text-primary shadow-sm' : 'text-text-muted'}`}>
          자동
        </button>
        <button onClick={() => setCustomTab('manual')} className={`flex-1 rounded-md py-2 font-medium transition-all ${customTab === 'manual' ? 'bg-bg-secondary text-text-primary shadow-sm' : 'text-text-muted'}`}>
          수동
        </button>
      </div>

      {/* ================= 자동 탭 콘텐츠 ================= */}
      {customTab === 'auto' && (
        <div className="mb-4">
          <p className="text-text-secondary mb-4 text-sm">바꾸고 싶은 색상의 테마를 선택해 주세요</p>
          <div className="grid grid-cols-3 gap-3">
            {COLORS.map((colorName) => (
              <button key={colorName} onClick={() => applyAutoColorPalette(colorName)} className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all hover:scale-105 ${selectedAutoColor === colorName ? 'border-accent-primary bg-button-hover' : 'border-border'}`}>
                <div className="h-12 w-12 rounded-full shadow-md" style={{ backgroundColor: `var(--color-${colorName}-500)` }} />
                <span className="text-text-primary text-xs font-medium capitalize">{colorName}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= 수동 탭 콘텐츠 ================= */}
      {customTab === 'manual' && (
        <div className="animate-fade-in mb-4 space-y-6">
          {/* 1. 미리보기 박스 */}
          <div
            className="border-border relative flex h-32 w-full items-center justify-center rounded-xl border shadow-sm transition-all duration-200"
            style={{
              background: isGradientEnabled ? `linear-gradient(${gradientDir}, ${startColor} ${startPos}%, ${endColor} ${endPos}%)` : 'var(--bg-primary)',
            }}
          >
            <span
              className="font-bold transition-all duration-200"
              style={{
                color: 'var(--text-primary)',
                fontFamily: fontFamily,
                fontSize: `${fontSize * 1.5}px`,
              }}
            >
              벼리
            </span>
            <div className="text-text-muted absolute right-3 bottom-2 text-xs">Preview</div>
          </div>

          {/* 2. Text 설정 아코디언 */}
          <div className="border-border bg-bg-secondary overflow-hidden rounded-xl border shadow-sm">
            <button onClick={() => setIsTextExpanded(!isTextExpanded)} className="hover:bg-button-hover flex w-full items-center justify-between p-4 transition-colors">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-primary">
                  <path d="M4 7V4h16v3M9 20h6M12 4v16" />
                </svg>
                <span className="text-text-primary font-semibold">Text</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-text-muted transition-transform duration-200 ${isTextExpanded ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {isTextExpanded && (
              <div className="border-border space-y-5 border-t p-4">
                <div className="flex gap-3">
                  <div className="flex-1 space-y-1">
                    <label className="text-text-secondary text-xs font-medium">Font Family</label>
                    <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="border-border text-text-primary focus:border-accent-primary w-full rounded-md border bg-transparent p-2 text-sm focus:outline-none">
                      {FONT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-text-secondary text-xs font-medium">Font Size</label>
                    <div className="flex items-center gap-2">
                      <input type="range" min="12" max="24" step="1" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="accent-accent-primary h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200" />
                      <span className="text-text-primary w-6 text-right text-xs">{fontSize}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-text-secondary text-xs font-medium">Text Color</label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((c) => (
                      <button key={c} onClick={() => setTextColorName(c)} className={`h-6 w-6 rounded-full border transition-transform hover:scale-110 ${textColorName === c ? 'border-text-primary ring-text-primary ring-1 ring-offset-1' : 'border-transparent'}`} style={{ backgroundColor: `var(--color-${c}-500)` }} />
                    ))}
                    <button
                      onClick={() => {
                        setTextColorName('slate');
                        setTextSaturation(100);
                      }}
                      className={`h-6 w-6 rounded-full border bg-black transition-transform hover:scale-110 ${textColorName === 'slate' && textSaturation === 100 ? 'border-text-primary ring-text-primary ring-1 ring-offset-1' : 'border-transparent'}`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="text-text-secondary text-xs font-medium">Intensity</label>
                    <span className="text-text-primary text-xs">{textSaturation}%</span>
                  </div>
                  <input type="range" min="0" max="100" step="10" value={textSaturation} onChange={(e) => setTextSaturation(Number(e.target.value))} className="accent-accent-primary h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200" style={{ background: `linear-gradient(to right, #ffffff, var(--color-${textColorName}-900))` }} />
                </div>
              </div>
            )}
          </div>

          {/* 3. Colors (배경/테마) 설정 */}
          <div className="border-border bg-bg-secondary overflow-hidden rounded-xl border shadow-sm">
            <div className="flex w-full items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-primary">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
                <span className="text-text-primary font-semibold">Colors</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary text-xs">{isGradientEnabled ? 'Gradient' : 'Solid'}</span>
                <button onClick={() => setIsGradientEnabled(!isGradientEnabled)} className={`relative h-7 w-12 rounded-full transition-colors ${isGradientEnabled ? 'bg-accent-primary' : 'bg-gray-300'}`}>
                  <span className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white transition-transform ${isGradientEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <div className="border-border space-y-6 border-t p-4">
              {/* 테마 색상 피커 */}
              <div className="space-y-2">
                <label className="text-text-secondary text-xs font-medium">Base Theme Color</label>
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full shadow-md" style={{ backgroundColor: customBaseColor }}>
                    <input type="color" value={customBaseColor} onChange={(e) => setCustomBaseColor(e.target.value)} className="absolute -top-2 -left-2 h-16 w-16 cursor-pointer opacity-0" />
                  </div>
                  <input type="text" value={customBaseColor} onChange={(e) => setCustomBaseColor(e.target.value)} className="border-border text-text-primary focus:border-accent-primary w-28 rounded-md border bg-transparent px-3 py-2 text-sm uppercase focus:outline-none" />
                </div>
              </div>

              {/* 그라데이션 UI (ON일 때만) */}
              {isGradientEnabled && (
                <div className="animate-fade-in space-y-6 rounded-lg bg-gray-50/50 p-3">
                  <div className="space-y-2">
                    <label className="text-text-secondary text-xs font-medium">Direction</label>
                    <div className="grid grid-cols-4 gap-2">
                      {GRADIENT_DIRECTIONS.map((dir) => (
                        <button key={dir.value} onClick={() => setGradientDir(dir.value)} className={`flex aspect-square items-center justify-center rounded-md border text-lg transition-all ${gradientDir === dir.value ? 'border-accent-primary bg-button-hover text-accent-primary' : 'border-border text-text-muted hover:border-text-secondary'}`} title={dir.label}>
                          {dir.icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 시작 색상 */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-text-secondary text-xs font-medium">Start Color</label>
                      <span className="text-text-primary text-xs">{startPos}%</span>
                    </div>
                    <div className="flex gap-2">
                      <input type="color" value={startColor} onChange={(e) => setStartColor(e.target.value)} className="h-9 w-9 cursor-pointer border-none bg-transparent p-0" />
                      <input type="text" value={startColor} onChange={(e) => setStartColor(e.target.value)} className="border-border text-text-primary focus:border-accent-primary w-full rounded-md border bg-transparent px-3 text-sm uppercase focus:outline-none" />
                    </div>
                    <input type="range" min="0" max="100" value={startPos} onChange={(e) => setStartPos(Number(e.target.value))} className="accent-accent-primary h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200" />
                  </div>

                  {/* 끝 색상 */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-text-secondary text-xs font-medium">End Color</label>
                      <span className="text-text-primary text-xs">{endPos}%</span>
                    </div>
                    <div className="flex gap-2">
                      <input type="color" value={endColor} onChange={(e) => setEndColor(e.target.value)} className="h-9 w-9 cursor-pointer border-none bg-transparent p-0" />
                      <input type="text" value={endColor} onChange={(e) => setEndColor(e.target.value)} className="border-border text-text-primary focus:border-accent-primary w-full rounded-md border bg-transparent px-3 text-sm uppercase focus:outline-none" />
                    </div>
                    <input type="range" min="0" max="100" value={endPos} onChange={(e) => setEndPos(Number(e.target.value))} className="accent-accent-primary h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <button onClick={onClose} className="bg-accent-primary w-full rounded-lg py-3 font-semibold text-white transition-opacity hover:opacity-90">
        완료
      </button>
    </>
  );
}
