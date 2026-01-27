import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Delete } from 'lucide-react';

interface PinInputModalProps {
    title?: string;
    subtitle?: string;
    isLocked?: boolean;
    onClose: () => void;
    onSubmit: (pin: string) => Promise<string | null>;
    onUnlockRequest?: () => Promise<string | null>;
}

const PinInputModal: React.FC<PinInputModalProps> = ({
    title = "PIN 설정",
    subtitle = "6자리 숫자를 입력하세요",
    isLocked = false,
    onClose,
    onSubmit,
    onUnlockRequest
}) => {
    const [pin, setPin] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    // Keypad numbers 0-9
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

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
            setIsSubmitting(false);
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
                setIsSubmitting(false); // Enable input again (in case modal stays open for next step)
            }
        } catch (error) {
            console.error('PIN submission error:', error);
            setPin('');
            setError('오류가 발생했습니다.');
            setIsSubmitting(false);
        }
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[2px] animate-fade-in px-4">
            <div className="theme-bg-card rounded-[2.5rem] w-full max-w-sm overflow-hidden flex flex-col shadow-2xl animate-scale-up border theme-border">
                {/* Header */}
                <div className="p-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-6 h-6 theme-text-secondary" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-8 pb-4 text-center">
                    <h2 className="text-3xl font-bold mb-2 theme-text-primary tracking-tight">{title}</h2>
                    <p className="theme-text-secondary mb-2 font-medium opacity-80 text-sm leading-relaxed">{subtitle}</p>
                    <div className="h-6 mb-4">
                        {error && <p className="text-red-500 font-bold animate-shake text-sm drop-shadow-sm">{error}</p>}
                        {statusMessage && <p className="text-green-500 font-bold text-sm drop-shadow-sm">{statusMessage}</p>}
                    </div>

                    {/* PIN Dots or Digits */}
                    <div className="flex justify-center gap-3 mb-6 mt-2">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className={`transition-all duration-300 flex items-center justify-center ${isLocked
                                    ? `w-10 h-13 rounded-2xl text-xl font-bold ${i < pin.length
                                        ? 'bg-[var(--btn-bg)] text-white shadow-lg scale-105 border-transparent'
                                        : 'bg-black/5 dark:bg-white/5 border-2 border-dashed theme-border'
                                    }`
                                    : `w-4 h-4 rounded-full ${i < pin.length
                                        ? error ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-[var(--btn-bg)] scale-125 shadow-md shadow-[var(--btn-bg)]/30'
                                        : 'bg-black/10 dark:bg-white/10'
                                    }`
                                    }`}
                            >
                                {isLocked && i < pin.length && (
                                    <span className="animate-in fade-in zoom-in duration-200">{pin[i]}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {isLocked && (
                        <button
                            onClick={handleRequestCode}
                            disabled={isSubmitting}
                            className="mb-4 px-6 py-2 rounded-full theme-bg-subtle hover:bg-black/10 dark:hover:bg-white/10 theme-text-primary border theme-border transition-all text-xs font-semibold disabled:opacity-50"
                        >
                            {statusMessage ? "인증코드 재요청" : "이메일로 인증코드 받기"}
                        </button>
                    )}
                </div>

                {/* Keypad */}
                <div className="theme-bg-card border-t theme-border p-8 grid grid-cols-3 gap-y-4 gap-x-6">
                    {numbers.slice(0, 9).map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumberClick(num)}
                            className="h-14 flex items-center justify-center text-2xl font-semibold rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all theme-text-primary active:scale-90 hover:scale-105"
                            disabled={isSubmitting}
                        >
                            {num}
                        </button>
                    ))}
                    <div className="col-start-1" /> {/* Spacer */}
                    <button
                        onClick={() => handleNumberClick(0)}
                        className="h-14 flex items-center justify-center text-2xl font-semibold rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all theme-text-primary active:scale-90 hover:scale-105"
                        disabled={isSubmitting}
                    >
                        0
                    </button>
                    <button
                        onClick={handleDelete}
                        className="h-14 flex items-center justify-center rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all theme-text-primary active:scale-90 hover:scale-105"
                        disabled={isSubmitting}
                        aria-label="Delete"
                    >
                        <Delete className="w-7 h-7 opacity-70" />
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PinInputModal;
