import React, { useState } from 'react';
import { BookOpen, Settings } from 'lucide-react';
import { WidgetWrapper } from '../Common';
import { useWidgetStorage } from '../SDK';

// --- 7. Book Cover (읽는 책)
export const BookCover = React.memo(function BookCover() {
    const [data, setData] = useWidgetStorage('bookcover-data', {
        title: '데미안',
        author: 'H. Hesse',
        page: 42,
        total: 300
    });
    const [isEditing, setIsEditing] = useState(false);

    const progress = Math.min(100, Math.round((data.page / data.total) * 100));

    if (isEditing) {
        return (
            <WidgetWrapper className="bg-[#f5e6d3]">
                <div className="flex flex-col gap-1 p-2 h-full justify-center">
                    <input
                        type="text"
                        value={data.title}
                        onChange={(e) => setData({ ...data, title: e.target.value })}
                        className="text-xs p-1 border rounded w-full bg-white/50"
                        placeholder="Title"
                    />
                    <input
                        type="text"
                        value={data.author}
                        onChange={(e) => setData({ ...data, author: e.target.value })}
                        className="text-xs p-1 border rounded w-full bg-white/50"
                        placeholder="Author"
                    />
                    <div className="flex gap-1">
                        <input
                            type="number"
                            value={data.page}
                            onChange={(e) => setData({ ...data, page: Number(e.target.value) })}
                            className="text-xs p-1 border rounded w-1/2 bg-white/50"
                            placeholder="Page"
                        />
                        <input
                            type="number"
                            value={data.total}
                            onChange={(e) => setData({ ...data, total: Number(e.target.value) })}
                            className="text-xs p-1 border rounded w-1/2 bg-white/50"
                            placeholder="Total"
                        />
                    </div>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="bg-[#8b4513] text-white text-xs py-1 rounded hover:bg-[#5c4033]"
                    >
                        Save
                    </button>
                </div>
            </WidgetWrapper>
        );
    }

    return (
        <WidgetWrapper className="bg-[#f5e6d3] relative group">
            <button
                onClick={() => setIsEditing(true)}
                className="absolute top-1 right-1 text-[#8b4513]/30 hover:text-[#8b4513] opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <Settings size={12} />
            </button>
            <div className="flex items-start gap-2 w-full h-full">
                <div className="w-12 h-16 bg-[#8b4513] rounded-sm shadow-md flex items-center justify-center text-white/50 shrink-0">
                    <BookOpen size={16} />
                </div>
                <div className="flex-1 flex flex-col justify-between h-full py-1 min-w-0">
                    <div>
                        <p className="text-xs font-serif font-bold text-[#5c4033] line-clamp-1">{data.title}</p>
                        <p className="text-[10px] text-[#8b4513]/70 truncate">{data.author}</p>
                    </div>
                    <div className="w-full">
                        <div className="flex justify-between text-[8px] text-[#5c4033] mb-0.5">
                            <span>p.{data.page}</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#d2b48c] rounded-full overflow-hidden">
                            <div className="h-full bg-[#8b4513]" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </WidgetWrapper>
    );
});
