import Navigation from '../../components/Navigation';

function PostPage() {
  return (
    <div className="theme-bg-gradient min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* 내비게이션 설정 */}
      <Navigation />

      {/* 메인 화면 */}
      <main className="px-8 pt-16 pb-20 md:px-45 md:pt-20 md:pb-0">
        <div className="mx-auto py-8">
          <h1 className="mb-4 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Post Page
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>포스트 페이지입니다.</p>
        </div>
      </main>
    </div>
  );
}

export default PostPage;
