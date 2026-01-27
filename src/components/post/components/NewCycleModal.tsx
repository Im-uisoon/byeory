import React, { useState, useEffect } from "react";
import { X, BookOpen, ScrollText } from "lucide-react";
import { fetchRoomMembersApi } from "../api";
import { createCycleApi, type CycleType } from "../api/roomCycle";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  roomId: string | number;
  onSuccess: () => void;
  showConfirmModal?: (title: string, message: string, type?: 'info' | 'danger' | 'success', onConfirm?: () => void, singleButton?: boolean) => void;
}

const NewCycleModal: React.FC<Props> = ({
  isOpen,
  onClose,
  roomId,
  onSuccess,
  showConfirmModal
}) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<CycleType>("ROLLING_PAPER");
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMembers();
      setTitle("");
      setSelectedMemberIds([]);
      setType("ROLLING_PAPER");
    }
  }, [isOpen]);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const list = await fetchRoomMembersApi(String(roomId));
      setMembers(list);

      // Auto-select self? Or let user choose order from scratch.
      // Let's expect user to select order.
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMember = (userId: number) => {
    if (selectedMemberIds.includes(userId)) {
      setSelectedMemberIds((prev) => prev.filter((id) => id !== userId));
    } else {
      setSelectedMemberIds((prev) => [...prev, userId]);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      if (showConfirmModal) showConfirmModal("입력 확인", "활동 제목을 입력해주세요.", "danger", undefined, true);
      else alert("활동 제목을 입력해주세요.");
      return;
    }
    if (selectedMemberIds.length === 0) {
      if (showConfirmModal) showConfirmModal("입력 확인", "함께할 멤버를 최소 1명 이상 선택해주세요.", "danger", undefined, true);
      else alert("함께할 멤버를 최소 1명 이상 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createCycleApi(roomId, {
        title,
        type,
        targetMemberIds: selectedMemberIds,
        timeLimitHours: type === "EXCHANGE_DIARY" ? 24 : 720, // Default 30 days for RollingPaper to be safe
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      const errMsg = error.message || "활동 생성 중 오류가 발생했습니다.";
      if (showConfirmModal) showConfirmModal("생성 실패", errMsg, "danger", undefined, true);
      else alert(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--bg-modal)] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-[var(--border-color)] max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <h3 className="font-bold text-lg text-[var(--text-primary)]">
            새로운 활동 시작하기
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-card-secondary)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
              제목
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 우리들의 교환일기, 롤링페이퍼"
              className="w-full p-3 rounded-xl bg-[var(--bg-card-secondary)] border border-[var(--border-color)] focus:border-indigo-500 outline-none transition-colors"
            />
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
              활동 유형
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setType("ROLLING_PAPER")}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === "ROLLING_PAPER"
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                  : "bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)]"
                  }`}
              >
                <ScrollText size={24} />
                <span className="font-bold text-sm">롤링페이퍼</span>
              </button>
              <button
                onClick={() => setType("EXCHANGE_DIARY")}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === "EXCHANGE_DIARY"
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                  : "bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)]"
                  }`}
              >
                <BookOpen size={24} />
                <span className="font-bold text-sm">교환일기</span>
              </button>
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mt-2 pl-1">
              {type === "ROLLING_PAPER"
                ? "한 사람씩 글을 작성하고 다음 사람에게 넘깁니다. 모두 작성하면 내용이 공개됩니다."
                : "순서대로 일기를 작성합니다. 내 차례에만 작성할 수 있으며, 모두 완료되면 전체 공개됩니다."}
            </p>
          </div>

          {/* Member Selection (Simple Order) */}
          <div>
            <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
              참여 멤버 및 순서 ({selectedMemberIds.length}명)
            </label>
            <p className="text-xs text-[var(--text-secondary)] mb-3">
              클릭하여 순서대로 선택해주세요.
            </p>

            {isLoading ? (
              <div className="py-4 text-center text-sm text-[var(--text-tertiary)]">
                멤버 불러오는 중...
              </div>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                {members.map((member) => {
                  const selectedIndex = selectedMemberIds.indexOf(
                    member.userId
                  );
                  const isSelected = selectedIndex !== -1;

                  return (
                    <div
                      key={member.userId}
                      onClick={() => handleToggleMember(member.userId)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                        ? "bg-indigo-50 border-indigo-200"
                        : "bg-[var(--bg-card-secondary)] border-[var(--border-color)] hover:border-indigo-300"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isSelected
                            ? "bg-indigo-200 text-indigo-700"
                            : "bg-gray-200 text-gray-500"
                            }`}
                        >
                          {member.nickname?.substring(0, 2).toUpperCase()}
                        </div>
                        <span
                          className={`text-sm font-medium ${isSelected
                            ? "text-indigo-900"
                            : "text-[var(--text-primary)]"
                            }`}
                        >
                          {member.nickname}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-indigo-500 text-white px-2 py-0.5 rounded-full">
                            {selectedIndex + 1}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-[var(--border-color)] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)] transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !title || selectedMemberIds.length === 0}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:shadow-none"
          >
            {isSubmitting ? "생성 중..." : "활동 시작하기"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewCycleModal;
