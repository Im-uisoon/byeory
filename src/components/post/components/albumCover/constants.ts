export type CoverType = 'solid' | 'gradient' | 'pattern' | 'illustration' | 'image';

export interface AlbumCoverConfig {
    type: CoverType;
    value: string; // Color code, gradient string, or pattern ID
    spineColor?: string; // Optional custom spine color, defaults to matching value
    labelColor?: string;
    sticker?: string; // Optional sticker icon
    customImage?: string; // Data URL for custom image
    backgroundColor?: string; // For patterns or transparent items
    backgroundSize?: string; // ✨ Control pattern scaling
    patternScale?: number; // 50 to 200 (%)
    patternPositionX?: number; // 0 to 100 (%)
    patternPositionY?: number; // 0 to 100 (%)
}

// Helper to escape color for SVG data URI
const svgColor = (color: string) => encodeURIComponent(color);

// Pattern Generator for 'My Design'
export const PATTERN_SHAPES = [
    // ✨ Removed: dots, grid, diagonal, circuit
    // ✨ Retained & New Fancy Patterns
    {
        id: 'damask',
        name: '다마스크',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0 Q30 10 40 0 Q30 10 20 20 Q10 10 0 0 Q10 10 20 0 M20 40 Q30 30 40 40 Q30 30 20 20 Q10 30 0 40 Q10 30 20 40' stroke='${svgColor(color)}' stroke-width='1' fill='none'/%3E%3Ccircle cx='20' cy='20' r='3' fill='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '40px 40px'
    },
    {
        id: 'arabesque',
        name: '아라베스크',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 0 C22 5 22 25 15 30 C8 25 8 5 15 0 Z M0 15 C5 22 25 22 30 15 C25 8 5 8 0 15 Z' stroke='${svgColor(color)}' fill='none' stroke-width='1.5'/%3E%3C/svg%3E")`,
        size: '30px 30px'
    },
    {
        id: 'maze',
        name: '미로',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 H10 V10 H20 V20 H10 V10 H0 Z' fill='none' stroke='${svgColor(color)}' stroke-width='2'/%3E%3C/svg%3E")`,
        size: '20px 20px'
    },
    {
        id: 'hex-maze',
        name: '헥사',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='24' height='28' viewBox='0 0 24 28' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 0 L24 7 V21 L12 28 L0 21 V7 Z' fill='none' stroke='${svgColor(color)}' stroke-width='1'/%3E%3Cpath d='M12 8 L18 11.5 V18.5 L12 22 L6 18.5 V11.5 Z' fill='${svgColor(color)}' fill-opacity='0.3'/%3E%3C/svg%3E")`,
        size: '24px 28px'
    },
    {
        id: 'seigaiha',
        name: '청해파',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='7' stroke='${svgColor(color)}' stroke-width='1' fill='none'/%3E%3Ccircle cx='0' cy='20' r='7' stroke='${svgColor(color)}' stroke-width='1' fill='none'/%3E%3Ccircle cx='20' cy='20' r='7' stroke='${svgColor(color)}' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
        size: '30px 30px'
    },
    {
        id: 'houndstooth',
        name: '하운드',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 L10 10 L20 0 L20 20 L0 20 Z M0 10 L10 20 L10 0 L0 0 Z' fill='${svgColor(color)}' fill-opacity='0.5'/%3E%3Cpath d='M0 0 L10 10 L0 20 Z' fill='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '20px 20px'
    },
    {
        id: 'diamond',
        name: '다이아',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0 L20 10 L10 20 L0 10 Z' fill='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '24px 24px'
    },
    {
        id: 'ornament',
        name: '오너먼트',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 0 Q20 10 30 15 Q20 20 15 30 Q10 20 0 15 Q10 10 15 0' stroke='${svgColor(color)}' fill='none' stroke-width='1.5'/%3E%3C/svg%3E")`,
        size: '30px 30px'
    },
    {
        id: 'tic-tac-toe',
        name: '틱택토',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 16 H32 M16 0 V32' stroke='${svgColor(color)}' stroke-width='1' fill='none'/%3E%3Ccircle cx='8' cy='8' r='3' stroke='${svgColor(color)}' fill='none'/%3E%3Cpath d='M21 21 L27 27 M27 21 L21 27' stroke='${svgColor(color)}' stroke-width='1'/%3E%3C/svg%3E")`,
        size: '32px 32px'
    },
    {
        id: 'scales',
        name: '비늘',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 Q 10 10 20 0' stroke='${svgColor(color)}' fill='none'/%3E%3Cpath d='M0 10 Q 10 20 20 10' stroke='${svgColor(color)}' fill='none'/%3E%3C/svg%3E")`,
        size: '20px 20px'
    },
    {
        id: 'bamboo',
        name: '대나무',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='20' height='40' viewBox='0 0 20 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='8' y='0' width='4' height='40' rx='2' fill='${svgColor(color)}'/%3E%3Cpath d='M0 20 Q10 25 20 20' stroke='${svgColor(color)}' fill='none' stroke-width='1'/%3E%3C/svg%3E")`,
        size: '20px 40px'
    },
    {
        id: 'geometric-flower',
        name: '꽃무늬',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='10' stroke='${svgColor(color)}' fill='none' stroke-width='1'/%3E%3Cpath d='M20 0 Q25 20 20 40 Q15 20 20 0 M0 20 Q20 25 40 20 Q20 15 0 20' stroke='${svgColor(color)}' fill='none' stroke-width='1'/%3E%3C/svg%3E")`,
        size: '40px 40px'
    },
    {
        id: 'zigzag',
        name: '지그재그',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 L10 0 L20 10 L10 20 Z' fill='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '20px 20px'
    },
    // ✨ FANCY & COMPLEX (10+)
    {
        id: 'art-deco',
        name: '아르데코',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 40 C31 40 40 31 40 20 M0 20 C0 31 9 40 20 40' stroke='${svgColor(color)}' fill='none' stroke-width='1'/%3E%3Cpath d='M20 35 C28 35 35 28 35 20 M5 20 C5 28 12 35 20 35' stroke='${svgColor(color)}' fill='none' stroke-width='1'/%3E%3C/svg%3E")`,
        size: '40px 40px'
    },
    {
        id: 'moroccan',
        name: '모로칸',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16 0 Q20 8 32 8 Q24 12 24 20 Q28 28 16 32 Q4 28 8 20 Q8 12 0 8 Q12 8 16 0' stroke='${svgColor(color)}' fill='none' stroke-width='1.5'/%3E%3C/svg%3E")`,
        size: '32px 32px'
    },
    {
        id: 'greek-key',
        name: '미앤더',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 5 H25 V25 H10 V10 H20 V15 H15' stroke='${svgColor(color)}' fill='none' stroke-width='2'/%3E%3C/svg%3E")`,
        size: '30px 30px'
    },
    {
        id: 'royal',
        name: '로얄',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 5 L23 15 L33 15 L25 21 L28 31 L20 25 L12 31 L15 21 L7 15 H17 Z' stroke='${svgColor(color)}' fill='none' stroke-width='1'/%3E%3Ccircle cx='20' cy='20' r='15' stroke='${svgColor(color)}' fill='none' stroke-width='1'/%3E%3C/svg%3E")`,
        size: '40px 40px'
    },
    {
        id: 'celtic',
        name: '켈틱',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='5' y='5' width='30' height='30' rx='5' stroke='${svgColor(color)}' fill='none' stroke-width='2'/%3E%3Cpath d='M5 20 H35 M20 5 V35' stroke='${svgColor(color)}' stroke-width='2'/%3E%3C/svg%3E")`,
        size: '40px 40px'
    },
    {
        id: 'basket',
        name: '바구니',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='10' height='10' fill='${svgColor(color)}' fill-opacity='0.2'/%3E%3Crect x='10' y='10' width='10' height='10' fill='${svgColor(color)}' fill-opacity='0.2'/%3E%3Cpath d='M0 5 H10 M5 0 V10 M10 15 H20 M15 10 V20' stroke='${svgColor(color)}' stroke-width='1'/%3E%3C/svg%3E")`,
        size: '20px 20px'
    },
    {
        id: 'hex-flower-complex',
        name: '꽃격자',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='34' height='60' viewBox='0 0 34 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17 0 L34 10 V30 L17 40 L0 30 V10 Z' stroke='${svgColor(color)}' fill='none'/%3E%3Cpath d='M17 20 L34 30 V50 L17 60 L0 50 V30 Z' stroke='${svgColor(color)}' fill='none'/%3E%3C/svg%3E")`,
        size: '34px 60px'
    },
    {
        id: 'scales-fish',
        name: '물고기',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q10 20 20 10 Q30 20 40 10' stroke='${svgColor(color)}' fill='none' stroke-width='1.5'/%3E%3Cpath d='M-10 0 Q0 10 10 0 Q20 10 30 0' stroke='${svgColor(color)}' fill='none' stroke-width='1.5'/%3E%3C/svg%3E")`,
        size: '20px 20px'
    },
    {
        id: 'tile-ornate',
        name: '타일',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='18' y='0' width='4' height='40' fill='${svgColor(color)}' opacity='0.5'/%3E%3Crect x='0' y='18' width='40' height='4' fill='${svgColor(color)}' opacity='0.5'/%3E%3Ccircle cx='20' cy='20' r='5' stroke='${svgColor(color)}' fill='none'/%3E%3Crect x='10' y='10' width='20' height='20' stroke='${svgColor(color)}' fill='none'/%3E%3C/svg%3E")`,
        size: '40px 40px'
    },
    {
        id: 'loops',
        name: '루프',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='8' stroke='${svgColor(color)}' fill='none'/%3E%3Ccircle cx='20' cy='10' r='8' stroke='${svgColor(color)}' fill='none'/%3E%3C/svg%3E")`,
        size: '20px 20px'
    },

    // ✨ CUTE & ROUNDED (10+)
    {
        id: 'bubbles',
        name: '버블',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='5' cy='5' r='3' fill='${svgColor(color)}'/%3E%3Ccircle cx='15' cy='15' r='2' fill='${svgColor(color)}'/%3E%3Ccircle cx='15' cy='5' r='1' fill='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '20px 20px'
    },
    {
        id: 'paws',
        name: '발바닥',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='15' cy='20' r='5' fill='${svgColor(color)}'/%3E%3Ccircle cx='10' cy='12' r='2' fill='${svgColor(color)}'/%3E%3Ccircle cx='15' cy='10' r='2' fill='${svgColor(color)}'/%3E%3Ccircle cx='20' cy='12' r='2' fill='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '30px 30px'
    },
    {
        id: 'bows',
        name: '리본',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='30' height='20' viewBox='0 0 30 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 10 L5 5 V15 L15 10 L25 5 V15 Z' fill='${svgColor(color)}'/%3E%3Ccircle cx='15' cy='10' r='2' fill='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '30px 20px'
    },
    {
        id: 'cherries',
        name: '체리',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='20' r='4' fill='${svgColor(color)}'/%3E%3Ccircle cx='20' cy='20' r='4' fill='${svgColor(color)}'/%3E%3Cpath d='M10 20 Q15 5 20 20 M15 5 L20 8' stroke='${svgColor(color)}' fill='none' stroke-width='1.5'/%3E%3C/svg%3E")`,
        size: '30px 30px'
    },
    {
        id: 'clouds-soft',
        name: '뭉게구름',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='40' height='20' viewBox='0 0 40 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 15 Q10 10 15 10 Q20 5 25 10 Q30 10 30 15' stroke='${svgColor(color)}' fill='none' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
        size: '40px 20px'
    },
    {
        id: 'hearts-scatter',
        name: '미니하트',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 15 L8 13 Q5 10 5 8 Q5 5 8 5 Q9 5 10 7 Q11 5 12 5 Q15 5 15 8 Q15 10 12 13 Z' fill='${svgColor(color)}' transform='scale(0.5) translate(10,10)'/%3E%3C/svg%3E")`,
        size: '20px 20px'
    },
    {
        id: 'smileys',
        name: '스마일',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='15' cy='15' r='10' stroke='${svgColor(color)}' fill='none'/%3E%3Ccircle cx='12' cy='12' r='1' fill='${svgColor(color)}'/%3E%3Ccircle cx='18' cy='12' r='1' fill='${svgColor(color)}'/%3E%3Cpath d='M10 18 Q15 22 20 18' stroke='${svgColor(color)}' fill='none'/%3E%3C/svg%3E")`,
        size: '30px 30px'
    },
    {
        id: 'daisy',
        name: '데이지',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='15' cy='15' r='3' fill='${svgColor(color)}'/%3E%3Ccircle cx='15' cy='8' r='3' fill='none' stroke='${svgColor(color)}'/%3E%3Ccircle cx='15' cy='22' r='3' fill='none' stroke='${svgColor(color)}'/%3E%3Ccircle cx='8' cy='15' r='3' fill='none' stroke='${svgColor(color)}'/%3E%3Ccircle cx='22' cy='15' r='3' fill='none' stroke='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '30px 30px'
    },
    {
        id: 'teddy',
        name: '곰돌이',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='15' cy='18' r='8' stroke='${svgColor(color)}' fill='none'/%3E%3Ccircle cx='8' cy='10' r='3' stroke='${svgColor(color)}' fill='none'/%3E%3Ccircle cx='22' cy='10' r='3' stroke='${svgColor(color)}' fill='none'/%3E%3C/svg%3E")`,
        size: '30px 30px'
    },
    {
        id: 'candy',
        name: '캔디',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='15' cy='15' r='6' stroke='${svgColor(color)}' fill='none'/%3E%3Cpath d='M9 15 H2 M21 15 H28' stroke='${svgColor(color)}'/%3E%3Cpath d='M15 9 V15' stroke='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '30px 30px'
    },
    // ✨ EXTRA CUTE & EMOTIONAL (12+)
    {
        id: 'sparkles',
        name: '반짝이',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z' fill='${svgColor(color)}' transform='scale(0.8) translate(3,3)'/%3E%3C/svg%3E")`,
        size: '24px 24px'
    },
    {
        id: 'moon-dream',
        name: '달꿈',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 5 C10 5 15 5 18 10 C21 15 18 22 18 22' stroke='${svgColor(color)}' fill='none' stroke-width='2' stroke-linecap='round'/%3E%3Ccircle cx='22' cy='8' r='2' fill='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '30px 30px'
    },
    {
        id: 'bunny',
        name: '토끼',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='15' cy='18' r='6' stroke='${svgColor(color)}' fill='none' stroke-width='1.5'/%3E%3Cpath d='M11 14 L9 5 L13 12 M19 14 L21 5 L17 12' stroke='${svgColor(color)}' fill='none' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E")`,
        size: '30px 30px'
    },
    {
        id: 'strawberry',
        name: '딸기',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 22 C12 22 4 15 4 8 C4 5 7 2 12 2 C17 2 20 5 20 8 C20 15 12 22 12 22' fill='none' stroke='${svgColor(color)}' stroke-width='1.5'/%3E%3Cpath d='M8 2 Q12 8 16 2' stroke='${svgColor(color)}' fill='none'/%3E%3Ccircle cx='9' cy='10' r='0.5' fill='${svgColor(color)}'/%3E%3Ccircle cx='15' cy='10' r='0.5' fill='${svgColor(color)}'/%3E%3Ccircle cx='12' cy='15' r='0.5' fill='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '24px 24px'
    },
    {
        id: 'cupcake',
        name: '머핀',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 15 L10 25 H20 L22 15' stroke='${svgColor(color)}' fill='none' stroke-width='1.5'/%3E%3Cpath d='M7 15 C7 10 10 5 15 5 C20 5 23 10 23 15' stroke='${svgColor(color)}' fill='none' stroke-width='1.5'/%3E%3Ccircle cx='15' cy='4' r='1.5' fill='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '30px 30px'
    },
    {
        id: 'planet',
        name: '행성',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='40' height='30' viewBox='0 0 40 30' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='15' r='8' stroke='${svgColor(color)}' fill='none' stroke-width='1.5'/%3E%3Cpath d='M5 20 Q20 5 35 15' stroke='${svgColor(color)}' fill='none' stroke-width='1'/%3E%3C/svg%3E")`,
        size: '40px 30px'
    },
    {
        id: 'music-note',
        name: '음표',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='8' cy='18' r='3' fill='${svgColor(color)}'/%3E%3Ccircle cx='18' cy='16' r='3' fill='${svgColor(color)}'/%3E%3Cpath d='M10 18 V6 L20 4 V16' stroke='${svgColor(color)}' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
        size: '24px 24px'
    },
    {
        id: 'paper-plane',
        name: '비행기',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 25 L10 15 L25 5 L15 20 L5 25 Z M25 5 L10 15' stroke='${svgColor(color)}' fill='none' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E")`,
        size: '30px 30px'
    },
    {
        id: 'tulip',
        name: '튤립',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='24' height='30' viewBox='0 0 24 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 20 V30 M12 20 Q7 10 7 5 Q12 10 17 5 Q17 10 12 20' stroke='${svgColor(color)}' fill='none' stroke-width='1.5'/%3E%3C/svg%3E")`,
        size: '24px 30px'
    },
    {
        id: 'chick',
        name: '병아리',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='12' cy='14' r='6' stroke='${svgColor(color)}' fill='none' stroke-width='1.5'/%3E%3Ccircle cx='12' cy='8' r='4' stroke='${svgColor(color)}' fill='none' stroke-width='1.5'/%3E%3Cpath d='M15 8 L17 8' stroke='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '24px 24px'
    },
    {
        id: 'butterfly',
        name: '나비',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 12 Q8 4 4 8 Q8 12 12 12 Q16 4 20 8 Q16 12 12 12 M12 12 Q8 20 4 16 Q8 12 12 12 Q16 20 20 16 Q16 12 12 12' stroke='${svgColor(color)}' fill='none' stroke-width='1'/%3E%3C/svg%3E")`,
        size: '24px 24px'
    },
    {
        id: 'ghost',
        name: '유령',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 20 Q4 22 6 22 H18 Q20 22 20 20 V10 Q20 2 12 2 Q4 2 4 10 V20 Z' stroke='${svgColor(color)}' fill='none' stroke-width='1.5'/%3E%3Ccircle cx='8' cy='10' r='1' fill='${svgColor(color)}'/%3E%3Ccircle cx='16' cy='10' r='1' fill='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '24px 24px'
    },
    // ✨ SUPER CUTE & EMOTIONAL (10+)
    {
        id: 'cat-face',
        name: '냥냥이',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 10 L2 5 L8 7 M25 10 L28 5 L22 7' stroke='${svgColor(color)}' fill='none' stroke-width='1.5'/%3E%3Ccircle cx='15' cy='18' r='8' stroke='${svgColor(color)}' fill='none' stroke-width='1.5'/%3E%3Cpath d='M10 16 L12 18 L10 20 M20 16 L18 18 L20 20' stroke='${svgColor(color)}' fill='none' stroke-width='1'/%3E%3C/svg%3E")`,
        size: '30px 30px'
    },
    {
        id: 'shooting-star',
        name: '별똥별',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10 L15 15 M8 12 L12 16 M12 8 L16 12' stroke='${svgColor(color)}' stroke-width='1'/%3E%3Cpath d='M20 20 L22 26 L28 28 L22 30 L20 36 L18 30 L12 28 L18 26 Z' fill='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '40px 40px'
    },
    {
        id: 'rainbow',
        name: '무지개',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='40' height='30' viewBox='0 0 40 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 25 Q20 5 35 25' stroke='${svgColor(color)}' fill='none' stroke-width='1.5'/%3E%3Cpath d='M8 25 Q20 10 32 25' stroke='${svgColor(color)}' fill='none' stroke-width='1.5' stroke-dasharray='2 2'/%3E%3C/svg%3E")`,
        size: '40px 30px'
    },
    {
        id: 'balloon',
        name: '풍선',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='24' height='40' viewBox='0 0 24 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='12' cy='12' r='8' stroke='${svgColor(color)}' fill='none' stroke-width='1.5'/%3E%3Cpath d='M12 20 V35' stroke='${svgColor(color)}' stroke-width='1' stroke-dasharray='2 1'/%3E%3C/svg%3E")`,
        size: '24px 40px'
    },
    {
        id: 'envelope',
        name: '편지',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='3' y='8' width='24' height='16' rx='2' stroke='${svgColor(color)}' fill='none' stroke-width='1.5'/%3E%3Cpath d='M3 8 L15 18 L27 8' stroke='${svgColor(color)}' fill='none' stroke-width='1.5'/%3E%3C/svg%3E")`,
        size: '30px 30px'
    },
    {
        id: 'key-lock',
        name: '자물쇠',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='8' y='12' width='14' height='10' rx='2' stroke='${svgColor(color)}' fill='none'/%3E%3Cpath d='M15 12 V8 Q15 5 11 5 Q7 5 7 8' stroke='${svgColor(color)}' fill='none'/%3E%3C/svg%3E")`,
        size: '30px 30px'
    },
    {
        id: 'clover',
        name: '클로버',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 12 Q12 6 8 6 Q4 6 4 10 Q4 12 12 12 M12 12 Q18 12 18 10 Q18 6 14 6 Q12 6 12 12 M12 12 Q12 18 14 18 Q18 18 18 14 Q18 12 12 12 M12 12 Q6 12 6 14 Q6 18 10 18 Q12 18 12 12' stroke='${svgColor(color)}' fill='none' stroke-width='1.5'/%3E%3C/svg%3E")`,
        size: '24px 24px'
    },
    {
        id: 'fish-bone',
        name: '생선뼈',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='30' height='20' viewBox='0 0 30 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 10 L25 10 M10 10 L8 5 M10 10 L8 15 M15 10 L13 5 M15 10 L13 15 M20 10 L18 5 M20 10 L18 15' stroke='${svgColor(color)}' fill='none' stroke-width='1.5'/%3E%3Cpath d='M25 10 L28 7 M25 10 L28 13' stroke='${svgColor(color)}' fill='none' stroke-width='1.5'/%3E%3C/svg%3E")`,
        size: '30px 20px'
    },
    {
        id: 'socks',
        name: '양말',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 2 V12 Q8 16 12 16 H16 Q18 16 18 14 Q18 12 16 12 H14 V2 H8 Z' stroke='${svgColor(color)}' fill='none' stroke-width='1.5'/%3E%3C/svg%3E")`,
        size: '24px 24px'
    },
    {
        id: 'mitten',
        name: '장갑',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 6 V16 Q8 20 12 20 Q16 20 16 16 V6 H8 Z M16 12 Q18 12 20 10' stroke='${svgColor(color)}' fill='none' stroke-width='1.5'/%3E%3Crect x='7' y='20' width='10' height='3' rx='1' fill='${svgColor(color)}'/%3E%3C/svg%3E")`,
        size: '24px 24px'
    },
    {
        id: 'smile-flower',
        name: '스마일꽃',
        generate: (color: string) => `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='15' cy='15' r='5' stroke='${svgColor(color)}' fill='none'/%3E%3Cpath d='M13 14 L13.5 14 M16.5 14 L17 14 M13 16 Q15 18 17 16' stroke='${svgColor(color)}' fill='none'/%3E%3Cpath d='M15 8 V5 M15 22 V25 M8 15 H5 M22 15 H25 M10 10 L8 8 M20 20 L22 22 M10 20 L8 22 M20 10 L22 8' stroke='${svgColor(color)}' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
        size: '30px 30px'
    }
];

// Premium Illustrations (Trendy Gradients & Mesh)
// ✨ Cute & Emotional Illustrations (Expanded & High Quality)
export const COVER_ILLUSTRATIONS = [
    {
        id: 'picnic-day',
        name: '피크닉',
        // Gingham check with a picnic basket
        value: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='gingham' x='0' y='0' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Crect width='40' height='40' fill='%23fefce8'/%3E%3Crect width='20' height='20' fill='%23fecaca' opacity='0.5'/%3E%3Crect x='20' y='20' width='20' height='20' fill='%23fecaca' opacity='0.5'/%3E%3Crect x='20' y='0' width='20' height='20' fill='%23f87171' opacity='0.4'/%3E%3Crect x='0' y='20' width='20' height='20' fill='%23f87171' opacity='0.4'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23gingham)'/%3E%3Cpath d='M30 65 L70 65 L65 85 H35 Z' fill='%2392400e'/%3E%3Cpath d='M30 65 Q50 40 70 65' stroke='%2392400e' stroke-width='3' fill='none'/%3E%3Cpath d='M35 65 L65 65' stroke='%23fef3c7' stroke-width='2' stroke-dasharray='4'/%3E%3Ccircle cx='50' cy='65' r='5' fill='%23ef4444'/%3E%3C/svg%3E")`,
        spineColor: '#f87171',
        previewColor: '#fef2f2',
        textColor: '#991b1b'
    },
    {
        id: 'night-sky',
        name: '밤하늘',
        // More stars added
        value: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='%230f172a'/%3E%3Ccircle cx='10' cy='15' r='1' fill='white'/%3E%3Ccircle cx='85' cy='10' r='1.5' fill='white'/%3E%3Ccircle cx='50' cy='20' r='1' fill='white'/%3E%3Ccircle cx='25' cy='40' r='0.8' fill='white'/%3E%3Ccircle cx='90' cy='50' r='1' fill='white'/%3E%3Ccircle cx='15' cy='80' r='1.2' fill='white'/%3E%3Ccircle cx='70' cy='85' r='1' fill='white'/%3E%3Ccircle cx='40' cy='90' r='0.8' fill='white'/%3E%3Cpath d='M60 30 L63 38 L70 40 L63 42 L60 50 L57 42 L50 40 L57 38 Z' fill='%23fef3c7'/%3E%3Cpath d='M30 60 L31 63 L34 64 L31 65 L30 68 L29 65 L26 64 L29 63 Z' fill='white' opacity='0.7'/%3E%3C/svg%3E")`,
        spineColor: '#334155',
        previewColor: '#0f172a',
        textColor: '#f1f5f9'
    },
    {
        id: 'strawberry-milk',
        name: '딸기우유',
        // More contents: milk carton shape and berries
        value: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='%23fff1f2'/%3E%3Cpath d='M30 30 L70 30 L70 90 L30 90 Z' fill='%23fecaca' stroke='%23fb7185' stroke-width='2'/%3E%3Cpath d='M30 30 L50 10 L70 30' fill='%23fecaca' stroke='%23fb7185' stroke-width='2'/%3E%3Ctext x='50' y='60' font-family='sans-serif' font-size='10' fill='%23be123c' text-anchor='middle' font-weight='bold'%3EMILK%3C/text%3E%3Cpath d='M45 70 L48 74 L52 74 L49 78 L50 82 L46 79 L42 82 L43 78 L40 74 L44 74 Z' fill='%23e11d48' transform='scale(0.8) translate(10 10)'/%3E%3Ccircle cx='80' cy='20' r='5' fill='%23fda4af' opacity='0.5'/%3E%3Ccircle cx='15' cy='80' r='8' fill='%23fda4af' opacity='0.5'/%3E%3C/svg%3E")`,
        spineColor: '#fda4af',
        previewColor: '#fff1f2',
        textColor: '#9f1239'
    },
    {
        id: 'peach-fuzz',
        name: '복숭아',
        // Clearer peach shape
        value: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='p_bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23fff7ed'/%3E%3Cstop offset='1' stop-color='%23ffedd5'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23p_bg)'/%3E%3Ccircle cx='50' cy='55' r='25' fill='%23fdba74'/%3E%3Cpath d='M50 30 Q60 20 70 30' stroke='%2315803d' stroke-width='2' fill='none'/%3E%3Cpath d='M50 30 Q40 40 30 35 Q40 20 50 30' fill='%2386efac'/%3E%3Ccircle cx='60' cy='50' r='10' fill='%23fb923c' opacity='0.3'/%3E%3C/svg%3E")`,
        spineColor: '#fdba74',
        previewColor: '#ffedd5',
        textColor: '#9a3412'
    },
    {
        id: 'lemonade',
        name: '레몬에이드',
        // Detailed lemon slice and glass feel
        value: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='%23fefce8'/%3E%3Ccircle cx='50' cy='50' r='30' fill='%23fef08a' stroke='%23ca8a04' stroke-width='2'/%3E%3Cpath d='M50 50 L50 20 M50 50 L75 35 M50 50 L75 65 M50 50 L50 80 M50 50 L25 65 M50 50 L25 35' stroke='%23ca8a04' stroke-width='1'/%3E%3Ccircle cx='50' cy='50' r='25' fill='none' stroke='white' stroke-width='1' stroke-dasharray='10 5'/%3E%3Cpath d='M70 20 L80 10' stroke='%23a3e635' stroke-width='3' stroke-linecap='round'/%3E%3Ccircle cx='20' cy='80' r='3' fill='%23a3e635' opacity='0.5'/%3E%3Ccircle cx='80' cy='20' r='4' fill='%23a3e635' opacity='0.5'/%3E%3C/svg%3E")`,
        spineColor: '#fde047',
        previewColor: '#fef9c3',
        textColor: '#854d0e'
    },
    {
        id: 'cotton-candy',
        name: '솜사탕',
        // Fluffy cloud-like shapes on a stick
        value: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='%23f0f9ff'/%3E%3Cpath d='M45 80 L55 80 L52 60 L48 60 Z' fill='%23d1d5db'/%3E%3Ccircle cx='40' cy='50' r='15' fill='%23fbcfe8'/%3E%3Ccircle cx='60' cy='50' r='15' fill='%23bae6fd'/%3E%3Ccircle cx='50' cy='40' r='15' fill='%23e9d5ff'/%3E%3Cpath d='M20 20 Q30 10 40 20' stroke='%23fbcfe8' stroke-width='2' fill='none' opacity='0.5'/%3E%3Cpath d='M80 80 Q70 90 60 80' stroke='%23bae6fd' stroke-width='2' fill='none' opacity='0.5'/%3E%3C/svg%3E")`,
        spineColor: '#f472b6',
        previewColor: '#fce7f3',
        textColor: '#831843'
    },
    {
        id: 'cherry-blossom',
        name: '벚꽃앤딩',
        value: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='%23fff1f2'/%3E%3Cpath d='M20 30 Q30 20 40 30 Q30 40 20 30 M80 70 Q90 60 100 70 Q90 80 80 70' fill='%23fbcfe8'/%3E%3Ccircle cx='50' cy='50' r='5' fill='%23fb7185'/%3E%3Cpath d='M50 50 Q70 30 80 50 Q60 70 50 50' fill='%23fda4af' opacity='0.8'/%3E%3Cpath d='M50 50 Q30 30 20 50 Q40 70 50 50' fill='%23fda4af' opacity='0.8'/%3E%3Cpath d='M50 50 Q30 70 40 90 Q60 60 50 50' fill='%23fda4af' opacity='0.8'/%3E%3C/svg%3E")`,
        spineColor: '#fda4af',
        previewColor: '#fff1f2',
        textColor: '#9f1239'
    },
    {
        id: 'pudding-jiggle',
        name: '커스터드 푸딩',
        value: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='%23fffbeb'/%3E%3Cpath d='M30 80 L35 40 Q50 35 65 40 L70 80 Z' fill='%23fcd34d'/%3E%3Cpath d='M35 40 Q50 35 65 40 L65 45 Q50 50 35 45 Z' fill='%2392400e'/%3E%3Ccircle cx='80' cy='85' r='5' fill='%23fca5a5' opacity='0.5'/%3E%3Ccircle cx='20' cy='20' r='5' fill='%23fca5a5' opacity='0.5'/%3E%3C/svg%3E")`,
        spineColor: '#fbbf24',
        previewColor: '#fffbeb',
        textColor: '#92400e'
    },
    {
        id: 'avocado-green',
        name: '아보카도',
        value: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='%23ecfccb'/%3E%3Cpath d='M50 20 Q80 20 80 55 Q80 90 50 90 Q20 90 20 55 Q20 20 50 20' fill='%2365a30d'/%3E%3Ccircle cx='50' cy='65' r='12' fill='%233f6212'/%3E%3Cpath d='M50 30 Q65 30 65 55' stroke='%23bef264' stroke-width='2' fill='none' opacity='0.5'/%3E%3C/svg%3E")`,
        spineColor: '#84cc16',
        previewColor: '#ecfccb',
        textColor: '#365314'
    },
    {
        id: 'space-planet',
        name: '우주여행',
        value: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='%231e1b4b'/%3E%3Ccircle cx='50' cy='50' r='20' fill='%23fcd34d'/%3E%3Cpath d='M30 60 Q50 70 70 40' stroke='%23fda4af' stroke-width='4' fill='none'/%3E%3Ccircle cx='20' cy='20' r='2' fill='white'/%3E%3Ccircle cx='80' cy='80' r='2' fill='white'/%3E%3Ccircle cx='80' cy='20' r='1' fill='white'/%3E%3C/svg%3E")`,
        spineColor: '#4338ca',
        previewColor: '#1e1b4b',
        textColor: '#e0e7ff'
    },
    {
        id: 'rainy-window',
        name: '비오는 창가',
        value: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='%2394a3b8'/%3E%3Cpath d='M30 30 Q35 40 30 50' stroke='%23e0f2fe' stroke-width='2' fill='none'/%3E%3Cpath d='M60 40 Q65 50 60 60' stroke='%23e0f2fe' stroke-width='2' fill='none'/%3E%3Cpath d='M45 70 Q50 80 45 90' stroke='%23e0f2fe' stroke-width='2' fill='none'/%3E%3Crect x='10' y='10' width='80' height='80' stroke='%23334155' stroke-width='2' fill='none' rx='5'/%3E%3C/svg%3E")`,
        spineColor: '#64748b',
        previewColor: '#94a3b8',
        textColor: '#f1f5f9'
    },
    {
        id: 'coffee-time',
        name: '커피 한 잔',
        value: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='%23fff7ed'/%3E%3Cpath d='M35 60 Q35 80 50 80 Q65 80 65 60 L65 40 L35 40 Z' fill='white' stroke='%23c2410c' stroke-width='2'/%3E%3Cpath d='M65 50 Q75 50 75 60 Q75 70 65 70' stroke='%23c2410c' stroke-width='2' fill='none'/%3E%3Cpath d='M40 30 Q45 20 40 10' stroke='%239a3412' stroke-width='1' fill='none' opacity='0.5'/%3E%3Cpath d='M50 35 Q55 25 50 15' stroke='%239a3412' stroke-width='1' fill='none' opacity='0.5'/%3E%3C/svg%3E")`,
        spineColor: '#fdba74',
        previewColor: '#fff7ed',
        textColor: '#7c2d12'
    },
    {
        id: 'music-playlist',
        name: '플레이리스트',
        // Modern player UI: Album art, progress bar, controls
        value: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='%23f5d0fe'/%3E%3Crect x='20' y='15' width='60' height='60' rx='4' fill='%23e879f9' shadow='blur'/%3E%3Ccircle cx='50' cy='45' r='15' stroke='white' stroke-width='2' fill='none'/%3E%3Ccircle cx='50' cy='45' r='5' fill='white'/%3E%3Crect x='20' y='82' width='60' height='4' rx='2' fill='white' opacity='0.5'/%3E%3Crect x='20' y='82' width='25' height='4' rx='2' fill='white'/%3E%3Ccircle cx='50' cy='45' r='2' fill='white'/%3E%3Cpath d='M42 43 V47 M58 43 V47' stroke='white' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
        spineColor: '#e879f9',
        previewColor: '#f5d0fe',
        textColor: '#701a75'
    },
    {
        id: 'birthday-cake',
        name: '생일 케이크',
        // Added sparkles
        value: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='%23fff1f2'/%3E%3Crect x='30' y='60' width='40' height='20' fill='%23fca5a5' rx='2'/%3E%3Crect x='35' y='45' width='30' height='15' fill='%23fda4af' rx='2'/%3E%3Crect x='48' y='30' width='4' height='15' fill='%23fcd34d'/%3E%3Ccircle cx='50' cy='25' r='3' fill='%23ef4444'/%3E%3Cpath d='M30 60 Q40 65 50 60 Q60 65 70 60' stroke='white' stroke-width='2' fill='none'/%3E%3Cpath d='M20 30 L22 32 L20 34 L18 32 Z' fill='%23fcd34d'/%3E%3Cpath d='M80 40 L82 42 L80 44 L78 42 Z' fill='%23fcd34d'/%3E%3Ccircle cx='25' cy='70' r='1.5' fill='%23fda4af'/%3E%3Ccircle cx='75' cy='20' r='2' fill='%23fda4af'/%3E%3Cpath d='M50 15 L51 12 L52 15 L51 18 Z' fill='%23fef3c7'/%3E%3C/svg%3E")`,
        spineColor: '#fca5a5',
        previewColor: '#fff1f2',
        textColor: '#be123c'
    },
    {
        id: 'soft-clouds',
        name: '뭉게구름',
        value: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='sky' x1='0%25' y1='100%25' x2='0%25' y2='0%25'%3E%3Cstop offset='0%25' stop-color='%23bae6fd'/%3E%3Cstop offset='100%25' stop-color='%23eff6ff'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23sky)'/%3E%3Cpath d='M10 80 Q25 65 40 80 T70 80 T100 80 V100 H0 V80 Z' fill='white' opacity='0.8'/%3E%3Ccircle cx='20' cy='30' r='10' fill='white' opacity='0.6'/%3E%3Ccircle cx='40' cy='40' r='15' fill='white' opacity='0.6'/%3E%3Ccircle cx='70' cy='25' r='12' fill='white' opacity='0.6'/%3E%3C/svg%3E")`,
        spineColor: '#7dd3fc',
        previewColor: '#e0f2fe',
        textColor: '#0c4a6e'
    },
    {
        id: 'teddy-bear',
        name: '곰돌이',
        value: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='%23fef3c7'/%3E%3Ccircle cx='50' cy='60' r='25' fill='%23d97706'/%3E%3Ccircle cx='35' cy='45' r='8' fill='%23d97706'/%3E%3Ccircle cx='65' cy='45' r='8' fill='%23d97706'/%3E%3Ccircle cx='42' cy='58' r='3' fill='%2327272a'/%3E%3Ccircle cx='58' cy='58' r='3' fill='%2327272a'/%3E%3Cellipse cx='50' cy='65' rx='6' ry='4' fill='%23fffbeb'/%3E%3Ccircle cx='50' cy='64' r='2' fill='%2327272a'/%3E%3C/svg%3E")`,
        spineColor: '#f59e0b',
        previewColor: '#fef3c7',
        textColor: '#78350f'
    },
    {
        id: 'lavender-field',
        name: '라벤더',
        value: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='%23f3e8ff'/%3E%3Cpath d='M50 90 V60 M20 90 V70 M80 90 V50' stroke='%23a855f7' stroke-width='1.5'/%3E%3Ccircle cx='50' cy='55' r='4' fill='%23d8b4fe'/%3E%3Ccircle cx='50' cy='48' r='3' fill='%23d8b4fe'/%3E%3Ccircle cx='50' cy='42' r='2' fill='%23d8b4fe'/%3E%3Ccircle cx='20' cy='65' r='3' fill='%23d8b4fe'/%3E%3Ccircle cx='20' cy='59' r='2' fill='%23d8b4fe'/%3E%3Ccircle cx='80' cy='45' r='4' fill='%23d8b4fe'/%3E%3Ccircle cx='80' cy='38' r='3' fill='%23d8b4fe'/%3E%3Ccircle cx='80' cy='32' r='2' fill='%23d8b4fe'/%3E%3C/svg%3E")`,
        spineColor: '#d8b4fe',
        previewColor: '#f3e8ff',
        textColor: '#6b21a8'
    },
    {
        id: 'mint-choco',
        name: '민트초코',
        value: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='%23ccfbf1'/%3E%3Ccircle cx='20' cy='20' r='6' fill='%234b2c20'/%3E%3Ccircle cx='80' cy='50' r='8' fill='%234b2c20'/%3E%3Ccircle cx='40' cy='80' r='5' fill='%234b2c20'/%3E%3Cpath d='M60 20 L70 30 L50 35 Z' fill='%234b2c20'/%3E%3Crect x='10' y='60' width='8' height='8' fill='%234b2c20' transform='rotate(45 14 64)'/%3E%3C/svg%3E")`,
        spineColor: '#5eead4',
        previewColor: '#ccfbf1',
        textColor: '#134e4a'
    },
    {
        id: 'ocean-blue',
        name: '바다',
        value: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='%23e0f2fe'/%3E%3Cpath d='M0 80 Q25 70 50 80 T100 80 V100 H0 Z' fill='%2338bdf8'/%3E%3Cpath d='M0 90 Q25 80 50 90 T100 90 V100 H0 Z' fill='%230284c7'/%3E%3Ccircle cx='30' cy='40' r='5' fill='%23bae6fd' opacity='0.5'/%3E%3Ccircle cx='70' cy='20' r='8' fill='%23facc15' opacity='0.8'/%3E%3C/svg%3E")`,
        spineColor: '#0ea5e9',
        previewColor: '#38bdf8',
        textColor: '#0c4a6e'
    },
    {
        id: 'magic-castle',
        name: '마법의 성',
        value: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='%23f3e8ff'/%3E%3Ccircle cx='10' cy='20' r='1' fill='white'/%3E%3Ccircle cx='90' cy='30' r='2' fill='white'/%3E%3Ccircle cx='20' cy='10' r='1.5' fill='white'/%3E%3Ccircle cx='80' cy='15' r='1' fill='white'/%3E%3Ccircle cx='35' cy='15' r='1' fill='white' opacity='0.7'/%3E%3Ccircle cx='65' cy='10' r='1' fill='white' opacity='0.7'/%3E%3Ccircle cx='5' cy='40' r='1' fill='white' opacity='0.5'/%3E%3Ccircle cx='95' cy='45' r='1' fill='white' opacity='0.5'/%3E%3Cpath d='M15 35 L16 32 L17 35 L16 38 Z' fill='%23fef3c7'/%3E%3Cpath d='M85 40 L86 37 L87 40 L86 43 Z' fill='%23fef3c7'/%3E%3Cpath d='M30 80 V50 L30 40 L40 50 V80 H30 Z' fill='%23c084fc'/%3E%3Cpath d='M60 80 V50 L60 40 L70 50 V80 H60 Z' fill='%23c084fc'/%3E%3Cpath d='M40 80 V40 L50 20 L60 40 V80 H40 Z' fill='%23a855f7'/%3E%3Crect x='45' y='60' width='10' height='20' fill='%23f3e8ff' rx='5'/%3E%3Ccircle cx='50' cy='20' r='2' fill='%23fef3c7'/%3E%3Cpath d='M50 15 L51 12 L52 15 L51 18 Z' fill='white' opacity='0.8'/%3E%3C/svg%3E")`,
        spineColor: '#a855f7',
        previewColor: '#f3e8ff',
        textColor: '#6b21a8'
    }
];

