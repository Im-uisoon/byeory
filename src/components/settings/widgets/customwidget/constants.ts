import type { WidgetSize } from './types';


// DashboardGrid: Canvas Width = 800px.
// Margins = 16px (approx). Content Width = ~768px.
// 4 Columns: (180px * 4) + (16px * 3) = 720 + 48 = 768px.
// Base Unit: 180px x 180px.
export const WIDGET_SIZES: Record<string, WidgetSize & { capacity: number }> = {
    '1x1': { w: 180, h: 180, label: '1x1', capacity: 4 },
    '1x2': { w: 180, h: 376, label: '1x2', capacity: 6 },
    '2x1': { w: 376, h: 180, label: '2x1', capacity: 6 },
    '2x2': { w: 376, h: 376, label: '2x2', capacity: 15 },
    '3x3': { w: 572, h: 572, label: '3x3', capacity: 30 }, // (180*3 + 16*2)
    '4x4': { w: 768, h: 768, label: '4x4', capacity: 50 }, // (180*4 + 16*3)
    // Irregular Sizes
    '2x3': { w: 376, h: 572, label: '2x3', capacity: 20 },
    '2x4': { w: 376, h: 768, label: '2x4', capacity: 25 },
};

// 2. 블록 타입별 비용 (Cost)
// 높이를 많이 차지할수록 높은 비용
export const BLOCK_COSTS: Record<string, number> = {
    // 텍스트류 (작음)
    'text': 1,
    'heading3': 1,
    'bullet-list': 1,
    'number-list': 1,
    'todo-list': 1,
    'toggle-list': 1,
    'footnote': 1,
    'highlight': 1,
    'spoiler': 1,
    'callout': 2,    // 예시 비용


    // 중간 크기
    'heading2': 1.5,
    'heading1': 2,
    'button': 1.5,
    'quote': 2,
    'divider': 0.5,
    'scroll-text': 1.5,
    'typing-text': 1,

    // 대형 (차트, 캘린더 등)
    'chart': 5,      // 높이 많이 차지함
    'calendar': 6,   // 꽤 큼
    'image': 4,
    'accordion': 3,  // 펼쳐질 수 있으므로 여유 필요
    'vertical-text': 4,
    'columns': 3,    // 내부에 또 블록이 들어가지만 일단 기본 비용
    'math': 2,
    'chart-pie': 4, 'chart-bar': 4, 'chart-radar': 5, 'heatmap': 3,
    'counter': 1.5, 'rating': 1.5, 'progress-bar': 1, 'database': 6,

    'unit-converter': 2, 'calculator': 3, 'random-picker': 2, 'map-pin': 3,
    'zip-viewer': 2, 'rss-reader': 3, 'link-bookmark': 2, 'pdf-viewer': 4,
    'export-button': 1,

    'flash-card': 2, 'mind-map': 5, 'code-sandbox': 4, 'word-book': 3, 'book-info': 2, 'movie-ticket': 2,
};