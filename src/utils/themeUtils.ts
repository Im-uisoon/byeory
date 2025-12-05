// 커스텀 색상 값 불러오는 파일

export type ColorName = 'rose' | 'orange' | 'yellow' | 'lime' | 'emerald' | 'indigo' | 'purple' | 'pink' | 'slate';
export type ColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export const getColorValue = (colorName: ColorName, shade: ColorShade): string => {
  if (typeof window === 'undefined') return '';
  const variableName = `--color-${colorName}-${shade}`;
  const value = getComputedStyle(document.documentElement).getPropertyValue(variableName);
  return value ? value.trim() : '';
};

// Hex 색상 밝기 조절 함수
export const adjustColorBrightness = (hex: string, percent: number) => {
  if (!hex) return '#000000';
  hex = hex.replace(/^\s*#|\s*$/g, '');
  if (hex.length === 3) hex = hex.replace(/(.)/g, '$1$1');

  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex;

  const calculatedR = Math.round(r + (255 - r) * percent);
  const calculatedG = Math.round(g + (255 - g) * percent);
  const calculatedB = Math.round(b + (255 - b) * percent);

  const R = percent < 0 ? Math.round(r * (1 + percent)) : calculatedR;
  const G = percent < 0 ? Math.round(g * (1 + percent)) : calculatedG;
  const B = percent < 0 ? Math.round(b * (1 + percent)) : calculatedB;

  return `rgb(${Math.max(0, Math.min(255, R))}, ${Math.max(0, Math.min(255, G))}, ${Math.max(0, Math.min(255, B))})`;
};
