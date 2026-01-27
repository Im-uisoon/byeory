import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import type { Todo } from '../../types/todo';
import { TodoItem } from './CheckTodo';
import { TodoModal } from './EditTodo';

interface MonthlyViewProps {
  todos: Todo[];
  onAddTodo: (todo: Omit<Todo, 'id'>) => void;
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void;
  onDeleteTodo: (id: string) => void;
  onToggleComplete: (id: string) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  isReadOnly?: boolean;
}

function MonthlyViewContent({
  todos,
  onAddTodo,
  onUpdateTodo,
  onDeleteTodo,
  onToggleComplete,
  currentDate,
  onDateChange,
  isReadOnly = false,
}: MonthlyViewProps) {
  // const [currentDate, setCurrentDate] = useState(new Date());
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
    onDateChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
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
    if (!showCompleted && !showIncomplete) return true;
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
      const isInRange = isMultiDay && current >= start && current <= end;

      if (!isInRange) return false;

      // Filter logic
      if (!showCompleted && !showIncomplete) return true;
      if (!showCompleted && todo.completed) return false;
      if (!showIncomplete && !todo.completed) return false;

      return true;
    });
  };

  // Get single day todos for the calendar
  const getSingleDayTodos = (dateString: string) => {
    return todos.filter(todo => {
      const isSingleDay = todo.startDate === todo.endDate;
      const isToday = isSingleDay && todo.startDate === dateString;

      if (!isToday) return false;

      // Filter logic
      if (!showCompleted && !showIncomplete) return true;
      if (!showCompleted && todo.completed) return false;
      if (!showIncomplete && !todo.completed) return false;

      return true;
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
    isReadOnly?: boolean;
  }

  interface CalendarTodoItemProps {
    todo: Todo;
    dateString: string;
    isReadOnly?: boolean;
  }

  function CalendarTodoItem({ todo, dateString, isReadOnly }: CalendarTodoItemProps) {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'TODO',
      item: { todo },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    const position = getTodoPosition(todo, dateString);
    const isMultiDay = todo.startDate !== todo.endDate;

    const baseStyle = {
      opacity: isDragging ? 0.3 : 1,
      backgroundColor: 'var(--btn-bg)',
      color: 'var(--btn-text)',
    };

    if (isMultiDay) {
      return (
        <div
          ref={drag as any}
          style={baseStyle}
          className={`text-[10px] md:text-xs px-1 py-0.5 truncate cursor-move hover:opacity-90 transition-opacity ${position === 'start' ? 'rounded-l' : ''
            } ${position === 'end' ? 'rounded-r' : ''} ${position === 'middle' ? '' : ''
            } ${todo.completed ? 'opacity-70 line-through' : ''}`}
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
          style={baseStyle}
          className={`text-[10px] md:text-xs px-1 py-0.5 truncate rounded cursor-move hover:opacity-90 transition-opacity ${todo.completed ? 'opacity-70 line-through' : ''
            }`}
          title={todo.title}
          onClick={(e) => e.stopPropagation()}
        >
          {isReadOnly ? '✏️' : (todo.allDay ? '🗓️' : '⏱️')} {todo.title}
        </div>
      );
    }
  }

  function CalendarCell({ day, index, dateString, isSelected, isToday, onSelect, onDrop, isReadOnly }: CalendarCellProps) {
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

    // 요일 색상 로직
    const dayColorClass = index % 7 === 0
      ? 'text-red-500' // 일요일
      : index % 7 === 6
        ? 'text-blue-500' // 토요일
        : 'theme-text-primary'; // 평일

    return (
      <div
        ref={drop as any}
        onClick={() => onSelect(dateString)}
        className={`theme-bg-card h-17 md:h-[120px] p-1 md:p-2 cursor-pointer transition-all border border-transparent flex flex-col ${!day.isCurrentMonth ? 'opacity-40' : ''
          } ${isOver ? 'bg-blue-50' : 'hover:brightness-95'
          }`}
        style={{
          borderColor: isSelected ? 'var(--btn-bg)' : 'transparent'
        }}
      >
        <div
          className={`text-xs md:text-sm mb-1 w-6 h-6 md:w-8 md:h-8 flex-shrink-0 flex items-center justify-center rounded-full mx-auto md:mx-0 ${isToday ? 'text-white font-bold' : dayColorClass}`}
          style={{ backgroundColor: isToday ? 'var(--btn-bg)' : undefined }}
        >
          {dayNum}
        </div>

        <div className="space-y-0.5 md:space-y-1 flex-1 overflow-y-auto scrollbar-hide min-h-0">
          {/* Multi-day todos */}
          {multiDayTodos.map(todo => (
            <CalendarTodoItem key={todo.id} todo={todo} dateString={dateString} isReadOnly={isReadOnly} />
          ))}

          {/* Single day todos */}
          {singleDayTodos.map(todo => (
            <CalendarTodoItem key={todo.id} todo={todo} dateString={dateString} isReadOnly={isReadOnly} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full p-2 md:p-2">
      {/* Month Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-6">
        <div className="flex items-center gap-1 md:gap-4 justify-center md:justify-start">
          <button
            onClick={goToPreviousMonth}
            className="p-1 md:p-2 theme-text-secondary hover:text-[var(--text-primary)] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <h2 className="text-base md:text-lg xl:text-2xl font-bold min-w-[150px] md:min-w-[250px] text-center theme-text-primary">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </h2>
          <button
            onClick={goToNextMonth}
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

      {/* Calendar */}
      <div className="mb-4 md:mb-6">
        {/* Day names header */}
        <div className="grid grid-cols-7 gap-px border theme-border mb-px bg-[var(--border-color)]">
          {dayNames.map((day, index) => (
            <div
              key={day}
              className={`theme-bg-card py-1 md:py-2 text-center text-[10px] md:text-sm font-bold ${index === 0 ?
                'text-red-500' : index === 6 ? 'text-blue-500' : 'theme-text-secondary'
                }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px border theme-border bg-[var(--border-color)] rounded-b-lg overflow-hidden">
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
                isReadOnly={isReadOnly}
              />
            );
          })}
        </div>
      </div>

      {/* Selected Date Todos */}
      <div className="theme-bg-card-secondary rounded-lg p-3 md:p-6">
        <h3 className="text-sm md:text-lg mb-3 md:mb-4 theme-text-primary font-bold">
          {new Date(selectedDate).getFullYear()}년 {new Date(selectedDate).getMonth() + 1}월 {' '}
          {new Date(selectedDate).getDate()}일 할 일
        </h3>

        <div
          className="space-y-3 h-30 md:h-[300px] overflow-y-auto pr-1 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {selectedDateTodos.length === 0 ?
            (
              <div className="h-full flex items-center justify-center theme-text-secondary opacity-60 text-xs md:text-sm">
                이 날짜에 등록된 할 일이 없습니다
              </div>
            ) : (
              selectedDateTodos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggleComplete={isReadOnly ? () => { } : onToggleComplete}
                  onEdit={isReadOnly ? () => { } : setEditingTodo}
                  isReadOnly={isReadOnly}
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