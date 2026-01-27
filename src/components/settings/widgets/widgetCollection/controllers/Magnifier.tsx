import React, { useEffect } from 'react';
import { EffectController } from './SharedController';
import { Search } from 'lucide-react';

interface ComponentProps {
    className?: string;
    style?: React.CSSProperties;
}

const LocalizedLens = () => {
    useEffect(() => {
        const lens = document.createElement('div');
        lens.style.position = 'fixed';
        lens.style.pointerEvents = 'none';
        lens.style.width = '100px';
        lens.style.height = '100px';
        lens.style.border = '2px solid rgba(0, 0, 0, 0.2)';
        lens.style.borderRadius = '50%';
        lens.style.boxShadow = '0 0 0 2000px rgba(0, 0, 0, 0.3)'; // Dim everything else
        lens.style.zIndex = '9999';
        lens.style.transform = 'translate(-50%, -50%)';
        lens.style.backdropFilter = 'brightness(1.1) contrast(1.1)';
        document.body.appendChild(lens);

        let activeElement: HTMLElement | null = null;

        const onMove = (e: MouseEvent) => {
            lens.style.left = `${e.clientX}px`;
            lens.style.top = `${e.clientY}px`;

            // Reset previous
            if (activeElement) {
                activeElement.style.transform = '';
                activeElement.style.zIndex = '';
                activeElement.style.transition = '';
            }

            // Find new
            const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
            if (el && el !== document.body && el !== document.documentElement && !el.classList.contains('magnifier-ignore')) {
                // Find a meaningful container or self
                const target = el.closest('button, a, .widget-wrapper, img') as HTMLElement || el;

                if (target) {
                    target.style.transition = 'transform 0.1s';
                    target.style.transform = 'scale(1.2)';
                    target.style.zIndex = '1000';
                    activeElement = target;
                }
            }
        };

        window.addEventListener('mousemove', onMove);

        return () => {
            if (activeElement) {
                activeElement.style.transform = '';
                activeElement.style.zIndex = '';
            }
            window.removeEventListener('mousemove', onMove);
            if (document.body.contains(lens)) document.body.removeChild(lens);
        };
    }, []);

    return null;
};


export const Magnifier = React.memo(({ className, style, gridSize: _ }: ComponentProps & { gridSize?: { w: number; h: number } }) => {
    return (
        <EffectController
            className={className}
            style={style}
            label="돋보기"
            icon={<Search size={20} />}
            storageKey="effect-magnifier"
        >
            <LocalizedLens />
        </EffectController>
    );
});
