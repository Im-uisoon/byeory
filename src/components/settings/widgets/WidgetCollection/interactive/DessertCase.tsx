import { WidgetWrapper } from '../Common';
import { useWidgetStorage } from '../SDK';

// --- 4. Dessert Case (간식 진열대) ---
export function DessertCase({ }: { gridSize?: { w: number; h: number } }) {
    const desserts = ['🍩', '🍪', '🍰', '🧁', '🍮', '🍭', '🍫', '🍦'];
    const [items, setItems] = useWidgetStorage<string[]>('dessert-items', []);

    const addItem = (icon: string) => {
        if (items.length >= 8) return; // Limit for 2x1 (4x2 grid)
        setItems(prev => [...prev, icon]);
    };

    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <WidgetWrapper className="bg-pink-50 border-pink-100">
            <div className="w-full h-full flex flex-col gap-2">
                {/* Snack Display Area (Top) */}
                <div className="bg-white/50 rounded-lg p-2 flex-1 border-2 border-pink-200 border-dashed grid grid-cols-4 grid-rows-2 content-center items-center gap-1">
                    {items.map((item, i) => (
                        <div key={i} onClick={() => removeItem(i)} className="flex items-center justify-center text-xl cursor-pointer hover:scale-110 transition-transform animate-in zoom-in h-full">
                            {item}
                        </div>
                    ))}
                    {items.length === 0 && (
                        <div className="flex items-center justify-center text-pink-200 text-xs col-span-full row-span-full">Empty</div>
                    )}
                </div>

                {/* Decoration Buttons (Bottom Row) */}
                <div className="flex flex-row gap-1 overflow-x-auto overflow-y-hidden h-8 w-full scrollbar-hide">
                    {desserts.map(d => (
                        <button
                            key={d}
                            onClick={() => addItem(d)}
                            className="min-w-[30px] h-[30px] bg-white rounded-full shadow-sm hover:bg-pink-100 flex items-center justify-center text-sm transition-colors flex-shrink-0"
                        >
                            {d}
                        </button>
                    ))}
                </div>
            </div>
        </WidgetWrapper>
    );
}
