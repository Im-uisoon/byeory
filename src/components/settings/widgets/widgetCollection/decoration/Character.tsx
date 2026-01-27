import React, { useState } from 'react';
import { WidgetWrapper } from '../Common';
import { useWidgetStorage } from '../SDK';
import { Settings } from 'lucide-react';

export const FavoriteCharacter = React.memo(function FavoriteCharacter({ src, name, gridSize }: { src?: string; name?: string; gridSize?: { w: number; h: number } }) {
    const [data, setData] = useWidgetStorage('character-data', {
        src: src || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        name: name || 'My Star'
    });
    const [isEditing, setIsEditing] = useState(false);

    const w = gridSize?.w || 1;
    const h = gridSize?.h || 1;
    const isWide = w >= 2 && h === 1;

    if (isEditing) {
        return (
            <WidgetWrapper className="bg-gradient-to-br from-pink-50 to-white">
                <div className="flex flex-col gap-2 w-full h-full justify-center p-2">
                    <input
                        type="text"
                        value={data.src}
                        onChange={(e) => setData({ ...data, src: e.target.value })}
                        className="bg-white/50 text-xs p-1 rounded border border-pink-200 w-full"
                        placeholder="Image URL"
                    />
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
                        className="bg-white/50 text-xs p-1 rounded border border-pink-200 w-full"
                        placeholder="Name"
                    />
                    <button
                        onClick={() => setIsEditing(false)}
                        className="bg-pink-400 text-white text-xs py-1 rounded hover:bg-pink-500 w-full"
                    >
                        Save
                    </button>
                </div>
            </WidgetWrapper>
        );
    }

    return (
        <WidgetWrapper className="bg-gradient-to-br from-pink-50 to-white relative group">
            <button
                onClick={() => setIsEditing(true)}
                className="absolute top-1 right-1 text-pink-300 hover:text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <Settings size={12} />
            </button>
            {isWide ? (
                <div className="flex items-center gap-4 px-4 w-full h-full">
                    <div className="relative h-[80%] aspect-square rounded-full overflow-hidden border-2 border-[var(--btn-bg)] shadow-md transition-transform hover:scale-105 shrink-0">
                        <img src={data.src} alt={data.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-semibold text-sm text-[var(--text-primary)] truncate">{data.name}</span>
                </div>
            ) : (
                <>
                    <div className="relative w-full aspect-square max-w-[100px] rounded-full overflow-hidden border-2 border-[var(--btn-bg)] shadow-md transition-transform hover:scale-105 mx-auto">
                        <img src={data.src} alt={data.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-semibold text-xs md:text-sm text-[var(--text-primary)] mt-2 text-center truncate w-full block">{data.name}</span>
                </>
            )}
        </WidgetWrapper>
    );
});
