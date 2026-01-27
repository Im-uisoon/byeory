import { useState, useEffect } from "react";
import Navigation from "../../../components/header/Navigation";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Shield, LogOut } from "lucide-react";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { useIsMobile } from "../../../hooks"; // ✨
import FloatingSettingsPanel from "../../../components/dashboard/components/FloatingSettingsPanel"; // ✨

// Components
import ProfileHeader from "../../../components/profile/ProfileHeader";
import ProfileStats from "../../../components/profile/ProfileStats";
import ProfileMenu from "../../../components/profile/ProfileMenu";
import PinSettings from "../../../components/profile/security/PinSettings";
import TagSettings from "../../../components/profile/security/TagSettings";

function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile(); // ✨

  const [profile, setProfile] = useState<{
    name?: string;
    nickname?: string;
    email?: string;
    profilePhoto?: string;
    birthDate?: string;
    phone?: string;
    gender?: string;
    bio?: string;
    totalEntries?: number;
    streakDays?: number;
    receivedLikes?: number;
  } | null>(null);

  const [provider, setProvider] = useState<string>("LOCAL");

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: "info" | "danger" | "success";
    singleButton?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
  });

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      // Decode token to check provider
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.provider) {
          setProvider(payload.provider);
        }
      } catch (e) {
        console.error("Token decode error", e);
      }

      try {
        const response = await fetch("http://localhost:8080/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else if (response.status === 404) {
          // Profile not found -> Redirect to setup
          console.log("Profile not found, redirecting to setup...");
          navigate("/setup-profile");
        } else if (response.status === 401 || response.status === 403) {
          // Invalid token -> Logout
          logout();
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [logout, navigate]);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* 내비게이션 설정 */}
      <Navigation />

      {/* ✨ Floating Settings Panel */}
      <FloatingSettingsPanel
        defaultOpen={false}
        isMobile={isMobile}
      />

      {/* 메인 화면 */}
      <main className="pt-16 md:pt-20 px-4 animate-fade-in">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Profile Section */}
          <ProfileHeader profile={profile} />

          {/* Stats Cards */}
          <ProfileStats profile={profile} />

          {/* My Diary & Account Sections */}
          <ProfileMenu provider={provider} />

          {/* Security Section */}
          <div className="rounded-2xl shadow-sm border overflow-hidden theme-bg-card theme-border">
            <h3 className="px-6 py-4 border-b font-medium flex items-center gap-2 theme-text-primary theme-border">
              <Shield className="w-5 h-5 theme-icon" />
              보안
            </h3>

            <PinSettings
              confirmModal={setConfirmModal}
              closeConfirmModal={closeConfirmModal}
            />

            <TagSettings />

            <button
              onClick={() => navigate("/profile/delete")}
              className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between hover:opacity-80"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 theme-text-secondary"
                  >
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                  </svg>
                </span>
                <span className="theme-text-primary">회원탈퇴</span>
              </div>
            </button>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full rounded-2xl shadow-sm border py-4 px-6 text-left transition-colors flex items-center gap-3 hover:opacity-80 theme-bg-card theme-border"
          >
            <LogOut className="w-5 h-5 theme-text-secondary" />
            <span className="theme-text-primary font-medium">로그아웃</span>
          </button>

          {/* Footer */}
          <div className="text-center py-4 text-sm theme-text-secondary">
            <p>© 2025 벼리. All rights reserved.</p>
          </div>
        </div>

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
      </main>
    </div>
  );
}

export default ProfilePage;
