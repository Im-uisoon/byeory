import { CheckCircle2, Circle, Settings } from 'lucide-react';
import type { Todo } from '../../types';

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: string) => void;
  onEdit: (todo: Todo) => void;
}

export function TodoItem({ todo, onToggleComplete, onEdit }: TodoItemProps) {


  const getTimeDisplay = () => {
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
      className={`flex items-center gap-1.5 md:gap-3 p-1.5 md:p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow ${todo.completed ? 'opacity-60' : ''
        }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggleComplete(todo.id)}
        className="flex-shrink-0 text-gray-400 transition-colors hover:opacity-80"
        style={{ color: todo.completed ? 'var(--btn-bg)' : undefined }}
      >
        {todo.completed ? (
          <CheckCircle2 className="w-3.5 h-3.5 md:w-5 md:h-5" />
        ) : (
          <Circle className="w-3.5 h-3.5 md:w-5 md:h-5" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className={`text-[11px] md:text-base ${todo.completed ? 'line-through text-gray-500' : ''}`}>
          {todo.title}
        </div>
        <div className="text-[9px] md:text-sm text-gray-500 mt-0.5 md:mt-1 truncate">
          {getTimeDisplay()}
        </div>
      </div>

      {/* Settings button */}
      <button
        onClick={() => onEdit(todo)}
        className="flex-shrink-0 p-1 md:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Settings className="w-3 h-3 md:w-4 md:h-4" />
      </button>
    </div>
  );
}
