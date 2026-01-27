import { useState } from 'react';
import { WidgetWrapper } from '../Common';
import { Flower } from 'lucide-react';

// Simplified Data - In real app, this would be a large JSON or API
// We'll map by month for simplicity in this demo
const FLOWERS: Record<number, { name: string; lang: string; color: string }> = {
    1: { name: 'Carnation', lang: 'Fascination & Love', color: 'text-pink-400' },
    2: { name: 'Violet', lang: 'Faithfulness', color: 'text-violet-500' },
    3: { name: 'Daffodil', lang: 'New Beginnings', color: 'text-yellow-400' },
    4: { name: 'Daisy', lang: 'Innocence', color: 'text-white' },
    5: { name: 'Lily of the Valley', lang: 'Happiness', color: 'text-green-200' },
    6: { name: 'Rose', lang: 'Love & Passion', color: 'text-red-500' },
    7: { name: 'Larkspur', lang: 'Strong Bond', color: 'text-purple-400' },
    8: { name: 'Gladiolus', lang: 'Strength', color: 'text-orange-400' },
    9: { name: 'Aster', lang: 'Wisdom', color: 'text-indigo-400' },
    10: { name: 'Marigold', lang: 'Creativity', color: 'text-orange-500' },
    11: { name: 'Chrysanthemum', lang: 'Friendship', color: 'text-red-400' },
    12: { name: 'Narcissus', lang: 'Hope', color: 'text-yellow-200' },
};

interface BirthFlowerProps {
    gridSize?: { w: number; h: number };
}

export function BirthFlower({ gridSize }: BirthFlowerProps) {
    const [dateStr, setDateStr] = useState(() => localStorage.getItem('userBirthDate') || '');
    const [isEditing, setIsEditing] = useState(!dateStr);

    const getFlowerInfo = (dateString: string) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const month = date.getMonth() + 1;
        return FLOWERS[month] || FLOWERS[1];
    };

    const flower = getFlowerInfo(dateStr);

    const handleSave = (val: string) => {
        localStorage.setItem('userBirthDate', val);
        setDateStr(val);
        setIsEditing(false);
    };

    const w = gridSize?.w || 2;
    const h = gridSize?.h || 2;
    const isSmall = w === 1 && h === 1;
    const isTall = w === 1 && h >= 2;
    const isWide = w >= 2 && h === 1;

    if (isSmall && flower) {
        return (
            <WidgetWrapper className="bg-white dark:bg-slate-800 p-0">
                <div
                    className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 p-1"
                    onClick={() => setIsEditing(true)}
                >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${flower.color} bg-opacity-20 mb-1`}>
                        <Flower size={16} />
                    </div>
                    <div className="text-[9px] font-serif font-bold text-center leading-tight">{flower.name}</div>
                </div>
            </WidgetWrapper>
        );
    }

    if (isEditing || !flower) {
        return (
            <WidgetWrapper className="bg-white dark:bg-slate-800 p-3 flex flex-col items-center justify-center">
                <Flower className="w-6 h-6 text-pink-300 mb-2" />
                <p className="text-[10px] text-gray-500 mb-1">Enter your birthday</p>
                <input
                    type="date"
                    value={dateStr}
                    onChange={(e) => handleSave(e.target.value)}
                    className="w-full text-xs p-1 border rounded"
                />
            </WidgetWrapper>
        );
    }

    // Tall Layout (1x2) - Vertical Centered
    if (isTall) {
        return (
            <WidgetWrapper className="bg-white dark:bg-slate-800 relative overflow-hidden group">
                <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 ${flower.color.replace('text-', 'bg-')}`}></div>
                <div className="p-3 h-full flex flex-col items-center justify-center gap-2 text-center">
                    <div className={`w-12 h-12 rounded-full bg-gray-50 dark:bg-slate-700 flex items-center justify-center ${flower.color}`}>
                        <Flower size={24} />
                    </div>
                    <div>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Birth Flower</p>
                        <h3 className="text-sm font-serif font-bold text-slate-700 dark:text-slate-200 leading-tight my-1">{flower.name}</h3>
                        <p className={`text-[9px] font-medium italic opacity-80 ${flower.color}`}>{flower.lang}</p>
                    </div>
                    <button onClick={() => setIsEditing(true)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white/50 rounded-full">
                        <Flower size={10} className="text-gray-400" />
                    </button>
                </div>
            </WidgetWrapper>
        );
    }

    return (
        <WidgetWrapper className="bg-white dark:bg-slate-800 relative overflow-hidden group">
            {/* Background Decor */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 ${flower.color.replace('text-', 'bg-')}`}></div>

            <div className={`p-3 h-full flex flex-row items-center gap-3 ${isWide ? 'justify-between' : ''}`}>
                <div className={`w-12 h-12 rounded-full bg-gray-50 dark:bg-slate-700 flex items-center justify-center ${flower.color} flex-shrink-0`}>
                    <Flower size={24} />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Birth Flower</p>
                    <h3 className="text-lg font-serif font-bold text-slate-700 dark:text-slate-200 leading-none my-0.5 truncate">{flower.name}</h3>
                    <p className={`text-[10px] font-medium italic opacity-80 ${flower.color} truncate`}>{flower.lang}</p>
                </div>

                <button
                    onClick={() => setIsEditing(true)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white/50 rounded-full"
                >
                    <Flower size={10} className="text-gray-400" />
                </button>
            </div>
        </WidgetWrapper>
    );
}
