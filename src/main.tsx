import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import MainPage from './pages/MainPage'
import PostPage from './pages/post/PostPage'
import TodoPage from './pages/todo/TodoPage'
import InviteAcceptPage from './pages/post/InviteAcceptPage';
import RoomJoinPage from './pages/post/RoomJoinPage';
import CommunityPage from './pages/community/CommunityPage';
import { MenuProvider } from './components/settings/menu/MenuSettings';

import { ThemeProvider } from './context/ThemeContext';
import MarketPage from './pages/market/MarketPage.tsx'

import ProfilePage from './pages/profile/my/ProfilePage'
import ProfileEditPage from './pages/profile/my/ProfileEditPage';
import PasswordChangePage from './pages/profile/PasswordChangePage';
import GetOutPage from './pages/profile/GetOutPage';
import InitialProfileSetup from './pages/auth/InitialProfileSetup';
import ChargePage from './pages/payment/ChargePage';
import PaymentSuccessPage from './pages/payment/PaymentSuccessPage';
import PaymentCancelPage from './pages/payment/PaymentCancelPage';
import PaymentFailPage from './pages/payment/PaymentFailPage';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const Backend = isMobile ? TouchBackend : HTML5Backend;
const backendOptions = isMobile ? { enableMouseEvents: true } : {};

import './assets/main.css'
import './assets/themes.css'
//import './assets/index.css'
import LoginPage from './pages/auth/LoginPage'
import JoinPage from './pages/auth/JoinPage'
import FindPasswordPage from './pages/auth/FindPasswordPage'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { TodoProvider } from './context/TodoContext'
import { CreditProvider } from './context/CreditContext'


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
const savedManualTextColor = localStorage.getItem('manualTextColor');
const savedManualTextIntensity = localStorage.getItem('manualTextIntensity');
const savedManualBgColor = localStorage.getItem('manualBgColor');
const savedManualBgIntensity = localStorage.getItem('manualBgIntensity');
const savedManualCardColor = localStorage.getItem('manualCardColor'); // New

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

if (savedManualCardColor) {
  const r = parseInt(savedManualCardColor.slice(1, 3), 16);
  const g = parseInt(savedManualCardColor.slice(3, 5), 16);
  const b = parseInt(savedManualCardColor.slice(5, 7), 16);
  document.documentElement.style.setProperty('--manual-card-color', `${r}, ${g}, ${b}`);
}

// Initialize manual background (Image priority > Gradient > Solid)
const savedManualBgImage = localStorage.getItem('manualBgImage');
const savedIsGradient = localStorage.getItem('manualIsGradient') === 'true';
const savedGradientDirection = localStorage.getItem('manualGradientDirection');
const savedGradientStartColor = localStorage.getItem('manualGradientStartColor');
const savedGradientEndColor = localStorage.getItem('manualGradientEndColor');

if (savedManualBgImage) {
  const savedBgSize = localStorage.getItem('manualBgSize') || 'cover';
  document.documentElement.style.setProperty('--manual-gradient', `url(${savedManualBgImage})`);
  document.documentElement.style.setProperty('--manual-bg-intensity', '0');
  document.documentElement.style.setProperty('--manual-bg-size', savedBgSize === 'repeat' ? 'auto' : savedBgSize);
  document.documentElement.style.setProperty('--manual-bg-repeat', savedBgSize === 'repeat' ? 'repeat' : 'no-repeat');
} else if (savedIsGradient && savedGradientDirection && savedGradientStartColor && savedGradientEndColor) {
  const gradientValue = `linear-gradient(${savedGradientDirection}, ${savedGradientStartColor}, ${savedGradientEndColor})`;
  document.documentElement.style.setProperty('--manual-gradient', gradientValue);
  document.documentElement.style.setProperty('--manual-bg-intensity', '0'); // Hide solid bg
  document.documentElement.style.setProperty('--manual-bg-size', 'cover');
  document.documentElement.style.setProperty('--manual-bg-repeat', 'no-repeat');
} else {
  document.documentElement.style.setProperty('--manual-gradient', 'none');
  document.documentElement.style.setProperty('--manual-bg-size', 'cover');
  document.documentElement.style.setProperty('--manual-bg-repeat', 'no-repeat');
}

// Initialize manual button color
const savedManualBtnColor = localStorage.getItem('manualBtnColor');
if (savedManualBtnColor) {
  document.documentElement.style.setProperty('--manual-btn-bg', savedManualBtnColor);
}

// Initialize manual button text color
const savedManualBtnTextColor = localStorage.getItem('manualBtnTextColor');
if (savedManualBtnTextColor) {
  document.documentElement.style.setProperty('--manual-btn-text', savedManualBtnTextColor);
}

import WelcomePage from './pages/WelcomePage';
import AnalysisPage from "./pages/profile/analysis/AnalysisPage.tsx";
import RoomCyclePage from './pages/post/RoomCyclePage';
import YearPage from './pages/post/season-greeting/YearPage';

const RootRouting = () => {
  const token = localStorage.getItem('accessToken');
  const defaultPage = localStorage.getItem('defaultPage') || '/home';

  if (token) {
    return <Navigate to={defaultPage} replace />;
  }
  return <WelcomePage />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRouting />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/join",
    element: <JoinPage />,
  },
  {
    path: "/find-password",
    element: <FindPasswordPage />,
  },
  {
    path: "/invite/:code",
    element: <InviteAcceptPage />,
  },
  {
    path: "/rooms/:roomId/join",
    element: <RoomJoinPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/home", element: <MainPage /> },
      { path: "/post", element: <PostPage /> },
      { path: "/cycles/:cycleId", element: <RoomCyclePage /> },
      { path: "/todo", element: <TodoPage /> },
      { path: "/community", element: <CommunityPage /> },
      { path: "/market", element: <MarketPage /> },
      { path: "/profile", element: <ProfilePage /> },
      { path: "/profile/edit", element: <ProfileEditPage /> },
      { path: "/profile/password", element: <PasswordChangePage /> },
      { path: "/profile/delete", element: <GetOutPage /> },
      { path: "/setup-profile", element: <InitialProfileSetup /> },
      { path: "/profile/analysis", element: <AnalysisPage /> },
      { path: "/season-greeting", element: <YearPage /> },
      { path: "/charge", element: <ChargePage /> },
      { path: "/payment/success", element: <PaymentSuccessPage /> },
      { path: "/payment/cancel", element: <PaymentCancelPage /> },
      { path: "/payment/fail", element: <PaymentFailPage /> },
    ]
  }
]);


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DndProvider backend={Backend} options={backendOptions}>
      <AuthProvider>
        <MenuProvider>
          <ThemeProvider>
            <CreditProvider>
              <TodoProvider>
                <RouterProvider router={router} />
              </TodoProvider>
            </CreditProvider>
          </ThemeProvider>
        </MenuProvider>
      </AuthProvider>
    </DndProvider>
  </StrictMode >,
);