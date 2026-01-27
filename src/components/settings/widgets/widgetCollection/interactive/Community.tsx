import { WidgetWrapper } from '../../Shared';

// 13. Community Widget (커뮤니티)
// 13. Community Widget (커뮤니티)
// 13. Community Widget (커뮤니티)
export function CommunityWidget({ gridSize }: { gridSize?: { w: number; h: number } }) {
    const posts = [
        { title: "오늘 다꾸 팁 공유해요! 🎀", likes: 12 },
        { title: "위젯 배치 좀 봐주세요 ㅎㅎ", likes: 8 },
        { title: "저녁 메뉴 추천 받아요", likes: 5 },
        { title: "주말에 뭐하시나요?", likes: 3 },
    ];

    const w = gridSize?.w || 2;
    const h = gridSize?.h || 2;
    const isWide = w >= 2 && h === 1;
    const isTall = w === 1 && h >= 2;

    // Show fewer items if 2x1 (Height 1)
    const visiblePosts = isWide ? posts.slice(0, 2) : posts.slice(0, 3);
    // If tall, can show more?
    const displayPosts = isTall ? posts : visiblePosts;

    return (
        <WidgetWrapper title="커뮤니티 인기글" className="bg-white">
            <div className="flex-1 p-0 flex flex-col">
                {displayPosts.map((post, i) => (
                    <div key={i} className={`px-3 py-2 border-b border-gray-50 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-colors ${i === 0 ? 'bg-orange-50/50' : ''}`}>
                        <span className="text-xs text-gray-700 truncate flex-1">{post.title}</span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5 ml-2 min-w-[30px] justify-end">❤️ {post.likes}</span>
                    </div>
                ))}
                {!isWide && (
                    <div className="p-2 text-center text-[10px] text-gray-400 hover:text-[var(--btn-bg)] cursor-pointer mt-auto">
                        더보기 &gt;
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
}
