import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './assets/index.css';
import HomePage from './HomePage.tsx';
import LoginPage from './pages/auth/LoginPage.tsx';
import JoinPage from './pages/auth/JoinPage.tsx';
import PostPage from './pages/post/PostPage.tsx';
import TodoPage from './pages/todo/TodoPage.tsx';
import CommunityPage from './pages/community/CommunityPage.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/posts" element={<PostPage />} />
        <Route path="/todo" element={<TodoPage />} />
        <Route path="/community" element={<CommunityPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
