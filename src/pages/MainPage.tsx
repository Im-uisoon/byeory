import React from 'react';
import Navigation from '../components/Header/Navigation';
import MenuSettings, { useMenu } from '../components/settings/menu/MenuSettings';

const MainPage: React.FC = () => {
    const { isEditMode } = useMenu();

    return (
        <div className="min-h-screen">
            <Navigation />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {isEditMode ? (
                    <MenuSettings />
                ) : (
                    <div className="theme-bg-card theme-border border rounded-2xl p-8 shadow-lg backdrop-blur-sm transition-colors duration-300">
                        <div className="mb-6">
                            <h1 className="text-3xl theme-text-primary mb-2">환영합니다!</h1>
                            <p className="theme-text-secondary text-lg">
                                현재 적용된 테마의 스타일을 확인해보세요.
                            </p>
                        </div>

                        {/* 보조 박스 (Secondary Box) */}
                        <div className="theme-bg-card-secondary theme-border border rounded-xl p-6 mb-8 transition-colors duration-300">
                            <h2 className="text-xl font-semibold theme-text-primary mb-4">보조 섹션</h2>
                            <p className="theme-text-secondary mb-4">
                                이 박스는 메인 박스와 구분되는 보조 배경색을 가집니다.
                                테마에 따라 투명도나 색상이 달라집니다.
                            </p>
                            <div className="flex gap-4">
                                <div className="h-12 w-12 rounded-lg theme-bg-card theme-border border flex items-center justify-center">
                                    📦
                                </div>
                                <div className="h-12 w-12 rounded-lg theme-bg-card theme-border border flex items-center justify-center">
                                    🎨
                                </div>
                                <div className="h-12 w-12 rounded-lg theme-bg-card theme-border border flex items-center justify-center">
                                    ✨
                                </div>
                            </div>
                        </div>

                        {/* 버튼 및 액션 */}
                        <div className="flex flex-wrap gap-4">
                            <button className="theme-btn px-6 py-3 rounded-lg font-medium shadow-sm">
                                Primary Button
                            </button>
                            <button className="theme-bg-card theme-border border theme-text-primary px-6 py-3 rounded-lg font-medium hover:bg-black/5 transition-colors">
                                Secondary Button
                            </button>
                        </div>
                    </div>
                )}

                {/* 추가 그리드 예시 - Only show in non-edit mode */}
                {!isEditMode && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="theme-bg-card theme-border border rounded-xl p-6 shadow-sm transition-colors duration-300">
                                <div className="w-10 h-10 rounded-full theme-bg-card-secondary mb-4 flex items-center justify-center theme-text-primary font-bold">
                                    {item}
                                </div>
                                <h3 className="text-lg font-semibold theme-text-primary mb-2">Feature {item}</h3>
                                <p className="theme-text-secondary text-sm">
                                    테마 시스템이 적용된 카드 컴포넌트입니다. 배경색과 텍스트 색상이 자동으로 변경됩니다.
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MainPage;
