// pages/widget-builder/utils.ts
import type { BlockType } from './types';

export const getDefaultContent = (type: BlockType) => {
    switch (type) {
        case 'heading1': return { text: '대제목 1' };
        case 'heading2': return { text: '중제목 2' };
        case 'heading3': return { text: '소제목 3' };

        case 'text': return { text: '텍스트를 입력하세요.' };
        case 'footnote': return { text: '본문 내용입니다.', note: '각주 설명' };

        case 'bullet-list':
            return { items: ['첫 번째 항목', '두 번째 항목'] };
        case 'number-list':
            return { items: ['순서 1', '순서 2'] };

        case 'quote': return { text: '인용구 작성' };
        case 'divider': return {};

        case 'button': return { label: '버튼' };
        case 'chart-pie':
        case 'chart-bar':
            return {
                data: [
                    { label: '식비', value: 40 },
                    { label: '교통', value: 25 },
                    { label: '쇼핑', value: 15 },
                    { label: '기타', value: 20 }
                ]
            };

        case 'todo-list':
            return {
                items: [
                    { text: '우유 사기', done: false },
                    { text: '운동하기', done: true }
                ]
            };

        case 'counter':
            return {
                title: '여름 휴가',
                date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0] // 일주일 뒤
            };
        // 4. 토글 목록 (제목 + 숨겨진 리스트)
        case 'toggle-list':
            return { title: '▶ 토글 제목', items: ['숨겨진 내용 1', '숨겨진 내용 2'] };

        // 5. 다단 컬럼 (기본 2단)
        case 'columns':
            return {
                layout: [[], []] // 2단이 기본, 각각 빈 배열
            };

        // 6. 아코디언 (제목 + 숨겨진 긴 본문)
        case 'accordion':
            return { title: 'Q. 자주 묻는 질문', body: 'A. 이곳에 상세한 답변 내용을 적습니다.' };

        case 'callout':
            return {
                type: 'info', // info, warning, error, success
                title: '알림',
                text: '이곳에 중요한 내용을 작성하세요.'
            };
        case 'highlight':
            return {
                text: '중요한 핵심 내용입니다.',
                color: '#fef08a' // 기본 노란색
            };
        case 'spoiler':
            return {
                text: '클릭하여 스포일러 내용을 확인하세요.',
                isRevealed: false // 기본적으로 숨김 상태
            };
        case 'vertical-text':
            return {
                text: '세로쓰기입니다.', // 줄바꿈을 포함하여 예시 제공
            };

        case 'math':
            return {
                text: '\\sqrt{b^2 - 4ac}', // 기본 2차 방정식 공식 예시 (LaTeX)
                fontSize: 20
            };
        case 'typing-text':
            return {
                text: '안녕하세요! 이 텍스트는 자동으로 타이핑됩니다.',
                speed: 100, // 타이핑 속도 (ms)
                isBackspaceMode: false, // 🆕 기본적으로는 꺼둠 (즉시 리셋)
            };

        case 'scroll-text':
            return {
                text: '📣 긴급 공지사항: 이 텍스트는 뉴스 티커처럼 흐릅니다. 중요한 내용을 여기에 적어주세요.',
                speed: 10, // 스크롤 속도 (초 단위, 낮을수록 빠름)

            };
        case 'chart-radar':
            return {
                data: [
                    { label: '속도', value: 80 },
                    { label: '파워', value: 90 },
                    { label: '지구력', value: 60 },
                    { label: '기술', value: 70 },
                    { label: '수비', value: 50 },
                    { label: '멘탈', value: 85 },
                ],
                showLabels: true, // 라벨 표시 여부
            };
        case 'heatmap':
            return {
                viewMode: 'year', // 기본은 1년 보기 ('year' | 'month' | 'week')
                // 데이터는 서버에서 가져오므로 초기 데이터 불필요
            };
        case 'rating':
            return {
                value: 3,       // 현재 점수
                max: 5,         // 최대 점수
                icon: 'star',   // 아이콘 타입 (star, heart, zap, thumb)
            };
        case 'pdf-viewer':
            return {
                fileUrl: '',       // blob url or remote url
                fileName: '',
            };
        // utils.ts
        case 'mindmap':
            return {
                nodes: [
                    {
                        id: `mm-root-${Date.now()}`,
                        type: 'mindmap',
                        position: { x: 0, y: 0 },
                        data: { label: 'Main Topic' },
                    },
                ],
                edges: [],
                selectedNodeId: null,
            };

        case 'flashcards':
            return {
                title: 'Flashcards',
                cards: [
                    { id: `fc-${Date.now()}-1`, front: 'Front', back: 'Back' },
                ],
                currentIndex: 0,
                showBack: false,
                shuffle: false,
            };
        // 🌟 [추가됨] 책 정보 위젯
        case 'book-info':
            return {
                bookData: null // 초기값은 null이어야 검색 화면이 나옵니다.
            };

        // 🌟 [추가됨] 진행 게이지
        case 'progress-bar':
            return {
                value: 50,
                max: 100,
                label: '진행률',
                style: 'bar' // or 'circle'
            };

        // 🌟 [추가됨] 단위 변환기
        case 'unit-converter':
            return {
                category: 'length',
                value: 1,
                fromUnitIdx: 0,
                toUnitIdx: 1,
                title: '단위 변환기'
            };

        // 🌟 [추가됨] 데이터베이스
        case 'database':
            return {
                headers: ['이름', '태그', '상태'],
                rows: [
                    ['프로젝트 기획', '업무', '완료'],
                    ['디자인 시안', '디자인', '진행중'],
                ]
            };
        case 'movie-ticket':
            return {
                movieData: null,
                watchedDate: new Date().toISOString().split('T')[0], // 오늘 날짜 기본
                review: '',       // 감상평
                isReviewOpen: false // 감상평 펼침 여부 저장
            };
        default: return {};
    }
};

