import React, { useState } from 'react';
import { useWidgetStorage } from '../SDK';
import { Settings } from 'lucide-react';

export const ColorChip = React.memo(function ColorChip({ color: initialColor, name: initialName, code: initialCode }: { color?: string; name?: string; code?: string; gridSize?: { w: number; h: number } }) {
    const [data, setData] = useWidgetStorage('colorchip-data', {
        color: initialColor || '#3b82f6',
        name: initialName || 'Blue',
        code: initialCode
    });
    const [isEditing, setIsEditing] = useState(false);

    if (isEditing) {
        return (
            <div className="w-full h-full bg-white shadow-sm rounded-lg overflow-hidden flex flex-col border border-gray-100 p-2 gap-1 relative">
                <button
                    onClick={() => setIsEditing(false)}
                    className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>
                <div className="text-[10px] font-bold text-gray-500">Edit Color</div>
                <input
                    type="color"
                    value={data.color}
                    onChange={(e) => setData({ ...data, color: e.target.value, code: e.target.value })}
                    className="w-full h-8 cursor-pointer"
                />
                <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    className="w-full text-xs p-1 border rounded"
                    placeholder="Color Name"
                />
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-white shadow-sm rounded-lg overflow-hidden flex flex-col border border-gray-100 relative group">
            <button
                onClick={() => setIsEditing(true)}
                className="absolute top-1 right-1 text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 drop-shadow-md"
            >
                <Settings size={12} />
            </button>
            <div className="flex-1 w-full" style={{ backgroundColor: data.color }} />
            <div className="p-2 bg-white w-full">
                <p className="font-bold text-gray-800 text-xs truncate">{data.name}</p>
                <p className="text-gray-500 text-[10px] truncate">{data.code || data.color}</p>
            </div>
        </div>
    );
});
