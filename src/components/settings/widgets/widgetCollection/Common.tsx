import React from 'react';
import { WidgetWrapper as SharedWidgetWrapper } from '../Shared';

export const WidgetWrapper = ({ children, className = '', title, headerRight }: { children: React.ReactNode; className?: string; title?: string; headerRight?: React.ReactNode }) => (
    <SharedWidgetWrapper className={`items-center justify-center p-2 ${className}`} title={title} headerRight={headerRight}>
        {children}
    </SharedWidgetWrapper>
);
