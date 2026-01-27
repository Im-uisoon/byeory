import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

const COMMON_EMOJIS = [
    // Emotion
    '😀', '🥰', '😂', '😎', '🤔', '😭', '😡', '🥳', '😴', '🤯',
    // Nature
    '🌸', '🍀', '🌹', '🌻', '🌴', '🌵', '🍁', '❄️', '🌙', '⭐', '🌈', '🔥', '💧',
    // Animals
    '🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐯', '🦁', '🐮',
    // Food
    '🍎', '🍓', '🍔', '🍕', '🍰', '🍫', '☕', '🍺', '🍷', '🥂',
    // Activities
    '⚽', '🏀', '🎾', '⚾', '🎮', '🎨', '🎤', '🎧', '✈️', '🚗',
    // Objects
    '💻', '📱', '📷', '⌚', '💡', '💰', '🎁', '📚', '✏️', '💼',
    // Symbols
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '💯',
    // More specific ones relative to planning/diary
    '📅', '✅', '📝', '📌', '📎', '🛒', '💊', '🧹', '🛁', '🛌'
];

interface Props {
    onSelect: (sticker: string) => void;
    selectedSticker?: string;
}

const StickerSelector: React.FC<Props> = ({ onSelect, selectedSticker }) => {
    const [search, setSearch] = useState('');

    // Simplified searchable map
    const EMOJI_MAP = [
        { char: '😀', keywords: 'smile happy face 스마일 웃음' },
        { char: '🥰', keywords: 'love heart face 사랑 하트' },
        { char: '😂', keywords: 'laugh cry lol 눈물 웃음' },
        { char: '😎', keywords: 'cool sunglasses 쿨 선글라스' },
        { char: '🥳', keywords: 'party celebrate 파티 축하' },
        { char: '🌸', keywords: 'flower cherry blossom 벚꽃 꽃' },
        { char: '⭐', keywords: 'star 별' },
        { char: '🔥', keywords: 'fire hot 불' },
        { char: '❤️', keywords: 'love heart red 하트 사랑' },
        { char: '🐶', keywords: 'dog puppy 강아지 개' },
        { char: '🐱', keywords: 'cat kitten 고양이' },
        { char: '🍔', keywords: 'burger food 햄버거' },
        { char: '☕', keywords: 'coffee cafe 커피 카페' },
        { char: '✈️', keywords: 'airplane travel 비행기 여행' },
        { char: '📚', keywords: 'book study 책 공부' },
        { char: '✏️', keywords: 'pencil write 연필 쓰기' },
        { char: '💻', keywords: 'computer laptop 컴퓨터' },
        { char: '📅', keywords: 'calendar date schedule 달력 일정' },
        { char: '💪', keywords: 'muscle work out exercise 운동 헬스' },
        { char: '🛒', keywords: 'cart shopping 쇼핑' },
        // ... extend with common ones
        ...COMMON_EMOJIS.map(e => ({ char: e, keywords: '' }))
    ];

    const filteredEmojis = search
        ? EMOJI_MAP.filter(e => e.keywords.includes(search) || e.char.includes(search))
        : EMOJI_MAP;

    // Remove duplicates if any
    const uniqueEmojis = Array.from(new Set(filteredEmojis.map(e => e.char)));

    return (
        <div className="flex flex-col h-full">
            <div className="relative mb-4">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="스티커 검색 (예: 하트, 커피)"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 placeholder-gray-400 transition"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>

            <div className="grid grid-cols-5 gap-3 overflow-y-auto custom-scrollbar content-start pr-1">
                <button
                    onClick={() => onSelect('')}
                    className={`aspect-square rounded-xl flex items-center justify-center border transition-all ${!selectedSticker
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                        : 'border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-400'}`}
                    title="선택 해제"
                >
                    <X size={16} />
                </button>
                {uniqueEmojis.map((emoji) => (
                    <button
                        key={emoji}
                        onClick={() => onSelect(emoji)}
                        className={`aspect-square rounded-xl text-2xl flex items-center justify-center border transition-all ${selectedSticker === emoji
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-transparent hover:bg-gray-100'}`}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #ddd;
                    border-radius: 2px;
                }
            `}</style>
        </div>
    );
};

export default StickerSelector;
