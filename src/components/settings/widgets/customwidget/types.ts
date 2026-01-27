// pages/widget-builder/types.ts

// 블록 타입 정의
export type BlockType =
    | 'heading1' | 'heading2' | 'heading3' // 헤딩
    | 'text' | 'vertical-text' | 'typing-text' | 'scroll-text' // 텍스트 효과
    | 'bullet-list' | 'number-list' | 'todo-list' | 'toggle-list' // 리스트
    | 'callout' | 'quote' | 'divider' // 꾸미기
    | 'accordion' | 'columns' | 'custom-block'// 레이아웃
    | 'math' | 'spoiler' | 'highlight' | 'footnote' // 인라인/특수
    | 'button'
    // NEW (데이터)
    | 'chart-pie' | 'chart-bar' | 'chart-radar' | 'heatmap'
    | 'counter' | 'rating' | 'progress-bar' | 'database'
    // NEW (유틸)
    | 'unit-converter' | 'calculator' | 'random-picker' | 'map-pin'
    | 'zip-viewer' | 'rss-reader' | 'link-bookmark' | 'pdf-viewer' | 'export-button' | 'travel-plan'
    // NEW (학습)
    | 'flashcards' | 'mindmap' | 'book-info' | 'movie-ticket';

// 블록 스타일 정의
export interface WidgetBlockStyle {

    color?: string;
    bgColor?: string; // 형광펜, 콜아웃 배경 등
    fontSize?: number;
    align?: 'left' | 'center' | 'right';
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean; // New
    columnCount?: 2 | 3 | 4; // 다단 컬럼용
}
export type MindmapNodeData = { label: string };

export type MindmapContent = {
    nodes: Array<{
        id: string;
        type?: string; // 'mindmap' 같은 커스텀 타입
        position: { x: number; y: number };
        data: MindmapNodeData;
    }>;
    edges: Array<{
        id: string;
        source: string;
        target: string;
        type?: string;
    }>;
    selectedNodeId?: string | null;
};
// 블록 데이터 구조
export interface WidgetBlock {
    id: string;
    type: BlockType;
    layout?: BlockLayout;
    content: any | { decorations?: WidgetDecoration[]; children?: WidgetBlock[] }; // 텍스트, 리스트 아이템, 수식 등 + decorations for CustomBlock
    styles: WidgetBlockStyle;
    action?: string; // 버튼 등 액션
}
export type Flashcard = {
    id: string;
    front: string;
    back: string;
};

export interface WidgetSize {
    w: number;
    h: number;
    label: string;
}
export interface BlockLayout {
    x: number; // Normalized 0-100 relative to widget
    y: number; // Normalized 0-100 relative to widget
    w: number | string; // px or %
    h: number | string; // px or 'auto'
    rotation?: number;
    zIndex?: number;
}
// 🆕 [중요] 다단 컬럼 포커스 위치 타입
// (어떤 블록의 몇 번째 칸이 선택되었는지 저장)
export type ContainerLocation = {
    blockId: string;
    colIndex: number;
} | null;

export type DecorationType = 'circle' | 'square' | 'blob' | 'star' | 'text' | 'image' | 'sticker' | 'shape' | 'line';

export interface WidgetDecoration {
    id: string;
    type: DecorationType;
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
    opacity: number;
    rotation?: number;
    zIndex?: number;
    points?: { x: number; y: number }[]; // [NEW] For organic blobs (normalized 0-100 relative to box)
    imageUrl?: string; // [NEW] For image decorations

    // [NEW] Crop Support
    crop?: {
        contentX: number;
        contentY: number;
        contentW: number;
        contentH: number;
    };

    // [NEW] Video Support
    mediaType?: 'image' | 'video'; // Default to 'image' if undefined
    videoUrl?: string;
    videoStartTime?: number; // seconds
    videoEndTime?: number;   // seconds
    animation?: {
        type: 'pulse' | 'spin' | 'bounce' | 'float' | 'wiggle';
        duration?: number; // seconds
        delay?: number;    // seconds
    };
    // [NEW] Text & Extended Support
    text?: string;
    style?: React.CSSProperties;
    src?: string; // Alias for imageUrl
    width?: number; // Alias for w
    height?: number; // Alias for h
    unit?: string; // 'px' | '%'
    shapeType?: string; // For type='shape'
}

export interface WidgetScene {
    id: string;
    decorations: WidgetDecoration[];
    blocks: WidgetBlock[]; // [NEW] Blocks are now scene-specific
    duration: number; // Duration in seconds
}

