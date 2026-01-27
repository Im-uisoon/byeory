import { useState } from 'react';
import { Star } from 'lucide-react';
import { WidgetWrapper } from '../Common';

interface MovieTicketProps {
    gridSize?: { w: number; h: number };
}

export function MovieTicket({ gridSize }: MovieTicketProps) {
    const [title, setTitle] = useState(() => localStorage.getItem('movie_title') || '');
    const [date, setDate] = useState(() => localStorage.getItem('movie_date') || '');
    const [rating, setRating] = useState(() => parseInt(localStorage.getItem('movie_rating') || '0'));
    const [isEditing, setIsEditing] = useState(false);

    const w = gridSize?.w || 2;
    // Treat 1 column widths as "small" (stub view)
    const isSmall = w === 1;

    const handleSave = () => {
        localStorage.setItem('movie_title', title);
        localStorage.setItem('movie_date', date);
        localStorage.setItem('movie_rating', rating.toString());
        setIsEditing(false);
    };

    // Stable barcode generation
    const [barcode] = useState(() => [...Array(15)].map(() => Math.random() * 4 + 1));

    if (isSmall) {
        return (
            <WidgetWrapper className="bg-transparent border-none p-0 items-stretch justify-center">
                <div
                    className="w-full h-full bg-[#e3cdab] text-stone-800 rounded-lg relative flex flex-col items-center justify-center px-0.5 py-1 shadow-sm border-dashed border-l-2 border-l-stone-800/20"
                    onClick={() => setIsEditing(true)}
                >
                    <div className="text-[9px] uppercase tracking-widest font-bold opacity-50 mb-0.5">ADMIT ONE</div>
                    <div className="font-serif font-bold text-center leading-tight line-clamp-2 w-full break-words px-1">{title || 'UNTITLED'}</div>
                    <div className="flex mt-1 gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={8} fill={s <= rating ? 'black' : 'none'} className={s <= rating ? 'text-black' : 'text-black/20'} />
                        ))}
                    </div>
                </div>
            </WidgetWrapper>
        );
    }

    return (
        <WidgetWrapper className="bg-transparent border-none p-1">
            <div className="relative w-full h-full bg-[#e8dcc5] text-stone-900 rounded-lg shadow-md flex flex-row overflow-hidden group">
                {/* Left: Main Ticket Stub */}
                <div className="flex-1 p-3 relative border-r-2 border-dashed border-stone-400 flex flex-col justify-between min-w-0">
                    <div className="absolute -right-[7px] top-0 bottom-0 w-[14px] flex flex-col justify-between overflow-hidden py-1">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="w-4 h-4 rounded-full bg-[var(--bg-card)] -mr-2"></div>
                        ))}
                    </div>

                    {isEditing ? (
                        <div className="space-y-2 w-full">
                            <input
                                className="w-full bg-transparent border-b border-stone-400 font-serif text-lg font-bold placeholder:text-stone-400"
                                placeholder="Movie Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    className="flex-1 bg-transparent border-none text-xs text-stone-600 min-w-0"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-1 cursor-pointer">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s}
                                        size={16}
                                        fill={s <= rating ? '#1c1917' : 'none'}
                                        className={s <= rating ? 'text-stone-900' : 'text-stone-300'}
                                        onClick={() => setRating(s)}
                                    />
                                ))}
                            </div>
                            <button onClick={handleSave} className="text-[10px] bg-stone-900 text-[#e8dcc5] px-2 py-1 rounded w-full">SAVE</button>
                        </div>
                    ) : (
                        <div onClick={() => setIsEditing(true)} className="cursor-pointer flex flex-col h-full justify-between">
                            <div className="w-full">
                                <h3 className="text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-1">CINEMA TICKET</h3>
                                <h2 className="text-xl md:text-2xl font-serif font-black uppercase leading-none break-words line-clamp-2 w-full">{title || 'NO TITLE'}</h2>
                            </div>

                            <div className="flex justify-between items-end mt-2 bg-transparent w-full">
                                <span className="text-xs font-mono text-stone-600 shrink-0">{date || 'YYYY-MM-DD'}</span>
                                <div className="flex gap-0.5 shrink-0 ml-2">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} size={12} fill={s <= rating ? '#1c1917' : 'none'} className={s <= rating ? 'text-stone-900' : 'text-stone-300'} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Barcode Stub */}
                <div className="w-10 md:w-12 bg-[#dfd3bc] flex flex-col items-center justify-center py-2 relative shrink-0 border-l border-dashed border-stone-400/30">
                    <div className="absolute -left-[7px] top-0 bottom-0 w-[14px] flex flex-col justify-between overflow-hidden py-1">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="w-4 h-4 rounded-full bg-[var(--bg-card)] -ml-2"></div>
                        ))}
                    </div>
                    <span className="text-[8px] font-mono rotate-90 whitespace-nowrap opacity-60 mb-2">NO. 0824</span>

                    {/* Barcode visual */}
                    <div className="w-6 flex flex-col gap-0.5 opacity-70">
                        {barcode.map((h, i) => (
                            <div key={i} className="w-full bg-stone-900" style={{ height: h }}></div>
                        ))}
                    </div>
                </div>
            </div>
        </WidgetWrapper>
    );
}
