import { useTodoContext } from '../../context/TodoContext';
import { useMemo } from 'react';

export const useSharedTodo = () => {
    const { todos, addTodo, updateTodo, deleteTodo, toggleTodo } = useTodoContext();

    const getTodosByDate = useMemo(() => (date: Date) => {
        const dateString = date.toISOString().split('T')[0];

        return todos.filter(todo => {
            const start = new Date(todo.startDate);
            const end = new Date(todo.endDate);
            const current = new Date(dateString);

            return current >= start && current <= end;
        });
    }, [todos]);

    const getTodayTodos = () => {
        const today = new Date();
        return getTodosByDate(today);
    };

    return {
        todos,
        addTodo,
        updateTodo,
        deleteTodo,
        toggleTodo,
        getTodosByDate,
        getTodayTodos
    };
};
