import React from 'react';
import { WidgetWrapper } from '../../Shared';



// 5. Photo Gallery (내 사진들)
// 5. Photo Gallery (내 사진들)
interface PhotoGalleryProps {
    gridSize?: { w: number; h: number };
}

export const PhotoGallery = React.memo(function PhotoGallery({ gridSize }: PhotoGalleryProps) {
    const images = [
        'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1504198458649-3128b932f49e?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=300&h=300&fit=crop'
    ];

    const isSmall = (gridSize?.w || 2) < 2;

    if (isSmall) {
        return (
            <WidgetWrapper title="Gallery" headerClassName="!bg-white/60 dark:!bg-black/60 backdrop-blur-md border-b-0 absolute top-0 left-0 right-0 z-10">
                <div className="w-full h-full relative cursor-pointer group">
                    <img src={images[0]} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
            </WidgetWrapper>
        );
    }

    return (
        <WidgetWrapper title="My Gallery">
            <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5 bg-white">
                {images.map((src, i) => (
                    <div key={i} className="relative overflow-hidden group cursor-pointer">
                        <img src={src} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                    </div>
                ))}
            </div>
        </WidgetWrapper>
    );
});

export const Polaroid = React.memo(function Polaroid({ src, date, rotation = 0 }: { src: string; date: string; rotation?: number; gridSize?: { w: number; h: number } }) {
    return (
        <div className="w-full h-full flex items-center justify-center p-2">
            <div
                className="bg-white p-2 pb-6 shadow-lg w-full max-w-[160px] aspect-[4/5] flex flex-col transition-transform hover:scale-105 hover:z-10"
                style={{ transform: `rotate(${rotation}deg)` }}
            >
                <div className="w-full aspect-square bg-gray-100 overflow-hidden mb-2 shadow-inner">
                    <img src={src} alt="Polaroid" className="w-full h-full object-cover" />
                </div>
                <div className="text-center mt-auto">
                    <p className="text-gray-400 jua-regular text-[10px] truncate">{date}</p>
                </div>
            </div>
        </div>
    );
});

export const InstantBooth = React.memo(function InstantBooth({ images, date, gridSize }: { images: string[]; date: string; gridSize?: { w: number; h: number } }) {
    const isWide = (gridSize?.w || 1) > (gridSize?.h || 1);

    return (
        <div className="w-full h-full flex items-center justify-center p-1">
            <div className={`h-full max-h-full bg-[#1a1a1a] p-1.5 shadow-lg flex gap-1 items-center justify-between overflow-hidden rounded-sm ${isWide ? 'flex-row w-full aspect-[2.5/1] pr-3' : 'flex-col w-auto aspect-[1/2.5] pb-3'}`}>
                {images.slice(0, 4).map((img, i) => (
                    <div key={i} className={`bg-gray-800 overflow-hidden flex-shrink-0 ${isWide ? 'h-full aspect-[2/3]' : 'w-full aspect-[3/2]'}`}>
                        <img src={img} alt={`Cut ${i + 1}`} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
                    </div>
                ))}
                <span className={`text-white/50 text-[8px] tracking-widest uppercase shrink-0 ${isWide ? 'writing-vertical-rl rotate-180' : ''}`}>{date}</span>
            </div>
        </div>
    );
});

export const FilmStrip = React.memo(function FilmStrip({ images, gridSize }: { images: string[]; gridSize?: { w: number; h: number } }) {
    const isTall = (gridSize?.h || 1) > (gridSize?.w || 1);

    return (
        <div className={`relative w-full h-full bg-black p-1 md:p-2 overflow-auto scrollbar-hide rounded-lg flex shadow-lg ${isTall ? 'flex-col items-center py-2' : 'flex-row items-center px-2'}`}>
            <div className={`flex gap-2 ${isTall ? 'flex-col min-h-max w-full' : 'flex-row min-w-max h-full'}`}>
                {images.map((img, i) => (
                    <div key={i} className={`relative bg-gray-900 border-dashed border-gray-700 flex-shrink-0 ${isTall ? 'w-full aspect-[3/2] border-x-2 md:border-x-4' : 'h-full aspect-[3/2] border-y-2 md:border-y-4'}`}>
                        <img src={img} alt={`Film ${i}`} className="h-full w-full object-cover opacity-70 hover:opacity-100 transition-opacity" />
                    </div>
                ))}
            </div>
        </div>
    );
});
