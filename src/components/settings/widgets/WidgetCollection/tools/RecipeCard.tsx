import { useState } from 'react';
import { Timer, Play, Pause, RotateCcw, Plus, X, Check, Clock } from 'lucide-react';
import { useWidgetStorage, useWidgetInterval } from '../SDK';

interface Step {
    id: string;
    text: string;
    checked: boolean;
}

interface RecipeCardProps {
    gridSize?: { w: number; h: number };
}

export function RecipeCard({ }: RecipeCardProps) {
    // --- State ---
    const [title, setTitle] = useWidgetStorage('recipe-title', 'My Recipe');

    // Timer State
    const [initialTime, setInitialTime] = useWidgetStorage('recipe-timer-init', 180); // Default 3 min
    const [timeLeft, setTimeLeft] = useWidgetStorage('recipe-time-left', 180);
    const [isActive, setIsActive] = useWidgetStorage('recipe-timer-active', false);
    const [isEditingTimer, setIsEditingTimer] = useState(false);
    const [editMinutes, setEditMinutes] = useState('3');

    // Checklist State
    const [steps, setSteps] = useWidgetStorage<Step[]>('recipe-steps', [
        { id: '1', text: 'Preheat oven', checked: false },
        { id: '2', text: 'Mix ingredients', checked: false },
        { id: '3', text: 'Bake for 20m', checked: false }
    ]);

    // --- Timer Logic ---
    useWidgetInterval(() => {
        if (timeLeft > 0) {
            setTimeLeft(timeLeft - 1);
        } else {
            setIsActive(false);
            // Optional: Play sound or visual indicator
        }
    }, isActive ? 1000 : null);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(initialTime);
    };

    const saveTimerEdit = () => {
        const mins = parseInt(editMinutes) || 0;
        const totalSeconds = mins * 60;
        setInitialTime(totalSeconds);
        setTimeLeft(totalSeconds);
        setIsActive(false);
        setIsEditingTimer(false);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // --- Checklist Logic ---
    const toggleStep = (id: string) => {
        setSteps(steps.map(s => s.id === id ? { ...s, checked: !s.checked } : s));
    };

    const addStep = () => {
        const newStep: Step = {
            id: Date.now().toString(),
            text: '',
            checked: false
        };
        setSteps([...steps, newStep]);
    };

    const updateStepText = (id: string, text: string) => {
        setSteps(steps.map(s => s.id === id ? { ...s, text } : s));
    };

    const deleteStep = (id: string) => {
        setSteps(steps.filter(s => s.id !== id));
    };

    // --- Render ---
    return (
        <div className="h-full flex flex-col theme-bg-card rounded-xl shadow-sm border theme-border overflow-hidden">
            {/* Header: Title */}
            <div className={`flex items-center gap-2 p-3 border-b theme-border bg-orange-50/50 dark:bg-orange-900/10`}>
                <div className="w-1.5 h-6 rounded-full bg-orange-400 shrink-0"></div>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Recipe Name"
                    className="bg-transparent text-lg font-bold theme-text-primary outline-none w-full placeholder:text-gray-400"
                />
            </div>

            {/* Timer Section */}
            <div className="px-3 py-2 bg-stone-50 dark:bg-stone-900 border-b theme-border flex items-center justify-between shrink-0">
                {isEditingTimer ? (
                    <div className="flex items-center gap-2 flex-1">
                        <Clock size={14} className="theme-text-secondary" />
                        <input
                            type="number"
                            value={editMinutes}
                            onChange={(e) => setEditMinutes(e.target.value)}
                            className="bg-white dark:bg-stone-800 border rounded w-12 px-1 text-sm text-center"
                            autoFocus
                        />
                        <span className="text-xs theme-text-secondary">min</span>
                        <button onClick={saveTimerEdit} className="p-1 hover:bg-green-100 text-green-600 rounded">
                            <Check size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => {
                        setEditMinutes(Math.floor(initialTime / 60).toString());
                        setIsEditingTimer(true);
                    }}>
                        <Timer size={16} className={`transition-colors ${isActive ? 'text-orange-500 animate-pulse' : 'theme-text-secondary'}`} />
                        <span className={`font-mono font-bold text-xl ${isActive ? 'text-orange-600 dark:text-orange-400' : 'theme-text-primary'}`}>
                            {formatTime(timeLeft)}
                        </span>
                        <span className="opacity-0 group-hover:opacity-100 text-[10px] theme-text-secondary transition-opacity">Edit</span>
                    </div>
                )}

                <div className="flex gap-1.5">
                    <button
                        onClick={toggleTimer}
                        className={`p-1.5 rounded-full transition-all active:scale-95 shadow-sm border ${isActive
                            ? 'bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-800'
                            : 'theme-bg-card-secondary theme-text-secondary theme-border hover:theme-text-primary'
                            }`}
                    >
                        {isActive ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button
                        onClick={resetTimer}
                        className="p-1.5 rounded-full theme-bg-card-secondary theme-text-secondary theme-border border shadow-sm hover:theme-text-primary active:scale-95 transition-all"
                    >
                        <RotateCcw size={14} />
                    </button>
                </div>
            </div>

            {/* Checklist Section */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {steps.map((step) => (
                    <div key={step.id} className="group flex items-center gap-2 p-1.5 rounded hover:bg-stone-100 dark:hover:bg-white/5 transition-colors">
                        <button
                            onClick={() => toggleStep(step.id)}
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${step.checked
                                ? 'bg-orange-400 border-orange-400 text-white'
                                : 'border-stone-300 dark:border-stone-600 bg-transparent'
                                }`}
                        >
                            {step.checked && <Check size={10} strokeWidth={4} />}
                        </button>
                        <input
                            type="text"
                            value={step.text}
                            onChange={(e) => updateStepText(step.id, e.target.value)}
                            placeholder="Step description..."
                            className={`flex-1 bg-transparent text-sm outline-none w-full min-w-0 transition-colors ${step.checked
                                ? 'text-stone-400 dark:text-stone-500 line-through'
                                : 'theme-text-primary'
                                }`}
                        />
                        <button
                            onClick={() => deleteStep(step.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 text-stone-400 transition-all shrink-0"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add Step Button */}
            <button
                onClick={addStep}
                className="mx-3 mb-3 mt-1 py-1.5 flex items-center justify-center gap-1.5 text-xs font-bold text-stone-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 border border-dashed border-stone-300 dark:border-stone-700 hover:border-orange-300 rounded-lg transition-all"
            >
                <Plus size={12} />
                Add Step
            </button>
        </div>
    );
}
