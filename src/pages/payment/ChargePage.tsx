import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Wallet, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useIsMobile } from '../../hooks';

const ChargePage: React.FC = () => {
    const navigate = useNavigate();
    const isMobile = useIsMobile();
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

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const chargeOptions = [
        { amount: 1000, price: 1000, bonus: 0 },
        { amount: 5000, price: 5000, bonus: 500 },
        { amount: 10000, price: 10000, bonus: 1500 },
        { amount: 30000, price: 30000, bonus: 5000 },
        { amount: 50000, price: 50000, bonus: 10000 },
    ];

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

    const handleCharge = async (option: any) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            showAlert('로그인 필요', '크레딧 충전을 위해 로그인이 필요합니다.', 'info');
            return;
        }

        setModalConfig({
            isOpen: true,
            title: '크레딧 충전 확인',
            message: `${option.price.toLocaleString()}원을 결제하고 ${option.amount.toLocaleString()} C (+보너스 ${option.bonus.toLocaleString()} C)를 충전하시겠습니까?`,
            type: 'info',
            singleButton: false,
            onConfirm: async () => {
                setModalConfig(prev => ({ ...prev, isOpen: false }));
                try {
                    const response = await fetch('http://localhost:8080/api/payment/ready', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ amount: option.amount + option.bonus })
                    });

                    if (!response.ok) throw new Error('Payment ready failed');

                    const data = await response.json();
                    localStorage.setItem('kakaopay_tid', data.tid);

                    // Choose redirect URL based on device
                    const redirectUrl = isMobile && data.next_redirect_mobile_url
                        ? data.next_redirect_mobile_url
                        : data.next_redirect_pc_url;

                    window.location.href = redirectUrl;

                } catch (e) {
                    console.error(e);
                    showAlert('오류 발생', '결제 준비 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'danger');
                }
            },
        });
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] pb-20 md:pb-0 animate-fade-in relative z-50">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-[var(--bg-header)]/80 backdrop-blur-md border-b border-[var(--border-color)] px-4 h-16 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-[var(--text-primary)]" />
                </button>
                <h1 className="text-lg font-bold text-[var(--text-primary)]">크레딧 충전</h1>
            </div>

            <main className="max-w-2xl mx-auto p-4 space-y-6 pt-6">
                {/* Banner */}
                <div className="bg-[var(--btn-bg)] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black mb-2">Credit Charge</h2>
                        <p className="opacity-90">필요한 만큼 크레딧을 충전하고<br />다양한 아이템을 구매해보세요!</p>
                    </div>
                    <Wallet className="absolute right-4 bottom-[-20px] w-32 h-32 text-white/10 rotate-[-15deg]" />
                </div>

                {/* Options Grid */}
                <div className="grid gap-3">
                    {chargeOptions.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleCharge(option)}
                            className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)] flex items-center justify-between hover:border-[var(--btn-bg)] transition-all group active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center group-hover:bg-[var(--btn-bg)]/10 transition-colors">
                                    <CreditCard className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--btn-bg)]" />
                                </div>
                                <div className="text-left">
                                    <span className="block font-bold text-lg text-[var(--text-primary)]">
                                        {option.amount.toLocaleString()} C
                                    </span>
                                    {option.bonus > 0 && (
                                        <span className="text-xs text-green-500 font-bold">
                                            +{option.bonus.toLocaleString()} Bonus
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-[var(--text-secondary)]">
                                    {option.price.toLocaleString()}원
                                </span>
                                <div className="w-6 h-6 rounded-full bg-[var(--btn-bg)] flex items-center justify-center">
                                    <ArrowLeft className="w-3 h-3 text-white rotate-180" />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Info Text */}
                <div className="flex items-start gap-2 p-4 bg-[var(--bg-secondary)]/50 rounded-xl text-xs text-[var(--text-secondary)]">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>
                        현재 결제 시스템은 준비 중입니다. 실제 결제는 이루어지지 않으며, 추후 업데이트될 예정입니다.
                        문의사항은 고객센터를 이용해주세요.
                    </p>
                </div>
            </main>

            <ConfirmationModal
                {...modalConfig}
                onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};

export default ChargePage;
