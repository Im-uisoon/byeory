import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Calendar, Smile, Phone, FileText, Camera, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../../components/header/Navigation';
import { uploadImageToSupabase, deleteOldImage } from "../../../components/post/api";
import ConfirmationModal from '../../../components/common/ConfirmationModal';

const ProfileEditPage: React.FC = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [gender, setGender] = useState("unspecified");
    const [phone, setPhone] = useState("");
    const [bio, setBio] = useState("");
    const [profilePhoto, setProfilePhoto] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type?: 'info' | 'danger' | 'success';
        singleButton?: boolean;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    const closeConfirmModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

    const showModal = (title: string, message: string, type: 'info' | 'danger' | 'success' = 'info', onConfirm?: () => void) => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            type,
            singleButton: true,
            onConfirm: onConfirm || closeConfirmModal
        });
    };

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                showModal("알림", "로그인 정보가 없습니다.", 'danger', () => navigate('/login'));
                return;
            }

            try {
                const response = await fetch('http://localhost:8080/api/user/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setName(data.name || "");
                    setNickname(data.nickname || "");
                    setBirthDate(data.birthDate || "");
                    setPhone(data.phone || "");
                    setBio(data.bio || "");
                    setProfilePhoto(data.profilePhoto || "");

                    if (data.gender === "MALE") setGender("male");
                    else if (data.gender === "FEMALE") setGender("female");
                    else setGender("unspecified");

                    if (data.email) {
                        setEmail(data.email);
                    } else {
                        try {
                            const payload = token.split('.')[1];
                            const decoded = JSON.parse(atob(payload));
                            setEmail(decoded.sub || decoded.email || "");
                        } catch (e) {
                            console.error("Failed to decode token for email", e);
                        }
                    }
                } else {
                    console.error("Failed to fetch profile");
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handlePhotoUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        // 비동기 처리를 위해 async 키워드 추가
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];

            if (file) {
                // 파일 크기 체크 (2MB 제한)
                const maxSize = 2 * 1024 * 1024; // 2MB in bytes
                if (file.size > maxSize) {
                    showModal("업로드 실패", "사진 최대 크기는 2MB입니다", 'danger');
                    return;
                }

                try {
                    setIsUploading(true);
                    // 기존 이미지가 있다면 삭제
                    if (profilePhoto) {
                        await deleteOldImage(profilePhoto);
                    }
                    // Supabase 업로드 함수 호출
                    const uploadedUrl = await uploadImageToSupabase(file);

                    // 업로드 성공 시 상태 업데이트
                    if (uploadedUrl) {
                        setProfilePhoto(uploadedUrl);
                    } else {
                        console.error("이미지 업로드 실패");
                        showModal("업로드 실패", "이미지 업로드에 실패했습니다.", 'danger');
                    }
                } catch (error) {
                    console.error("업로드 중 에러 발생:", error);
                } finally {
                    setIsUploading(false);
                }

            }
        };

        input.click();
    };

    const handleSave = async () => {
        if (!name.trim()) {
            showModal("입력 오류", "이름을 입력해주세요!", 'danger');
            return;
        }
        if (!nickname.trim()) {
            showModal("입력 오류", "닉네임을 입력해주세요!", 'danger');
            return;
        }

        // Validate Birth Date
        if (birthDate) {
            const birthYear = new Date(birthDate).getFullYear();
            const currentYear = new Date().getFullYear();
            if (birthYear < 1900 || birthYear > currentYear) {
                showModal("입력 오류", `생년월일 연도는 1900년부터 ${currentYear}년 사이여야 합니다.`, 'danger');
                return;
            }
        }

        // Validate Phone Number
        if (phone) {
            const cleanPhone = phone.replace(/-/g, '');
            if (cleanPhone.length !== 11) {
                showModal("입력 오류", "전화번호는 11자리여야 합니다.", 'danger');
                return;
            }
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
            showModal("알림", "로그인 정보가 없습니다.", 'danger', () => navigate('/login'));
            return;
        }

        let mappedGender = "PRIVATE";
        if (gender === 'male') mappedGender = "MALE";
        else if (gender === 'female') mappedGender = "FEMALE";

        const payload = {
            profilePhoto: profilePhoto || "",
            name: name,
            nickname: nickname,
            birthDate: birthDate,
            phone: phone,
            gender: mappedGender,
            bio: bio
        };

        try {
            const response = await fetch('http://localhost:8080/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showModal("성공", "프로필이 수정되었습니다.", 'success', () => {
                    navigate('/profile', { replace: true });
                    window.location.reload();
                });
            } else if (response.status === 409) {
                showModal("수정 실패", "이미 존재하는 닉네임입니다.", 'danger');
            } else {
                const errorData = await response.text();
                console.error("Profile update failed:", errorData);
                showModal("수정 실패", "프로필 수정에 실패했습니다.", 'danger');
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            showModal("오류", "서버와 통신 중 오류가 발생했습니다.", 'danger');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Navigation />

            <div className="pt-16 pb-24 md:pt-15 md:pb-15">
                <div className="max-w-2xl mx-auto px-4">
                    {/* Header */}
                    <div className="mb-6 flex items-center gap-4">
                        <button
                            onClick={() => navigate('/profile')}
                            className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 theme-text-primary" />
                        </button>
                        <h1 className="text-xl font-bold theme-text-primary">프로필 수정</h1>
                    </div>

                    <div className="theme-bg-card rounded-3xl shadow-sm p-8 border theme-border relative overflow-hidden">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--btn-bg)] to-[var(--icon-color)] opacity-50"></div>

                        <div className="space-y-5">
                            {/* Photo Upload */}
                            <div className="flex flex-col items-center">
                                <div className="relative group cursor-pointer" onClick={handlePhotoUpload}>
                                    <div className="w-24 h-24 rounded-full overflow-hidden theme-border border-4 shadow-lg flex items-center justify-center theme-bg-card-secondary transition-transform group-hover:scale-105">
                                        {profilePhoto ? (
                                            <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-10 h-10 theme-icon opacity-50" />
                                        )}
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 theme-btn rounded-full flex items-center justify-center shadow-md">
                                        {isUploading ? <span className="text-[10px]">...</span> : <Camera size={14} />}
                                    </div>
                                </div>
                            </div>

                            {/* Email (Read Only) */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider ml-1">이메일</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-4 theme-icon w-5 h-5 scale-90 opacity-70" />
                                    <input
                                        type="email"
                                        value={email}
                                        readOnly
                                        disabled
                                        className="w-full pl-10 pr-4 py-3 rounded-xl theme-bg-card-secondary theme-border border focus:outline-none opacity-60 cursor-not-allowed theme-text-primary"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Name */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider ml-1">이름 <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-4 theme-icon w-5 h-5 scale-90 opacity-70" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="실명 입력"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl theme-bg-card-secondary theme-border border focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)] theme-text-primary"
                                        />
                                    </div>
                                </div>

                                {/* Nickname */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider ml-1">닉네임 <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Smile className="absolute left-3 top-4 theme-icon w-5 h-5 scale-90 opacity-70" />
                                        <input
                                            type="text"
                                            value={nickname}
                                            onChange={(e) => setNickname(e.target.value)}
                                            placeholder="별명 입력"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl theme-bg-card-secondary theme-border border focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)] theme-text-primary"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Birth Date */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider ml-1">생년월일</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-4 theme-icon w-5 h-5 scale-90 opacity-70" />
                                        <input
                                            type="date"
                                            value={birthDate}
                                            onChange={(e) => setBirthDate(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl theme-bg-card-secondary theme-border border focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)] theme-text-primary"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider ml-1">전화번호</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-4 theme-icon w-5 h-5 scale-90 opacity-70" />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => {
                                                const raw = e.target.value.replace(/\D/g, '');
                                                let formatted = raw;
                                                if (raw.length > 3 && raw.length <= 7) {
                                                    formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
                                                } else if (raw.length > 7) {
                                                    formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
                                                }
                                                setPhone(formatted);
                                            }}
                                            maxLength={13}
                                            placeholder="010-0000-0000"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl theme-bg-card-secondary theme-border border focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)] theme-text-primary"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Gender */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider ml-1">성별</label>
                                <div className="relative flex p-1 theme-bg-card-secondary rounded-xl theme-border border">
                                    {/* Sliding Background */}
                                    <div
                                        className="absolute top-1 bottom-1 rounded-lg theme-btn shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
                                        style={{
                                            width: 'calc((100% - 8px) / 3)',
                                            left: '4px',
                                            transform: `translateX(${['male', 'female', 'unspecified'].indexOf(gender) * 100}%)`
                                        }}
                                    />
                                    {['male', 'female', 'unspecified'].map((g) => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => setGender(g)}
                                            className={`relative z-10 flex-1 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${gender === g
                                                ? 'text-[var(--btn-text)]'
                                                : 'theme-text-secondary hover:theme-text-primary'
                                                }`}
                                        >
                                            {g === 'male' ? '남성' : g === 'female' ? '여성' : '비공개'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider ml-1">자기소개</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-4 theme-icon w-5 h-5 scale-90 opacity-70" />
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        maxLength={50}
                                        placeholder="자신을 자유롭게 소개해주세요 (최대 50자)"
                                        rows={3}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl theme-bg-card-secondary theme-border border focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)] theme-text-primary resize-none"
                                    />
                                    <div className="absolute right-3 bottom-3 text-xs theme-text-secondary opacity-70 pointer-events-none">
                                        {bio.length}/50
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="flex-1 py-3 rounded-xl transition-colors font-medium theme-bg-card theme-text-primary border theme-border hover:bg-black/5 dark:hover:bg-white/5"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 py-3 rounded-xl shadow-lg transition-all font-medium theme-btn hover:opacity-90"
                                >
                                    저장
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Confirmation Modal */}
                <ConfirmationModal
                    isOpen={confirmModal.isOpen}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    type={confirmModal.type}
                    singleButton={confirmModal.singleButton}
                    onConfirm={() => {
                        confirmModal.onConfirm();
                        if (confirmModal.singleButton) closeConfirmModal();
                    }}
                    onCancel={closeConfirmModal}
                />
            </div>
        </div>
    );
}

export default ProfileEditPage;
