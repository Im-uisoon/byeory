import { useState, useRef } from 'react';
import { Camera, Upload } from 'lucide-react';
import { WidgetWrapper } from '../Common';
import { useWidgetStorage } from '../SDK';

interface PolaroidProps {
    gridSize?: { w: number; h: number };
}

export function Polaroid({ gridSize }: PolaroidProps) {
    // SDK Storage
    const [image, setImage] = useWidgetStorage<string | null>('widget-polaroid-img', null);
    const [caption, setCaption] = useWidgetStorage('widget-polaroid-caption', '');

    const [isDeveloping, setIsDeveloping] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const w = gridSize?.w || 2;
    const isSmall = w === 1;

    // Manual persistence effects removed (handled by SDK)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setImage(ev.target?.result as string);
                setIsDeveloping(true);
                // "Develop" over 3 seconds
                setTimeout(() => setIsDeveloping(false), 3000);
            };
            reader.readAsDataURL(file);
        }
    };

    if (isSmall) {
        return (
            <WidgetWrapper className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center p-2 group cursor-pointer" title="">
                <div className="relative w-12 h-12 bg-black rounded-lg flex items-center justify-center overflow-hidden shadow-md group-hover:scale-105 transition-transform">
                    {image ? (
                        <img src={image} alt="Mini" className="w-full h-full object-cover opacity-80" />
                    ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-white/50"></div>
                    )}
                    {/* Lens reflection */}
                    <div className="absolute top-2 right-2 w-2 h-2 bg-white/30 rounded-full blur-[1px]"></div>
                </div>
                <span className="text-[9px] mt-2 font-mono text-gray-400">MEMORY</span>
            </WidgetWrapper>
        );
    }

    return (
        <WidgetWrapper className="bg-[#f8f8f8] dark:bg-zinc-900 border-none p-4 flex items-center justify-center relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] pointer-events-none"></div>

            <div className="relative bg-white dark:bg-zinc-800 p-3 shadow-xl transform rotate-[-2deg] transition-transform hover:rotate-0 duration-300 max-w-full max-h-full flex flex-col items-center pb-8 group">
                {/* Photo Area */}
                <div
                    className="w-48 h-48 bg-gray-100 dark:bg-zinc-700 relative overflow-hidden cursor-pointer mb-4 flex items-center justify-center border border-gray-100 dark:border-zinc-600"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {image ? (
                        <div className={`w-full h-full transition-all duration-[3000ms] ${isDeveloping ? 'filter blur-md grayscale brightness-150' : 'filter blur-0 grayscale-0 brightness-100'}`}>
                            <img src={image} alt="Polaroid" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-gray-300 dark:text-zinc-500">
                            <Camera size={32} strokeWidth={1.5} />
                            <span className="text-[10px] mt-2">Upload Photo</span>
                        </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="text-white drop-shadow-md" size={24} />
                    </div>
                </div>

                {/* Caption Area */}
                <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a caption..."
                    className="w-full text-center font-['Caveat',sans-serif] text-gray-600 dark:text-gray-300 outline-none bg-transparent placeholder:text-gray-300 dark:placeholder:text-zinc-600 text-lg"
                    style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}
                />

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />

                {/* Tape effect */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/40 border-l border-r border-white/60 rotate-1 shadow-sm backdrop-blur-sm z-10"></div>
            </div>
        </WidgetWrapper>
    );
}
