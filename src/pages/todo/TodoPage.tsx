import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from "@/config";
import Navigation from '../../components/Header/Navigation';
import { DailyView } from '../../components/Todo/Daily';
import { WeeklyView } from '../../components/Todo/Weekly';
import { MonthlyView } from '../../components/Todo/Monthly';
import type { Todo, Post } from '../../components/Todo/types';
import { useSharedTodo } from '../../components/Todo/useSharedTodo';

type ViewMode = 'daily' | 'weekly' | 'monthly';
type AppMode = 'todo' | 'post';

const TodoPage: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('daily');
    const [appMode, setAppMode] = useState<AppMode>('todo');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [postTodos, setPostTodos] = useState<Todo[]>([]);

    // Shared Todo context
    const { todos: sharedTodos, addTodo, updateTodo, deleteTodo, toggleTodo } = useSharedTodo();

    // Fetch posts when in Post mode and date (month) changes
    useEffect(() => {
        if (appMode === 'post') {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            fetchCalendarPosts(year, month);
        }
    }, [appMode, currentDate.getFullYear(), currentDate.getMonth()]);

    const fetchCalendarPosts = async (year: number, month: number) => {
        try {
            const token = localStorage.getItem('accessToken');
            const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

            const response = await fetch(`${API_BASE_URL}/api/posts/summary?year=${year}&month=${month}`, {
                headers
            });

            if (response.ok) {
                const posts: Post[] = await response.json();
                const transformed = transformPostsToTodos(posts);
                setPostTodos(transformed);
            } else {
                console.error("Failed to fetch posts");
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    };

    const transformPostsToTodos = (posts: Post[]): Todo[] => {
        return posts.map(post => {
            // "2026-01-08T09:58" format
            // We need to parse this carefully to match local date expectations if needed,
            // but standard Date parsing usually works for ISO-like strings.
            // Component logic expects YYYY-MM-DD string for startDate/endDate usually.

            // However, DailyView/WeeklyView logic often creates Date objects from these strings.
            // Let's use the full string which includes time. The components should handle it.
            // If components expect strictly YYYY-MM-DD, we might need to substring.
            // types.ts says startDate: string.
            // Let's keep the T format if components can handle parsing `new Date(string)`.
            // Looking at Weekly.tsx -> `parseLocalDate` splits by `-`. It might fail with `T`.
            // Let's check `parseLocalDate` in Weekly.tsx again.
            // const [year, month, day] = dateStr.split("-").map(Number);
            // If dateStr is "2026-01-08T09:58", split('-') gives ["2026", "01", "08T09:58"].
            // Number("08T09:58") will be NaN.
            // So we MUST strictly format to YYYY-MM-DD for startDate/endDate.

            const dateObj = new Date(post.createdAt);
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            // Extract time for display if needed, but Todo type has startTime/endTime optional.
            // Let's fill them.
            const hours = String(dateObj.getHours()).padStart(2, '0');
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            const timeStr = `${hours}:${minutes}`;

            return {
                id: String(post.id),
                title: post.title,
                completed: false,
                startDate: dateStr,
                endDate: dateStr,
                startTime: timeStr,
                endTime: timeStr,
                allDay: false
            };
        });
    };

    const handleAddTodo = (newTodo: Omit<Todo, 'id'>) => {
        if (appMode === 'todo') addTodo(newTodo);
    };

    const handleUpdateTodo = (id: string, updates: Partial<Todo>) => {
        if (appMode === 'todo') updateTodo(id, updates);
    };

    const handleDeleteTodo = (id: string) => {
        if (appMode === 'todo') deleteTodo(id);
    };

    const handleToggleComplete = (id: string) => {
        if (appMode === 'todo') toggleTodo(id);
    };

    // Determine which todos to show
    const displayTodos = appMode === 'todo' ? sharedTodos : postTodos;

    return (
        <div className="min-h-screen flex flex-col transition-colors duration-300">
            <Navigation />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header & View Switcher */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-6">
                        {/* Title Box with Padding */}
                        <div className="py-2 pr-4 min-w-[100px]">
                            <h1 className="text-3xl font-bold theme-text-primary">
                                {appMode === 'todo' ? 'Todo' : 'Post'}
                            </h1>
                        </div>

                        {/* Mode Toggle Switch */}
                        <div className="theme-bg-card-secondary p-1 rounded-xl flex">
                            <button
                                onClick={() => setAppMode('todo')}
                                className={`px-3 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all ${appMode === 'todo'
                                    ? 'theme-btn shadow-md'
                                    : 'theme-text-secondary hover:text-[var(--text-primary)]'
                                    }`}
                            >
                                Todo
                            </button>
                            <button
                                onClick={() => setAppMode('post')}
                                className={`px-3 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all ${appMode === 'post'
                                    ? 'theme-btn shadow-md'
                                    : 'theme-text-secondary hover:text-[var(--text-primary)]'
                                    }`}
                            >
                                Post
                            </button>
                        </div>
                    </div>

                    {/* View Filters (Daily/Weekly/Monthly) */}
                    <div className="flex theme-bg-card-secondary p-1 rounded-xl self-end md:self-auto">
                        <button
                            onClick={() => setViewMode('daily')}
                            className={`px-3 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'daily'
                                ? 'theme-btn shadow-md'
                                : 'theme-text-secondary hover:text-[var(--text-primary)]'
                                }`}
                        >
                            일간
                        </button>
                        <button
                            onClick={() => setViewMode('weekly')}
                            className={`px-3 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'weekly'
                                ? 'theme-btn shadow-md'
                                : 'theme-text-secondary hover:text-[var(--text-primary)]'
                                }`}
                        >
                            주간
                        </button>
                        <button
                            onClick={() => setViewMode('monthly')}
                            className={`px-3 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'monthly'
                                ? 'theme-btn shadow-md'
                                : 'theme-text-secondary hover:text-[var(--text-primary)]'
                                }`}
                        >
                            월간
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="theme-bg-card rounded-2xl shadow-sm border theme-border p-3 md:p-6 min-h-[350px] md:min-h-[600px]">
                    {viewMode === 'monthly' && (
                        <MonthlyView
                            todos={displayTodos}
                            onAddTodo={handleAddTodo}
                            onUpdateTodo={handleUpdateTodo}
                            onDeleteTodo={handleDeleteTodo}
                            onToggleComplete={handleToggleComplete}
                            currentDate={currentDate}
                            onDateChange={setCurrentDate}
                            isReadOnly={appMode === 'post'}
                        />
                    )}
                    {viewMode === 'weekly' && (
                        <WeeklyView
                            todos={displayTodos}
                            onAddTodo={handleAddTodo}
                            onUpdateTodo={handleUpdateTodo}
                            onDeleteTodo={handleDeleteTodo}
                            onToggleComplete={handleToggleComplete}
                            currentDate={currentDate}
                            onDateChange={setCurrentDate}
                            isReadOnly={appMode === 'post'}
                        />
                    )}
                    {viewMode === 'daily' && (
                        <DailyView
                            todos={displayTodos}
                            onAddTodo={handleAddTodo}
                            onUpdateTodo={handleUpdateTodo}
                            onDeleteTodo={handleDeleteTodo}
                            onToggleComplete={handleToggleComplete}
                            currentDate={currentDate}
                            onDateChange={setCurrentDate}
                            isReadOnly={appMode === 'post'}
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

export default TodoPage;
