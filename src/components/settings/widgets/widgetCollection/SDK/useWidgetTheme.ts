import { useTheme } from '../../../../../context/ThemeContext';

/**
 * Hook to access current theme settings effectively.
 * returns { theme, isDark, toggleTheme, ... }
 */
export function useWidgetTheme() {
    const context = useTheme();

    // Abstracting check for dark mode if not directly provided
    const isDark = context.theme === 'dark' || context.theme === 'midnight' || context.theme === 'forest';

    return {
        ...context,
        isDark,
        // Helper specifically for widgets to get standardized colors
        getWidgetBg: () => isDark ? 'bg-zinc-800' : 'bg-white',
        getWidgetText: () => isDark ? 'text-zinc-100' : 'text-gray-900',
    };
}
