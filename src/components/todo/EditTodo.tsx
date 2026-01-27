import { useState, useEffect } from 'react';
import { X, Trash2, Calendar, Clock } from 'lucide-react';
import type { Todo } from '../../types/todo';

interface TodoModalProps {
  onClose: () => void;

  // 수정 모드일 때 전달
  todo?: Todo | null;
  onUpdate?: (id: string, updates: Partial<Todo>) => void;
  onDelete?: (id: string) => void;

  // 추가 모드일 때 전달
  onAdd?: (todo: Omit<Todo, 'id'>) => void;
  initialDate?: string;
}

export function TodoModal({
  onClose,
  todo,
  onUpdate,
  onDelete,
  onAdd,
  initialDate
}: TodoModalProps) {
  // todo prop이 있으면 수정 모드로 간주
  const isEditMode = !!todo;

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(initialDate || '2025-12-06');
  const [endDate, setEndDate] = useState(initialDate || '2025-12-06');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [allDay, setAllDay] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 수정 모드 진입 시 데이터 채우기
  useEffect(() => {
    if (isEditMode && todo) {
      setTitle(todo.title);
      setStartDate(todo.startDate);
      setEndDate(todo.endDate);
      setStartTime(todo.startTime || '09:00');
      setEndTime(todo.endTime || '10:00');
      setAllDay(todo.allDay);
    }
  }, [isEditMode, todo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('할 일 제목을 입력해주세요');
      return;
    }

    const todoData = {
      title: title.trim(),
      startDate,
      endDate: allDay ? startDate : endDate,
      startTime: allDay ? undefined : startTime,
      endTime: allDay ? undefined : endTime,
      allDay,
    };

    if (isEditMode && todo && onUpdate) {
      onUpdate(todo.id, todoData);
    } else if (!isEditMode && onAdd) {
      onAdd({
        ...todoData,
        completed: false,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (showDeleteConfirm && onDelete && todo) {
      onDelete(todo.id);
      onClose();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 backdrop-blur-sm rounded-xl">
      <div className="theme-bg-modal rounded-xl shadow-2xl max-w-md w-full border theme-border">
        {/* Header */}
        <div className="flex items-center justify-between p-3 md:p-5 border-b theme-border">
          <h2 className="text-lg md:text-xl font-bold theme-text-primary">{isEditMode ? '할 일 수정' : '할 일 추가'}</h2>
          <button
            onClick={onClose}
            className="p-1.5 md:p-2 hover:bg-black/5 rounded-lg transition-colors theme-icon"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-3 md:p-5 space-y-2 md:space-y-3">
          {/* Title */}
          <div>
            <label className="block text-xs md:text-sm font-medium mb-1 theme-text-secondary">할 일</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="할 일을 입력하세요"
              className="w-full px-2 py-2 md:px-3 border theme-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)] bg-transparent theme-text-primary placeholder-gray-400 text-sm md:text-base"
              autoFocus
            />
          </div>

          {/* All Day Switch */}
          <div className="flex items-center justify-between py-1">
            <label className="text-xs md:text-sm font-medium theme-text-secondary">하루종일</label>
            <button
              type="button"
              onClick={() => setAllDay(!allDay)}
              className={`relative w-10 h-6 rounded-full transition-colors ${allDay ? '' : 'bg-gray-300'}`}
              style={{ backgroundColor: allDay ? 'var(--btn-bg)' : undefined }}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${allDay ? 'translate-x-4' : ''
                  }`}
              />
            </button>
          </div>

          {/* Date Row: Start Date | End Date */}
          <div className={`grid ${allDay ? 'grid-cols-1' : 'grid-cols-2'} gap-2 md:gap-3`}>
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1 theme-text-secondary">시작 날짜</label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (!allDay && new Date(e.target.value) > new Date(endDate)) {
                      setEndDate(e.target.value);
                    }
                  }}
                  className="w-full px-2 py-1.5 md:px-3 md:py-2 border theme-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)] bg-transparent theme-text-primary [&::-webkit-calendar-picker-indicator]:opacity-0 text-sm"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-secondary pointer-events-none" />
              </div>
            </div>

            {!allDay && (
              <div>
                <label className="block text-xs md:text-sm font-medium mb-1 theme-text-secondary">종료 날짜</label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full px-2 py-1.5 md:px-3 md:py-2 border theme-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)] bg-transparent theme-text-primary [&::-webkit-calendar-picker-indicator]:opacity-0 text-sm"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-secondary pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {/* Time Row: Start Time | End Time */}
          {!allDay && (
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              <div>
                <label className="block text-xs md:text-sm font-medium mb-1 theme-text-secondary">시작 시간</label>
                <div className="relative">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2 py-1.5 md:px-3 md:py-2 border theme-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)] bg-transparent theme-text-primary [&::-webkit-calendar-picker-indicator]:opacity-0 text-sm"
                  />
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-secondary pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium mb-1 theme-text-secondary">종료 시간</label>
                <div className="relative">
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-2 py-1.5 md:px-3 md:py-2 border theme-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)] bg-transparent theme-text-primary [&::-webkit-calendar-picker-indicator]:opacity-0 text-sm"
                  />
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-secondary pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 md:gap-3 pt-4 md:pt-6">
            {isEditMode && (
              <button
                type="button"
                onClick={handleDelete}
                className={`px-3 py-2 md:px-4 md:py-3 rounded-xl transition-colors flex items-center gap-2 text-sm md:text-base ${showDeleteConfirm ? 'bg-red-600 text-white hover:bg-red-700' : 'border border-red-200 text-red-500 hover:bg-red-50'}`}
              >
                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                {showDeleteConfirm ? '삭제 확인' : ''}
              </button>
            )}

            <div className="flex-1" />

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 md:px-6 md:py-3 border theme-border rounded-xl hover:bg-black/5 transition-colors theme-text-secondary text-sm md:text-base font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 md:px-6 md:py-3 text-white rounded-xl transition-all hover:opacity-90 shadow-lg shadow-blue-500/30 text-sm md:text-base font-medium"
              style={{ backgroundColor: 'var(--btn-bg)' }}
            >
              {isEditMode ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}