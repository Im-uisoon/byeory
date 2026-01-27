import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Delete } from 'lucide-react';

interface ForcedPinInputModalProps {
    onSubmit: (pin: string) => Promise<string | null>;
    onUnlockRequest?: () => Promise<string | null>;
    isLocked?: boolean;
}

const ForcedPinInputModal: React.FC<ForcedPinInputModalProps> = ({
    onSubmit,
    onUnlockRequest,
    isLocked = false
}) => {
    const [pin, setPin] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    // Keypad numbers 0-9
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

    useEffect(() => {
        // Anti-tamper: Watch for removal of the overlay
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    const removedNodes = Array.from(mutation.removedNodes);
                    const isRemoved = removedNodes.some(node =>
                        node instanceof HTMLElement && node.id === 'pin-lock-overlay'
                    );

                    if (isRemoved) {
                        // Detected tampering, force reload
                        window.location.reload();
                    }
                }
            }
        });

        observer.observe(document.body, { childList: true });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (pin.length === 6) {
            handleSubmit(pin);
        } else if (pin.length > 0) {
            if (error) setError(null); // Clear error when user types
        }
    }, [pin]);

    const handleNumberClick = (num: number) => {
        if (pin.length < 6 && !isSubmitting) {
            setPin(prev => prev + num.toString());
        }
    };

    const handleDelete = () => {
        if (!isSubmitting) {
            setPin(prev => prev.slice(0, -1));
        }
    };

    const handleRequestCode = async () => {
        if (!onUnlockRequest || isSubmitting) return;
        setIsSubmitting(true);
        setError(null);
        setStatusMessage(null);
        try {
            const err = await onUnlockRequest();
            if (err) {
                setError(err);
            } else {
                setStatusMessage("인증코드가 발송되었습니다.");
            }
        } catch (e) {
            setError("인증코드 요청 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(true); // Keep it "submitting" for a bit or just false
            setTimeout(() => setIsSubmitting(false), 2000); // Prevent spam
        }
    };

    const handleSubmit = async (currentPin: string) => {
        setIsSubmitting(true);
        setError(null);
        setStatusMessage(null);
        try {
            const errorMsg = await onSubmit(currentPin);
            if (errorMsg) {
                // Failed
                setPin('');
                setError(errorMsg);
                setIsSubmitting(false); // Enable input again
            } else {
                // Success
                setPin('');
                setIsSubmitting(false);
                // Modal will presumably be closed by parent component upon success
            }
        } catch (error) {
            console.error('PIN submission error:', error);
            setPin('');
            setError('오류가 발생했습니다.');
            setIsSubmitting(false);
        }
    };

    return ReactDOM.createPortal(
        <div
            id="pin-lock-overlay"
            className="fixed inset-0 z-[9999] flex items-center justify-center w-screen h-screen overflow-hidden"
            style={{
                background: 'var(--bg-gradient)',
                backgroundColor: 'var(--bg-solid)',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
            }}
            onContextMenu={(e) => e.preventDefault()} // Basic right-click deterrent
        >
            {/* Background cover to ensure nothing behind is visible if theme is transparent */}
            <div className="absolute inset-0 bg-white dark:bg-gray-900 -z-10" />

            {/* Theme Background Layer (re-applying theme to be on top of white base) */}
            <div
                className="absolute inset-0 -z-5"
                style={{
                    background: 'var(--bg-gradient)',
                    backgroundColor: 'var(--bg-solid)',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                }}
            />

            {/* Transparent Container for Layout */}
            <div className="w-full max-w-[28rem] flex flex-col animate-scale-up mx-4">
                {/* Content */}
                <div className="px-4 pb-4 pt-10 text-center">
                    <h2 className="text-3xl font-bold mb-3 theme-text-primary drop-shadow-sm">
                        {isLocked ? "인증코드 입력" : "PIN 입력"}
                    </h2>
                    <p className="theme-text-secondary mb-2 font-medium opacity-90">
                        {isLocked ? "가입하신 메일을 통해 받은 인증코드를 입력해주세요" : "계정을 사용하려면 PIN을 입력하세요"}
                    </p>
                    <div className="h-6 mb-2">
                        {error && <p className="text-red-500 font-bold animate-shake drop-shadow-sm">{error}</p>}
                        {statusMessage && <p className="text-green-500 font-bold drop-shadow-sm">{statusMessage}</p>}
                    </div>

                    {/* PIN Input Boxes */}
                    <div className="flex justify-center gap-3 mb-6 mt-2">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-12 h-14 rounded-xl flex items-center justify-center text-3xl transition-all duration-200 backdrop-blur-sm ${i < pin.length
                                    ? 'bg-[var(--btn-bg)] text-white shadow-lg scale-105 border-transparent'
                                    : 'bg-white/20 dark:bg-black/20 border-2 theme-border'
                                    }`}
                            >
                                {i < pin.length && (
                                    <span className={`font-bold ${!isLocked ? 'translate-y-[0.15em] inline-block' : ''}`}>
                                        {isLocked ? pin[i] : '*'}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {isLocked && (
                        <button
                            onClick={handleRequestCode}
                            disabled={isSubmitting}
                            className="mb-4 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 theme-text-primary border theme-border transition-all text-sm font-medium disabled:opacity-50"
                        >
                            {statusMessage ? "인증코드 재요청" : "이메일로 인증코드 받기"}
                        </button>
                    )}
                </div>

                {/* Keypad */}
                <div className="p-4 grid grid-cols-3 gap-y-4 gap-x-6">
                    {numbers.slice(0, 9).map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumberClick(num)}
                            className="h-20 w-20 mx-auto flex items-center justify-center text-3xl font-medium rounded-full hover:bg-white/10 transition-all theme-text-primary active:scale-95 active:bg-white/20"
                            disabled={isSubmitting}
                        >
                            {num}
                        </button>
                    ))}
                    <div className="col-start-2">
                        <button
                            onClick={() => handleNumberClick(0)}
                            className="h-20 w-20 mx-auto flex items-center justify-center text-3xl font-medium rounded-full hover:bg-white/10 transition-all theme-text-primary active:scale-95 active:bg-white/20"
                            disabled={isSubmitting}
                        >
                            0
                        </button>
                    </div>
                    <div className="col-start-3">
                        <button
                            onClick={handleDelete}
                            className="h-20 w-20 mx-auto flex items-center justify-center rounded-full hover:bg-white/10 transition-all theme-text-primary active:scale-95 active:bg-white/20"
                            disabled={isSubmitting}
                        >
                            <Delete className="w-8 h-8" />
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ForcedPinInputModal;
