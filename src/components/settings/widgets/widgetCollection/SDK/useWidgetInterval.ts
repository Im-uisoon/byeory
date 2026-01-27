import { useEffect, useRef } from 'react';

/**
 * Hook for setting an interval that is safe to use in React components.
 * Automatically clears the interval when the component unmounts or delay changes.
 * 
 * @param callback Function to be called every interval
 * @param delay Delay in milliseconds, or null/undefined to pause
 */
export function useWidgetInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef(callback);

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        if (delay !== null) {
            const id = setInterval(() => savedCallback.current(), delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}
