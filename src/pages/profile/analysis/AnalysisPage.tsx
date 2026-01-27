import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, Calendar } from "lucide-react";
import Navigation from '../../../components/header/Navigation';
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { API_BASE_URL } from '../../../api/config';


// --- 타입 정의 (JSON 구조에 맞춤) ---
interface MoodItem {
  mood: string;
  percentage: number;
  emoji: string;
}

interface WordItem {
  text: string;
  value: number; // 빈도수 (크기 결정용)
}

interface PersonaAnalysisData {
  representativeEmoji: string;
  digitalSelf: string[];
  characteristics: string[];
  moods: MoodItem[];
  wordCloud: WordItem[];
}

// --- 컴포넌트 1: 도넛 차트 (기분 분석) ---
const MoodChart = ({ moods }: { moods: MoodItem[] }) => {
  // SVG 도넛 차트 계산 로직
  let accumulatedPercent = 0;
  const radius = 16;
  const circumference = 2 * Math.PI * radius; // 약 100

  // 색상 팔레트 (기분별)
  const colors = ["#4ADE80", "#FACC15", "#F87171", "#60A5FA", "#A78BFA"];

  return (
    <div className="flex flex-col md:flex-row items-center gap-8 justify-center">
      {/* 차트 영역 */}
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 40 40" className="w-full h-full transform -rotate-90">
          {moods.map((mood, idx) => {
            const strokeDasharray = `${(mood.percentage / 100) * circumference
              } ${circumference}`;
            const strokeDashoffset = -(
              (accumulatedPercent / 100) *
              circumference
            );
            accumulatedPercent += mood.percentage;

            return (
              <circle
                key={idx}
                cx="20"
                cy="20"
                r={radius}
                fill="transparent"
                stroke={colors[idx % colors.length]}
                strokeWidth="5"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl animate-bounce">{moods[0]?.emoji}</span>
          <span className="text-xs font-bold theme-text-secondary mt-1">
            지금 상태
          </span>
        </div>
      </div>

      {/* 범례(Legend) 영역 */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {moods.map((mood, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 p-2 rounded-lg theme-bg-card-secondary border theme-border"
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[idx % colors.length] }}
            ></span>
            <span className="text-lg">{mood.emoji}</span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold theme-text-primary">
                {mood.mood}
              </span>
              <span className="text-xs theme-text-secondary">
                {mood.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 컴포넌트 2: 워드 클라우드 (CSS Flex 활용) ---
const WordMindMap = ({ words }: { words: WordItem[] }) => {
  // value에 따라 폰트 크기 계산 (최소 1rem, 최대 3rem)
  const maxVal = Math.max(...words.map((w) => w.value));
  const minVal = Math.min(...words.map((w) => w.value));

  const getSize = (val: number) => {
    const normalized = (val - minVal) / (maxVal - minVal || 1); // 0~1
    return 1 + normalized * 2; // 1rem ~ 3rem
  };

  // 색상 랜덤 배정
  const textColors = [
    "text-blue-500",
    "text-pink-500",
    "text-purple-500",
    "text-green-500",
    "text-indigo-500",
  ];

  return (
    <div className="p-6 theme-bg-card rounded-3xl shadow-sm border theme-border min-h-[200px] flex flex-wrap items-center justify-center gap-x-6 gap-y-2 content-center">
      {words.map((word, idx) => (
        <span
          key={idx}
          className={`font-bold transition-all duration-500 hover:scale-110 cursor-default ${textColors[idx % textColors.length]
            }`}
          style={{
            fontSize: `${getSize(word.value)}rem`,
            opacity: 0.7 + (word.value / maxVal) * 0.3, // 빈도 높으면 더 진하게
          }}
        >
          {word.text}
        </span>
      ))}
    </div>
  );
};

// --- 메인 페이지 ---
function AnalysisPage() {
  const [data, setData] = useState<PersonaAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  // 필터 상태: 'ALL' 또는 'YYYY-MM'
  const [filterMode, setFilterMode] = useState<"ALL" | "MONTH">("ALL");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 7)
  ); // YYYY-MM

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

  const fetchPersona = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const response = await fetch("${API_BASE_URL}/api/persona", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok && response.status !== 204) {
        try {
          const text = await response.text();
          if (!text) {
            setData(null);
            return;
          }

          const json = JSON.parse(text);

          // 빈 배열([])이거나 데이터 구조가 안맞으면 null 처리
          if (Array.isArray(json) && json.length === 0) {
            setData(null);
            return;
          }

          if (typeof json.analysisResult === "string") {
            try {
              const parsed = JSON.parse(json.analysisResult);
              setData(parsed);
            } catch (e) {
              console.warn("Legacy data format");
              setData(null);
            }
          } else {
            setData(json);
          }
        } catch (e) {
          console.error("Data parsing error:", e);
          setData(null);
        }
      } else {
        setData(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersona();
  }, []);

  const handleAnalyze = async () => {
    const token = localStorage.getItem("accessToken");
    setAnalyzing(true);

    // 파라미터 구성
    let url = "${API_BASE_URL}/api/persona/analyze";
    if (filterMode === "MONTH") {
      const [y, m] = selectedDate.split("-");
      url += `?year=${y}&month=${m}`;
    }

    try {
      const savedTags = localStorage.getItem('excludedTags');
      const excludedTags = savedTags ? JSON.parse(savedTags) : [];

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ excludedTags })
      });

      if (response.ok) {
        await fetchPersona(); // 재조회
      } else {
        setConfirmModal({
          isOpen: true,
          title: "분석 실패",
          message: "게시글이 부족하거나 분석에 실패했습니다.",
          type: "danger",
          singleButton: true,
          onConfirm: closeConfirmModal,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen pb-20 theme-bg animate-fade-in relative">
      <Navigation />

      <main className="w-full max-w-3xl mx-auto px-4 py-8 pt-20 space-y-8">
        {/* 헤더 및 컨트롤 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold theme-text-primary">
              AI Analysis
            </h1>
            <p className="theme-text-secondary text-sm">
              나의 기록이 말해주는 나의 모습
            </p>
          </div>

          {/* 필터 컨트롤 */}
          <div className="flex items-center gap-2 theme-bg-card p-1 rounded-xl shadow-sm border theme-border">
            <button
              onClick={() => setFilterMode("ALL")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterMode === "ALL"
                ? "theme-btn"
                : "theme-text-secondary hover:theme-bg-card-secondary"
                }`}
            >
              All Posts
            </button>
            <div className="h-4 w-[1px] theme-border"></div>
            <div className="flex items-center relative">
              <button
                onClick={() => setFilterMode("MONTH")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${filterMode === "MONTH"
                  ? "theme-btn"
                  : "theme-text-secondary hover:theme-bg-card-secondary"
                  }`}
              >
                <Calendar className="w-3 h-3" />
                <span>Monthly</span>
              </button>
              {/* 월 선택 인풋 (투명하게 위에 덮기) */}
              {filterMode === "MONTH" && (
                <input
                  type="month"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              )}
            </div>
          </div>
        </div>

        {data ? (
          <>
            {/* 1. 페르소나 카드 */}
            <section className="theme-bg-card rounded-3xl p-6 md:p-8 shadow-sm border theme-border relative overflow-hidden">
              {/* 배경 장식 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>

              <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                {/* 아바타 (이미지 또는 이모지) */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-400 to-pink-400 p-1">
                  <div className="w-full h-full rounded-full theme-bg-card flex items-center justify-center text-4xl">
                    {data.representativeEmoji || "🧑‍💻"}
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-sm font-bold text-orange-500 tracking-wide uppercase">
                    나는 어떤 사람인가요?
                  </h2>
                  {(data.digitalSelf || []).map((sent, idx) => (
                    <p
                      key={idx}
                      className="theme-text-primary font-medium leading-relaxed"
                    >
                      {sent}
                    </p>
                  ))}
                </div>

                {/* Key Characteristics (Chips) */}
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {(data.characteristics || []).map((char, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-1.5 rounded-full bg-orange-50 text-orange-700 text-sm font-semibold border border-orange-100"
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* 2. Mood & Stats */}
            <section className="theme-bg-card rounded-3xl p-6 shadow-sm border theme-border">
              <h3 className="font-bold theme-text-primary mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-green-400 rounded-full"></span>
                Mood Analytics
              </h3>
              <div className="theme-bg-card-secondary rounded-2xl p-6">
                <MoodChart moods={data.moods || []} />
              </div>
              <p className="text-center theme-text-secondary text-sm mt-4">
                {filterMode === "MONTH" ? "이번 달" : "전체 기간"} 동안 가장
                많이 느낀 감정은{" "}
                <strong className="theme-text-primary">
                  {data.moods?.[0]?.mood || "없음"}
                </strong>{" "}
                입니다.
              </p>
            </section>

            {/* 3. Word Mind Map */}
            <section>
              <h3 className="font-bold theme-text-primary mb-4 px-2">
                Word Mind Map
              </h3>
              <WordMindMap words={data.wordCloud || []} />
            </section>
          </>
        ) : (
          // 데이터 없음 표시
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 theme-bg-card-secondary rounded-full flex items-center justify-center mx-auto text-3xl">
              🧐
            </div>
            <p className="theme-text-secondary">
              아직 분석된 데이터가 없습니다.
              <br />첫 번째 분석을 시작해보세요!
            </p>
          </div>
        )}

        {/* 하단 분석 버튼 */}
        <div className="sticky bottom-8 flex justify-center z-20">
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="theme-btn px-8 py-4 rounded-full font-bold shadow-xl hover:scale-105 active:scale-95 transition-transform flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {analyzing ? (
              <RefreshCw className="animate-spin w-5 h-5" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            <span>{analyzing ? "AI가 분석 중입니다..." : "새로 분석하기"}</span>
          </button>
        </div>
      </main>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        singleButton={confirmModal.singleButton}
        onConfirm={() => {
          confirmModal.onConfirm();
        }}
        onCancel={closeConfirmModal}
      />
    </div>
  );
}

export default AnalysisPage;
