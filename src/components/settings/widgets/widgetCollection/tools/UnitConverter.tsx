import { useState, useEffect } from 'react';
import { ArrowLeftRight, ArrowDownUp } from 'lucide-react';
import { useWidgetStorage } from '../SDK';

const UNIT_CATEGORIES = {
    length: {
        label: '길이',
        units: {
            m: '미터 (m)',
            cm: '센티미터 (cm)',
            mm: '밀리미터 (mm)',
            km: '킬로미터 (km)',
            in: '인치 (in)',
            ft: '피트 (ft)',
            yd: '야드 (yd)',
            mi: '마일 (mi)',
        },
        rates: {
            m: 1, cm: 100, mm: 1000, km: 0.001,
            in: 39.3701, ft: 3.28084, yd: 1.09361, mi: 0.000621371
        }
    },
    area: {
        label: '면적',
        units: {
            m2: '제곱미터 (m²)',
            py: '평',
            ft2: '제곱피트 (sq ft)',
            ac: '에이커 (ac)',
        },
        rates: {
            m2: 1, py: 0.3025, ft2: 10.7639, ac: 0.000247105
        }
    },
    weight: {
        label: '무게',
        units: {
            kg: '킬로그램 (kg)',
            g: '그램 (g)',
            lb: '파운드 (lb)',
            oz: '온스 (oz)',
        },
        rates: {
            kg: 1, g: 1000, lb: 2.20462, oz: 35.274
        }
    },
    currency: {
        label: '환율',
        units: {
            KRW: '대한민국 원 (KRW)',
            USD: '미국 달러 (USD)',
            JPY: '일본 엔 (JPY)',
            EUR: '유로 (EUR)',
            CNY: '중국 위안 (CNY)',
        },
        rates: {
            USD: 1,
            KRW: 1445,
            JPY: 155,
            EUR: 0.85,
            CNY: 7.02
        }
    }
};

const API_KEY = import.meta.env.VITE_EXCHANGE_RATE_API_KEY;

interface UnitConverterProps {
    gridSize?: { w: number; h: number };
}

