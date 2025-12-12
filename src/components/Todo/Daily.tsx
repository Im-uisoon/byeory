import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { ThemeCheckbox } from '../common/ThemeCheckbox';
import type { Todo } from '../../types';
import { TodoItem } from './CheckTodo';
import { TodoModal } from './EditTodo';

interface DailyViewProps {
    todos: Todo[];
    onAddTodo: (todo: Omit<Todo, 'id'>) => void;
    onUpdateTodo: (id: string, updates: Partial<Todo>) => void;
    onDeleteTodo: (id: string) => void;
    onToggleComplete: (id: string) => void;
}

export function DailyView({
    todos,
    onAddTodo,
    onUpdateTodo,
    onDeleteTodo,
    onToggleComplete,
}: DailyViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    // 모달 관련 상태
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

    const [showCompleted, setShowCompleted] = useState(true);
    const [showIncomplete, setShowIncomplete] = useState(true);

    const goToPreviousDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 1);
        setCurrentDate(newDate);
    };

    const goToNextDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 1);
        setCurrentDate(newDate);
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
        <div>
            {/* Date Navigation */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2 md:gap-4 justify-center md:justify-start">
                    <button
                        onClick={goToPreviousDay}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg md:text-2xl min-w-[200px] md:min-w-[300px] text-center">
                        {formatDisplayDate(currentDate)}
                    </h2>
                    <button
                        onClick={goToNextDay}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center gap-3 md:gap-4 justify-between md:justify-start">
                    {/* Filter */}
                    <div className="flex items-center gap-3 md:border-r md:pr-4">
                        <ThemeCheckbox
                            checked={showIncomplete}
                            onChange={setShowIncomplete}
                            label="미완료"
                        />
                        <ThemeCheckbox
                            checked={showCompleted}
                            onChange={setShowCompleted}
                            label="완료"
                        />
                    </div>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-3 md:px-4 py-2 text-white rounded-lg transition-colors hover:opacity-90"
                        style={{ backgroundColor: 'var(--btn-bg)' }}
                    >
                        <Plus className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="hidden sm:inline">할 일 추가</span>
                        <span className="sm:hidden">추가</span>
                    </button>
                </div>
            </div>

            {/* Todo List */}
            <div className="space-y-2">
                {incompleteTodos.length === 0 && completedTodos.length === 0 ?
                    (
                        <div className="text-center py-12 text-gray-400">
                            이 날짜에 등록된 할 일이 없습니다
                        </div>
                    ) : (
                        <>
                            {incompleteTodos.map(todo => (
                                <TodoItem
                                    key={todo.id}
                                    todo={todo}
                                    onToggleComplete={onToggleComplete}
                                    onEdit={setEditingTodo}
                                />
                            ))}
                            {completedTodos.map(todo => (
                                <TodoItem
                                    key={todo.id}
                                    todo={todo}
                                    onToggleComplete={onToggleComplete}
                                    onEdit={setEditingTodo}
                                />
                            ))}
                        </>
                    )}
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