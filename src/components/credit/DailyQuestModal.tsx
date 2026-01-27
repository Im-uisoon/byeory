import React, { useState } from 'react';
import { X, Coins, Check, Clock, PlayCircle, ShoppingBag, PenTool, Wallet } from 'lucide-react';
import { useCredits } from '../../context/CreditContext';
import type { DailyQuest } from '../../types/credit';
import { useNavigate } from 'react-router-dom';

interface DailyQuestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

import ConfirmationModal from '../common/ConfirmationModal';

const DailyQuestModal: React.FC<DailyQuestModalProps> = ({ isOpen, onClose }) => {
    const { credits, addCredits, dailyQuests, claimQuest, resetTime } = useCredits();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'quests' | 'shop'>('quests');
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: React.ReactNode;
        type?: 'info' | 'danger' | 'success';
        onConfirm: () => void;
        singleButton?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    if (!isOpen) return null;

    const showAlert = (title: string, message: string, type: 'info' | 'danger' | 'success' = 'info') => {
        setModalConfig({
            isOpen: true,
            title,
            message,
            type,
            singleButton: true,
            onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false })),
        });
    };

    const handleClaim = async (quest: DailyQuest) => {
        if (!quest.isCompleted && quest.isClaimable) {
            try {
                await claimQuest(quest.id);
                showAlert('보상 수령 완료', `${quest.reward} 크레딧을 받았습니다!`, 'success');
            } catch (e: any) {
                showAlert('수령 실패', e.message || '보상을 수령할 수 없습니다.', 'danger');
            }
        }
    };

    const handleGo = (quest: DailyQuest) => {
        onClose();
        if (quest.type === 'widget') {
            navigate('/home');
        } else if (quest.type === 'post') {
            navigate('/post');
        } else {
            // Default action or specific logic for other types
            navigate('/home');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="theme-bg-modal border theme-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b theme-border theme-bg-header shrink-0">
                    <h2 className="text-xl font-bold theme-text-primary flex items-center gap-2">
                        <Coins className="w-5 h-5 text-yellow-500" />
                        일일 퀘스트
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black/5 rounded-full transition-colors theme-text-secondary"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Credit Balance & Reset Timer */}
                <div className="bg-[var(--bg-card-secondary)] p-6 flex flex-col items-center justify-center shrink-0">
                    <div className="text-4xl font-black theme-text-primary font-mono mb-2 flex items-center gap-2">
                        <Coins className="w-8 h-8 text-yellow-500 fill-yellow-500/20" />
                        {credits.toLocaleString()}
                    </div>
                    <div className="text-xs theme-text-secondary font-medium flex items-center gap-1 bg-black/5 px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3" />
                        {resetTime} 후 초기화 (KST)
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b theme-border shrink-0">
                    <button
                        className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'quests' ? 'theme-text-primary border-b-2 border-primary theme-bg-modal' : 'theme-text-secondary bg-[var(--bg-card-secondary)] hover:theme-bg-card'}`}
                        onClick={() => setActiveTab('quests')}
                    >
                        퀘스트 목록
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'shop' ? 'theme-text-primary border-b-2 border-primary theme-bg-modal' : 'theme-text-secondary bg-[var(--bg-card-secondary)] hover:theme-bg-card'}`}
                        onClick={() => setActiveTab('shop')}
                    >
                        크레딧샵
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {activeTab === 'quests' ? (
                        <div className="space-y-3">
                            {dailyQuests.map((quest) => (
                                <div key={quest.id} className="flex items-center justify-between p-3 rounded-xl border theme-border bg-[var(--bg-card)]/50 hover:bg-[var(--bg-card)] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${quest.isCompleted ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                            {quest.type === 'login' && <Clock className="w-5 h-5" />}
                                            {quest.type === 'time' && <Clock className="w-5 h-5" />}
                                            {quest.type === 'widget' && <PlayCircle className="w-5 h-5" />}
                                            {quest.type === 'post' && <PenTool className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="font-bold theme-text-primary text-sm">{quest.description}</div>
                                            <div className="text-xs theme-text-secondary font-mono">+{quest.reward} C</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {quest.isCompleted ? (
                                            <button disabled className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-600 text-xs font-bold border border-green-500/20 flex items-center gap-1 cursor-default">
                                                <Check className="w-3 h-3" /> 완료
                                            </button>
                                        ) : quest.isClaimable ? (
                                            <button
                                                onClick={() => handleClaim(quest)}
                                                className="px-4 py-1.5 rounded-lg bg-yellow-500 text-white text-xs font-bold shadow-sm hover:bg-yellow-600 active:scale-95 transition-all animate-pulse-soft"
                                            >
                                                받기
                                            </button>
                                        ) : quest.type === 'time' ? (
                                            <button disabled className="px-3 py-1.5 rounded-lg theme-bg-card-secondary theme-text-secondary border theme-border text-xs font-bold cursor-not-allowed opacity-70">
                                                진행 중
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleGo(quest)}
                                                className="px-3 py-1.5 rounded-lg theme-btn border border-primary/30 text-xs font-bold hover:brightness-110 active:scale-95 transition-all"
                                            >
                                                이동
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Market Link */}
                            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border theme-border flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold theme-text-primary text-sm">아이템 마켓 방문하기</h3>
                                    <p className="text-xs theme-text-secondary mt-1">크레딧으로 스티커와 테마를 구매하세요!</p>
                                </div>
                                <button
                                    onClick={() => { onClose(); navigate('/market'); }}
                                    className="p-2 theme-bg-card rounded-lg border theme-border shadow-sm hover:scale-105 transition-transform"
                                >
                                    <ShoppingBag className="w-5 h-5 text-purple-500" />
                                </button>
                            </div>

                            <div className="border-t theme-border pt-4">
                                <h3 className="text-sm font-bold theme-text-secondary mb-3 uppercase tracking-wider">크레딧 충전</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => {
                                            onClose();
                                            navigate('/charge');
                                        }}
                                        className="w-full flex items-center justify-between p-4 rounded-xl bg-[var(--bg-card)] border theme-border hover:border-primary/50 transition-all hover:shadow-md group mb-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Wallet className="w-6 h-6 text-yellow-500" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold theme-text-primary">크레딧 충전소</div>
                                                <div className="text-xs theme-text-secondary">전체 상품 보기</div>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1.5 rounded-lg bg-[var(--btn-bg)] text-white text-xs font-bold shadow-sm group-hover:brightness-110 transition-all">
                                            이동
                                        </div>
                                    </button>

                                    <h3 className="text-xs font-bold theme-text-secondary mb-2 uppercase tracking-wider flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> 빠른 충전 (Test)
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { amount: 1000, price: '₩1,000', color: 'bg-blue-500' },
                                            { amount: 5000, price: '₩5,000', color: 'bg-purple-500' },
                                            { amount: 10000, price: '₩10,000', color: 'bg-pink-500', popular: true },
                                            { amount: 30000, price: '₩30,000', color: 'bg-yellow-500' },
                                        ].map((item, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setModalConfig({
                                                        isOpen: true,
                                                        title: '빠른 충전 확인',
                                                        message: `[테스트 결제] 💳\n${item.price}으로 ${item.amount} 크레딧을 충전하시겠습니까?`,
                                                        type: 'info',
                                                        singleButton: false,
                                                        onConfirm: async () => {
                                                            try {
                                                                await addCredits(item.amount);
                                                                setModalConfig(prev => ({ ...prev, isOpen: false }));
                                                                showAlert('충전 완료', `${item.amount} 크레딧이 충전되었습니다!`, 'success');
                                                            } catch (e) {
                                                                showAlert('충전 실패', '크레딧 충전 중 오류가 발생했습니다.', 'danger');
                                                            }
                                                        },
                                                    });
                                                }}
                                                className="relative group p-3 rounded-xl border theme-border bg-[var(--bg-card)] hover:border-primary/50 transition-all flex items-center gap-3 text-left"
                                            >
                                                <div className={`w-8 h-8 rounded-full ${item.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0`}>
                                                    <Coins className={`w-4 h-4 ${item.color.replace('bg-', 'text-')}`} />
                                                </div>
                                                <div>
                                                    <div className="font-bold theme-text-primary text-sm font-mono">{item.amount} C</div>
                                                    <div className="text-[10px] theme-text-secondary">{item.price}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationModal
                {...modalConfig}
                onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};

export default DailyQuestModal;
