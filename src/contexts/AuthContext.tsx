import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextType {
    isLoggedIn: boolean;
    userEmail: string | null;
    login: (email: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        // 초기 로딩 시 localStorage 체크
        const storedLogin = localStorage.getItem('isLoggedIn');
        const storedEmail = localStorage.getItem('userEmail');

        if (storedLogin === 'true' && storedEmail) {
            setIsLoggedIn(true);
            setUserEmail(storedEmail);
        }
    }, []);

    const login = (email: string) => {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        setIsLoggedIn(true);
        setUserEmail(email);
    };

    const logout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        setIsLoggedIn(false);
        setUserEmail(null);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, userEmail, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
