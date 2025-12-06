import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './assets/index.css';
import './assets/themes.css';
import HomePage from './HomePage.tsx';
import LoginPage from './pages/auth/LoginPage.tsx';
import JoinPage from './pages/auth/JoinPage.tsx';
import FindPasswordPage from './pages/auth/FindPasswordPage.tsx';
import PostPage from './pages/post/PostPage.tsx';
import TodoPage from './pages/todo/TodoPage.tsx';
import CommunityPage from './pages/community/CommunityPage.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import ProfilePage from './pages/profile/ProfilePage.tsx';

import { AuthProvider } from './contexts/AuthContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/join" element={<JoinPage />} />
            <Route path="/forgot-password" element={<FindPasswordPage />} />
            <Route path="/posts" element={<PostPage />} />
            <Route path="/todo" element={<TodoPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
