import Navigation from '../../components/Navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Lock, Download, LogOut, BarChart3, Calendar, Shield, Fingerprint, Key, Image as ImageIcon } from "lucide-react";
import { useState } from 'react';
import { ProfileEditScreen } from './ProfileEditScreen';
import { PasswordChangeScreen } from './PasswordChangeScreen';

function ProfilePage() {
    const { userEmail, logout } = useAuth();
    const navigate = useNavigate();

    // Modal state: 'none', 'editProfile', 'changePassword'
    const [activeModal, setActiveModal] = useState<'none' | 'editProfile' | 'changePassword'>('none');

    const stats = {
        totalEntries: 42,
        streakDays: 7,
        exchangeRooms: 3
    };

    // Mock user data for profile edit
    const [mockUserProfile, setMockUserProfile] = useState({
        name: userEmail ? userEmail.split('@')[0] : '사용자',
        email: userEmail || '',
        phone: '010-1234-5678',
        birthDate: '1990-01-01',
        bio: '안녕하세요! 벼리와 함께 일상을 기록하고 있어요.',
        profilePhoto: ''
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSaveProfile = (updatedProfile: any) => {
        // In a real app, this would make an API call
        setMockUserProfile(updatedProfile);
        setActiveModal('none');
        alert('프로필이 저장되었습니다.');
    };

    const handleSavePassword = (oldPassword: string, newPassword: string) => {
        // In a real app, this would make an API call
        console.log('Changing password', { oldPassword, newPassword });
        setActiveModal('none');
        alert('비밀번호가 변경되었습니다.');
    };

    const userName = mockUserProfile.name;

    return (
        <div className="theme-bg-gradient min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            {/* 내비게이션 설정 */}
            <Navigation />

            {/* 메인 화면 */}
            <main className="px-4 pt-16 pb-24 md:px-25 md:pt-20 md:pb-0">
                <div className="mx-auto max-w-2xl py-8 space-y-6">
                    {/* Header Card */}
                    <div className="rounded-2xl p-6 shadow-lg text-white" style={{ backgroundColor: 'var(--accent-primary)' }}>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                                {mockUserProfile.profilePhoto ? (
                                    <img src={mockUserProfile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-white" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold mb-1">{userName}님</h1>
                                <p className="opacity-90">{mockUserProfile.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="rounded-2xl p-4 shadow-sm border text-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: 'var(--bg-primary)' }}>
                                <Calendar className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                            </div>
                            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{stats.totalEntries}</div>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>작성한 일기</p>
                        </div>
                        <div className="rounded-2xl p-4 shadow-sm border text-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: 'var(--bg-primary)' }}>
                                <BarChart3 className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                            </div>
                            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{stats.streakDays}</div>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>연속 작성일</p>
                        </div>
                        <div className="rounded-2xl p-4 shadow-sm border text-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: 'var(--bg-primary)' }}>
                                <User className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                            </div>
                            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{stats.exchangeRooms}</div>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>교환일기</p>
                        </div>
                    </div>

                    {/* My Diary Section */}
                    <div className="rounded-2xl shadow-sm border overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                        <h3 className="px-6 py-4 border-b font-medium" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>내 일기</h3>
                        <button className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-b hover:opacity-80" style={{ borderColor: 'var(--border-color)' }}>
                            <div className="flex items-center gap-3">
                                <BarChart3 className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                                <div>
                                    <span className="block font-medium" style={{ color: 'var(--text-primary)' }}>분석 & 인사이트</span>
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>감정 분포, 페르소나 카드, 성장 리포트</span>
                                </div>
                            </div>
                            <span style={{ color: 'var(--text-secondary)' }}>→</span>
                        </button>
                        <button className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between hover:opacity-80">
                            <div className="flex items-center gap-3">
                                <ImageIcon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                                <div>
                                    <span className="block font-medium" style={{ color: 'var(--text-primary)' }}>사진 관리</span>
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI 자동 분류, 카테고리별 정리</span>
                                </div>
                            </div>
                            <span style={{ color: 'var(--text-secondary)' }}>→</span>
                        </button>
                    </div>

                    {/* Settings Sections */}
                    <div className="rounded-2xl shadow-sm border overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                        <h3 className="px-6 py-4 border-b font-medium" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>계정</h3>
                        <button
                            onClick={() => setActiveModal('editProfile')}
                            className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-b hover:opacity-80"
                            style={{ borderColor: 'var(--border-color)' }}
                        >
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                                <span style={{ color: 'var(--text-primary)' }}>프로필 수정</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveModal('changePassword')}
                            className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between hover:opacity-80"
                        >
                            <div className="flex items-center gap-3">
                                <Lock className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                                <span style={{ color: 'var(--text-primary)' }}>비밀번호 변경</span>
                            </div>
                        </button>
                    </div>

                    {/* General Settings */}
                    <div className="rounded-2xl shadow-sm border overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                        <h3 className="px-6 py-4 border-b font-medium" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>설정</h3>
                        <button className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-b hover:opacity-80" style={{ borderColor: 'var(--border-color)' }}>
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                                <span style={{ color: 'var(--text-primary)' }}>알림 설정</span>
                            </div>
                        </button>
                        <button className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-b hover:opacity-80" style={{ borderColor: 'var(--border-color)' }}>
                            <div className="flex items-center gap-3">
                                <Lock className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                                <span style={{ color: 'var(--text-primary)' }}>프라이버시 설정</span>
                            </div>
                        </button>
                        <button className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between hover:opacity-80">
                            <div className="flex items-center gap-3">
                                <Download className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                                <span style={{ color: 'var(--text-primary)' }}>데이터 내보내기</span>
                            </div>
                        </button>
                    </div>

                    {/* Security Section */}
                    <div className="rounded-2xl shadow-sm border overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                        <h3 className="px-6 py-4 border-b font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
                            <Shield className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                            보안
                        </h3>
                        <button className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-b hover:opacity-80" style={{ borderColor: 'var(--border-color)' }}>
                            <div className="flex items-center gap-3">
                                <Key className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                                <div>
                                    <span className="block" style={{ color: 'var(--text-primary)' }}>PIN 잠금</span>
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>앱 실행 시 PIN 입력</span>
                                </div>
                            </div>
                            <div className="w-12 h-6 rounded-full relative cursor-pointer" style={{ backgroundColor: 'var(--text-muted)' }}>
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all"></div>
                            </div>
                        </button>
                        <button className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-b hover:opacity-80" style={{ borderColor: 'var(--border-color)' }}>
                            <div className="flex items-center gap-3">
                                <Fingerprint className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                                <div>
                                    <span className="block" style={{ color: 'var(--text-primary)' }}>생체 인증</span>
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>지문 또는 Face ID</span>
                                </div>
                            </div>
                            <div className="w-12 h-6 rounded-full relative cursor-pointer" style={{ backgroundColor: 'var(--accent-primary)' }}>
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-all"></div>
                            </div>
                        </button>
                        <button className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between hover:opacity-80">
                            <div className="flex items-center gap-3">
                                <Lock className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                                <div>
                                    <span className="block" style={{ color: 'var(--text-primary)' }}>비공개 태그 설정</span>
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI 분석에서 제외할 태그</span>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full py-4 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium"
                        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--accent-primary)', border: '1px solid var(--border-color)' }}
                    >
                        <LogOut className="w-5 h-5" />
                        <span>로그아웃</span>
                    </button>

                    {/* Footer */}
                    <div className="text-center py-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                        <p>© 2025 벼리. All rights reserved.</p>
                    </div>
                </div>
            </main>

            {/* Modals */}
            {activeModal === 'editProfile' && (
                <div className="fixed inset-0 z-50">
                    <ProfileEditScreen
                        currentProfile={mockUserProfile}
                        onClose={() => setActiveModal('none')}
                        onSave={handleSaveProfile}
                    />
                </div>
            )}

            {activeModal === 'changePassword' && (
                <div className="fixed inset-0 z-50">
                    <PasswordChangeScreen
                        onClose={() => setActiveModal('none')}
                        onSave={handleSavePassword}
                    />
                </div>
            )}
        </div>
    );
}

export default ProfilePage;
