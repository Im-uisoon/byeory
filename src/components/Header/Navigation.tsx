import React, { useState } from 'react';
import SettingsModal from '../settings/Settings';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Settings, LogOut } from 'lucide-react';
import { useMenu } from '../settings/menu/MenuSettings';
import { useAuth } from '../../context/AuthContext';

const Navigation: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { isLoggedIn, logout } = useAuth();

    // Menu Context
    const { menuItems, isEditMode, setIsEditMode, moveMenuItem } = useMenu();
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const isActive = (path: string) => {
        if (path === '/' && location.pathname !== '/') return false;
        return location.pathname.startsWith(path);
    };

    // Drag and Drop Handlers
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (index: number) => {
        if (draggedIndex === null) return;
        if (draggedIndex !== index) {
            moveMenuItem(draggedIndex, index);
        }
        setDraggedIndex(null);
    };

    return (
        <>
            {/* Top Header */}
            <header className={`sticky top-0 z-50 flex justify-between items-center px-4 md:px-6 py-3 md:py-4 theme-bg-header shadow-sm border-b theme-border transition-colors duration-300`}>
                {/* Logo */}
                <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                    <img src="/logo.png" alt="Logo" className="w-18 md:w-20" />
                </div>

                {/* Desktop Center Navigation */}
                <nav className="hidden md:flex space-x-20">
                    {menuItems.map((item, index) => {
                        return (
                            <div
                                key={item.id}
                                draggable={isEditMode}
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(index)}
                                className={`relative rounded-lg transition-all duration-200 
                                ${isEditMode
                                        ? 'border-2 border-dashed border-primary/50 cursor-grab active:cursor-grabbing p-2 hover:bg-primary/5'
                                        : ''
                                    }`}
                            >
                                {isEditMode ? (
                                    <div className="flex items-center gap-2 px-2 pointer-events-none">
                                        <span className={`text-lg font-medium theme-text-secondary opacity-70`}>
                                            {item.name}
                                        </span>
                                    </div>
                                ) : (
                                    <Link
                                        to={item.path}
                                        className={`text-lg font-medium transition-colors duration-200 ${isActive(item.path)
                                            ? 'theme-text-primary font-bold'
                                            : 'theme-text-secondary hover:theme-text-primary'
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                )}
                            </div>
                        )
                    })}
                </nav>

                {/* Right Icons */}
                <div className="flex items-center space-x-2 md:space-x-4 theme-text-secondary">
                    <button
                        className="p-2 hover:bg-black/5 rounded-full transition-colors"
                        onClick={() => isLoggedIn ? logout() : navigate('/login')}
                        title={isLoggedIn ? "로그아웃" : "로그인"}
                    >
                        {isLoggedIn ? <LogOut className="w-5 h-5 md:w-6 md:h-6" /> : <User className="w-5 h-5 md:w-6 md:h-6" />}
                    </button>
                    <button
                        className="p-2 hover:bg-black/5 rounded-full transition-colors"
                        onClick={() => setIsSettingsOpen(true)}
                    >
                        <Settings className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>
            </header>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 theme-bg-header border-t theme-border z-50 pb-safe transition-colors duration-300">
                <div className="flex justify-around items-center h-16">
                    {menuItems.map((item) => {
                        const active = isActive(item.path);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${active ? 'theme-text-primary' : 'theme-text-secondary'
                                    }`}
                            >
                                <Icon className="w-6 h-6" />
                                <span className="text-[10px] font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onMenuEditMode={() => setIsEditMode(true)}
            />
        </>
    );
};

export default Navigation;
