import React, { useState, useEffect } from 'react';
import { WidgetWrapper } from '../../Shared';
import { Power, Settings } from 'lucide-react';



export interface EffectControllerProps {
    className?: string;
    style?: React.CSSProperties;
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    storageKey: string;
    onSettingsClick?: () => void;
}

export const EffectController = ({ className, style, label, icon, children, storageKey, onSettingsClick }: EffectControllerProps) => {
    const [isOn, setIsOn] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        return saved === 'true';
    });

    useEffect(() => {
        localStorage.setItem(storageKey, String(isOn));
    }, [isOn, storageKey]);

    return (
        <WidgetWrapper className={`bg-white ${className || ''}`} style={style}>
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2 relative overflow-hidden transition-colors duration-300">
                {/* Background Glow if ON */}
                <div className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${isOn ? 'opacity-20 bg-green-400' : 'opacity-0'}`} />

                {/* Settings Button (if provided) */}
                {onSettingsClick && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onSettingsClick(); }}
                        className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 transition-colors z-20"
                    >
                        <Settings size={12} />
                    </button>
                )}

                <div className={`text-gray-600 transition-transform duration-300 ${isOn ? 'scale-110 text-green-600' : ''}`}>
                    {icon}
                </div>
                <span className="text-xs font-bold text-gray-800 z-10 text-center leading-tight">{label}</span>

                <button
                    onClick={() => setIsOn(!isOn)}
                    className={`mt-1 p-1.5 rounded-full transition-all duration-300 z-10 ${isOn ? 'bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                >
                    <Power size={14} />
                </button>
            </div>
            {isOn && React.isValidElement(children) && React.cloneElement(children as React.ReactElement<any>, { onClose: () => setIsOn(false) })}
        </WidgetWrapper>
    );
};
