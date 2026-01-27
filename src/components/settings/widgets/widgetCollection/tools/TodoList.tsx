import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Check } from 'lucide-react';
import { WidgetWrapper } from '../../Shared';
import { useSharedTodo } from '../../../../todo/useSharedTodo';
import type { Todo } from '../../../../../types/todo';

interface TodoListWidgetProps {
    gridSize?: { w: number; h: number };
    isStickerMode?: boolean;
}

// 6. Todo List Widget (할 일 목록)
export function TodoListWidget({ gridSize, isStickerMode }: TodoListWidgetProps) {
    const navigate = useNavigate();
    const { getTodayTodos, addTodo, toggleTodo } = useSharedTodo();
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Get today's todos
    const todayTodos = getTodayTodos();
    const completedTodos = todayTodos.filter(t => t.completed);

    // calculate progress
    const total = todayTodos.length;
    const completed = completedTodos.length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    const progressColor = progress === 100 ? 'bg-green-500' : 'bg-[var(--btn-bg)]';

    const handleNavigate = () => {
        if (isStickerMode) return;
        navigate('/todo');
    };

    // Auto-stamp logic
    useEffect(() => {
        if (total > 0 && completed === total) {
            const today = new Date();
            const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

            // Dispatch event for other widgets (like Daily Stamp)
            window.dispatchEvent(new CustomEvent('todo-all-completed', {
                detail: { date: dateStr }
            }));
        }
    }, [total, completed]);

    const handleAdd = () => {
        if (!newTodoTitle.trim()) return;
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];
        const newTodo: Omit<Todo, 'id'> = {
            title: newTodoTitle,
            completed: false,
            startDate: dateString,
            endDate: dateString,
            allDay: true
        };
        addTodo(newTodo);
        setNewTodoTitle('');
        setIsAdding(false);
    };

    const isSmall = (gridSize?.w || 2) < 2;

    // Small View
    if (isSmall) {
        return (
            <WidgetWrapper className="theme-bg-card cursor-pointer" onClick={handleNavigate}>
                <div className="flex flex-col items-center justify-center h-full relative">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="theme-text-secondary opacity-20" />
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent"
                                className={`${progress === 100 ? 'text-green-500' : 'text-[var(--btn-bg)]'} transition-all duration-1000 ease-out`}
                                strokeDasharray={175.9}
                                strokeDashoffset={175.9 - (progress / 100) * 175.9}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-sm font-bold theme-text-primary">{Math.round(progress)}%</span>
                        </div>
                    </div>
                    <span className="text-[10px] theme-text-secondary mt-2 font-medium">{completed}/{total} Tasks</span>
                </div>
            </WidgetWrapper>
        );
    }

    // Standard/Large View
    return (

        <WidgetWrapper
            title="TODAY'S TASKS"
            className="theme-bg-card"
            headerRight={
                <div className="text-xs font-bold theme-text-secondary cursor-pointer hover:text-[var(--btn-bg)] uppercase tracking-wide" onClick={handleNavigate}>
                    VIEW ALL
                </div>
            }
        >
            <div className="flex flex-col h-full overflow-hidden">
                {/* Progress Bar (Linear) */}
                <div className="px-3 pt-2 pb-1">
                    <div className="w-full h-1.5 theme-bg-card-secondary rounded-full overflow-hidden">
                        <div
                            className={`h-full ${progressColor} transition-all duration-500 ease-out`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                    {todayTodos.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full theme-text-secondary gap-2 opacity-50">
                            <Check size={24} />
                            <span className="text-xs">No tasks for today!</span>
                        </div>
                    )}

                    <div className="space-y-2">
                        {todayTodos.slice(0, (gridSize?.h || 2) < 2 ? 3 : 10).map(todo => (
                            <div
                                key={todo.id}
                                className={`flex items-center gap-3 p-3 rounded-xl theme-bg-card-secondary border theme-border transition-all hover:brightness-95 ${todo.completed ? 'opacity-60' : ''}`}
                            >
                                <button
                                    onClick={() => toggleTodo(todo.id)}
                                    className="flex-shrink-0 theme-text-secondary hover:text-[var(--btn-bg)] transition-colors"
                                    style={{ color: todo.completed ? 'var(--btn-bg)' : undefined }}
                                >
                                    {todo.completed ? (
                                        <Check size={18} className="stroke-[3]" />
                                    ) : (
                                        <div className="w-[18px] h-[18px] rounded-full border-2 border-current opacity-50" />
                                    )}
                                </button>

                                <div className="flex-1 min-w-0 flex items-center gap-2">
                                    <span className={`text-sm font-medium truncate ${todo.completed ? 'line-through theme-text-secondary' : 'theme-text-primary'}`}>
                                        {todo.title}
                                    </span>
                                    {/* Simple Time Display inline if needed */}
                                    {!todo.allDay && (
                                        <span className="text-xs theme-text-secondary whitespace-nowrap">
                                            - {todo.startTime}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add Input - Optimized for available space */}
                {(gridSize?.h || 2) >= 2 && (
                    <div className="p-2 border-t theme-border mt-auto">
                        {isAdding ? (
                            <div className="flex gap-2 items-center animate-in slide-in-from-bottom-2 duration-200">
                                <input
                                    autoFocus
                                    value={newTodoTitle}
                                    onChange={(e) => setNewTodoTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                    placeholder="New task..."
                                    className="flex-1 text-sm bg-transparent outline-none min-w-0 theme-text-primary placeholder:text-gray-400 py-2"
                                />
                                <button onClick={handleAdd} className="p-2 rounded bg-[var(--btn-bg)] text-white hover:opacity-90 transition-opacity">
                                    <Plus size={18} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAdding(true)}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed theme-border text-sm theme-text-secondary hover:text-[var(--btn-bg)] hover:border-[var(--btn-bg)] hover:bg-[var(--btn-bg)] hover:bg-opacity-5 transition-all"
                            >
                                <Plus size={16} />
                                <span>Add Task</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
}
