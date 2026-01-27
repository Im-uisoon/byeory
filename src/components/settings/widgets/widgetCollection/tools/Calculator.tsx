import { useState } from 'react';
import { Delete, Eraser, Equal, Divide, X, Minus, Plus, Settings } from 'lucide-react';
import { evaluate } from 'mathjs';
import { useWidgetStorage } from '../SDK';

interface CalculatorProps {
    mode?: 'basic' | 'scientific';
    updateLayout?: (layout: { w?: number, h?: number }) => void;
    widgetId?: string;
    gridSize?: { w: number, h: number };
}

interface ScientificBtnProps {
    label: string;
    fn: string;
    onClick: (fn: string) => void;
}



const ScientificBtn = ({ label, fn, onClick }: ScientificBtnProps) => (
    <button
        type="button"
        onClick={() => onClick(fn)}
        className="h-10 rounded-lg theme-bg-card-secondary text-xs font-bold theme-text-secondary hover:bg-[var(--btn-bg)] hover:text-white transition-colors"
    >
        {label}
    </button>
);

export function Calculator({ mode: initialMode = 'basic', updateLayout, gridSize }: CalculatorProps) {
    const [display, setDisplay] = useState('0');
    const [equation, setEquation] = useState('');
    const [isResult, setIsResult] = useState(false);

    // SDK Storage
    const [mode, setMode] = useWidgetStorage<'basic' | 'scientific'>('widget-calculator-mode', initialMode);
    const [history, setHistory] = useWidgetStorage<string[]>('widget-calculator-history', []);

    const [showHistory, setShowHistory] = useState(false);

    const handleInput = (val: string) => {
        if (isResult) {
            setDisplay(val);
            setIsResult(false);
        } else {
            if (display === '0' && val !== '.') {
                setDisplay(val);
            } else {
                setDisplay(prev => prev + val);
            }
        }
    };

    const handleOperator = (op: string) => {
        setIsResult(false);
        if (display === 'Error') return;
        setEquation(display + ' ' + op + ' ');
        setDisplay('0');
    };

    const handleClear = () => {
        setDisplay('0');
        setEquation('');
        setIsResult(false);
    };

    const handleBackspace = () => {
        if (isResult) {
            setDisplay('0');
            setIsResult(false);
            return;
        }
        if (display.length === 1) {
            setDisplay('0');
        } else {
            setDisplay(prev => prev.slice(0, -1));
        }
    };

    const calculate = () => {
        try {
            // 2. let 대신 const 사용 (ESLint: prefer-const)
            const fullEq = equation + display;
            const result = evaluate(fullEq);

            const final = Number(result).toLocaleString(undefined, { maximumFractionDigits: 8 });

            setHistory(prev => [fullEq + ' = ' + final, ...prev].slice(10));
            setDisplay(String(result));
            setEquation('');
            setIsResult(true);
        } catch {
            // 3. 사용하지 않는 매개변수 'e' 제거 (ESLint: no-unused-vars)
            setDisplay('Error');
            setIsResult(true);
        }
    };

    const clearHistory = () => {
        setHistory([]);
    };

    return (
        <div className="h-full flex flex-col p-4 theme-bg-card rounded-xl shadow-sm border theme-border relative overflow-hidden">
            {/* Top Toolbar */}
            <div className="absolute top-2 left-2 z-20 flex gap-2">
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="p-2 rounded-lg hover:bg-black/5 theme-text-secondary hover:theme-text-primary transition-colors"
                    title="Settings & History"
                >
                    <Settings size={18} />
                </button>
            </div>

            {showHistory ? (
                <div className="absolute inset-0 z-30 theme-bg-card p-4 flex flex-col animate-in fade-in slide-in-from-bottom-5">
                    <div className="flex items-center justify-between mb-4 border-b theme-border pb-2">
                        <span className="font-bold theme-text-primary">Settings & History</span>
                        <button
                            onClick={() => setShowHistory(false)}
                            className="bg-black/5 p-1 rounded-full px-3 text-xs font-bold hover:bg-black/10"
                        >
                            Close
                        </button>
                    </div>

                    <div className="mb-4">
                        <label className="text-xs theme-text-secondary font-bold mb-2 block">Calculator Mode</label>
                        <div className="flex gap-2 bg-black/5 p-1 rounded-lg">
                            <button
                                onClick={() => {
                                    setMode('basic');
                                    if (updateLayout && gridSize && gridSize.h > 2) {
                                        updateLayout({ h: 2 });
                                    }
                                }}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'basic' ? 'bg-white shadow-sm theme-text-primary' : 'theme-text-secondary hover:theme-text-primary'}`}
                            >
                                Basic
                            </button>
                            <button
                                onClick={() => {
                                    setMode('scientific');
                                    if (updateLayout && gridSize && gridSize.h < 3) {
                                        updateLayout({ h: 3 });
                                    }
                                }}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'scientific' ? 'bg-white shadow-sm theme-text-primary' : 'theme-text-secondary hover:theme-text-primary'}`}
                            >
                                Scientific
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs theme-text-secondary font-bold">History</span>
                            <button
                                onClick={clearHistory}
                                className="text-xs text-red-400 hover:text-red-500 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                            >
                                <Eraser size={14} /> Clear
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                            {history.length === 0 ? (
                                <div className="text-center py-8 opacity-30 text-xs">
                                    No history yet
                                </div>
                            ) : (
                                history.map((item, idx) => (
                                    <div key={idx} className="p-2 rounded bg-black/5 text-right">
                                        <div className="text-xs theme-text-primary font-mono select-all">
                                            {item}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Display */}
                    <div className="flex-1 flex flex-col justify-end items-end mb-2 px-1 min-h-[60px]">
                        <div className="text-xs theme-text-secondary h-4">{equation}</div>
                        <div className={`font-mono font-bold theme-text-primary break-all text-right transition-all
                            ${display.length > 10 ? 'text-xl' : 'text-3xl'}
                        `}>
                            {display}
                        </div>
                    </div>

                    {/* Scientific Keypad */}
                    {mode === 'scientific' && (
                        <div className="grid grid-cols-4 gap-1 mb-1 animate-in fade-in zoom-in-95 shrink-0">
                            <ScientificBtn label="sin" fn="sin(" onClick={handleInput} />
                            <ScientificBtn label="cos" fn="cos(" onClick={handleInput} />
                            <ScientificBtn label="tan" fn="tan(" onClick={handleInput} />
                            <ScientificBtn label="π" fn="pi" onClick={handleInput} />
                            <ScientificBtn label="(" fn="(" onClick={handleInput} />
                            <ScientificBtn label=")" fn=")" onClick={handleInput} />
                            <ScientificBtn label="^" fn="^" onClick={handleInput} />
                            <ScientificBtn label="√" fn="sqrt(" onClick={handleInput} />
                        </div>
                    )}

                    {/* Keypad */}
                    <div className="flex-1 grid grid-cols-4 gap-1 min-h-0">
                        <button onClick={handleClear} className="col-span-1 rounded-lg bg-red-100 text-red-500 font-bold hover:bg-red-200 transition-colors text-sm">AC</button>
                        <button onClick={handleBackspace} className="col-span-1 rounded-lg theme-bg-card-secondary theme-text-primary flex items-center justify-center hover:bg-gray-200 transition-colors"><Delete size={16} /></button>
                        <button onClick={() => handleOperator('%')} className="col-span-1 rounded-lg theme-bg-card-secondary theme-text-primary font-bold hover:bg-gray-200 transition-colors text-sm">%</button>
                        <button onClick={() => handleOperator('/')} className="col-span-1 rounded-lg bg-[var(--btn-bg)]/10 text-[var(--btn-bg)] flex items-center justify-center font-bold hover:bg-[var(--btn-bg)]/20 transition-colors"><Divide size={16} /></button>

                        {[7, 8, 9].map(n => (
                            <button key={n} onClick={() => handleInput(String(n))} className="rounded-lg theme-bg-card border theme-border theme-text-primary font-bold text-lg hover:bg-gray-50 transition-colors shadow-sm">{n}</button>
                        ))}
                        <button onClick={() => handleOperator('*')} className="rounded-lg bg-[var(--btn-bg)]/10 text-[var(--btn-bg)] flex items-center justify-center font-bold hover:bg-[var(--btn-bg)]/20 transition-colors"><X size={16} /></button>

                        {[4, 5, 6].map(n => (
                            <button key={n} onClick={() => handleInput(String(n))} className="rounded-lg theme-bg-card border theme-border theme-text-primary font-bold text-lg hover:bg-gray-50 transition-colors shadow-sm">{n}</button>
                        ))}
                        <button onClick={() => handleOperator('-')} className="rounded-lg bg-[var(--btn-bg)]/10 text-[var(--btn-bg)] flex items-center justify-center font-bold hover:bg-[var(--btn-bg)]/20 transition-colors"><Minus size={16} /></button>

                        {[1, 2, 3].map(n => (
                            <button key={n} onClick={() => handleInput(String(n))} className="rounded-lg theme-bg-card border theme-border theme-text-primary font-bold text-lg hover:bg-gray-50 transition-colors shadow-sm">{n}</button>
                        ))}
                        <button onClick={() => handleOperator('+')} className="rounded-lg bg-[var(--btn-bg)]/10 text-[var(--btn-bg)] flex items-center justify-center font-bold hover:bg-[var(--btn-bg)]/20 transition-colors"><Plus size={16} /></button>

                        <div className="col-span-2 grid grid-cols-2 gap-1">
                            <button onClick={() => handleInput('0')} className="col-span-1 rounded-lg theme-bg-card border theme-border theme-text-primary font-bold text-lg hover:bg-gray-50 transition-colors shadow-sm">0</button>
                            <button onClick={() => handleInput('.')} className="col-span-1 rounded-lg theme-bg-card border theme-border theme-text-primary font-bold text-lg hover:bg-gray-50 transition-colors shadow-sm">.</button>
                        </div>

                        <button onClick={calculate} className="col-span-2 rounded-lg bg-[var(--btn-bg)] text-[var(--btn-text)] flex items-center justify-center font-bold text-lg shadow-md hover:opacity-90 transition-opacity"><Equal size={20} /></button>
                    </div>
                </>
            )}
        </div>
    );
}