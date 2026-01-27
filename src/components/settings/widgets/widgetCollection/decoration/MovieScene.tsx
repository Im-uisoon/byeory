import React, { useState } from 'react';
import { useWidgetStorage } from '../SDK';
import { Settings } from 'lucide-react';

export const MovieScene = React.memo(function MovieScene({ src, quote }: { src?: string; quote?: string }) {
    const [data, setData] = useWidgetStorage('moviescene-data', {
        src: src || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800',
        quote: quote || "Here's looking at you, kid."
    });
    const [isEditing, setIsEditing] = useState(false);

    if (isEditing) {
        return (
            <div className="relative w-full h-full rounded-lg overflow-hidden shadow-md border border-gray-800 bg-gray-900 p-2 flex flex-col gap-2 justify-center">
                <input
                    type="text"
                    value={data.src}
                    onChange={(e) => setData({ ...data, src: e.target.value })}
                    className="bg-gray-800 text-white text-xs p-1 rounded border border-gray-700"
                    placeholder="Image URL"
                />
                <input
                    type="text"
                    value={data.quote}
                    onChange={(e) => setData({ ...data, quote: e.target.value })}
                    className="bg-gray-800 text-white text-xs p-1 rounded border border-gray-700"
                    placeholder="Quote"
                />
                <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-700 text-white text-xs py-1 rounded hover:bg-gray-600"
                >
                    Done
                </button>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full rounded-lg overflow-hidden shadow-md group border border-gray-800">
            <button
                onClick={() => setIsEditing(true)}
                className="absolute top-2 right-2 text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-black/20 rounded-full p-1"
            >
                <Settings size={14} />
            </button>
            <img src={data.src} alt="Movie Scene" className="w-full h-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent pt-8 pb-2 px-2 text-center">
                <p className="text-white text-xs md:text-sm font-medium font-serif italic drop-shadow-md line-clamp-2">
                    "{data.quote}"
                </p>
            </div>
        </div>
    );
});
