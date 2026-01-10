import React, { useState } from 'react';
import { API_BASE_URL } from "@/config";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HeartCrack, ArrowLeft, ShieldAlert } from 'lucide-react';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const GetOutPage: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth(); // user is no longer needed for verification
    const [inputConfirmation, setInputConfirmation] = useState("");

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type?: 'info' | 'danger' | 'success';
        singleButton?: boolean;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    const closeConfirmModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleDelete = async () => {
        if (inputConfirmation !== "탈퇴합니다") return;

        // Custom Confirmation Logic
        setConfirmModal({
            isOpen: true,
            title: "정말 떠나시나요?",
            message: "정말로 탈퇴하시겠습니까? 돌이킬 수 없습니다.",
            type: 'danger',
            singleButton: false, // Two buttons for confirmation
            onConfirm: async () => {
                closeConfirmModal(); // Close modal first
                await executeDelete();
            }
        });
    };

    const executeDelete = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/api/user`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setConfirmModal({
                    isOpen: true,
                    title: "안녕히 가세요",
                    message: "그동안 벼리를 이용해주셔서 감사합니다.\n부디 좋은 기억으로 남기를 바랍니다.",
                    type: 'success',
                    singleButton: true,
                    onConfirm: () => {
                        logout(); // Clears local storage
                        navigate('/');
                    }
                });
            } else {
                const msg = await response.text();
                setConfirmModal({
                    isOpen: true,
                    title: "탈퇴 실패",
                    message: "탈퇴 처리에 실패했습니다: " + msg,
                    type: 'danger',
                    singleButton: true,
                    onConfirm: closeConfirmModal
                });
            }
        } catch (e) {
            console.error("Delete error", e);
            setConfirmModal({
                isOpen: true,
                title: "오류 발생",
                message: "서버 통신 오류가 발생했습니다.",
                type: 'danger',
                singleButton: true,
                onConfirm: closeConfirmModal
            });
        }
    };

    return (
        <div className="min-h-screen pt-20 px-4 pb-12 animate-fade-in">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full theme-bg-card theme-border border hover:opacity-80 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 theme-text-primary" />
                    </button>
                    <h1 className="text-2xl font-bold theme-text-primary">회원 탈퇴</h1>
                </div>

                {/* Emotional Appeal Section */}
                <div className="rounded-2xl p-8 shadow-lg theme-bg-card theme-border border text-center space-y-6">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto animate-pulse theme-bg-card-secondary">
                        <HeartCrack className="w-12 h-12 theme-icon" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-xl font-bold theme-text-primary">정말 떠나시나요?</h2>
                        <p className="theme-text-secondary leading-relaxed">
                            벼리와 함께한 소중한 추억들이 모두 사라지게 됩니다.<br />
                            작성하신 일기, 감정 분석 데이터, 획득한 배지 등<br />
                            <span className="font-bold theme-text-primary">모든 데이터가 영구적으로 삭제</span>되며 복구할 수 없습니다.
                        </p>
                    </div>

                    <div className="rounded-xl p-6 text-left space-y-3 theme-bg-card-secondary">
                        <h3 className="font-bold theme-text-primary flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 theme-icon" />
                            탈퇴 전 확인해주세요
                        </h3>
                        <ul className="text-sm theme-text-secondary space-y-2 list-disc list-inside">
                            <li>현재 계정의 모든 정보가 즉시 삭제됩니다.</li>
                            <li>같은 아이디로 재가입하더라도 데이터는 복구되지 않습니다.</li>
                            <li>작성하신 공개 게시글 등은 자동으로 삭제되지 않을 수 있습니다.</li>
                        </ul>
                    </div>
                </div>

                {/* Verification Section */}
                <div className="rounded-2xl p-6 shadow-sm theme-bg-card theme-border border space-y-6">
                    <h3 className="font-bold theme-text-primary text-lg">탈퇴 확인</h3>

                    <div className="space-y-4">
                        <p className="text-sm theme-text-secondary">
                            탈퇴를 원하시면 아래 입력창에 <span className="font-bold theme-text-primary">탈퇴합니다</span> 라고 입력해주세요.
                        </p>
                        <input
                            type="text"
                            value={inputConfirmation}
                            onChange={(e) => setInputConfirmation(e.target.value)}
                            placeholder="탈퇴합니다"
                            className="w-full p-4 rounded-xl theme-bg-card-secondary theme-border border focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all theme-text-primary"
                            style={{ '--tw-ring-color': 'var(--btn-bg)' } as React.CSSProperties}
                        />
                    </div>

                    <button
                        onClick={handleDelete}
                        disabled={inputConfirmation !== "탈퇴합니다"}
                        className={`w-full py-4 rounded-xl font-bold transition-all transform active:scale-[0.98] theme-btn ${inputConfirmation !== "탈퇴합니다" ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                            }`}
                    >
                        회원 탈퇴하기
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        className="w-full py-4 rounded-xl font-medium theme-text-secondary hover:opacity-80 transition-opacity theme-bg-card-secondary"
                    >
                        마음이 바뀌었어요 (돌아가기)
                    </button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                singleButton={confirmModal.singleButton}
                onConfirm={() => {
                    confirmModal.onConfirm();
                }}
                onCancel={closeConfirmModal}
            />
        </div>
    );
};

export default GetOutPage;