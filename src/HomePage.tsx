import Navigation from './components/Navigation';

function HomePage() {
  return (
    <div className="min-h-screen bg-orange-50">
      {/* 내비게이션 설정 */}
      <Navigation />

      {/* 메인 화면 */}
      <main className="px-4 pt-16 pb-20 md:pt-20 md:pb-0">
        <div className="mx-auto max-w-4xl py-8">
          <h1 className="mb-4 text-3xl font-bold">메인</h1>
          <p className="text-gray-600">메인 페이지입니다.</p>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
