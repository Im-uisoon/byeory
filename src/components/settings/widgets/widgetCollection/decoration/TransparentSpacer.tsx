import type { WidgetDecoration } from '../../customwidget/types';
import DecorationLayer from '../../customwidget/components/DecorationLayer';

interface TransparentSpacerProps {
    decorations?: WidgetDecoration[];
    style?: React.CSSProperties;
    styles?: React.CSSProperties; // Alias
}

// --- 10. Transparent Spacer (투명 위젯)
export function TransparentSpacer({ decorations, style, styles }: TransparentSpacerProps) {
    return (
        <div className="w-full h-full relative overflow-hidden" style={style || styles}>
            <DecorationLayer decorations={decorations} />
        </div>
    );
}
