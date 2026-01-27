import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { Todo } from '../../types/todo';
import { useDrag, useDrop } from "react-dnd";
import type { DragSourceMonitor, DropTargetMonitor } from "react-dnd";
import { TodoItem } from "./CheckTodo";
import { TodoModal } from "./EditTodo";

// --- 날짜 헬퍼 함수 ---
const parseLocalDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

interface WeeklyViewProps {
  todos: Todo[];
  onAddTodo: (todo: Omit<Todo, "id">) => void;
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void;
  onDeleteTodo: (id: string) => void;
  onToggleComplete: (id: string) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  isReadOnly?: boolean;
}

interface DraggableTodoItemProps {
  todo: Todo;
  onSelect: (todo: Todo) => void;
}

function DraggableTodoItem({
  todo,
  onSelect,
}: DraggableTodoItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TODO",
    item: { todo },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [todo]);

  return (
    <div
      ref={drag as any}
      style={{
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: 'var(--btn-bg)',
        color: 'var(--btn-text)'
      }}
      className="p-2 rounded-lg shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
      onClick={() => onSelect(todo)}
    >
      <div className={`text-xs md:text-sm truncate ${todo.completed ? "line-through opacity-70" : ""}`}>
        {todo.title}
      </div>
    </div>
  );
}

interface DayColumnProps {
  date: string;
  dayName: string;
  todos: Todo[];
  isToday: boolean;
  onDrop: (todo: Todo, newDate: string) => void;
  onToggleComplete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onSelectDate: (date: string) => void;
  onAddClick: (date: string) => void;
  isSelected: boolean;
  isReadOnly?: boolean;
}

function DayColumn({
  date,
  dayName,
  todos,
  isToday,
  onDrop,
  onSelectDate,
  onAddClick,
  isSelected,
  isReadOnly,
}: DayColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "TODO",
    drop: (item: { todo: Todo }) => {
      onDrop(item.todo, date);
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [date, onDrop]);

  // 화면 표시용 날짜 포맷
  const dateObj = parseLocalDate(date);
  const day = dateObj.getDate();

  return (
    <div
      onClick={() => onSelectDate(date)}
      className={`flex-1 min-w-0 flex flex-col cursor-pointer p-1 md:p-2 rounded-xl transition-all border-2 border-transparent ${isOver ? "bg-blue-50" : isSelected ? "bg-blue-50/50 dark:bg-white/5 shadow-sm" : ""
        }`}
      style={{
        borderColor: isSelected ? 'var(--btn-bg)' : 'transparent'
      }}
    >
      {/* 날짜 헤더 */}
      <div className="flex flex-col items-center mb-1 md:mb-4">
        <div className="text-[10px] md:text-sm theme-text-secondary font-bold mb-0.5 md:mb-2 w-auto text-center">{dayName}</div>
        <div
          className={`w-6 h-6 md:w-16 md:h-16 
          rounded-full flex items-center justify-center text-[10px] md:text-base transition-colors font-bold ${isToday
              ? "text-white"
              : ""
            }`}
          style={{
            backgroundColor: isToday ? 'var(--btn-bg)' : 'rgba(128, 128, 128, 0.15)',
            color: isToday ? '#ffffff' : 'var(--text-primary)'
          }}
        >
          {day}
        </div>
      </div>

      {/* 할 일 목록 영역 */}
      <div
        ref={drop as any}
        className={`flex-1 px-0.5 md:px-1 space-y-1.5 md:space-y-2 min-h-[30px] max-h-[100px] md:min-h-25 md:max-h-25 overflow-y-auto scrollbar-hide ${isOver ?
          "bg-blue-100/30 rounded-lg" : ""
          }`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="hidden md:block space-y-1.5 md:space-y-2">
          {todos.map((todo) => (
            <DraggableTodoItem
              key={todo.id}
              todo={todo}
              onSelect={isReadOnly ? () => { } : () => onSelectDate(date)}
            />
          ))}
        </div>

        {/* 모바일에서는 항상 + 버튼 표시 (할 일이 있어도 상세 내용은 하단에서 확인) */}
        {!isReadOnly && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddClick(date);
            }}
            className={`w-full py-1 md:py-3 text-[10px] md:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${todos.length > 0 ? 'md:hidden' : ''}`}
            style={{
              color: 'var(--btn-bg)',
              backgroundColor: 'rgba(var(--btn-bg-rgb), 0.1)',
            }}
          >
            <Plus className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden md:inline">일정 추가</span>
          </button>
        )}
      </div>
    </div>
  );
}

