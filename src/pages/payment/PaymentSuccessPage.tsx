import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useCredits } from '../../context/CreditContext';
import { API_BASE_URL } from '../../api/config';

const PaymentSuccessPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { refreshCredits } = useCredits();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const calledRef = React.useRef(false);

    useEffect(() => {
        const approvePayment = async () => {
            if (calledRef.current) return;
            calledRef.current = true;

            const pg_token = searchParams.get('pg_token');
            const tid = localStorage.getItem('kakaopay_tid');

            if (!pg_token || !tid) {
                setError('결제 정보를 찾을 수 없습니다.');
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`${API_BASE_URL}/api/payment/approve`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ pg_token, tid })
                });

                if (response.ok) {
                    await refreshCredits();
                    localStorage.removeItem('kakaopay_tid');
                    setLoading(false);
                } else {
                    const errorData = await response.json();
                    // Handle "already done" as success if tid matches
                    if (errorData.error_code === -702) {
                        await refreshCredits();
                        localStorage.removeItem('kakaopay_tid');
                        setLoading(false);
                    } else {
                        throw new Error('Payment approval failed');
                    }
                }
            } catch (e) {
                console.error(e);
                setError('결제 승인 처리 중 오류가 발생했습니다.');
                setLoading(false);
            }
        };

        approvePayment();
    }, [searchParams, refreshCredits]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-4">
                <Loader2 className="w-12 h-12 text-[var(--btn-bg)] animate-spin mb-4" />
                <p className="text-[var(--text-primary)] font-medium">결제 승인을 처리 중입니다...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">결제 실패</h1>
                <p className="text-[var(--text-secondary)] mb-8">{error}</p>
                <div className="w-full max-w-xs space-y-3">
                    <button
                        onClick={() => navigate('/charge')}
                        className="w-full py-4 bg-[var(--btn-bg)] text-white font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all"
                    >
                        다시 시도하기
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-4 bg-[var(--bg-secondary)] text-[var(--text-primary)] font-bold rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] active:scale-95 transition-all"
                    >
                        홈으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">결제 완료! 🎉</h1>
            <p className="text-[var(--text-secondary)] mb-8">
                크레딧 충전이 성공적으로 완료되었습니다.<br />
                이제 다양한 아이템을 구매해보세요!
            </p>
            <button
                onClick={() => navigate('/')}
                className="w-full max-w-xs py-4 bg-[var(--btn-bg)] text-white font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
                홈으로 돌아가기
            </button>
        </div>
    );
};

export default PaymentSuccessPage;
