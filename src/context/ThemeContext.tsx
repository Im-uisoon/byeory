import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { applyThemeStyles, saveThemeToLocalStorage } from '../utils/theme';
import { API_BASE_URL } from '../api/config';

interface ThemeContextType {
    theme: string;
    setTheme: (theme: string) => void;
    refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isLoggedIn } = useAuth();
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'default';
    });

    const applyStyles = (mode: string, config?: any) => {
        applyThemeStyles(mode, config);
    };

    const saveToLocalStorage = (data: any) => {
        saveThemeToLocalStorage(data);
    };

    const fetchThemeSettings = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            const currentTheme = localStorage.getItem('theme') || 'default';
            applyStyles(currentTheme);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/setting/all`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.ok) {
                const data = await response.json();

                // Handle Theme
                if (data.theme) {
                    saveToLocalStorage(data);
                    setTheme(data.theme.mode);
                    applyStyles(data.theme.mode, data.theme);
                } else {
                    const currentTheme = localStorage.getItem('theme') || 'default';
                    applyStyles(currentTheme);
                }

                // Handle Default Page
                if (data.page && data.page.defaultPage) {
                    localStorage.setItem('defaultPage', data.page.defaultPage);
                }
            } else {
                const currentTheme = localStorage.getItem('theme') || 'default';
                applyStyles(currentTheme);
            }

            // Explicitly fetch page setting as requested
            try {
                const pageRes = await fetch(`${API_BASE_URL}/api/setting/page`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (pageRes.ok) {
                    const pageData = await pageRes.json();
                    if (pageData.defaultPage) {
                        localStorage.setItem('defaultPage', pageData.defaultPage);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch specific page setting", e);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            const currentTheme = localStorage.getItem('theme') || 'default';
            applyStyles(currentTheme);
        }
    };

    useEffect(() => {
        fetchThemeSettings();

        const handleStorageChange = () => {
            const storedTheme = localStorage.getItem('theme') || 'default';
            setTheme(storedTheme);
            applyStyles(storedTheme);
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('themeChange', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('themeChange', handleStorageChange);
        };
    }, [isLoggedIn]);

    const updateTheme = (newTheme: string) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        applyStyles(newTheme);

        // Tailwind Dark Mode Sync
        if (newTheme === 'dark' || newTheme === 'dracula') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        window.dispatchEvent(new Event('themeChange'));
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme: updateTheme, refreshTheme: fetchThemeSettings }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
