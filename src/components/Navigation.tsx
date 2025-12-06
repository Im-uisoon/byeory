import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import SettingsModal from './settings/SettingsModal';

function Navigation() {
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      {/* PC 버전 네비게이션 - 상단 고정 */}
      <div
        className="fixed top-0 right-0 left-0 z-50 hidden px-20 py-3 shadow-lg md:block"
        style={{
          backgroundColor: 'var(--nav-bg)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="flex items-center justify-between select-none">
          {/* 홈 로고 */}
          <Link to="/">
            <img src="/logo.png" alt="벼리" className="w-25" />
          </Link>

          {/* PC 내비게이션 메뉴 - 텍스트만 표시 */}
          <div className="flex items-center gap-15">
            <Link
              to="/"
              style={{
                color: location.pathname === '/' ? 'var(--accent-primary)' : 'var(--text-muted)',
              }}
              className="transition-colors"
              onMouseEnter={(e) => {
                if (location.pathname !== '/') {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== '/') {
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              Home
            </Link>
            <Link
              to="/posts"
              style={{
                color: location.pathname === '/posts' ? 'var(--accent-primary)' : 'var(--text-muted)',
              }}
              className="transition-colors"
              onMouseEnter={(e) => {
                if (location.pathname !== '/posts') {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== '/posts') {
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              포스트
            </Link>
            <Link
              to="/todo"
              style={{
                color: location.pathname === '/todo' ? 'var(--accent-primary)' : 'var(--text-muted)',
              }}
              className="transition-colors"
              onMouseEnter={(e) => {
                if (location.pathname !== '/todo') {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== '/todo') {
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              Todo
            </Link>
            <Link
              to="/community"
              style={{
                color: location.pathname === '/community' ? 'var(--accent-primary)' : 'var(--text-muted)',
              }}
              className="transition-colors"
              onMouseEnter={(e) => {
                if (location.pathname !== '/community') {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== '/community') {
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              커뮤니티
            </Link>
          </div>

          {/* 사용자 아이콘 영역 */}
          <div className="flex items-center gap-4">
            <Link to="/profile">
              <button
                className="rounded-full p-2 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--button-hover-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>
            </Link>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="rounded-full p-2 transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--button-hover-bg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 버전 상단 네비게이션 */}
      <div
        className="fixed top-0 right-0 left-0 z-50 px-4 py-3 shadow-lg md:hidden"
        style={{
          backgroundColor: 'var(--nav-bg)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="flex items-center justify-between select-none">
          {/* 홈 로고 */}
          <Link to="/">
            <img src="/logo.png" alt="벼리" className="w-20" />
          </Link>

          {/* 사용자 아이콘 영역 */}

          <div className="flex items-center gap-3">
            <Link to="/profile">
              <button
                className="rounded-full p-2 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--button-hover-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>
            </Link>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="rounded-full p-2 transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--button-hover-bg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        </div>
      </div >

      {/* 모바일 버전 네비게이션 - 하단 고정 */}
      < div
        className="fixed right-0 bottom-0 left-0 z-50 shadow-lg md:hidden"
        style={{
          backgroundColor: 'var(--nav-bg)',
          borderTop: '1px solid var(--border-color)',
        }
        }
      >
        <div className="flex items-center justify-around py-2">
          {/* Home 버튼 */}
          <Link
            to="/"
            className="flex flex-col items-center gap-1 px-4 py-2 transition-colors"
            style={{
              color: location.pathname === '/' ? 'var(--accent-primary)' : 'var(--text-muted)',
            }}
            onMouseEnter={(e) => {
              if (location.pathname !== '/') {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/') {
                e.currentTarget.style.color = 'var(--text-muted)';
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-house h-6 w-6">
              <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
              <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
            <span className="text-xs">Home</span>
          </Link>

          {/* 포스트 버튼 */}
          <Link
            to="/posts"
            className="flex flex-col items-center gap-1 px-4 py-2 transition-colors"
            style={{
              color: location.pathname === '/posts' ? 'var(--accent-primary)' : 'var(--text-muted)',
            }}
            onMouseEnter={(e) => {
              if (location.pathname !== '/posts') {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/posts') {
                e.currentTarget.style.color = 'var(--text-muted)';
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text h-6 w-6">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <line x1="10" y1="9" x2="8" y2="9"></line>
            </svg>
            <span className="text-xs">포스트</span>
          </Link>

          {/* Todo 버튼 */}
          <Link
            to="/todo"
            className="flex flex-col items-center gap-1 px-4 py-2 transition-colors"
            style={{
              color: location.pathname === '/todo' ? 'var(--accent-primary)' : 'var(--text-muted)',
            }}
            onMouseEnter={(e) => {
              if (location.pathname !== '/todo') {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/todo') {
                e.currentTarget.style.color = 'var(--text-muted)';
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square-check-big h-6 w-6">
              <path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344"></path>
              <path d="m9 11 3 3L22 4"></path>
            </svg>
            <span className="text-xs">Todo</span>
          </Link>

          {/* 커뮤니티 버튼 */}
          <Link
            to="/community"
            className="flex flex-col items-center gap-1 px-4 py-2 transition-colors"
            style={{
              color: location.pathname === '/community' ? 'var(--accent-primary)' : 'var(--text-muted)',
            }}
            onMouseEnter={(e) => {
              if (location.pathname !== '/community') {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/community') {
                e.currentTarget.style.color = 'var(--text-muted)';
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users h-6 w-6">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <circle cx="9" cy="7" r="4"></circle>
            </svg>
            <span className="text-xs">커뮤니티</span>
          </Link>
        </div>
      </div >

      {/* 설정 모달 */}
      < SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}

export default Navigation;
