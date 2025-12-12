import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { ThemeCheckbox } from '../common/ThemeCheckbox';
import { useDrag, useDrop } from 'react-dnd';
import type { Todo } from '../../types';
import { TodoItem } from './CheckTodo';
import { TodoModal } from './EditTodo';

interface MonthlyViewProps {
  todos: Todo[];
  onAddTodo: (todo: Omit<Todo, 'id'>) => void;
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void;
  onDeleteTodo: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

function MonthlyViewContent({
  todos,
  onAddTodo,
  onUpdateTodo,
  onDeleteTodo,
  onToggleComplete,
}: MonthlyViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // 모달 관련 상태
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const [showCompleted, setShowCompleted] = useState(true);
  const [showIncomplete, setShowIncomplete] = useState(true);

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date: d, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true });
    }

    // Next month days
    const remaining = 42 - days.length;
    // 6 rows x 7 days
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false });
    }

    return days;
  };

  const calendarDays = getCalendarDays(currentDate);
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  const handleDrop = (todo: Todo, newDate: string) => {
    const daysDiff = Math.ceil(
      (new Date(todo.endDate).getTime() - new Date(todo.startDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const newEndDate = new Date(newDate);
    newEndDate.setDate(newEndDate.getDate() + daysDiff);

    onUpdateTodo(todo.id, {
      startDate: newDate,
      endDate: formatDate(newEndDate),
    });
  };

  // Get todos for selected date
  const selectedDateTodos = todos.filter(todo => {
    const start = new Date(todo.startDate);
    const end = new Date(todo.endDate);
    const selected = new Date(selectedDate);
    return selected >= start && selected <= end;
  }).filter(todo => {
    if (!showCompleted && todo.completed) return false;
    if (!showIncomplete && !todo.completed) return false;
    return true;
  });

  // Get multi-day todos for the calendar
  const getMultiDayTodos = (dateString: string) => {
    return todos.filter(todo => {
      const start = new Date(todo.startDate);
      const end = new Date(todo.endDate);
      const current = new Date(dateString);

      // Check if this is a multi-day todo
      const isMultiDay = todo.startDate !== todo.endDate;

      return isMultiDay && current >= start && current <= end;
    });
  };

  // Get single day todos for the calendar
  const getSingleDayTodos = (dateString: string) => {
    return todos.filter(todo => {
      const isSingleDay = todo.startDate === todo.endDate;
      return isSingleDay && todo.startDate === dateString;
    });
  };

  const getTodoPosition = (todo: Todo, dateString: string) => {
    const start = new Date(todo.startDate);
    if (formatDate(start) === dateString) {
      return 'start';
    }

    const end = new Date(todo.endDate);
    if (formatDate(end) === dateString) {
      return 'end';
    }

    return 'middle';
  };

  interface CalendarCellProps {
    day: { date: Date; isCurrentMonth: boolean };
    index: number;
    dateString: string;
    isSelected: boolean;
    isToday: boolean;
    onSelect: (date: string) => void;
    onDrop: (todo: Todo, newDate: string) => void;
  }

  interface CalendarTodoItemProps {
    todo: Todo;
    dateString: string;
  }

  function CalendarTodoItem({ todo, dateString }: CalendarTodoItemProps) {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'TODO',
      item: { todo },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    const position = getTodoPosition(todo, dateString);
    const isMultiDay = todo.startDate !== todo.endDate;

    if (isMultiDay) {
      return (
        <div
          ref={drag as any}
          style={{ opacity: isDragging ? 0.3 : 1 }}
          className={`text-xs px-1 py-0.5 bg-blue-100 text-blue-800 truncate cursor-move ${position === 'start' ? 'rounded-l' : ''
            } ${position === 'end' ? 'rounded-r' : ''} ${position === 'middle' ? '' : ''
            } ${todo.completed ? 'opacity-50 line-through' : ''}`}
          title={todo.title}
          onClick={(e) => e.stopPropagation()}
        >
          {position === 'start' && todo.title}
        </div>
      );
    } else {
      return (
        <div
          ref={drag as any}
          style={{ opacity: isDragging ? 0.3 : 1 }}
          className={`text-xs px-1 py-0.5 bg-green-100 text-green-800 truncate rounded cursor-move ${todo.completed ? 'opacity-50 line-through' : ''
            }`}
          title={todo.title}
          onClick={(e) => e.stopPropagation()}
        >
          {todo.allDay ? '🗓️' : '⏱️'} {todo.title}
        </div>
      );
    }
  }

  function CalendarCell({ day, index, dateString, isSelected, isToday, onSelect, onDrop }: CalendarCellProps) {
    const dayNum = day.date.getDate();
    const multiDayTodos = getMultiDayTodos(dateString);
    const singleDayTodos = getSingleDayTodos(dateString);

    const [{ isOver }, drop] = useDrop(() => ({
      accept: 'TODO',
      drop: (item: { todo: Todo }) => {
        onDrop(item.todo, dateString);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }));

    return (
      <div
        ref={drop as any}
        onClick={() => onSelect(dateString)}
        className={`bg-white min-h-[80px] md:min-h-[120px] p-1 md:p-2 cursor-pointer transition-colors ${!day.isCurrentMonth ? 'opacity-40' : ''
          } ${isSelected ? 'ring-2 ring-blue-600 ring-inset' : ''} ${isOver ? 'bg-blue-50' : 'hover:bg-gray-50'
          }`}
      >
        <div
          className={`text-xs md:text-sm mb-1 ${isToday
            ? 'w-5 h-5 md:w-6 md:h-6 text-white rounded-full flex items-center justify-center text-[10px] md:text-sm'
            : index % 7 === 0
              ? 'text-red-600'
              : index % 7 === 6
                ? 'text-blue-600'
                : 'text-gray-700'
            }`}
          style={{ backgroundColor: isToday ? 'var(--btn-bg)' : undefined }}
        >
          {dayNum}
        </div>

        <div className="space-y-0.5 md:space-y-1">
          {/* Multi-day todos */}
          {multiDayTodos.map(todo => (
            <CalendarTodoItem key={todo.id} todo={todo} dateString={dateString} />
          ))}

          {/* Single day todos */}
          {singleDayTodos.map(todo => (
            <CalendarTodoItem key={todo.id} todo={todo} dateString={dateString} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Month Navigation */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 md:gap-4 justify-center md:justify-start">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg md:text-2xl min-w-[150px] md:min-w-[200px] text-center">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </h2>
          <button
            onClick={goToNextMonth}
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

      {/* Calendar */}
      <div className="mb-6">
        {/* Day names header */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 mb-px">
          {dayNames.map((day, index) => (
            <div
              key={day}
              className={`bg-gray-50 py-1 md:py-2 text-center text-[10px] md:text-sm ${index === 0 ?
                'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
                }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
          {calendarDays.map((day, index) => {
            const dateString = formatDate(day.date);
            const isSelected = dateString === selectedDate;
            const isToday = (() => {
              const today = new Date();
              const year = today.getFullYear();
              const month = String(today.getMonth() + 1).padStart(2, '0');
              const day = String(today.getDate()).padStart(2, '0');
              return dateString === `${year}-${month}-${day}`;
            })();

            return (
              <CalendarCell
                key={index}
                day={day}
                index={index}
                dateString={dateString}
                isSelected={isSelected}
                isToday={isToday}
                onSelect={setSelectedDate}
                onDrop={handleDrop}
              />
            );
          })}
        </div>
      </div>

      {/* Selected Date Todos */}
      <div className="bg-gray-50 rounded-lg p-4 md:p-6">
        <h3 className="text-base md:text-lg mb-4">
          {new Date(selectedDate).getFullYear()}년 {new Date(selectedDate).getMonth() + 1}월 {' '}
          {new Date(selectedDate).getDate()}일 할 일
        </h3>

        <div className="space-y-2">
          {selectedDateTodos.length === 0 ?
            (
              <div className="text-center py-8 text-gray-400">
                이 날짜에 등록된 할 일이 없습니다
              </div>
            ) : (
              selectedDateTodos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggleComplete={onToggleComplete}
                  onEdit={setEditingTodo}
                />
              ))
            )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <TodoModal
          onClose={() => setShowAddModal(false)}
          onAdd={onAddTodo}
          initialDate={selectedDate}
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

export function MonthlyView(props: MonthlyViewProps) {
  return <MonthlyViewContent {...props} />;
}