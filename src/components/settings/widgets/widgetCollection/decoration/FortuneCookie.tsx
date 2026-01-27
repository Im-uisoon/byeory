import { useState } from 'react';
import { WidgetWrapper } from '../Common';

// --- 3. Fortune Cookie (포춘 쿠키)
export function FortuneCookie() {
    const [isCracked, setIsCracked] = useState(false);
    const fortunes = ["대길! 🍀", "행운 가득!", "기대해!", "좋은 예감"];
    const [fortune, setFortune] = useState("");

    const crack = () => {
        if (!isCracked) {
            setFortune(fortunes[Math.floor(Math.random() * fortunes.length)]);
            setIsCracked(true);
        } else {
            setIsCracked(false);
        }
    };

    return (
        <WidgetWrapper className="bg-amber-50">
            <div onClick={crack} className="cursor-pointer text-center group">
                <div className="text-5xl transition-transform group-hover:scale-110 mb-2">
                    {isCracked ? '🥠' : '🥠'}
                </div>
                {isCracked ? (
                    <div className="bg-white border border-amber-200 p-1 px-2 text-xs text-amber-800 animate-in zoom-in font-serif">
                        {fortune}
                    </div>
                ) : (
                    <span className="text-xs text-amber-800/50">Click me!</span>
                )}
            </div>
        </WidgetWrapper>
    );
}
