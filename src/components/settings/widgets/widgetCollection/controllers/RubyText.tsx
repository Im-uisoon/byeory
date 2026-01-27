import React, { useEffect } from 'react';
import { EffectController } from './SharedController';
import { Type } from 'lucide-react';

interface ComponentProps {
    className?: string;
    style?: React.CSSProperties;
}

const PortalEffect = () => {
    useEffect(() => {
        document.body.classList.add('show-ruby');
        return () => {
            document.body.classList.remove('show-ruby');
        };
    }, []);

    return <style>{`
        body:not(.show-ruby) rt {
            display: none;
        }
        body.show-ruby rt {
            display: block;
            color: #ff6b6b;
            font-size: 0.6em;
        }
    `}</style>;
};

export const RubyText = ({ className, style, gridSize: _ }: ComponentProps & { gridSize?: { w: number; h: number } }) => {
    return (
        <EffectController
            className={className}
            style={style}
            label="루비 문자"
            icon={<Type size={20} />}
            storageKey="effect-ruby-text"
        >
            <PortalEffect />
        </EffectController>
    );
};
