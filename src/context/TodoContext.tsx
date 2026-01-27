import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import type { Todo } from '../types/todo';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../api/config';

interface TodoContextType {
    todos: Todo[];
    addTodo: (todo: Omit<Todo, 'id'>) => Promise<void>;
    updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
    deleteTodo: (id: string) => Promise<void>;
    toggleTodo: (id: string) => Promise<void>;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);



export const TodoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const TODO_API_URL = `${API_BASE_URL}/api/todos`;

    const [todos, setTodos] = useState<Todo[]>([]);
    const { isLoggedIn } = useAuth(); // Optional: Refetch when login state changes

    const getAuthHeader = (): Record<string, string> => {
        const token = localStorage.getItem('accessToken');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    const fetchTodos = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setTodos([]);
            return;
        }

        try {
            const response = await fetch(TODO_API_URL, {
                headers: { ...getAuthHeader() }
            });
            if (response.ok) {
                const data = await response.json();
                setTodos(data);
            } else {
                console.error("Failed to fetch todos");
            }
        } catch (error) {
            console.error("Error fetching todos:", error);
        }
    };

    useEffect(() => {
        fetchTodos();
    }, [isLoggedIn]);

    const addTodo = async (newTodo: Omit<Todo, 'id'>) => {
        try {
            const response = await fetch(TODO_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(newTodo)
            });

            if (response.ok) {
                const savedTodo = await response.json();
                setTodos(prev => [...prev, savedTodo]);
            } else {
                console.error("Failed to add todo");
                alert("할 일을 저장하지 못했습니다.");
            }
        } catch (error) {
            console.error("Error adding todo:", error);
        }
    };

    const updateTodo = async (id: string, updates: Partial<Todo>) => {
        // Optimistic update
        setTodos(prev => prev.map(todo =>
            todo.id === id ? { ...todo, ...updates } : todo
        ));

        try {
            // We need the full object or backend logic support. 
            // Assuming backend accepts partial updates (PATCH) or we merge it here.
            // If backend is strictly PUT with full object, we should find the current todo first.
            // For safety, let's find the current todo and merge.
            const currentTodo = todos.find(t => t.id === id);
            if (!currentTodo) return;

            const updatedTodo = { ...currentTodo, ...updates };

            const response = await fetch(`${TODO_API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(updatedTodo)
            });

            if (!response.ok) {
                // Revert on failure
                console.error("Failed to update todo");
                fetchTodos();
            }
        } catch (error) {
            console.error("Error updating todo:", error);
            fetchTodos();
        }
    };

    const deleteTodo = async (id: string) => {
        // Optimistic update
        setTodos(prev => prev.filter(todo => todo.id !== id));

        try {
            const response = await fetch(`${TODO_API_URL}/${id}`, {
                method: 'DELETE',
                headers: { ...getAuthHeader() }
            });

            if (!response.ok) {
                console.error("Failed to delete todo");
                fetchTodos();
            }
        } catch (error) {
            console.error("Error deleting todo:", error);
            fetchTodos();
        }
    };

    const toggleTodo = async (id: string) => {
        const todo = todos.find(t => t.id === id);
        if (todo) {
            await updateTodo(id, { completed: !todo.completed });
        }
    };

    return (
        <TodoContext.Provider value={{ todos, addTodo, updateTodo, deleteTodo, toggleTodo }}>
            {children}
        </TodoContext.Provider>
    );
};

export const useTodoContext = () => {
    const context = useContext(TodoContext);
    if (!context) {
        throw new Error('useTodoContext must be used within a TodoProvider');
    }
    return context;
};
