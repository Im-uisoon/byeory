import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useWidgetStorage } from '../SDK';

// [DB Connection Needed] Notes should be synced.
// Future: Note { id, content, color, position, updatedAt }

export function ScrapNote({ text: initialText = '', gridSize }: { text?: string; gridSize?: { w: number; h: number } }) {
    const [text, setText] = useWidgetStorage('widget-scrap-note', initialText);
    const [copied, setCopied] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isSmall = (gridSize?.w || 2) === 1 && (gridSize?.h || 2) === 1;

    return (
        <div className="w-full h-full bg-[#f0e6d2] dark:bg-[#3d3830] p-4 shadow-md relative overflow-hidden flex flex-col group transition-colors"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 95%, 95% 100%, 5% 100%, 0 95%)' }}>

            {/* Header / Tape (Hidden on 1x1 to save space) */}
            {!isSmall && (
                <div className="absolute top-0 left-0 w-full h-8 bg-[#e6dcc8] dark:bg-[#4a443a] border-b border-[#d4c9b3] dark:border-[#5c554a] flex items-center justify-between px-3 z-10">
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#c0b090] dark:bg-[#706858]"></div>
                        <div className="w-2 h-2 rounded-full bg-[#c0b090] dark:bg-[#706858]"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#8c7f66] dark:text-[#8c8273]">
                            {text.length} chars
                        </span>
                        <button
                            onClick={handleCopy}
                            className="p-1 rounded hover:bg-[#d4c9b3] dark:hover:bg-[#5c554a] text-[#8c7f66] transition-colors"
                            title="Copy to clipboard"
                        >
                            {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                        </button>
                    </div>
                </div>
            )}

            <textarea
                className={`w-full flex-1 bg-transparent resize-none outline-none text-[#5c4a35] dark:text-[#d4c9b3] jua-regular text-sm leading-6 custom-scrollbar ${!isSmall ? 'mt-6' : 'mt-1'}`}
                placeholder="Type..."
                value={text}
                onChange={handleChange}
                spellCheck={false}
                style={{
                    backgroundImage: 'linear-gradient(transparent 23px, currentColor 24px)',
                    backgroundSize: '100% 24px',
                    opacity: 0.9,
                    lineHeight: '24px'
                }}
            />
        </div>
    );
}