export function UnitConverter({ gridSize }: UnitConverterProps) {
    const isNarrow = gridSize ? gridSize.w === 1 : false;
    const isShort = gridSize ? gridSize.h === 1 : false;

    // Persist user selection
    const [settings, setSettings] = useWidgetStorage('widget-unit-converter', {
        category: 'length' as keyof typeof UNIT_CATEGORIES,
        fromUnit: 'm',
        toUnit: 'cm'
    });

    const category = settings.category;
    const fromUnit = settings.fromUnit;
    const toUnit = settings.toUnit;

    const setFromUnit = (u: string) => setSettings({ ...settings, fromUnit: u });
    const setToUnit = (u: string) => setSettings({ ...settings, toUnit: u });

    const [fromValue, setFromValue] = useState<string>('1');
    const [toValue, setToValue] = useState<string>('');
    const [rates, setRates] = useState<any>(UNIT_CATEGORIES.length.rates);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    const fetchCurrencyRates = async () => {
        const CACHE_KEY = 'exchange_rates_cache';
        const updatedCache = localStorage.getItem(CACHE_KEY);

        if (updatedCache) {
            const { timestamp, data } = JSON.parse(updatedCache);
            if (Date.now() - timestamp < 12 * 60 * 60 * 1000) {
                setRates(data.conversion_rates);
                setLastUpdated(new Date(timestamp).toLocaleTimeString());
                return;
            }
        }

        if (!API_KEY || API_KEY === 'YOUR_KEY_HERE') {
            setRates(UNIT_CATEGORIES.currency.rates);
            return;
        }

        try {
            const res = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`);
            const data = await res.json();
            if (data.result === 'success') {
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    timestamp: Date.now(),
                    data: data
                }));
                setRates(data.conversion_rates);
                setLastUpdated(new Date().toLocaleTimeString());
            }
        } catch (e) {
            setRates(UNIT_CATEGORIES.currency.rates);
        }
    };

    const calculate = (val: string, from: string, to: string) => {
        const num = parseFloat(val);
        if (isNaN(num)) {
            setToValue('');
            return;
        }

        if (!rates[from] || !rates[to]) return;

        const baseValue = num / rates[from];
        const result = baseValue * rates[to];
        setToValue(parseFloat(result.toFixed(6)).toString());
    };

    const handleCategoryChange = (c: keyof typeof UNIT_CATEGORIES) => {
        const cat = UNIT_CATEGORIES[c];
        const units = Object.keys(cat.units);
        setSettings({
            category: c,
            fromUnit: units[0],
            toUnit: units[1] || units[0]
        });

        if (c === 'currency') {
            fetchCurrencyRates();
        } else {
            setRates(cat.rates);
            setLastUpdated(null);
        }
    };

    useEffect(() => {
        if (category === 'currency') fetchCurrencyRates();
    }, []);

    useEffect(() => {
        calculate(fromValue, fromUnit, toUnit);
    }, [fromValue, fromUnit, toUnit, rates]);

    const handleSwap = () => {
        const tempUnit = fromUnit;
        setFromUnit(toUnit);
        setToUnit(tempUnit);
        setFromValue(toValue);
    };

    // Compact Layout for 2x1 (Short but Wide)
    if (isShort && !isNarrow) {
        return (
            <div className="h-full flex flex-col px-4 py-3 theme-bg-card rounded-xl shadow-sm border theme-border overflow-hidden">
                {/* Compact Header */}
                <div className="flex gap-2 overflow-x-auto pb-1 mb-2 scrollbar-hide">
                    {Object.entries(UNIT_CATEGORIES).map(([key, info]) => (
                        <button
                            key={key}
                            onClick={() => handleCategoryChange(key as any)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors flex-shrink-0
                                ${category === key
                                    ? 'theme-bg-primary text-white'
                                    : 'theme-bg-card-secondary theme-text-secondary hover:theme-text-primary'
                                }`}
                        >
                            {info.label}
                        </button>
                    ))}
                </div>

                {/* Horizontal Content */}
                <div className="flex-1 flex items-center gap-2">
                    {/* From */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 border-b border-[var(--border-color)] p-1.5 focus-within:border-[var(--btn-bg)] transition-colors">
                            <input
                                type="number"
                                value={fromValue}
                                onChange={(e) => setFromValue(e.target.value)}
                                className="flex-1 bg-transparent text-sm font-mono outline-none theme-text-primary w-full min-w-0"
                            />
                            <select
                                value={fromUnit}
                                onChange={(e) => setFromUnit(e.target.value)}
                                className="bg-transparent theme-text-secondary text-xs font-bold outline-none border-none py-0 max-w-[50px] text-right"
                            >
                                {Object.entries(UNIT_CATEGORIES[category].units).map(([u]) => (
                                    <option key={u} value={u} className="text-gray-900 dark:text-gray-100">{u}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Swap */}
                    <button
                        onClick={handleSwap}
                        className="p-1.5 rounded-full theme-bg-card border theme-border shadow-sm hover:scale-110 transition-transform theme-text-secondary hover:theme-text-primary flex-shrink-0"
                    >
                        <ArrowLeftRight size={12} />
                    </button>

                    {/* To */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 border-b border-[var(--border-color)] p-1.5">
                            <input
                                type="text"
                                readOnly
                                value={toValue}
                                className="flex-1 bg-transparent text-sm font-mono outline-none theme-text-primary w-full min-w-0"
                            />
                            <select
                                value={toUnit}
                                onChange={(e) => setToUnit(e.target.value)}
                                className="bg-transparent theme-text-secondary text-xs font-bold outline-none border-none py-0 max-w-[50px] text-right"
                            >
                                {Object.entries(UNIT_CATEGORIES[category].units).map(([u]) => (
                                    <option key={u} value={u} className="text-gray-900 dark:text-gray-100">{u}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default Layout (2x2) or Narrow Layout (1x2)
    return (
        <div className="h-full flex flex-col p-4 theme-bg-card rounded-xl shadow-sm border theme-border overflow-hidden">

            {/* Category Selector */}
            <div className={`flex gap-2 mb-4 scrollbar-hide ${isNarrow ? 'overflow-x-auto pb-1' : 'overflow-x-auto pb-2'}`}>
                {Object.entries(UNIT_CATEGORIES).map(([key, info]) => (
                    <button
                        key={key}
                        onClick={() => handleCategoryChange(key as any)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex-shrink-0
                            ${category === key
                                ? 'theme-bg-primary text-white'
                                : 'theme-bg-card-secondary theme-text-secondary hover:theme-text-primary'
                            }`}
                    >
                        {info.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className={`flex-1 flex ${isNarrow ? 'flex-col gap-2' : 'flex-col gap-4 justify-center'}`}>

                {/* From Group */}
                <div className="relative group">
                    <label className="text-[10px] theme-text-secondary mb-1 block font-bold uppercase tracking-wider">From</label>
                    <div className={`flex ${isNarrow ? 'flex-col' : 'flex-row'} gap-2`}>
                        <input
                            type="number"
                            value={fromValue}
                            onChange={(e) => setFromValue(e.target.value)}
                            className="flex-1 theme-bg-input rounded-lg px-3 py-2 text-lg font-mono outline-none focus:ring-2 ring-[var(--btn-bg)] transition-all theme-text-primary w-full"
                        />
                        <select
                            value={fromUnit}
                            onChange={(e) => setFromUnit(e.target.value)}
                            className={`${isNarrow ? 'w-full text-left bg-transparent border-b' : 'w-24 text-right bg-transparent border-b-2'} theme-text-primary text-sm font-bold outline-none border-transparent focus:border-[var(--btn-bg)] transition-colors py-1`}
                        >
                            {Object.entries(UNIT_CATEGORIES[category].units).map(([u]) => (
                                <option key={u} value={u} className="text-gray-900 dark:text-gray-100">{u}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Swap Action */}
                <div className={`flex justify-center z-10 ${isNarrow ? 'py-1' : '-my-2'}`}>
                    <button
                        onClick={handleSwap}
                        className="p-2 rounded-full theme-bg-card border theme-border shadow-sm hover:scale-110 transition-transform theme-text-secondary hover:theme-text-primary"
                    >
                        {isNarrow ? <ArrowDownUp size={14} /> : <ArrowLeftRight size={16} />}
                    </button>
                </div>

                {/* To Group */}
                <div className="relative group">
                    <label className="text-[10px] theme-text-secondary mb-1 block font-bold uppercase tracking-wider">To</label>
                    <div className={`flex ${isNarrow ? 'flex-col' : 'flex-row'} gap-2`}>
                        <input
                            type="text"
                            readOnly
                            value={toValue}
                            className="flex-1 theme-bg-card-secondary rounded-lg px-3 py-2 text-lg font-mono outline-none theme-text-primary w-full"
                        />
                        <select
                            value={toUnit}
                            onChange={(e) => setToUnit(e.target.value)}
                            className={`${isNarrow ? 'w-full text-left bg-transparent border-b' : 'w-24 text-right bg-transparent border-b-2'} theme-text-primary text-sm font-bold outline-none border-transparent focus:border-[var(--btn-bg)] transition-colors py-1`}
                        >
                            {Object.entries(UNIT_CATEGORIES[category].units).map(([u]) => (
                                <option key={u} value={u} className="text-gray-900 dark:text-gray-100">{u}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Info Footer */}
                {category === 'currency' && !isNarrow && (
                    <div className="text-[10px] theme-text-secondary text-center mt-2">
                        {lastUpdated ? `Updated: ${lastUpdated}` : 'Standard Rates'}
                    </div>
                )}
            </div>
        </div>
    );
}
