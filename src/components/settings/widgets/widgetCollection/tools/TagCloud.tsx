import React, { useMemo } from 'react';
import { WidgetWrapper } from '../../Shared';
import { RefreshCw } from 'lucide-react';
import { useWidgetStorage } from '../SDK';

interface ComponentProps {
    className?: string;
    style?: React.CSSProperties;
    initialTags?: Array<{ text: string; value: number }>;
}

const DEFAULT_TAGS = [
    { text: 'Byeory', value: 10 },
    { text: 'Diary', value: 8 },
    { text: 'Emotion', value: 7 },
    { text: 'Stickers', value: 6 },
    { text: 'Widgets', value: 6 },
    { text: 'Custom', value: 5 },
    { text: 'Decor', value: 5 },
    { text: 'Life', value: 4 },
    { text: 'Memory', value: 4 },
    { text: 'Dream', value: 3 },
    { text: 'Goal', value: 3 },
    { text: 'Space', value: 2 },
];

export const TagCloud = ({ className, style, initialTags = DEFAULT_TAGS, gridSize: _ }: ComponentProps & { gridSize?: { w: number; h: number } }) => {
    const [tags, setTags] = useWidgetStorage('widget-tagcloud-tags', initialTags);

    const shuffledTags = useMemo(() => {
        return [...tags].sort(() => Math.random() - 0.5);
    }, [tags]);

    const maxSize = 24;
    const minSize = 10;
    const maxValue = Math.max(...tags.map(t => t.value));
    const minValue = Math.min(...tags.map(t => t.value));

    const getFontSize = (value: number) => {
        if (maxValue === minValue) return (maxSize + minSize) / 2;
        return minSize + ((value - minValue) / (maxValue - minValue)) * (maxSize - minSize);
    };

    const getOpacity = (value: number) => {
        if (maxValue === minValue) return 1;
        return 0.4 + ((value - minValue) / (maxValue - minValue)) * 0.6;
    };

    return (
        <WidgetWrapper className={`bg-white text-gray-800 ${className || ''}`} style={style}>
            <div className="w-full h-full p-4 flex flex-col relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tag Cloud</span>
                    <button
                        onClick={() => setTags([...tags])}
                        className="p-1 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                    >
                        <RefreshCw size={12} />
                    </button>
                </div>

                <div className="flex-1 flex flex-wrap content-center justify-center gap-x-3 gap-y-1">
                    {shuffledTags.map((tag, index) => (
                        <span
                            key={`${tag.text}-${index}`}
                            className="cursor-default transition-all duration-300 hover:scale-110 hover:text-[#5b3c3c]"
                            style={{
                                fontSize: `${getFontSize(tag.value)}px`,
                                opacity: getOpacity(tag.value),
                                color: tag.value === maxValue ? '#5b3c3c' : undefined,
                                fontWeight: tag.value > (maxValue + minValue) / 2 ? 600 : 400,
                            }}
                            title={`Count: ${tag.value}`}
                        >
                            {tag.text}
                        </span>
                    ))}
                </div>
            </div>
        </WidgetWrapper>
    );
};
