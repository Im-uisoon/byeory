import { useState, useCallback } from 'react';
import { removeBackground, type Config } from '@imgly/background-removal';

interface UseBackgroundRemovalReturn {
    removeBg: (imageSource: string | Blob | File, options?: Config) => Promise<{ url: string; blob: Blob }>;
    isProcessing: boolean;
    error: string | null;
}

export const useBackgroundRemoval = (): UseBackgroundRemovalReturn => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const removeBg = useCallback(async (imageSource: string | Blob | File, options?: Config) => {
        setIsProcessing(true);
        setError(null);

        try {
            // Default configuration
            const config: Config = {
                debug: false,
                model: 'isnet', // Correct model name
                ...options
            };

            const blob = await removeBackground(imageSource, config);
            const url = URL.createObjectURL(blob);
            return { url, blob };
        } catch (err) {
            console.error("Background removal failed:", err);
            const errorMessage = err instanceof Error ? err.message : "배경 제거 중 오류가 발생했습니다.";
            setError(errorMessage);
            throw err;
        } finally {
            setIsProcessing(false);
        }
    }, []);

    return { removeBg, isProcessing, error };
};
