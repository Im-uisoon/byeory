import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { EffectController } from './SharedController';
import { Box, X, Activity } from 'lucide-react';
import { useWidgetStorage } from '../SDK';

interface ComponentProps {
    className?: string;
    style?: React.CSSProperties;
}

const PortalEffectWithProps = ({ multiplier }: { multiplier: number }) => {
    const requestRef = useRef<number>(0);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const updateLoop = () => {
            const widgets = document.querySelectorAll('.global-physics-widget');
            const { x: mx, y: my } = mouseRef.current;
            const radius = 500; // Detection radius

            widgets.forEach((widget) => {
                const rect = widget.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;

                // Calculate distance from mouse to widget center
                const dist = Math.sqrt(Math.pow(mx - cx, 2) + Math.pow(my - cy, 2));

                if (dist < radius) {
                    // Normalize distance: 1 (center) to 0 (edge)
                    // const intensity = (1 - dist / radius) * multiplier * 20; 
                    // Actually user just said "adjust shake force", so let's stick to the multiplier
                    // Maybe just straight random shake if inside radius? 
                    // Let's add a slight distance falloff for better feel
                    const falloff = 1 - (dist / radius);
                    const force = multiplier * 15 * falloff; // 15 is arbitrary base power

                    const rx = (Math.random() - 0.5) * force;
                    const ry = (Math.random() - 0.5) * force;
                    const rr = (Math.random() - 0.5) * force * 0.5;
                    (widget as HTMLElement).style.transform = `translate(${rx}px, ${ry}px) rotate(${rr}deg)`;
                } else {
                    // Reset if out of range (check if it has transform first to avoid style trashing?)
                    // Simple check: if style.transform is set, clear it.
                    if ((widget as HTMLElement).style.transform) {
                        (widget as HTMLElement).style.transform = '';
                    }
                }
            });

            requestRef.current = requestAnimationFrame(updateLoop);
        };

        window.addEventListener('mousemove', handleMouseMove);
        updateLoop();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(requestRef.current);
            document.querySelectorAll('.global-physics-widget').forEach((b) => {
                (b as HTMLElement).style.transform = '';
            });
        };
    }, [multiplier]);

    return null;
};

export const PhysicsBox = ({ className, style, gridSize: _ }: ComponentProps & { gridSize?: { w: number; h: number } }) => {
    const [showSettings, setShowSettings] = useState(false);

    // Initialize state from localStorage using SDK
    const [settings, setSettings] = useWidgetStorage('widget-physics-box', {
        multiplier: 0.5
    });

    const updateSetting = (key: keyof typeof settings, value: number) => {
        setSettings({ ...settings, [key]: value });
    };

    return (
        <EffectController
            className={className}
            style={style}
            label="물리 상자"
            icon={<Box size={20} />}
            storageKey="effect-physics-box"
            onSettingsClick={() => setShowSettings(true)}
        >
            <>
                <PortalEffectWithProps multiplier={settings.multiplier} />

                {showSettings && createPortal(
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50" onClick={() => setShowSettings(false)}>
                        <div className="bg-white rounded-2xl p-6 w-[320px] shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Activity className="text-orange-500" />
                                    Physics Settings
                                </h3>
                                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Shake Force (Intensity)</span>
                                        <span className="text-sm font-bold text-blue-600">{(settings.multiplier * 10).toFixed(0)}</span>
                                    </div>
                                    <input
                                        type="range" min="1" max="10" step="1"
                                        value={settings.multiplier * 10}
                                        onChange={(e) => updateSetting('multiplier', parseFloat(e.target.value) / 10)}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </>
        </EffectController>
    );
};
