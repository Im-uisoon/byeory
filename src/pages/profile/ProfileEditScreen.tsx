import { useState, useEffect } from "react";
import { ArrowLeft, Camera, User, Mail, Phone, Calendar } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

interface ProfileEditScreenProps {
    currentProfile: {
        name: string;
        email: string;
        phone?: string;
        birthDate?: string;
        bio?: string;
        profilePhoto?: string;
    };
    onClose: () => void;
    onSave: (profile: {
        name: string;
        email: string;
        phone?: string;
        birthDate?: string;
        bio?: string;
        profilePhoto?: string;
    }) => void;
}

export function ProfileEditScreen({ currentProfile, onClose, onSave }: ProfileEditScreenProps) {
    const { theme } = useTheme();
    const [name, setName] = useState(currentProfile.name);
    const [email, setEmail] = useState(currentProfile.email);
    const [phone, setPhone] = useState(currentProfile.phone || "");
    const [birthDate, setBirthDate] = useState(currentProfile.birthDate || "");
    const [bio, setBio] = useState(currentProfile.bio || "");
    const [profilePhoto, setProfilePhoto] = useState(currentProfile.profilePhoto || "");
    const [isUploading, setIsUploading] = useState(false);
    const [customBg, setCustomBg] = useState<string>('');

    useEffect(() => {
        if (theme === 'custom' && typeof window !== 'undefined') {
            try {
                const settingsStr = localStorage.getItem('customThemeSettings');
                if (settingsStr) {
                    const settings = JSON.parse(settingsStr);
                    const { baseColor, gradient } = settings;

                    if (gradient && gradient.enabled) {
                        setCustomBg(`linear-gradient(${gradient.dir}, ${gradient.start} ${gradient.startPos}%, ${gradient.end} ${gradient.endPos}%)`);
                    } else if (baseColor) {
                        // Fallback to solid color logic (simplified to avoid importing util if not needed, or just use var(--bg-primary) since it is opaque for solid custom themes)
                        // Actually, if it's solid custom, --bg-primary is opaque, so we can just use that.
                        // But let's be safe and set it if we can.
                        setCustomBg(''); // Empty means use default variable
                    }
                }
            } catch (e) {
                console.error("Failed to load custom theme settings", e);
            }
        }
    }, [theme]);

    const handlePhotoUpload = () => {
        setIsUploading(true);
        setTimeout(() => {
            setProfilePhoto("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400");
            setIsUploading(false);
        }, 1000);
    };

    const handleSave = () => {
        if (!name.trim()) {
            alert("이름을 입력해주세요");
            return;
        }
        if (!email.trim()) {
            alert("이메일을 입력해주세요");
            return;
        }
        if (email && !email.includes("@")) {
            alert("올바른 이메일 형식을 입력해주세요");
            return;
        }

        onSave({
            name,
            email,
            phone,
            birthDate,
            bio,
            profilePhoto,
        });
    };

    const getBackground = () => {
        if (theme === 'custom') {
            // If we found a gradient in localStorage, use it.
            if (customBg) return customBg;
            // Otherwise, fallback to the variable (which should be opaque for solid custom themes)
            // If it's transparent (because we failed to detect gradient but global theme thinks it is), 
            // fallback to white/black based on system ref? Or just white.
            return 'var(--bg-primary)';
        }
        if (theme === 'dark') return undefined; // CSS class handles gradient
        return 'var(--bg-primary)'; // solid color
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex flex-col ${theme === 'dark' ? 'theme-bg-gradient' : ''}`}
            style={{
                background: getBackground(),
                backgroundColor: !getBackground()?.includes('gradient') ? 'var(--bg-primary)' : undefined // Fallback for safety
            }}
        >
            {/* Header */}
            <div className="px-6 py-5 text-white" style={{ backgroundColor: 'var(--accent-primary)' }}>
                <div className="flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h2 className="font-bold text-lg">프로필 수정</h2>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 pb-24">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Profile Photo */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                {profilePhoto ? (
                                    <img
                                        src={profilePhoto}
                                        alt="프로필 사진"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = '';
                                        }}
                                    />
                                ) : (
                                    <User className="w-16 h-16" style={{ color: 'var(--accent-primary)' }} />
                                )}
                            </div>
                            <button
                                onClick={handlePhotoUpload}
                                disabled={isUploading}
                                className="absolute bottom-0 right-0 w-10 h-10 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all"
                                style={{ backgroundColor: 'var(--accent-primary)' }}
                            >
                                {isUploading ? (
                                    <span className="animate-spin text-white">⏳</span>
                                ) : (
                                    <Camera className="w-5 h-5 text-white" />
                                )}
                            </button>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>프로필 사진을 변경하려면 카메라 버튼을 클릭하세요</p>
                    </div>

                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                            <User className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                            <span>이름</span>
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="이름을 입력하세요"
                            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                            maxLength={20}
                        />
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{name.length}/20자</p>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                            <Mail className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                            <span>이메일</span>
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        />
                    </div>

                    {/* Phone Input */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                            <Phone className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                            <span>전화번호</span>
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="010-0000-0000"
                            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        />
                    </div>

                    {/* Birth Date Input */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                            <Calendar className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                            <span>생년월일</span>
                        </label>
                        <input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        />
                    </div>

                    {/* Bio Input */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                            <span>소개</span>
                        </label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="자신을 소개해주세요..."
                            rows={4}
                            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none"
                            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                            maxLength={200}
                        />
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{bio.length}/200자</p>
                    </div>

                    {/* Save Button */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl transition-colors font-medium"
                            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-3 rounded-xl shadow-lg transition-all font-medium text-white"
                            style={{ backgroundColor: 'var(--accent-primary)' }}
                        >
                            저장
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
