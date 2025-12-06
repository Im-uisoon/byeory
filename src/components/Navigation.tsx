import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import SettingsModal from './settings/SettingsModal';

interface MenuItem {
  id: string;
  label: string;
  path: string;
  pcIcon?: React.ReactNode;
  mobileIcon?: React.ReactNode;
}

const defaultMenuItems: MenuItem[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
  },
  {
    id: 'posts',
    label: '포스트',
    path: '/posts',
    mobileIcon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text h-6 w-6">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <line x1="10" y1="9" x2="8" y2="9"></line>
      </svg>
    ),
  },
  {
    id: 'todo',
    label: 'Todo',
    path: '/todo',
    mobileIcon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square-check-big h-6 w-6">
        <path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344"></path>
        <path d="m9 11 3 3L22 4"></path>
      </svg>
    ),
  },
  {
    id: 'community',
    label: '커뮤니티',
    path: '/community',
    mobileIcon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users h-6 w-6">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
        <circle cx="9" cy="7" r="4"></circle>
      </svg>
    ),
  },
];

// Home 아이콘 생성 함수
const getHomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-house h-6 w-6">
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
  </svg>
);

function Navigation() {
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const dragItemRef = useRef<number | null>(null);
  const dragOverItemRef = useRef<number | null>(null);

  useEffect(() => {
    // 로컬 스토리지에서 메뉴 순서 불러오기
    const savedOrder = localStorage.getItem('menuOrder');
    if (savedOrder) {
      const order = JSON.parse(savedOrder) as string[];
      const orderedItems = order.map((id) => defaultMenuItems.find((item) => item.id === id)).filter((item): item is MenuItem => item !== undefined);
      setMenuItems(orderedItems);
    }
  }, []);

  const handleDragStart = (index: number) => {
    dragItemRef.current = index;
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (dragItemRef.current === null || dragItemRef.current === index) return;

    // 실시간으로 순서 변경
    const newItems = [...menuItems];
    const draggedItem = newItems[dragItemRef.current];
    newItems.splice(dragItemRef.current, 1);
    newItems.splice(index, 0, draggedItem);

    dragItemRef.current = index;
    setMenuItems(newItems);
  };

  const handleDragEnd = () => {
    dragItemRef.current = null;
    dragOverItemRef.current = null;
    setDraggedIndex(null);
  };

  const handleApplyEdit = () => {
    const order = menuItems.map((item) => item.id);
    localStorage.setItem('menuOrder', JSON.stringify(order));
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    // 로컬 스토리지에서 다시 불러오기
    const savedOrder = localStorage.getItem('menuOrder');
    if (savedOrder) {
      const order = JSON.parse(savedOrder) as string[];
      const orderedItems = order.map((id) => defaultMenuItems.find((item) => item.id === id)).filter((item): item is MenuItem => item !== undefined);
      setMenuItems(orderedItems);
    } else {
      setMenuItems(defaultMenuItems);
    }
    setIsEditMode(false);
  };

  const renderPCMenuItem = (item: MenuItem, index: number) => {
    if (isEditMode) {
      return (
        <div key={item.id} draggable onDragStart={() => handleDragStart(index)} onDragEnter={() => handleDragEnter(index)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()} onClick={(e) => e.preventDefault()} className={`border-accent-primary cursor-move rounded-lg border-2 border-dashed px-4 py-2 transition-all duration-300 ease-in-out ${draggedIndex === index ? 'scale-105 opacity-50' : 'hover:border-accent-hover'}`} style={{ color: 'var(--text-muted)' }}>
          {item.label}
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        to={item.path}
        style={{
          color: location.pathname === item.path ? 'var(--accent-primary)' : 'var(--text-muted)',
        }}
        className="transition-colors"
        onMouseEnter={(e) => {
          if (location.pathname !== item.path) {
            e.currentTarget.style.color = 'var(--text-secondary)';
          }
        }}
        onMouseLeave={(e) => {
          if (location.pathname !== item.path) {
            e.currentTarget.style.color = 'var(--text-muted)';
          }
        }}
      >
        {item.label}
      </Link>
    );
  };

  const renderMobileMenuItem = (item: MenuItem, index: number) => {
    if (isEditMode) {
      return (
        <div key={item.id} draggable onDragStart={() => handleDragStart(index)} onDragEnter={() => handleDragEnter(index)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()} onClick={(e) => e.preventDefault()} className={`border-accent-primary flex cursor-move flex-col items-center gap-1 rounded-lg border-2 border-dashed px-4 py-2 transition-all duration-300 ease-in-out ${draggedIndex === index ? 'scale-105 opacity-50' : 'hover:border-accent-hover'}`} style={{ color: 'var(--text-muted)' }}>
          {item.id === 'home' ? getHomeIcon() : item.mobileIcon}
          <span className="text-xs">{item.label}</span>
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        to={item.path}
        className="flex flex-col items-center gap-1 px-4 py-2 transition-colors"
        style={{
          color: location.pathname === item.path ? 'var(--accent-primary)' : 'var(--text-muted)',
        }}
        onMouseEnter={(e) => {
          if (location.pathname !== item.path) {
            e.currentTarget.style.color = 'var(--text-secondary)';
          }
        }}
        onMouseLeave={(e) => {
          if (location.pathname !== item.path) {
            e.currentTarget.style.color = 'var(--text-muted)';
          }
        }}
      >
        {item.id === 'home' ? getHomeIcon() : item.mobileIcon}
        <span className="text-xs">{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* 편집 모드 블러 오버레이 */}
      {isEditMode && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md" style={{ pointerEvents: 'none' }}></div>}

      {/* PC 버전 네비게이션 - 상단 고정 */}
      <div
        className={`fixed top-0 right-0 left-0 z-50 hidden px-20 py-3 shadow-lg md:block ${isEditMode ? 'z-[60]' : ''}`}
        style={{
          backgroundColor: 'var(--nav-bg)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="flex items-center justify-between select-none">
          {/* 홈 로고 */}
          <Link to="/" className={isEditMode ? 'pointer-events-none' : ''}>
            <img src="/logo.png" alt="벼리" className="w-23" />
          </Link>

          {/* PC 내비게이션 메뉴 - 텍스트만 표시 */}
          <div className="flex items-center gap-15">{menuItems.map((item, index) => renderPCMenuItem(item, index))}</div>

          {/* 사용자 아이콘 영역 */}
          <div className="flex items-center gap-4">
            <Link to={localStorage.getItem('isLoggedIn') === 'true' ? '/profile' : '/login'} className={isEditMode ? 'pointer-events-none' : ''}>
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
              onClick={() => !isEditMode && setIsSettingsOpen(true)}
              className={`rounded-full p-2 transition-colors ${isEditMode ? 'pointer-events-none' : ''}`}
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
        className={`fixed top-0 right-0 left-0 z-50 px-4 py-3 shadow-lg md:hidden ${isEditMode ? 'z-[60]' : ''}`}
        style={{
          backgroundColor: 'var(--nav-bg)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="flex items-center justify-between select-none">
          {/* 홈 로고 */}
          <Link to="/" className={isEditMode ? 'pointer-events-none' : ''}>
            <img src="/logo.png" alt="벼리" className="w-20" />
          </Link>

          {/* 사용자 아이콘 영역 */}
          <div className="flex items-center gap-3">
            <Link to={localStorage.getItem('isLoggedIn') === 'true' ? '/profile' : '/login'} className={isEditMode ? 'pointer-events-none' : ''}>
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
              onClick={() => !isEditMode && setIsSettingsOpen(true)}
              className={`rounded-full p-2 transition-colors ${isEditMode ? 'pointer-events-none' : ''}`}
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
      </div>

      {/* 모바일 버전 네비게이션 - 하단 고정 */}
      <div
        className={`fixed right-0 bottom-0 left-0 z-50 shadow-lg md:hidden ${isEditMode ? 'z-[60]' : ''}`}
        style={{
          backgroundColor: 'var(--nav-bg)',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <div className="flex items-center justify-around py-2">{menuItems.map((item, index) => renderMobileMenuItem(item, index))}</div>
      </div>

      {/* 편집 모드 안내 및 버튼 영역 */}
      {isEditMode && (
        <div className="fixed inset-x-0 top-1/2 z-[70] flex -translate-y-1/2 flex-col items-center gap-6 px-4 md:gap-8">
          {/* 안내 메시지 */}
          <div className="text-center">
            <h3 className="mb-7 text-3xl font-bold text-zinc-300 md:text-4xl">메뉴 순서 변경</h3>
            <p className="mb-7 text-base text-white md:text-lg">
              드래그하여 메뉴 순서를 변경한 후<br />
              적용 버튼을 누르면 변경사항이 저장됩니다.
            </p>
          </div>

          {/* 버튼 그룹 */}
          <div className="flex w-full max-w-sm flex-col gap-3 md:flex-row">
            <button onClick={handleApplyEdit} className="bg-accent-primary hover:bg-accent-hover flex-1 rounded-lg px-8 py-4 text-lg text-white shadow-xl transition-colors">
              적용
            </button>
            <button onClick={handleCancelEdit} className="text-text-primary hover:bg-button-hover bg-bg-secondary flex-1 rounded-lg px-8 py-4 text-lg shadow-xl transition-colors">
              취소
            </button>
          </div>
        </div>
      )}

      {/* 설정 모달 */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onMenuEditMode={() => setIsEditMode(true)} />
    </>
  );
}

export default Navigation;
