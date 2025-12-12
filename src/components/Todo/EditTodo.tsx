import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import type { Todo } from '../../types';

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl">{isEditMode ? '할 일 수정' : '할 일 추가'}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm mb-2">할 일</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="할 일을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)]"
              autoFocus
            />
          </div>

          {/* All Day Switch */}
          <div className="flex items-center justify-between py-2">
            <label className="text-sm">하루종일</label>
            <button
              type="button"
              onClick={() => setAllDay(!allDay)}
              className={`relative w-12 h-6 rounded-full transition-colors ${allDay ? '' : 'bg-gray-300'}`}
              style={{ backgroundColor: allDay ? 'var(--btn-bg)' : undefined }}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${allDay ? 'translate-x-6' : ''
                  }`}
              />
            </button>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm mb-2">시작 날짜</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (!allDay && new Date(e.target.value) > new Date(endDate)) {
                  setEndDate(e.target.value);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)]"
            />
          </div>

          {/* Start Time */}
          {!allDay && (
            <div>
              <label className="block text-sm mb-2">시작 시간</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)]"
              />
            </div>
          )}

          {/* End Date */}
          {!allDay && (
            <div>
              <label className="block text-sm mb-2">종료 날짜</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)]"
              />
            </div>
          )}

          {/* End Time */}
          {!allDay && (
            <div>
              <label className="block text-sm mb-2">종료 시간</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)]"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            {isEditMode && (
              <button
                type="button"
                onClick={handleDelete}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${showDeleteConfirm ? 'bg-red-600 text-white hover:bg-red-700' : 'border border-red-300 text-red-600 hover:bg-red-50'}`}
              >
                <Trash2 className="w-4 h-4" />
                {showDeleteConfirm ? '정말 삭제' : '삭제'}
              </button>
            )}

            <div className="flex-1" />

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white rounded-lg transition-colors hover:opacity-90"
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