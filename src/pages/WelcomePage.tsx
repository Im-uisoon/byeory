import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    PenTool, MessageCircle, ArrowRight, ChevronDown,
    Heart, Shield, HelpCircle, Palette, Share2, Layout
} from 'lucide-react';

const WelcomePage: React.FC = () => {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate('/login');
    };

    const scrollToFeatures = () => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    };

    const elementsRef = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('opacity-100', 'translate-y-0');
                    entry.target.classList.remove('opacity-0', 'translate-y-10');
                }
            });
        }, { threshold: 0.1 });

        elementsRef.current.forEach(el => el && observer.observe(el));

        return () => observer.disconnect();
    }, []);

    const addToRefs = (el: HTMLDivElement | null) => {
        if (el && !elementsRef.current.includes(el)) {
            elementsRef.current.push(el);
        }
    };

    return (
        <div className="h-screen overflow-y-auto bg-slate-50 dark:bg-slate-900 transition-colors duration-500 font-sans show-scrollbar">
            {/* Hero Section */}
            <section className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-30 dark:opacity-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                    <div className="absolute top-20 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
                </div>

                <div
                    ref={addToRefs}
                    className="max-w-7xl mx-auto text-center relative z-10 opacity-0 translate-y-10 transition-all duration-1000"
                >
                    <div className="inline-block mb-8 animate-fade-in-up">
                        <img src="/logo.png" alt="Byeory" className="w-40 md:w-56 mx-auto drop-shadow-2xl" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-8 tracking-tight animate-fade-in-up animation-delay-100">
                        일상을 담다, <span className="text-blue-600 dark:text-blue-400">벼리</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-12 animate-fade-in-up animation-delay-200 leading-relaxed font-medium">
                        당신의 소중한 순간을 기록하고, 나만의 감성으로 꾸며보세요.<br className="hidden md:block" />
                        벼리는 당신의 하루를 아름답게 간직해줍니다.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up animation-delay-300">
                        <button
                            onClick={handleStart}
                            className="px-10 py-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all flex items-center gap-2 group w-full sm:w-auto justify-center"
                        >
                            시작하기
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={scrollToFeatures}
                            className="px-10 py-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all w-full sm:w-auto"
                        >
                            자세히 보기
                        </button>
                    </div>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer" onClick={scrollToFeatures}>
                    <ChevronDown className="w-8 h-8 text-slate-400" />
                </div>
            </section>

            {/* How It Works Section */}
            <section id="features" className="py-20 bg-white dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div
                        ref={addToRefs}
                        className="text-center mb-16 opacity-0 translate-y-10 transition-all duration-700"
                    >
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">함께하는 여정</h2>
                        <p className="text-slate-600 dark:text-slate-400">벼리와 함께하는 하루는 이렇게 특별해집니다</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        {/* Step 1 */}
                        <div
                            ref={addToRefs}
                            className="text-center group hover:-translate-y-2 transition-transform duration-300 opacity-0 translate-y-10 transition-all duration-700 delay-100"
                        >
                            <div className="w-20 h-20 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-blue-200 dark:group-hover:shadow-blue-900/20 transition-all">
                                <PenTool className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. 기록하기</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                오늘 있었던 일, 스쳐가는 감정을<br />
                                자유롭게 기록하세요.
                            </p>
                        </div>
                        {/* Step 2 */}
                        <div
                            ref={addToRefs}
                            className="text-center group hover:-translate-y-2 transition-transform duration-300 opacity-0 translate-y-10 transition-all duration-700 delay-200"
                        >
                            <div className="w-20 h-20 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-purple-200 dark:group-hover:shadow-purple-900/20 transition-all">
                                <Palette className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. 꾸미기</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                다양한 테마와 폰트로<br />
                                다이어리를 나만의 색으로 채우세요.
                            </p>
                        </div>
                        {/* Step 3 */}
                        <div
                            ref={addToRefs}
                            className="text-center group hover:-translate-y-2 transition-transform duration-300 opacity-0 translate-y-10 transition-all duration-700 delay-300"
                        >
                            <div className="w-20 h-20 mx-auto bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-pink-200 dark:group-hover:shadow-pink-900/20 transition-all">
                                <MessageCircle className="w-10 h-10 text-pink-600 dark:text-pink-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. 소통하기</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                커뮤니티에서 소중한 일상을<br />
                                이웃과 나누고 공감해보세요.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Preview Section */}
            <section className="py-24 bg-slate-50 dark:bg-slate-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div
                            ref={addToRefs}
                            className="order-2 lg:order-1 space-y-8 opacity-0 translate-y-10 transition-all duration-700"
                        >
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Layout className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2"> 직관적인 대시보드</h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        한눈에 들어오는 깔끔한 UI로 내 기록들을 편하게 관리하세요. 위젯을 자유롭게 배치할 수 있습니다.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <Share2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">활발한 커뮤니티 & 마켓</h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        다른 사람들의 다이어리를 구경하고, 스티커와 테마를 거래할 수 있는 마켓을 이용해보세요.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">안전한 데이터 관리</h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        당신의 소중한 추억은 안전하게 보관됩니다. 언제 어디서나 접속하여 열람하세요.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div
                            ref={addToRefs}
                            className="order-1 lg:order-2 relative opacity-0 translate-y-10 transition-all duration-700 delay-200"
                        >
                            {/* Abstract App Preview */}
                            <div className="relative rounded-2xl shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                                <div className="h-64 sm:h-80 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex flex-col">
                                    <div className="h-8 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 overflow-hidden">
                                        <img
                                            src="/writing_preview_new.png"
                                            alt="작성 화면 미리보기"
                                            className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Floating Stats Card Card */}
                            <div className="absolute -bottom-6 -left-6 p-4 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 animate-bounce-slow">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                                        <Heart className="w-5 h-5 text-pink-500" fill="currentColor" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">오늘의 기분</div>
                                        <div className="font-bold text-slate-900 dark:text-white">행복함 100%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>



            {/* FAQ */}
            <section className="py-20 bg-slate-50 dark:bg-slate-800/30">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-10">자주 묻는 질문</h2>
                    <div className="space-y-4">
                        {[
                            { q: "벼리는 무료인가요?", a: "네, 기본적인 다이어리 작성과 커뮤니티 기능은 모두 무료로 제공됩니다." },
                            { q: "테마는 어떻게 변경하나요?", a: "설정 > 테마 설정 메뉴에서 제공되는 다양한 테마를 선택하거나, 직접 색상을 조합하여 나만의 테마를 만들 수 있습니다." },
                            { q: "작성한 글을 비공개로 할 수 있나요?", a: "물론입니다. 모든 글은 기본적으로 비공개이며, 원하실 때만 커뮤니티에 공유할 수 있습니다." }
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 opacity-0 translate-y-10 transition-all duration-700"
                                ref={addToRefs}
                            >
                                <h3 className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white mb-2">
                                    <HelpCircle className="w-5 h-5 text-blue-500" />
                                    {item.q}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 pl-7">
                                    {item.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA & Footer */}
            <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">지금 바로 벼리를 시작하세요</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
                        당신의 일상을 기록하는 가장 특별한 방법.<br />
                        지금 가입하고 나만의 다이어리를 만들어보세요.
                    </p>
                    <button
                        onClick={handleStart}
                        className="px-10 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all mb-20"
                    >
                        무료로 시작하기
                    </button>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-10 flex flex-col md:relative md:flex-row items-center justify-center gap-6">
                        <div className="md:absolute md:left-0 flex items-center gap-2">
                            <img src="/logo.png" alt="Byeory" className="w-20 md:w-28 grayscale opacity-80" />
                        </div>
                        <div className="text-sm text-slate-400">
                            © 2025 Byeory. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default WelcomePage;