function WeeklyViewContent({
  todos,
  onAddTodo,
  onUpdateTodo,
  onDeleteTodo,
  onToggleComplete,
  currentDate,
  onDateChange,
  isReadOnly = false,
}: WeeklyViewProps) {
  // 초기값을 오늘 날짜로 안전하게 설정
  // const [currentDate, setCurrentDate] = useState(() => {
  //   const now = new Date();
  //   return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // });

  // 모달 관련 상태
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const [selectedDate, setSelectedDate] = useState(formatLocalDate(new Date()));
  const [showCompleted, setShowCompleted] = useState(true);
  const [showIncomplete, setShowIncomplete] = useState(true);

  const getWeekDates = (baseDate: Date) => {
    const current = new Date(baseDate);
    const day = current.getDay();

    // 0(일) ~ 6(토) -> 월요일 시작 기준
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const monday = new Date(current);
    monday.setDate(current.getDate() + diffToMonday);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push(d);
    }
    return week;
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    onDateChange(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    onDateChange(newDate);
  };

  const formatWeekRange = (dates: Date[]) => {
    const first = dates[0];
    const last = dates[6];
    return `${first.getFullYear()}년 ${first.getMonth() + 1}월 ${first.getDate()}일 - ${last.getMonth() + 1
      }월 ${last.getDate()}일`;
  };

  const isDateInRange = (dateStr: string, startStr: string, endStr: string) => {
    return dateStr >= startStr && dateStr <= endStr;
  };

  const weekDates = getWeekDates(currentDate);
  const dayNames = ["월", "화", "수", "목", "금", "토", "일"];

  // 오늘 날짜 계산
  const todayDate = new Date();
  const today = formatLocalDate(todayDate);

  const handleDrop = (todo: Todo, targetDateStr: string) => {
    // 같은 날짜면 무시
    if (todo.startDate === targetDateStr) {
      return;
    }

    // 기간 계산
    const originalStart = parseLocalDate(todo.startDate);
    const originalEnd = parseLocalDate(todo.endDate);
    const diffTime = originalEnd.getTime() - originalStart.getTime();

    // 새로운 날짜 계산
    const newStartDate = parseLocalDate(targetDateStr);
    const newEndDate = new Date(newStartDate.getTime() + diffTime);

    onUpdateTodo(todo.id, {
      startDate: targetDateStr,
      endDate: formatLocalDate(newEndDate),
    });
  };

  const filteredTodos = todos.filter((todo) => {
    // 아무것도 선택하지 않으면 전체 표시
    if (!showCompleted && !showIncomplete) return true;
    if (!showCompleted && todo.completed) return false;
    if (!showIncomplete && !todo.completed) return false;
    return true;
  });

  return (
    <div className="mx-auto w-full p-2 md:p-2">
      {/* Week Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-6">
        <div className="flex items-center gap-1 md:gap-4 justify-center md:justify-start">
          <button
            onClick={goToPreviousWeek}
            className="p-1 md:p-2 theme-text-secondary hover:text-[var(--text-primary)] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <h2 className="text-base md:text-lg xl:text-2xl font-bold min-w-[200px] md:min-w-[350px] text-center theme-text-primary">
            {formatWeekRange(weekDates)}
          </h2>
          <button
            onClick={goToNextWeek}
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

      {/* Week Grid */}
      <div className="flex flex-row gap-1 md:gap-4">
        {weekDates.map((date, index) => {
          const dateString = formatLocalDate(date);
          const dayTodos = filteredTodos.filter((todo) => {
            return isDateInRange(dateString, todo.startDate, todo.endDate);
          });

          return (
            <DayColumn
              key={dateString}
              date={dateString}
              dayName={dayNames[index]}
              todos={dayTodos}
              isToday={dateString === today}
              onDrop={handleDrop}
              onToggleComplete={onToggleComplete}
              onEdit={setEditingTodo}
              onSelectDate={setSelectedDate}
              onAddClick={(date) => {
                setSelectedDate(date);
                setShowAddModal(true);
              }}
              isSelected={dateString === selectedDate}
              isReadOnly={isReadOnly}
            />
          );
        })}
      </div>

      {/* Selected Date Todos */}
      <div className="theme-bg-card-secondary rounded-lg p-3 md:p-6 mt-4 md:mt-6">
        <h3 className="text-sm md:text-lg mb-3 md:mb-4 theme-text-primary font-bold">
          {new Date(selectedDate).getFullYear()}년 {new Date(selectedDate).getMonth() + 1}월 {' '}
          {new Date(selectedDate).getDate()}일 할 일
        </h3>

        <div
          className="space-y-3 h-30 md:h-[400px] overflow-y-auto pr-1 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {todos.filter(todo => {
            const start = new Date(todo.startDate);
            const end = new Date(todo.endDate);
            const selected = new Date(selectedDate);
            const selectedTime = selected.setHours(0, 0, 0, 0);
            const startTime = start.setHours(0, 0, 0, 0);
            const endTime = end.setHours(0, 0, 0, 0);
            return selectedTime >= startTime && selectedTime <= endTime;
          }).filter(todo => {
            if (!showCompleted && !showIncomplete) return true;
            if (!showCompleted && todo.completed) return false;
            if (!showIncomplete && !todo.completed) return false;
            return true;
          }).length === 0 ?
            (
              <div className="h-full flex items-center justify-center theme-text-secondary opacity-60 text-xs md:text-sm">
                이 날짜에 등록된 할 일이 없습니다
              </div>
            ) : (
              todos.filter(todo => {
                const start = new Date(todo.startDate);
                const end = new Date(todo.endDate);
                const selected = new Date(selectedDate);
                const selectedTime = selected.setHours(0, 0, 0, 0);
                const startTime = start.setHours(0, 0, 0, 0);
                const endTime = end.setHours(0, 0, 0, 0);
                return selectedTime >= startTime && selectedTime <= endTime;
              })
                .filter(todo => {
                  if (!showCompleted && !showIncomplete) return true;
                  if (!showCompleted && todo.completed) return false;
                  if (!showIncomplete && !todo.completed) return false;
                  return true;
                })
                .map(todo => (
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
          initialDate={selectedDate} // 현재 선택된 날짜 자동 입력
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

export function WeeklyView(props: WeeklyViewProps) {
  return <WeeklyViewContent {...props} />;
}