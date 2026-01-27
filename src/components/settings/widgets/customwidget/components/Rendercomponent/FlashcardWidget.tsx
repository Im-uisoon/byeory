import React from 'react';
import { RefreshCw } from 'lucide-react';
import { EditableText } from '../EditableText';

interface FlashcardWidgetProps {
    block: any;
    onUpdateBlock?: (id: string, updates: any) => void;
}

const FlashcardWidget: React.FC<FlashcardWidgetProps> = ({ block, onUpdateBlock }) => {
    const { content, styles } = block;
    // Sidebar logic uses: cards[], currentIndex, showBack
    const cards = content.cards || [];
    const currentIndex = content.currentIndex || 0;
    const isFlipped = !!content.showBack;

    // Get current card data
    const currentCard = cards[currentIndex] || { front: 'No Card', back: 'No Card' };

    const handleUpdateCard = (field: 'front' | 'back', val: string) => {
        if (!onUpdateBlock) return;
        const newCards = [...cards];
        if (!newCards[currentIndex]) {
            newCards[currentIndex] = { id: `fc-${Date.now()}`, front: '', back: '' };
        }
        newCards[currentIndex] = { ...newCards[currentIndex], [field]: val };

        onUpdateBlock(block.id, {
            content: { ...content, cards: newCards }
        });
    };

    const handleFlip = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onUpdateBlock) {
            onUpdateBlock(block.id, {
                content: { ...content, showBack: !isFlipped }
            });
        }
    };

    return (
        <div
            className="w-full h-full relative group perspective-1000"
            onClick={handleFlip}
            style={{ perspective: '1000px' }}
        >
            {/* Card Inner Container with 3D Transform */}
            <div
                className="w-full h-full relative transition-transform duration-500 ease-in-out transform-style-3d shadow-sm rounded-xl"
                style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
            >
                {/* FRONT FACE */}
                <div
                    className="absolute inset-0 w-full h-full backface-hidden bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center p-4 text-center"
                    style={{
                        backfaceVisibility: 'hidden',
                        backgroundColor: styles.bgColor || '#ffffff',
                        borderColor: styles.color ? styles.color : '#e5e7eb'
                    }}
                >
                    <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
                        <EditableText
                            tagName="h3"
                            text={currentCard.front}
                            onUpdate={(val) => handleUpdateCard('front', val)}
                            style={{
                                fontSize: styles.fontSize ? `${styles.fontSize}px` : '1.25rem',
                                fontWeight: styles.bold ? 'bold' : 'normal',
                                color: styles.color || '#111827'
                            }}
                            placeholder="앞면 (질문)"
                            className="break-words w-full"
                        />
                    </div>
                    <div className="absolute top-2 right-2 text-gray-300">
                        <span className="text-[10px] font-bold border border-gray-200 px-1 rounded">
                            FRONT {cards.length > 1 ? `(${currentIndex + 1}/${cards.length})` : ''}
                        </span>
                    </div>
                </div>

                {/* BACK FACE (Rotated 180deg) */}
                <div
                    className="absolute inset-0 w-full h-full backface-hidden bg-indigo-50 border border-indigo-200 rounded-xl flex flex-col items-center justify-center p-4 text-center transform rotate-y-180"
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        backgroundColor: styles.bgColor ? styles.bgColor : '#eef2ff',
                        borderColor: styles.color ? styles.color : '#c7d2fe'
                    }}
                >
                    <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
                        <EditableText
                            tagName="p"
                            text={currentCard.back}
                            onUpdate={(val) => handleUpdateCard('back', val)}
                            style={{
                                fontSize: styles.fontSize ? `${styles.fontSize}px` : '1rem',
                                color: styles.color || '#374151'
                            }}
                            placeholder="뒷면 (정답)"
                            className="break-words w-full"
                        />
                    </div>
                    <div className="absolute top-2 right-2 text-indigo-300">
                        <span className="text-[10px] font-bold border border-indigo-200 px-1 rounded">
                            BACK {cards.length > 1 ? `(${currentIndex + 1}/${cards.length})` : ''}
                        </span>
                    </div>
                </div>
            </div>

            <button
                onClick={handleFlip}
                className="absolute bottom-2 right-2 p-1.5 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full shadow-sm border border-gray-200 text-gray-400 hover:text-indigo-500 transition-colors z-20"
                title="뒤집기"
            >
                <RefreshCw size={14} />
            </button>
        </div>
    );
};

export default FlashcardWidget;
