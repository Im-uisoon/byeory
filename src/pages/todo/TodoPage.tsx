import React, { useState } from 'react';
import Navigation from '../../components/Header/Navigation';
import { DailyView } from '../../components/Todo/Daily';
import { WeeklyView } from '../../components/Todo/Weekly';
import { MonthlyView } from '../../components/Todo/Monthly';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { Todo } from '../../types';

type ViewMode = 'daily' | 'weekly' | 'monthly';

const TodoPage: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('daily');
    const [todos, setTodos] = useState<Todo[]>([
        {
            id: '1',
            title: 'Sample Todo',
            completed: false,
            startDate: '2025-12-06',
            endDate: '2025-12-06',
            startTime: '10:00',
            endTime: '11:00',
            allDay: false
        }
    ]);

    const handleAddTodo = (newTodo: Omit<Todo, 'id'>) => {
        const todo: Todo = {
            ...newTodo,
            id: Math.random().toString(36).substr(2, 9)
        };
        setTodos([...todos, todo]);
    };

    const handleUpdateTodo = (id: string, updates: Partial<Todo>) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, ...updates } : todo
        ));
    };

    const handleDeleteTodo = (id: string) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };

    const handleToggleComplete = (id: string) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navigation />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header & View Switcher */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-bold theme-text-primary">Todo</h1>

                    <div className="flex bg-gray-200 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('daily')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'daily'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            일간
                        </button>
                        <button
                            onClick={() => setViewMode('weekly')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'weekly'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            주간
                        </button>
                        <button
                            onClick={() => setViewMode('monthly')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'monthly'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            월간
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <DndProvider backend={HTML5Backend}>
                    <div className="theme-bg-card rounded-2xl shadow-sm border theme-border p-6 min-h-[600px]">
                        {viewMode === 'monthly' && (
                            <MonthlyView
                                todos={todos}
                                onAddTodo={handleAddTodo}
                                onUpdateTodo={handleUpdateTodo}
                                onDeleteTodo={handleDeleteTodo}
                                onToggleComplete={handleToggleComplete}
                            />
                        )}
                        {viewMode === 'weekly' && (
                            <WeeklyView
                                todos={todos}
                                onAddTodo={handleAddTodo}
                                onUpdateTodo={handleUpdateTodo}
                                onDeleteTodo={handleDeleteTodo}
                                onToggleComplete={handleToggleComplete}
                            />
                        )}
                        {viewMode === 'daily' && (
                            <DailyView
                                todos={todos}
                                onAddTodo={handleAddTodo}
                                onUpdateTodo={handleUpdateTodo}
                                onDeleteTodo={handleDeleteTodo}
                                onToggleComplete={handleToggleComplete}
                            />
                        )}
                    </div>
                </DndProvider>
            </main>
        </div>
    );
};

export default TodoPage;
