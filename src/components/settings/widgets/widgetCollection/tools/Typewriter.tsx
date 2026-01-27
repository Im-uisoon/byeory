import { WidgetWrapper } from '../Common';
import { useWidgetStorage } from '../SDK';

interface TypewriterProps {
    gridSize?: { w: number; h: number };
}

export function Typewriter({ }: TypewriterProps) {
    const [text, setText] = useWidgetStorage('widget-typewriter-text', '');

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        // Play sound effect hook here if requested later
    };

    return (
        <WidgetWrapper className="bg-[#f0e6d2] dark:bg-stone-800 border-none p-0 relative shadow-md items-stretch">
            {/* Paper Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/old-map.png')] opacity-30 pointer-events-none"></div>

            {/* Typewriter Roller Visual at Top */}
            <div className="h-4 bg-zinc-800 w-full relative z-10 shadow-md">
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-zinc-600"></div>
            </div>

            <div className="p-4 w-full h-full pt-6 relative">
                <textarea
                    value={text}
                    onChange={handleChange}
                    className="w-full h-full bg-transparent border-none outline-none font-serif text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 resize-none placeholder:italic placeholder:opacity-50"
                    placeholder="Type something..."
                    style={{ fontFamily: 'var(--font-mono, monospace)' }}
                />

                {/* Caret Blinker custom */}
                <style>{`
                    textarea::placeholder { color: currentColor; opacity: 0.5; }
                 `}</style>
            </div>
        </WidgetWrapper>
    );
}
