import React, { useState } from "react";
import { API_BASE_URL } from "@/config";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  User,
  Calendar,
  Smile,
  ArrowRight,
  Phone,
  FileText,
} from "lucide-react";
import { uploadImageToSupabase } from "../post/api.ts";

const InitialProfileSetup: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("unspecified");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Load pre-filled data from social login if available
  React.useEffect(() => {
    const storedData = localStorage.getItem("temp_social_profile");
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        if (data.name) setName(data.name);
        if (data.nickname) setNickname(data.nickname);
        if (data.profileImage) setProfilePhoto(data.profileImage);

        // Map Gender (Naver: M/F/U -> Local: male/female/unspecified)
        if (data.gender === "M") setGender("male");
        else if (data.gender === "F") setGender("female");
        else setGender("unspecified");

        // Map Birthday (Naver: birthyear="1990", birthday="01-01" -> 1990-01-01)
        if (data.birthyear && data.birthday) {
          setBirthDate(`${data.birthyear}-${data.birthday}`);
        }

        // Map Phone (Naver: 010-0000-0000 -> keep as is but remove non-digits for formatting if needed, but current state stores formatted)
        if (data.mobile) setPhone(data.mobile);
      } catch (e) {
        console.error("Failed to parse temp profile data", e);
      }
    }
  }, []);

  const handlePhotoUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    // 비동기 처리를 위해 async 키워드 추가
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];

      if (file) {
        // 파일 크기 체크 (2MB 제한)
        const maxSize = 2 * 1024 * 1024; // 2MB in bytes
        if (file.size > maxSize) {
          alert("사진 최대 크기는 2MB입니다");
          return;
        }

        try {
          setIsUploading(true); // 업로드 시작 상태 표시

          // 1. Supabase 업로드 함수 호출
          const uploadedUrl = await uploadImageToSupabase(file);

          // 2. 업로드 성공 시 상태 업데이트
          if (uploadedUrl) {
            setProfilePhoto(uploadedUrl); // Supabase에서 받은 공개 URL 저장
          } else {
            console.error("이미지 업로드 실패");
            // 필요하다면 여기에 에러 알림 추가 (예: alert("업로드 실패"))
          }
        } catch (error) {
          console.error("업로드 중 에러 발생:", error);
        } finally {
          setIsUploading(false); // 성공/실패 여부와 관계없이 로딩 종료
        }
      }
    };

    input.click();
  };

  const handleComplete = async () => {
    if (!name.trim()) {
      alert("이름을 입력해주세요!");
      return;
    }
    if (!nickname.trim()) {
      alert("닉네임을 입력해주세요!");
      return;
    }

    // Validate Birth Date
    if (birthDate) {
      const birthYear = new Date(birthDate).getFullYear();
      const currentYear = new Date().getFullYear();
      if (birthYear < 1900 || birthYear > currentYear) {
        alert(`생년월일 연도는 1900년부터 ${currentYear}년 사이여야 합니다.`);
        return;
      }
    }

    // Validate Phone Number
    if (phone) {
      const cleanPhone = phone.replace(/-/g, "");
      if (cleanPhone.length !== 11) {
        alert("전화번호는 11자리여야 합니다.");
        return;
      }
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
      navigate("/login");
      return;
    }

    // Map gender to expected backend enum
    let mappedGender = "PRIVATE";
    if (gender === "male") mappedGender = "MALE";
    else if (gender === "female") mappedGender = "FEMALE";

    const payload = {
      profilePhoto: profilePhoto || "",
      name: name,
      nickname: nickname,
      birthDate: birthDate,
      phone: phone,
      gender: mappedGender,
      bio: bio,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        localStorage.setItem("isProfileSetupCompleted", "true");
        // Force a reload or simply navigate to ensure all contexts (like Auth/Theme) refresh if needed
        navigate("/home", { replace: true });
        window.location.reload();
      } else if (response.status === 409) {
        alert("이미 존재하는 닉네임입니다.");
      } else {
        const errorData = await response.text();
        console.error("Profile update failed:", errorData);
        alert("프로필 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error submitting profile:", error);
      alert("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-500 overflow-y-auto">
      <div className="max-w-xl w-full theme-bg-card rounded-3xl shadow-2xl p-8 border theme-border relative overflow-hidden my-8">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--btn-bg)] to-[var(--icon-color)] opacity-50"></div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold theme-text-primary mb-2">
            프로필 설정
          </h1>
          <p className="theme-text-secondary text-sm">
            다른 사용자들에게 보여질 멋진 프로필을 완성해보세요.
            <br />
            <span className="text-xs opacity-70">
              (이메일과 비밀번호는 회원가입 시 이미 입력되었습니다)
            </span>
          </p>
        </div>

        <div className="space-y-5">
          {/* Photo Upload */}
          <div className="flex flex-col items-center">
            <div
              className="relative group cursor-pointer"
              onClick={handlePhotoUpload}
            >
              <div className="w-24 h-24 rounded-full overflow-hidden theme-border border-4 shadow-lg flex items-center justify-center theme-bg-card-secondary transition-transform group-hover:scale-105">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 theme-icon opacity-50" />
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 theme-btn rounded-full flex items-center justify-center shadow-md">
                {isUploading ? (
                  <span className="text-[10px]">...</span>
                ) : (
                  <Camera size={14} />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider ml-1">
                이름 <span className="text-red-500">*</span>
              </label>
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
              <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider ml-1">
                닉네임 <span className="text-red-500">*</span>
              </label>
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
              <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider ml-1">
                생년월일
              </label>
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
              <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider ml-1">
                전화번호
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-4 theme-icon w-5 h-5 scale-90 opacity-70" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    let formatted = raw;
                    if (raw.length > 3 && raw.length <= 7) {
                      formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
                    } else if (raw.length > 7) {
                      formatted = `${raw.slice(0, 3)}-${raw.slice(
                        3,
                        7
                      )}-${raw.slice(7, 11)}`;
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
            <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider ml-1">
              성별
            </label>
            <div className="relative flex p-1 theme-bg-card-secondary rounded-xl theme-border border">
              {/* Sliding Background */}
              <div
                className="absolute top-1 bottom-1 rounded-lg theme-btn shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
                style={{
                  width: "calc((100% - 8px) / 3)",
                  left: "4px",
                  transform: `translateX(${["male", "female", "unspecified"].indexOf(gender) * 100
                    }%)`,
                }}
              />
              {["male", "female", "unspecified"].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`relative z-10 flex-1 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${gender === g
                      ? "text-[var(--btn-text)]"
                      : "theme-text-secondary hover:theme-text-primary"
                    }`}
                >
                  {g === "male" ? "남성" : g === "female" ? "여성" : "비공개"}
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider ml-1">
              자기소개
            </label>
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
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={handleComplete}
            className="w-full py-4 rounded-xl theme-btn font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 group"
          >
            완료 및 시작하기
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InitialProfileSetup;