export const getLabelByType = (type: BlockType) => {
    switch (type) {
        case 'divider': return '구분선';
        case 'bullet-list': return '글머리 목록';
        case 'number-list': return '번호 목록';
        case 'toggle-list': return '토글 목록';
        case 'columns': return '다단 컬럼';
        case 'accordion': return '아코디언';
        // 🌟 라벨 추가
        case 'book-info': return '책 정보';
        case 'progress-bar': return '진행 게이지';
        case 'unit-converter': return '단위 변환기';
        case 'database': return '데이터베이스';
        case 'mindmap': return '마인드맵';
        case 'flashcards': return '암기카드';
        case 'movie-ticket': return '영화 티켓'; // 🌟 라벨 추가
        default: return '블록';
    }
};

// --------------------
// Spline Logic for Blob
// --------------------
export const getSvgPathFromPoints = (points: { x: number; y: number }[], tension: number = 0.5, close: boolean = true) => {
    if (!points || points.length < 1) return "";

    // Make a copy
    let pts = points.map(p => ({ ...p }));

    // If closed, repeat points to handle looping curvature
    if (close) {
        pts.unshift(points[points.length - 1]);
        pts.unshift(points[points.length - 2]);
        pts.push(points[0]);
        pts.push(points[1]);
    }

    const res: any[] = [];

    // Start drawing
    // Move to the first actual point
    res.push(`M ${points[0].x} ${points[0].y}`);

    // Loop through points
    // i starts at 1 because we added 2 pts at the start (if closed is typical implementation)
    // Actually simplicity: Catmull-Rom to Cubic Bezier conversion
    // For each segment p1 -> p2
    // p0, p1, p2, p3

    // If closed, the array has padded points. The actual segment we care about starts from the first real point.
    // Real points are at index 2 (since 0,1 are padding) in 'pts' if we padded simple.

    // Let's use a simpler known algorithm logic or just standard smoothing
    // Using Catmull-Rom logic:
    // P = points array
    // For i = 1 to length - 3
    // p0=pts[i-1], p1=pts[i], p2=pts[i+1], p3=pts[i+2]

    // Adjust logic:
    const padded = close
        ? [points[points.length - 1], ...points, points[0], points[1]]
        : [points[0], ...points, points[points.length - 1]];

    for (let i = 1; i < padded.length - 2; i++) {
        const p0 = padded[i - 1];
        const p1 = padded[i];
        const p2 = padded[i + 1];
        const p3 = padded[i + 2];

        const cp1x = p1.x + (p2.x - p0.x) / 6 * tension;
        const cp1y = p1.y + (p2.y - p0.y) / 6 * tension;

        const cp2x = p2.x - (p3.x - p1.x) / 6 * tension;
        const cp2y = p2.y - (p3.y - p1.y) / 6 * tension;

        res.push(`C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`);
    }

    return res.join(" ");
};

export const generateBlobPoints = (numPoints: number = 6) => {
    const points: { x: number; y: number }[] = [];
    const center = { x: 50, y: 50 };
    const radius = 40;

    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * 2 * Math.PI;
        // Randomize radius between 30 and 50
        const r = radius + (Math.random() * 20 - 10);
        points.push({
            x: center.x + r * Math.cos(angle),
            y: center.y + r * Math.sin(angle)
        });
    }
    return points;
};