// Premium Patterns (Memphis & Geometric)
export const COVER_PATTERNS = [
    {
        id: 'memphis-fun',
        name: '멤피스',
        value: `radial-gradient(circle, #fca5a5 20%, transparent 20%), 
                radial-gradient(circle, #fcd34d 20%, transparent 20%) 30px 30px,
                linear-gradient(45deg, transparent 48%, #60a5fa 48%, #60a5fa 52%, transparent 52%)`,
        spineColor: '#fef3c7',
        previewColor: '#fffbeb',
        textColor: '#1f2937',
        backgroundColor: '#fffbeb',
        size: '60px 60px'
    },
    {
        id: 'geo-blocks',
        name: '블록',
        value: `linear-gradient(30deg, #475569 12%, transparent 12.5%, transparent 87%, #475569 87.5%, #475569),
                linear-gradient(150deg, #475569 12%, transparent 12.5%, transparent 87%, #475569 87.5%, #475569),
                linear-gradient(30deg, #475569 12%, transparent 12.5%, transparent 87%, #475569 87.5%, #475569),
                linear-gradient(150deg, #475569 12%, transparent 12.5%, transparent 87%, #475569 87.5%, #475569),
                linear-gradient(60deg, #64748b 25%, transparent 25.5%, transparent 75%, #64748b 75%, #64748b),
                linear-gradient(60deg, #64748b 25%, transparent 25.5%, transparent 75%, #64748b 75%, #64748b)`,
        spineColor: '#334155',
        previewColor: '#0f172a',
        textColor: '#f8fafc',
        backgroundColor: '#0f172a',
        size: '100px 100px'
    },
    {
        id: 'japanese-waves',
        name: '파도',
        value: `radial-gradient(circle at 100% 50%, transparent 20%, #a5f3fc 21%, #a5f3fc 34%, transparent 35%, transparent),
                radial-gradient(circle at 0% 50%, transparent 20%, #a5f3fc 21%, #a5f3fc 34%, transparent 35%, transparent) 0 -50px`,
        spineColor: '#0ea5e9',
        previewColor: '#e0f2fe',
        textColor: '#0c4a6e',
        backgroundColor: '#eff6ff',
        size: '50px 50px'
    },
    {
        id: 'minimal-grid-premium',
        name: '모눈종이',
        value: `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`,
        spineColor: '#f3f4f6',
        previewColor: '#ffffff',
        textColor: '#1f2937',
        backgroundColor: '#ffffff',
        size: '20px 20px'
    },
    {
        id: 'noise-texture',
        name: '노이즈',
        value: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E"), linear-gradient(to bottom right, #e2e8f0, #cbd5e1)`,
        spineColor: '#94a3b8',
        previewColor: '#f1f5f9',
        textColor: '#334155',
        backgroundColor: '#f8fafc',
        size: '200px 200px'
    },
    {
        id: 'terrazzo-premium',
        name: '테라조',
        value: `radial-gradient(circle, #fbcfe8 15%, transparent 16%),
                radial-gradient(circle, #fcd34d 10%, transparent 11%) 20px 20px,
                radial-gradient(circle, #a5f3fc 15%, transparent 16%) 10px 10px`,
        spineColor: '#f5d0fe',
        previewColor: '#faf5ff',
        textColor: '#1f2937',
        backgroundColor: '#faf5ff',
        size: '40px 40px'
    }
];

