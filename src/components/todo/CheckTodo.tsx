import { CheckCircle2, Circle, Pencil } from 'lucide-react';
import type { Todo } from '../../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  isReadOnly?: boolean;
}

export function TodoItem({ todo, onToggleComplete, onEdit, isReadOnly = false }: TodoItemProps) {


  const getTimeDisplay = () => {
    if (isReadOnly) {
      return `작성시간 : ${todo.startTime || ''}`;
    }

    if (todo.allDay) {
      if (todo.startDate === todo.endDate) {
        return '하루종일';
      }
      return `${todo.startDate} - ${todo.endDate}`;
    }

    if (todo.startDate === todo.endDate) {
      return `${todo.startTime || ''} - ${todo.endTime || ''}`;
    }

    return `${todo.startDate} ${todo.startTime || ''} - ${todo.endDate} ${todo.endTime || ''}`;
  };

  return (
    <div
      className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 theme-bg-card border theme-border rounded-xl hover:shadow-md transition-all ${todo.completed ? 'opacity-60' : ''
        }`}
    >
      {/* Checkbox */}
      {!isReadOnly && (
        <button
          onClick={() => onToggleComplete(todo.id)}
          className="flex-shrink-0 theme-text-secondary transition-colors hover:opacity-80"
          style={{ color: todo.completed ? 'var(--btn-bg)' : undefined }}
        >
          {todo.completed ? (
            <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
          ) : (
            <Circle className="w-5 h-5 md:w-6 md:h-6" />
          )}
        </button>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className={`text-sm md:text-lg font-medium ${todo.completed ? 'line-through theme-text-secondary' : 'theme-text-primary'}`}>
          {todo.title}
        </div>
        <div className="text-xs md:text-sm theme-text-secondary mt-1 truncate">
          {getTimeDisplay()}
        </div>
      </div>

      {/* Edit button (changed from Settings) */}
      {!isReadOnly && (
        <button
          onClick={() => onEdit(todo)}
          className="flex-shrink-0 p-2 theme-text-secondary hover:text-[var(--btn-bg)] hover:bg-black/5 rounded-lg transition-colors"
        >
          <Pencil className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      )}
    </div>
  );
}
