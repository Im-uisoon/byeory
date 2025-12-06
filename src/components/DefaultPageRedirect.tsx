import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function DefaultPageRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 세션 내에서 이미 리다이렉트를 실행했는지 확인
    const hasRedirected = sessionStorage.getItem('hasDefaultRedirected');

    // 최초 접속 시(세션 시작)이고, 현재 경로가 '/'일 때만 리다이렉트 실행
    if (!hasRedirected && location.pathname === '/') {
      const defaultPage = localStorage.getItem('defaultPage');
      if (defaultPage && defaultPage !== 'home') {
        const pageMap: { [key: string]: string } = {
          posts: '/posts',
          todo: '/todo',
          community: '/community',
        };
        const targetPath = pageMap[defaultPage];
        if (targetPath) {
          // 리다이렉트 실행 표시
          sessionStorage.setItem('hasDefaultRedirected', 'true');
          navigate(targetPath, { replace: true });
        }
      } else {
        // home이 기본 페이지이거나 설정이 없으면 리다이렉트 실행 표시만
        sessionStorage.setItem('hasDefaultRedirected', 'true');
      }
    }
  }, [navigate, location.pathname]);

  return null;
}