export const COVER_COLORS = [
    { name: '크림', value: '#fffbeb', spine: '#fde68a', text: '#78350f' },
    { name: '스카이', value: '#f0f9ff', spine: '#bae6fd', text: '#0c4a6e' },
    { name: '라벤더', value: '#f5f3ff', spine: '#ddd6fe', text: '#4c1d95' },
    { name: '민트', value: '#ecfdf5', spine: '#6ee7b7', text: '#064e3b' },
    { name: '코랄', value: '#fff1f2', spine: '#fda4af', text: '#881337' },
    { name: '레몬', value: '#fefce8', spine: '#fde047', text: '#713f12' },
    { name: '클레이', value: '#fff7ed', spine: '#fdba74', text: '#7c2d12' },
    { name: '스톤', value: '#f8fafc', spine: '#94a3b8', text: '#0f172a' },
    { name: '미드나잇', value: '#0f172a', spine: '#1e293b', text: '#f1f5f9' },
    // Extended Colors
    { name: '로즈', value: '#ffe4e6', spine: '#fda4af', text: '#881337' },
    { name: '버터', value: '#fef3c7', spine: '#fcd34d', text: '#92400e' },
    { name: '라임', value: '#ecfccb', spine: '#bef264', text: '#3f6212' },
    { name: '아쿠아', value: '#ccfbf1', spine: '#5eead4', text: '#115e59' },
    { name: '오션', value: '#e0f2fe', spine: '#7dd3fc', text: '#075985' },
    { name: '인디고', value: '#e0e7ff', spine: '#818cf8', text: '#3730a3' },
    { name: '푸시아', value: '#fae8ff', spine: '#e879f9', text: '#86198f' },
    { name: '차콜', value: '#334155', spine: '#1e293b', text: '#f1f5f9' },
    { name: '브라운', value: '#451a03', spine: '#78350f', text: '#fffbeb' },
    { name: '포레스트', value: '#052e16', spine: '#14532d', text: '#ecfdf5' },
    { name: '네이비', value: '#172554', spine: '#1e3a8a', text: '#eff6ff' },
    { name: '핑크', value: '#fce7f3', spine: '#f9a8d4', text: '#be185d' },
];

export const STICKER_ICONS = [
    '📝', '✈️', '📖', '📅', '🍳', '🛒', '🏋️', '💼', '🎓', '🎨', '🧸', '🎵', '📷', '💊', '💰', '🔑', '🎁', '🎈', '🌙', '⭐', '❤️', '🔥', '✨', '🍀', '🐶', '🐱'
];
