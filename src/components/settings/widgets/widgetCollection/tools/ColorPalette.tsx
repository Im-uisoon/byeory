import { useState, useRef } from 'react';
import { Copy, Palette as PaletteIcon } from 'lucide-react';
import { WidgetWrapper } from '../Common';
import { useWidgetStorage } from '../SDK';

interface ColorPaletteProps {
    gridSize?: { w: number; h: number };
}

export function ColorPalette({ gridSize }: ColorPaletteProps) {
    // SDK Storage
    const [colors, setColors] = useWidgetStorage<string[]>('widget-palette-colors', ['#FFD166', '#06D6A0', '#118AB2', '#EF476F', '#073B4C']);

    const [image, setImage] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => extractColors(img);
                img.src = event.target?.result as string;
                setImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const extractColors = (img: HTMLImageElement) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 100;
        canvas.height = 100;
        ctx.drawImage(img, 0, 0, 100, 100);

        const imageData = ctx.getImageData(0, 0, 100, 100).data;
        const colorCounts: Record<string, number> = {};

        // Simple sampling every 10th pixel
        for (let i = 0; i < imageData.length; i += 40) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
            colorCounts[hex] = (colorCounts[hex] || 0) + 1;
        }

        // Sort by frequency and take top 5 diverse colors (simplified)
        // A real implementation might use clustering (K-means) for better results
        const sorted = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);
        const palette = sorted.slice(0, 5).map(x => x[0]);

        // Fill if < 5
        while (palette.length < 5) palette.push('#cccccc');

        setColors(palette);
    };

    const copyToClipboard = (hex: string) => {
        navigator.clipboard.writeText(hex);
        // Could show toast
    };

    const w = gridSize?.w || 2;
    const isSmall = w === 1;

    if (isSmall) {
        return (
            <WidgetWrapper className="bg-white dark:bg-zinc-800 border-zinc-200 flex flex-col items-center justify-center p-2">
                <div className="flex flex-wrap gap-1 justify-center w-full h-full content-center">
                    {colors.slice(0, 4).map((c, i) => (
                        <div key={i} className="w-5 h-5 rounded-full shadow-sm border border-black/5" style={{ backgroundColor: c }}></div>
                    ))}
                </div>
            </WidgetWrapper>
        );
    }

    return (
        <WidgetWrapper className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-0 flex flex-col">
            <canvas ref={canvasRef} className="hidden" />

            <div className="h-[40%] bg-zinc-100 relative group overflow-hidden">
                {image ? (
                    <img src={image} alt="Source" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 gap-2">
                        <PaletteIcon size={20} />
                        <span className="text-xs">Upload Image</span>
                    </div>
                )}

                <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={handleImageUpload}
                />
            </div>

            <div className="flex-1 p-3 flex flex-col justify-center gap-2">
                <div className="flex gap-2 h-12 w-full">
                    {colors.map((color, i) => (
                        <div
                            key={i}
                            className="flex-1 rounded-md shadow-sm border border-black/5 relative group cursor-pointer transition-transform hover:-translate-y-1"
                            style={{ backgroundColor: color }}
                            onClick={() => copyToClipboard(color)}
                            title={color}
                        >
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 text-white rounded-md">
                                <Copy size={12} />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono px-1">
                    {colors.map((c, i) => (
                        <span key={i}>{c.toUpperCase()}</span>
                    ))}
                </div>
            </div>
        </WidgetWrapper>
    );
}
