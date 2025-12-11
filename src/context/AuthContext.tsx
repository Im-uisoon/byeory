import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    isLoggedIn: boolean;
    login: (email: string) => void;
    logout: () => void;
    user: { email: string } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<{ email: string } | null>(null);

    useEffect(() => {
        const storedLogin = localStorage.getItem('isLoggedIn');
        const storedEmail = localStorage.getItem('userEmail');
        if (storedLogin === 'true') {
            setIsLoggedIn(true);
            setUser({ email: storedEmail || '' });
        }
    }, []);

    const login = (email: string) => {
        setIsLoggedIn(true);
        setUser({ email });
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
    };

    const logout = () => {
        setIsLoggedIn(false);
        setUser(null);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout, user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
