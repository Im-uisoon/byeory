import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { Todo } from '../../types/todo';
import { TodoItem } from './CheckTodo';
import { TodoModal } from './EditTodo';

interface DailyViewProps {
    todos: Todo[];
    onAddTodo: (todo: Omit<Todo, 'id'>) => void;
    onUpdateTodo: (id: string, updates: Partial<Todo>) => void;
    onDeleteTodo: (id: string) => void;
    onToggleComplete: (id: string) => void;
    currentDate: Date;
    onDateChange: (date: Date) => void;
    isReadOnly?: boolean;
}

export function DailyView({
    todos,
    onAddTodo,
    onUpdateTodo,
    onDeleteTodo,
    onToggleComplete,
    currentDate,
    onDateChange,
    isReadOnly = false,
}: DailyViewProps) {
    // 모달 관련 상태
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

    const [showCompleted, setShowCompleted] = useState(true);
    const [showIncomplete, setShowIncomplete] = useState(true);

    const goToPreviousDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 1);
        onDateChange(newDate);
    };

    const goToNextDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 1);
        onDateChange(newDate);
    };

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDisplayDate = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
        return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
    };

    const currentDateString = formatDate(currentDate);

    // Filter todos for current date
    const dailyTodos = todos.filter(todo => {
        const start = new Date(todo.startDate);
        const end = new Date(todo.endDate);
        const current = new Date(currentDateString);

        return current >= start && current <= end;
    }).filter(todo => {
        if (!showCompleted && todo.completed) return false;
        if (!showIncomplete && !todo.completed) return false;
        return true;
    });

    const incompleteTodos = dailyTodos.filter(t => !t.completed);
    const completedTodos = dailyTodos.filter(t => t.completed);

    return (
        <div className="mx-auto w-full p-2 md:p-2">
            {/* Date Navigation & Filters */}
            <div className="flex flex-col md:flex-row items-stretch xl:items-center justify-between gap-2 xl:gap-4 mb-3 xl:mb-6">
                <div className="flex items-center gap-1 md:gap-4 justify-center md:justify-start">
                    <button
                        onClick={goToPreviousDay}
                        className="p-1 md:p-2 theme-text-secondary hover:text-[var(--text-primary)] transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <h2 className="text-base md:text-lg xl:text-2xl font-bold min-w-[140px] md:min-w-[200px] xl:min-w-[300px] text-center theme-text-primary">
                        {formatDisplayDate(currentDate)}
                    </h2>
                    <button
                        onClick={goToNextDay}
                        className="p-1 md:p-2 theme-text-secondary hover:text-[var(--text-primary)] transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>

                <div className="flex items-center gap-2 md:gap-4 justify-between md:justify-end">
                    {/* Filter */}
                    {!isReadOnly && (
                        <div className="flex items-center gap-3 md:gap-4 md:border-r theme-border md:pr-4">
                            <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={showIncomplete}
                                    onChange={(e) => setShowIncomplete(e.target.checked)}
                                    className="w-3.5 h-3.5 md:w-4 md:h-4 rounded text-blue-600 focus:ring-blue-500 theme-border"
                                />
                                <span className="text-xs md:text-sm font-medium theme-text-secondary">미완료</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={showCompleted}
                                    onChange={(e) => setShowCompleted(e.target.checked)}
                                    className="w-3.5 h-3.5 md:w-4 md:h-4 rounded text-blue-600 focus:ring-blue-500 theme-border"
                                />
                                <span className="text-xs md:text-sm font-medium theme-text-secondary">완료</span>
                            </label>
                        </div>
                    )}

                    {!isReadOnly && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 text-white rounded-lg transition-colors hover:opacity-90"
                            style={{ backgroundColor: 'var(--btn-bg)' }}
                        >
                            <Plus className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="text-xs md:text-sm xl:text-base font-medium">할 일 추가</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Content Box (Outer Box) */}
            <div className="theme-bg-card-secondary rounded-2xl p-2">
                {/* Todo List Box (Inner Box) */}
                <div className="bg-transparent rounded-xl px-2 py-2">
                    <div
                        className="space-y-3 h-60 md:h-130 overflow-y-auto pr-1 scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {incompleteTodos.length === 0 && completedTodos.length === 0 ?
                            (
                                <div className="h-full flex items-center justify-center theme-text-secondary opacity-60">
                                    이 날짜에 등록된 할 일이 없습니다
                                </div>
                            ) : (
                                <>
                                    {incompleteTodos.map(todo => (
                                        <TodoItem
                                            key={todo.id}
                                            todo={todo}
                                            onToggleComplete={isReadOnly ? () => { } : onToggleComplete}
                                            onEdit={isReadOnly ? () => { } : setEditingTodo}
                                            isReadOnly={isReadOnly}
                                        />
                                    ))}
                                    {completedTodos.map(todo => (
                                        <TodoItem
                                            key={todo.id}
                                            todo={todo}
                                            onToggleComplete={isReadOnly ? () => { } : onToggleComplete}
                                            onEdit={isReadOnly ? () => { } : setEditingTodo}
                                            isReadOnly={isReadOnly}
                                        />
                                    ))}
                                </>
                            )}
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <TodoModal
                    onClose={() => setShowAddModal(false)}
                    onAdd={onAddTodo}
                    initialDate={currentDateString}
                />
            )}

            {/* Edit Modal */}
            {editingTodo && (
                <TodoModal
                    todo={editingTodo}
                    onClose={() => setEditingTodo(null)}
                    onUpdate={onUpdateTodo}
                    onDelete={onDeleteTodo}
                />
            )}
        </div>
    );
}