import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import MainPage from './pages/MainPage'
import Post from './pages/post/Post'
import Todo from './pages/todo/Todo'
import Community from './pages/community/Community'
import './assets/main.css'
import './assets/themes.css'
import LoginPage from './pages/auth/LoginPage'
import JoinPage from './pages/auth/JoinPage'
import FindPasswordPage from './pages/auth/FindPasswordPage'
import { AuthProvider } from './context/AuthContext'

// Initialize theme from localStorage
const savedTheme = localStorage.getItem('theme') || 'default';
document.documentElement.setAttribute('data-theme', savedTheme);

// Initialize font settings from localStorage
const savedFontFamily = localStorage.getItem('fontFamily');
const savedFontSize = localStorage.getItem('fontSize');

if (savedFontFamily) {
  document.documentElement.style.setProperty('--font-family', savedFontFamily);
}
if (savedFontSize) {
  document.documentElement.style.setProperty('--font-size', savedFontSize);
}

// Initialize manual theme settings
// Initialize manual theme settings
const savedManualTextColor = localStorage.getItem('manualTextColor');
const savedManualTextIntensity = localStorage.getItem('manualTextIntensity');
const savedManualBgColor = localStorage.getItem('manualBgColor');
const savedManualBgIntensity = localStorage.getItem('manualBgIntensity');

if (savedManualTextColor) {
  const r = parseInt(savedManualTextColor.slice(1, 3), 16);
  const g = parseInt(savedManualTextColor.slice(3, 5), 16);
  const b = parseInt(savedManualTextColor.slice(5, 7), 16);
  document.documentElement.style.setProperty('--manual-text-color', `${r}, ${g}, ${b}`);
}

if (savedManualTextIntensity) {
  document.documentElement.style.setProperty('--manual-text-intensity', `${parseInt(savedManualTextIntensity) / 100}`);
}

if (savedManualBgColor) {
  const r = parseInt(savedManualBgColor.slice(1, 3), 16);
  const g = parseInt(savedManualBgColor.slice(3, 5), 16);
  const b = parseInt(savedManualBgColor.slice(5, 7), 16);
  document.documentElement.style.setProperty('--manual-bg-color', `${r}, ${g}, ${b}`);
}

if (savedManualBgIntensity) {
  document.documentElement.style.setProperty('--manual-bg-intensity', `${parseInt(savedManualBgIntensity) / 100}`);
}

if (savedManualBgIntensity) {
  document.documentElement.style.setProperty('--manual-bg-intensity', `${parseInt(savedManualBgIntensity) / 100}`);
}

// Initialize manual gradient settings
const savedIsGradient = localStorage.getItem('manualIsGradient') === 'true';
const savedGradientDirection = localStorage.getItem('manualGradientDirection');
const savedGradientStartColor = localStorage.getItem('manualGradientStartColor');
const savedGradientEndColor = localStorage.getItem('manualGradientEndColor');

if (savedIsGradient && savedGradientDirection && savedGradientStartColor && savedGradientEndColor) {
  const gradientValue = `linear-gradient(${savedGradientDirection}, ${savedGradientStartColor}, ${savedGradientEndColor})`;
  document.documentElement.style.setProperty('--manual-gradient', gradientValue);
  document.documentElement.style.setProperty('--manual-bg-intensity', '0'); // Hide solid bg
} else {
  document.documentElement.style.setProperty('--manual-gradient', 'none');
}

const RootRedirector = () => {
  const defaultPage = localStorage.getItem('defaultPage') || '/home';
  return <Navigate to={defaultPage} replace />;
};

import { MenuProvider } from './components/settings/menu/MenuSettings';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MenuProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirector />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/join" element={<JoinPage />} />
            <Route path="/find-password" element={<FindPasswordPage />} />
            <Route path="/home" element={<MainPage />} />
            <Route path="/post" element={<Post />} />
            <Route path="/todo" element={<Todo />} />
            <Route path="/community" element={<Community />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </MenuProvider>
  </StrictMode >,
);

