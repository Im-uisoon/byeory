import React, { useState } from 'react';
import { useWidgetStorage } from '../SDK';
import { Settings } from 'lucide-react';

export const TicketStub = ({ title: initialTitle = 'Movie Night', date: initialDate = '24.12.24', seat: initialSeat = 'H12', gridSize }: { title?: string, date?: string, seat?: string, gridSize?: { w: number; h: number } }) => {
    const [data, setData] = useWidgetStorage('ticketstub-data', {
        title: initialTitle,
        date: initialDate,
        seat: initialSeat
    });
    const [isEditing, setIsEditing] = useState(false);

    const isSmall = (gridSize?.w || 2) < 2 && (gridSize?.h || 1) < 2;

    if (isEditing) {
        return (
            <div className="w-full h-full bg-[#fffbf0] rounded-lg overflow-hidden shadow-sm border border-[#e5e0d0] p-2 flex flex-col gap-1 justify-center">
                <input
                    type="text"
                    value={data.title}
                    onChange={(e) => setData({ ...data, title: e.target.value })}
                    className="bg-white/50 text-[10px] p-1 border rounded w-full"
                    placeholder="Event Title"
                />
                <div className="flex gap-1">
                    <input
                        type="text"
                        value={data.date}
                        onChange={(e) => setData({ ...data, date: e.target.value })}
                        className="bg-white/50 text-[10px] p-1 border rounded w-2/3"
                        placeholder="Date"
                    />
                    <input
                        type="text"
                        value={data.seat}
                        onChange={(e) => setData({ ...data, seat: e.target.value })}
                        className="bg-white/50 text-[10px] p-1 border rounded w-1/3"
                        placeholder="Seat"
                    />
                </div>
                <button onClick={() => setIsEditing(false)} className="bg-[#2c2c2c] text-[#fffbf0] text-[10px] rounded py-1">Save</button>
            </div>
        );
    }

    if (isSmall) {
        return (
            <div className="w-full h-full flex flex-col bg-[#fffbf0] rounded-lg overflow-hidden shadow-sm border border-[#e5e0d0] relative group">
                <button
                    onClick={() => setIsEditing(true)}
                    className="absolute top-1 right-1 text-gray-400 hover:text-black opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                    <Settings size={10} />
                </button>
                <div className="flex-1 flex items-center justify-center p-1 bg-[#2c2c2c] text-[#fffbf0]">
                    <span className="text-xs font-bold">{data.seat}</span>
                </div>
                <div className="h-2/3 p-1 flex flex-col justify-center items-center text-center">
                    <span className="text-[9px] font-bold text-[#2c2c2c] leading-tight truncate w-full">{data.title}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex bg-[#fffbf0] rounded-lg overflow-hidden shadow-sm border border-[#e5e0d0] relative group">
            <button
                onClick={() => setIsEditing(true)}
                className="absolute top-1 right-1 text-gray-400 hover:text-black opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <Settings size={12} />
            </button>
            <div className="flex-1 p-2 flex flex-col justify-center border-r-2 border-dashed border-[#dcdcdc] relative min-w-0">
                <h3 className="font-bold text-[#2c2c2c] text-sm truncate leading-tight tracking-tighter">{data.title}</h3>
                <p className="text-[#888] text-[10px] mt-1 truncate">{data.date}</p>
                <div className="absolute -top-2 -right-1.5 w-3 h-3 bg-[var(--bg-card)] rounded-full border border-[#e5e0d0]" />
                <div className="absolute -bottom-2 -right-1.5 w-3 h-3 bg-[var(--bg-card)] rounded-full border border-[#e5e0d0]" />
            </div>
            <div className="w-8 md:w-12 flex flex-col items-center justify-center bg-[#2c2c2c] text-[#fffbf0] p-1">
                <span className="text-[10px] font-bold rotate-90 whitespace-nowrap">{data.seat}</span>
            </div>
        </div>
    );
};
