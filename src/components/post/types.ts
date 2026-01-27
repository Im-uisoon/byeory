import type { AlbumCoverConfig } from './components/albumCover/constants';

export type ViewMode = 'list' | 'editor' | 'read' | 'album' | 'folder';

export interface Block {
    id: string;
    type: 'paragraph' | 'image-full' | 'image-double' | 'image-left' | 'image-right' | 'bullet-list' | 'number-list';
    text: string;
    imageUrl?: string;
    imageUrl2?: string;
    imageRotation?: number;
    imageFit?: 'cover' | 'contain';
    imageTransform?: { x: number; y: number; scale: number }; // ✨ Focus/Crop Data
    imageTransform2?: { x: number; y: number; scale: number };
    styles?: Record<string, any>;
    locked?: boolean;
}

// 좌표와 크기를 number(픽셀 단위)로 변경
export interface BaseFloatingItem {
    id: string;
    x: number | string; // px or %
    y: number | string;
    w: number | string;
    h: number | string;
    rotation: number;
    opacity?: number;
    zIndex: number;
    locked?: boolean;
    // ✨ Crop Data (Optional)
    crop?: {
        contentX: number; // Offset of content within the viewport
        contentY: number;
        contentW: number; // Fixed size of content
        contentH: number;
    };
    // ✨ Processing State (e.g., Background Removal Loading)
    isProcessing?: boolean;
}

export interface Sticker extends BaseFloatingItem {
    url?: string;
    widgetType?: string;
    widgetProps?: Record<string, any>;
}

export interface FloatingText extends BaseFloatingItem {
    text: string;
    styles: {
        fontSize: string;
        fontWeight: string;
        textAlign: string;
        color: string;
        backgroundColor: string;
        backgroundImage?: string; // ✨ Custom Background Image
        fontFamily: string;
        fontStyle?: string;
        textDecoration?: string;
        textEffect?: 'none' | 'curve' | 'wave' | 'double-wave'; // ✨ Text Effect
        textEffectIntensity?: number; // ✨ Text Effect Intensity (0-100)
        textPathPoints?: { x: number; y: number; type?: 'anchor' | 'control' }[]; // ✨ Interactive Curve Points
    };
    imageTransform?: { x: number; y: number; scale: number }; // ✨ Focus Data for Sticky Notes
    imageFit?: 'cover' | 'contain'; // ✨ Image Fit Mode
}

export interface FloatingImage extends BaseFloatingItem {
    url: string;
}

export type PostMode = 'AUTO' | 'MANUAL';

export interface Album {
    id: number;
    title: string;
    description?: string;
    coverImage?: string;
    isFavorite?: boolean;
    // ✨ Compatibility with CustomAlbum
    coverConfig?: AlbumCoverConfig;
}

export interface Folder {
    id: number;
    name: string;
    parentId?: number;
    isFavorite?: boolean;
}

export interface PostTemplate {
    id: number;
    name: string;
    styles: Record<string, any>;
    stickers: Sticker[];
    floatingTexts: FloatingText[];
    floatingImages: FloatingImage[];
    defaultFontColor?: string;
    sourceMarketItemId?: number;
}

export interface PostData {
    id: number;
    title: string;
    date: string;
    tags?: string[]; // ✨ 태그 (앨범 분류용 - 하위 호환성 및 단순 태그용)

    // ✨ New fields for Album/Note Management
    mode?: PostMode;
    targetAlbumIds?: number[]; // MANUAL 모드일 때만 전송

    isFavorite?: boolean; // ✨ 즐겨찾기 여부
    isPublic?: boolean; // ✨ 커뮤니티 공개 여부
    visibility?: 'public' | 'private'; // ✨ 가시성 상태 (UI용)

    // Legacy or internal fields
    albumIds?: string[];
    blocks: Block[];
    stickers: Sticker[];
    floatingTexts: FloatingText[];
    floatingImages: FloatingImage[];
    titleStyles?: Record<string, any>;
    styles?: Record<string, any>; // ✨ Paper Styles Snapshot
}

export interface CustomAlbum {
    id: string;
    name: string;
    tag: string | null;
    createdAt?: number;
    parentId?: string | null;
    isFavorite?: boolean;
    // ✨ New Fields for Meeting Room
    type?: 'album' | 'room';
    role?: 'OWNER' | 'MEMBER'; // ✨ Role in the room
    ownerId?: string | number;
    ownerEmail?: string; // ✨ Owner Email for robust check
    roomConfig?: {
        password?: string;
        description?: string;
        maxMembers?: number;
    };
    // ✨ Backend Persistence for Cover
    coverConfig?: AlbumCoverConfig;
    postCount?: number;
    folderCount?: number;
}