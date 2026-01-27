import React, { useState } from 'react';
import { useWidgetStorage } from '../SDK';
import { Settings } from 'lucide-react';

export const NeonSign = React.memo(function NeonSign({ text: initialText, color: initialColor = '#ff00ff', gridSize }: { text?: string; color?: string; gridSize?: { w: number; h: number } }) {
    const [data, setData] = useWidgetStorage('neonsign-data', {
        text: initialText || 'OPEN',
        color: initialColor
    });
    const [isEditing, setIsEditing] = useState(false);

    const isSmall = (gridSize?.w || 2) < 2;
    const glowStyle = {
        textShadow: `
      0 0 5px #fff,
      0 0 10px #fff,
      0 0 20px ${data.color},
      0 0 40px ${data.color},
      0 0 80px ${data.color}
    `,
        fontFamily: 'cursive',
        color: '#fff'
    };

    if (isEditing) {
        return (
            <div className="w-full h-full bg-black/95 rounded-xl border border-gray-800 p-2 flex flex-col gap-2 justify-center">
                <input
                    type="text"
                    value={data.text}
                    onChange={(e) => setData({ ...data, text: e.target.value })}
                    className="bg-gray-800 text-white text-xs p-1 rounded border border-gray-700"
                    placeholder="Text"
                />
                <input
                    type="color"
                    value={data.color}
                    onChange={(e) => setData({ ...data, color: e.target.value })}
                    className="w-full h-6 bg-transparent cursor-pointer"
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
        <div className="w-full h-full bg-black/95 rounded-xl border border-gray-800 flex items-center justify-center p-2 overflow-hidden shadow-2xl relative group">
            <button
                onClick={() => setIsEditing(true)}
                className="absolute top-2 right-2 text-gray-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <Settings size={14} />
            </button>
            <h2 className={`${isSmall ? 'text-xs p-1 leading-tight' : 'text-xl md:text-3xl'} font-bold text-center truncate animate-pulse`} style={glowStyle}>
                {data.text}
            </h2>
        </div>
    );
});
