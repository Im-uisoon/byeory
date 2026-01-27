import React, { useState } from 'react';
import { WidgetWrapper } from '../../Shared';
import { Terminal, Play, XCircle } from 'lucide-react';
import { useWidgetStorage } from '../SDK';

export const FormulaBlock = ({ style, gridSize }: { style?: React.CSSProperties, gridSize?: { w: number; h: number } }) => {
    const [code, setCode] = useWidgetStorage('widget-formula-code', 'const a = 10;\nconst b = 20;\nreturn a + b;');
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const runCode = () => {
        try {
            setError(null);
            // eslint-disable-next-line no-new-func
            const func = new Function(code);
            const res = func();
            setResult(String(res));
        } catch (e: any) {
            setError(e.message);
            setResult(null);
        }
    };

    const isSmall = (gridSize?.w || 2) < 2;

    if (isSmall) {
        return (
            <WidgetWrapper className="bg-white flex flex-col items-center justify-center p-1 relative group" style={style}>
                <div className="flex items-center gap-1 mb-1 text-gray-500">
                    <Terminal size={14} />
                </div>
                <div className="text-xs font-bold text-blue-600 truncate w-full text-center">
                    {result !== null ? result : 'Ready'}
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        runCode();
                    }}
                    className="absolute inset-0 w-full h-full cursor-pointer z-10"
                    title="Click to run"
                />
            </WidgetWrapper>
        );
    }

    return (
        <WidgetWrapper className="bg-white" style={style}>
            <div className="w-full h-full flex flex-col p-3 overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Terminal size={14} />
                        <span className="text-xs font-semibold uppercase tracking-wider">Code Runner</span>
                    </div>
                    <button
                        onClick={runCode}
                        className="p-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Run Code"
                    >
                        <Play size={14} fill="currentColor" />
                    </button>
                </div>

                <div className="flex-1 flex flex-col gap-2 min-h-0">
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-1 w-full bg-gray-50 p-2 rounded-md border border-gray-100 text-xs font-mono text-gray-700 outline-none focus:border-blue-300 resize-none font-medium custom-scrollbar"
                        spellCheck={false}
                    />

                    <div className="shrink-0 min-h-[24px] flex items-center px-2 py-1.5 rounded bg-gray-50 border border-gray-100">
                        {error ? (
                            <div className="flex items-center gap-2 text-red-500 w-full">
                                <XCircle size={12} />
                                <span className="text-xs font-mono truncate">{error}</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between w-full">
                                <span className="text-[10px] text-gray-400 font-mono">Return</span>
                                <span className="text-sm font-bold text-blue-600 font-mono truncate max-w-[120px] text-right">
                                    {result !== null ? result : '-'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </WidgetWrapper>
    );
};
