import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { API_BASE_URL } from "@/config";

export interface DailyQuest {
  id: string;
  description: string;
  reward: number;
  isCompleted: boolean;
  isClaimable: boolean;
  type: "login" | "time" | "widget" | "post";
  targetValue?: number;
}

interface CreditContextType {
  userId: string | null;
  credits: number;
  addCredits: (amount: number, reason?: string) => Promise<void>;
  spendCredits: (amount: number, reason?: string) => boolean;
  dailyQuests: DailyQuest[];
  claimQuest: (questId: string) => void;
  resetTime: string;
  triggerWidgetInteraction: () => void;
  triggerPostCreation: () => void;
  refreshCredits: () => Promise<void>;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const CreditProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [resetTime, setResetTime] = useState<string>("");

  // Memoize refreshCredits
  const refreshCredits = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const profile = await response.json();
        if (profile.id) {
          setUserId(String(profile.id));
        }
        if (profile.credits !== undefined) {
          setCredits(profile.credits);
        }
      }
    } catch (e) {
      console.error("Failed to fetch credits", e);
    }
  }, []);

  // Helper to get today's date string in KST
  const getKSTDateString = useCallback(() => {
    return new Date().toLocaleDateString("en-US", { timeZone: "Asia/Seoul" });
  }, []);

  const getDefaultQuests = useCallback(
    (): DailyQuest[] => [
      {
        id: "login",
        description: "매일 로그인",
        reward: 50,
        isCompleted: false,
        isClaimable: true,
        type: "login",
      },
      {
        id: "time_30m",
        description: "30분 접속 유지",
        reward: 50,
        isCompleted: false,
        isClaimable: false,
        type: "time",
        targetValue: 30,
      },
      {
        id: "time_1h",
        description: "1시간 접속 유지",
        reward: 100,
        isCompleted: false,
        isClaimable: false,
        type: "time",
        targetValue: 60,
      },
      {
        id: "widget_play",
        description: "위젯 상호작용하기",
        reward: 10,
        isCompleted: false,
        isClaimable: false,
        type: "widget",
      },
      {
        id: "write_post",
        description: "글 작성하기",
        reward: 100,
        isCompleted: false,
        isClaimable: false,
        type: "post",
      },
    ],
    []
  );

  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(
    getDefaultQuests()
  );

  // Load user-specific quests when userId changes
  useEffect(() => {
    if (!userId) {
      setDailyQuests(getDefaultQuests());
      return;
    }

    const todayKST = getKSTDateString();
    const questKey = `daily_quests_${userId}`;
    const dateKey = `last_quest_date_${userId}`;

    const savedQuests = localStorage.getItem(questKey);
    const lastQuestDate = localStorage.getItem(dateKey);

    if (savedQuests && lastQuestDate === todayKST) {
      try {
        const parsed = JSON.parse(savedQuests);
        const defaultQuests = getDefaultQuests();
        setDailyQuests(
          defaultQuests.map((def) => {
            const saved = parsed.find((p: DailyQuest) => p.id === def.id);
            return saved
              ? {
                ...def,
                isCompleted: saved.isCompleted,
                isClaimable: saved.isClaimable,
              }
              : def;
          })
        );
      } catch (e) {
        console.error("Failed to parse saved quests", e);
        setDailyQuests(getDefaultQuests());
      }
    } else {
      // New day or first time for this user
      setDailyQuests(getDefaultQuests());
    }
  }, [userId, getKSTDateString, getDefaultQuests]);

  useEffect(() => {
    refreshCredits();
  }, [refreshCredits]);

  useEffect(() => {
    if (!userId) return;

    const todayKST = getKSTDateString();
    const questKey = `daily_quests_${userId}`;
    const dateKey = `last_quest_date_${userId}`;

    localStorage.setItem(questKey, JSON.stringify(dailyQuests));
    localStorage.setItem(dateKey, todayKST);
  }, [dailyQuests, userId, getKSTDateString]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const kstOffset = 9 * 60 * 60000;
      const nowKST = new Date(utc + kstOffset);
      const tomorrowKST = new Date(nowKST);
      tomorrowKST.setHours(24, 0, 0, 0);
      const diff = tomorrowKST.getTime() - nowKST.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setResetTime(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkServerPlayTime = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/user/playtime`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          const totalSeconds = await response.json();
          const totalMinutes = Math.floor(totalSeconds / 60);
          setDailyQuests((prev) =>
            prev.map((q) => {
              if (
                q.type === "time" &&
                !q.isCompleted &&
                !q.isClaimable &&
                q.targetValue
              ) {
                if (totalMinutes >= q.targetValue) {
                  return { ...q, isClaimable: true };
                }
              }
              return q;
            })
          );
        }
      } catch (e) {
        console.error("Failed to check server playtime for quests", e);
      }
    };
    const interval = setInterval(checkServerPlayTime, 60000);
    checkServerPlayTime();
    return () => clearInterval(interval);
  }, []);

  const addCredits = useCallback(
    async (amount: number, reason?: string) => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      try {
        await fetch(`${API_BASE_URL}/api/credits/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount }),
        });
        refreshCredits();
      } catch (e) {
        console.error("Failed to add credits", e);
      }
    },
    [refreshCredits]
  );

  const spendCredits = useCallback(
    (amount: number, reason?: string) => {
      if (credits >= amount) {
        setCredits((prev) => prev - amount); // Optimistic update
        // Sync with backend (UserService allows negative addCredits)
        addCredits(-amount, reason || "Spent credits").catch((e) => {
          console.error("Failed to sync spent credits", e);
          refreshCredits();
        });
        return true;
      }
      return false;
    },
    [credits, addCredits, refreshCredits]
  );

  const claimQuest = useCallback(
    async (questId: string) => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      // questId를 백엔드 questType으로 매핑
      const questTypeMap: Record<string, string> = {
        login: "DAILY_LOGIN",
        time_30m: "DAILY_PLAYTIME_30MIN",
        time_1h: "DAILY_PLAYTIME_1HR",
        write_post: "DAILY_POST_WRITE",
        widget_play: "DAILY_TOUCH",
      };

      const questType = questTypeMap[questId];
      if (!questType) {
        console.error("Unknown quest type:", questId);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/quest/claim`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ questType }),
        });

        if (response.ok) {
          // 서버에서 성공적으로 처리된 경우에만 UI 업데이트
          setDailyQuests((prev) =>
            prev.map((q) =>
              q.id === questId ? { ...q, isCompleted: true } : q
            )
          );
          await refreshCredits();
        } else {
          const error = await response.text();
          console.error("Quest claim failed:", error);
          if (error.includes("Already claimed")) {
            alert("이미 오늘 받은 보상입니다.");
          } else {
            alert("퀘스트 보상을 받을 수 없습니다. (조건 미달)");
          }
        }
      } catch (e) {
        console.error("Failed to claim quest", e);
        alert("퀘스트 보상 처리 중 오류가 발생했습니다.");
      }
    },
    [refreshCredits]
  );

  // Auto-enable login quest
  useEffect(() => {
    setDailyQuests((prev) =>
      prev.map((q) =>
        q.type === "login" && !q.isCompleted ? { ...q, isClaimable: true } : q
      )
    );
  }, []);

  const triggerWidgetInteraction = useCallback(() => {
    setDailyQuests((prev) =>
      prev.map((q) => {
        if (q.id === "widget_play" && !q.isCompleted) {
          return { ...q, isClaimable: true };
        }
        return q;
      })
    );
  }, []);

  const triggerPostCreation = useCallback(() => {
    setDailyQuests((prev) =>
      prev.map((q) => {
        if (q.id === "write_post" && !q.isCompleted) {
          return { ...q, isClaimable: true };
        }
        return q;
      })
    );
  }, []);

  const contextValue = useMemo(
    () => ({
      userId,
      credits,
      addCredits,
      spendCredits,
      dailyQuests,
      claimQuest,
      resetTime,
      triggerWidgetInteraction,
      triggerPostCreation,
      refreshCredits,
    }),
    [
      userId,
      credits,
      addCredits,
      spendCredits,
      dailyQuests,
      claimQuest,
      resetTime,
      triggerWidgetInteraction,
      triggerPostCreation,
      refreshCredits,
    ]
  );

  return (
    <CreditContext.Provider value={contextValue}>
      {children}
    </CreditContext.Provider>
  );
};

export const useCredits = () => {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error("useCredits must be used within a CreditProvider");
  }
  return context;
};
