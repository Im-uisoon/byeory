import React, { useState } from 'react';
import { useWidgetStorage } from '../SDK';
import { Settings } from 'lucide-react';

export const TextScroller = React.memo(({ text: initialText = 'HELLO WORLD', gridSize: _ }: { text?: string, gridSize?: { w: number; h: number } }) => {
    const [text, setText] = useWidgetStorage('textscroller-text', initialText);
    const [color, setColor] = useWidgetStorage('textscroller-color', '#00ff00');
    const [isBold, setIsBold] = useWidgetStorage('textscroller-bold', true);
    const [isItalic, setIsItalic] = useWidgetStorage('textscroller-italic', false);
    const [isEditing, setIsEditing] = useState(false);

    if (isEditing) {
        return (
            <div className="w-full h-full bg-black text-[#00ff00] p-2 rounded-lg overflow-hidden font-mono flex flex-col items-center justify-center relative border-2 md:border-4 border-gray-800 shadow-inner gap-2">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="bg-gray-900 text-[#00ff00] text-xs p-1 w-full border border-gray-700 rounded"
                    placeholder="Enter text..."
                />
                <div className="flex gap-2 w-full">
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="h-6 w-6 bg-transparent border-none cursor-pointer"
                    />
                    <button
                        onClick={() => setIsBold(!isBold)}
                        className={`flex-1 text-xs border border-gray-700 rounded ${isBold ? 'bg-gray-700' : 'bg-transparent'}`}
                    >
                        B
                    </button>
                    <button
                        onClick={() => setIsItalic(!isItalic)}
                        className={`flex-1 text-xs border border-gray-700 rounded italic ${isItalic ? 'bg-gray-700' : 'bg-transparent'}`}
                    >
                        I
                    </button>
                </div>
                <button onClick={() => setIsEditing(false)} className="text-xs bg-gray-800 px-2 py-1 rounded hover:bg-gray-700 w-full">OK</button>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-black p-2 rounded-lg overflow-hidden font-mono flex items-center relative border-2 md:border-4 border-gray-800 shadow-inner group" style={{ color }}>
            <button
                onClick={() => setIsEditing(true)}
                className="absolute top-1 right-1 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <Settings size={12} />
            </button>
            <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
            <div className={`whitespace-nowrap animate-[scroll-left_10s_linear_infinite] text-sm md:text-xl tracking-widest ${isBold ? 'font-bold' : ''} ${isItalic ? 'italic' : ''}`} style={{ color }}>
                {text}
            </div>
        </div>
    );
});
