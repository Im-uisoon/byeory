import { useState, useEffect } from 'react';
import { WidgetWrapper } from '../Common';

// --- 1. Moon Phase (달의 위상) ---
export function MoonPhase() {
    const [phase, setPhase] = useState(0);
    const [phaseName, setPhaseName] = useState('');

    useEffect(() => {
        // Simple Moon Phase Calculation
        // Reference: Known New Moon at 2000-01-06 18:14 UTC
        const calculateMoonPhase = () => {
            const date = new Date();

            // Simple calculation logic (Conway's algorithm adaptation or similar)
            // Or simply calculating days from a known new moon
            const knownNewMoon = new Date('2000-01-06T18:14:00Z');
            const cycleLength = 29.53058867;
            const diffTime = date.getTime() - knownNewMoon.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            const currentCycle = diffDays % cycleLength;

            // Phase from 0 to 1 (0 = New Moon, 0.5 = Full Moon, 1 = New Moon)
            const p = currentCycle / cycleLength;
            setPhase(p);

            if (p < 0.05 || p > 0.95) setPhaseName('New Moon');
            else if (p < 0.2) setPhaseName('Waxing Crescent');
            else if (p < 0.3) setPhaseName('First Quarter');
            else if (p < 0.45) setPhaseName('Waxing Gibbous');
            else if (p < 0.55) setPhaseName('Full Moon');
            else if (p < 0.7) setPhaseName('Waning Gibbous');
            else if (p < 0.8) setPhaseName('Last Quarter');
            else setPhaseName('Waning Crescent');
        };

        calculateMoonPhase();
    }, []);

    // SVG Mask calculation to simulate shadow
    // We simulate phase by shifting a shadow circle
    // This is a simplified visual representation


    return (
        <WidgetWrapper className="bg-[#0f172a] border-[#1e293b] text-slate-200">
            <div className="flex flex-col items-center justify-center h-full w-full">
                <div className="relative w-24 h-24 mb-2">
                    {/* Base Moon (Dark) */}
                    <div className="absolute inset-0 rounded-full bg-slate-800 shadow-inner border border-slate-700"></div>

                    {/* Lit Moon (White) with Mask */}
                    {/* Implementing a high quality CSS Moon Phase is complex. 
              Let's use a simpler approximation: 
              We have a moon circle. We slide a shadow over it.
          */}
                    <div className="w-full h-full rounded-full overflow-hidden relative shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                        <div
                            className="w-full h-full bg-slate-100 rounded-full"
                            style={{
                                opacity: phase < 0.5
                                    ? phase * 2 // 0 to 1
                                    : (1 - phase) * 2 // 1 to 0
                            }}
                        ></div>

                        {/* Textural overlay */}
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                    </div>

                    {/* Phase Indicator Dot */}
                    <div
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full shadow-[0_0_5px_yellow]"
                    ></div>
                </div>

                <div className="text-center">
                    <h3 className="text-sm font-serif text-slate-100">{phaseName}</h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {Math.round(phase * 29.53 * 10) / 10} days old
                    </p>
                </div>
            </div>
        </WidgetWrapper>
    );
}
