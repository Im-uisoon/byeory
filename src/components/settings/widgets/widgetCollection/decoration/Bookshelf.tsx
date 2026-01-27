import { useState } from 'react';
import { Plus } from 'lucide-react';
import { WidgetWrapper } from '../Common';

interface Book {
    id: number;
    title: string;
    color: string;
    height: number; // % height relative to shelf
}

// Preset colors for random spine generation
const COLORS = ['bg-red-700', 'bg-blue-800', 'bg-green-800', 'bg-amber-900', 'bg-slate-700', 'bg-stone-600', 'bg-indigo-900', 'bg-teal-800'];



interface BookshelfProps {
    gridSize?: { w: number; h: number };
}

export function Bookshelf({ gridSize }: BookshelfProps) {
    const isSmall = (gridSize?.w || 2) < 2;
    const [books, setBooks] = useState<Book[]>(() => {
        const saved = localStorage.getItem('bookshelf_data');
        if (saved) return JSON.parse(saved);
        // Default starter book
        return [{ id: 1, title: 'My Diary', color: 'bg-blue-900', height: 85 }];
    });

    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');

    const addBook = () => {
        if (!newTitle.trim()) return;
        const newBook: Book = {
            id: Date.now(),
            title: newTitle,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            height: 75 + Math.floor(Math.random() * 20) // Random height between 75-95%
        };
        const updated = [...books, newBook];
        setBooks(updated);
        localStorage.setItem('bookshelf_data', JSON.stringify(updated));
        setNewTitle('');
        setIsAdding(false);
    };

    const removeBook = (id: number) => {
        const updated = books.filter(b => b.id !== id);
        setBooks(updated);
        localStorage.setItem('bookshelf_data', JSON.stringify(updated));
    };

    if (isSmall) {
        const book = books[0] || { id: 0, title: 'No Book', color: 'bg-gray-400', height: 90 };
        return (
            <WidgetWrapper className="bg-[#f0e6d2] dark:bg-[#2a2318] border-none p-2 flex items-center justify-center relative shadow-inner">
                <div className={`w-16 h-24 ${book.color} rounded-sm shadow-md flex items-center justify-center relative cursor-pointer hover:scale-105 transition-transform`} title={book.title}>
                    <div className="absolute left-1 top-0 bottom-0 w-[1px] bg-white/20"></div>
                    <div className="absolute top-2 left-0 right-0 h-[2px] bg-white/10"></div>
                    <span className="text-[10px] text-white/90 font-serif font-bold whitespace-nowrap rotate-90 truncate w-20 text-center block">
                        {book.title}
                    </span>
                </div>
            </WidgetWrapper>
        );
    }

    return (
        <WidgetWrapper className="bg-[#f0e6d2] dark:bg-[#2a2318] border-none p-0 relative shadow-inner">
            {/* Shelf Wood Texture Backing */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>

            {/* The Shelf Platform */}
            <div className="absolute bottom-0 left-0 right-0 h-3 bg-[#8b5a2b] shadow-lg z-20"></div>

            <div className="w-full h-full p-2 flex items-end overflow-x-auto gap-0.5 relative z-10 hide-scrollbar pb-3">
                {/* Add Button */}
                <div className="h-[70%] min-w-[24px] bg-stone-300/20 rounded-sm border-2 border-dashed border-stone-400/50 flex items-center justify-center cursor-pointer hover:bg-stone-300/40 transition-colors shrink-0"
                    onClick={() => setIsAdding(!isAdding)}
                >
                    <Plus size={14} className="text-stone-500" />
                </div>

                {/* Adding Input Popover */}
                {isAdding && (
                    <div className="absolute top-2 left-2 right-2 bg-white p-2 rounded shadow-xl z-50 flex gap-1 border border-stone-200">
                        <input
                            autoFocus
                            placeholder="Book Title"
                            className="flex-1 text-xs px-1 border border-gray-300 rounded"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addBook()}
                        />
                        <button onClick={addBook} className="bg-blue-600 text-white text-[10px] px-2 rounded">ADD</button>
                    </div>
                )}

                {/* Render Books */}
                {books.map((book) => (
                    <div
                        key={book.id}
                        className={`w-6 sm:w-8 relative rounded-sm shadow-md transition-transform hover:-translate-y-1 cursor-pointer group shrink-0 ${book.color}`}
                        style={{ height: `${book.height}%` }}
                        onDoubleClick={() => removeBook(book.id)} // Double click delete
                        title={book.title}
                    >
                        <div className="absolute left-1 top-0 bottom-0 w-[1px] bg-white/20"></div>
                        <div className="absolute top-2 left-0 right-0 h-[2px] bg-white/10"></div>

                        {/* Rotated Title (Vertical Text) */}
                        <div className="w-full h-full flex items-center justify-center overflow-hidden">
                            <span className="text-[8px] text-white/80 font-serif font-bold whitespace-nowrap rotate-90 truncate max-w-[150%]">
                                {book.title}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </WidgetWrapper>
    );
}
