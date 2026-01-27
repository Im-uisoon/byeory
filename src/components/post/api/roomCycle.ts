import { cleanId } from "./index";

// --- Types ---

export type CycleType = "ROLLING_PAPER" | "EXCHANGE_DIARY";
export type CycleStatus = "IN_PROGRESS" | "COMPLETED";

export interface RoomCycleMember {
  id: number;
  userId: number;
  nickname: string;
  email?: string;
  order?: number;
  turnOrder?: number; // Fallback
  isCompleted: boolean;
  content?: string;
}

export interface RoomCycle {
  id: number;
  roomId: number;
  title: string;
  type: CycleType;
  status: CycleStatus;
  currentTurnOrder: number;
  currentTurnUser?: {
    id: number;
    nickname: string;
  };
  nextTurnTime?: string; // ISO 8601 string
  created_at: string;
  totalMembers: number;

  // Extensions for Detail View
  isMyTurn?: boolean;
  myTurnOrder?: number | null;
  members?: RoomCycleMember[];
}

// --- API Keys ---
// Reusing headers from main API util
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const BASE_URL = "http://localhost:8080";

// --- API Functions ---

// 2.1 Create Cycle
export const createCycleApi = async (
  roomId: string | number,
  payload: {
    title: string;
    type: CycleType;
    targetMemberIds: number[];
    timeLimitHours?: number;
  }
): Promise<RoomCycle> => {
  const numericId = cleanId(roomId);
  const response = await fetch(`${BASE_URL}/api/rooms/${numericId}/cycles`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMsg = "활동 생성에 실패했습니다.";
    try {
      const errData = await response.json();
      if (errData.message) errorMsg = errData.message;
    } catch (e) {
      try {
        const text = await response.text();
        if (text && text.length < 200) errorMsg = text;
      } catch (t) { }
    }

    // Check for 403, 400 (Bad Request often used for business logic), or permission/owner keywords
    if (
      response.status === 403 ||
      response.status === 400 ||
      errorMsg.includes("권한") ||
      errorMsg.includes("Access Denied") ||
      errorMsg.toLowerCase().includes("owner")
    ) {
      throw new Error("방장만 새로운 활동을 시작할 수 있습니다.");
    }

    throw new Error(errorMsg);
  }
  return await response.json();
};

// 2.2 List Cycles in Room
export const fetchRoomCyclesApi = async (
  roomId: string | number
): Promise<RoomCycle[]> => {
  const numericId = cleanId(roomId);
  const response = await fetch(`${BASE_URL}/api/rooms/${numericId}/cycles`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    console.warn("Fetched cycles failed or empty");
    return [];
  }
  return await response.json();
};

// 2.2 Get Cycle Detail
export const fetchCycleDetailApi = async (
  cycleId: string | number
): Promise<RoomCycle> => {
  const response = await fetch(`${BASE_URL}/api/cycles/${cycleId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch cycle detail");
  }
  return await response.json();
};

// 2.3 Get Cycle Content (Shared Post)
export const fetchCycleContentApi = async (
  cycleId: string | number
): Promise<any> => {
  const response = await fetch(`${BASE_URL}/api/cycles/${cycleId}/content`, {
    headers: getAuthHeaders(),
  });

  if (response.status === 204) return null; // No Content
  if (response.status === 404) return null; // Not Found (Initial state)

  if (!response.ok) {
    throw new Error("Failed to fetch cycle content");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

// 2.4 Save Cycle Content
export const saveCycleContentApi = async (
  cycleId: string | number,
  data: any
): Promise<void> => {
  const response = await fetch(`${BASE_URL}/api/cycles/${cycleId}/content`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to save cycle content");
  }
};

// 2.5 Pass Turn (Signal only)
export const passTurnApi = async (
  cycleId: string | number
): Promise<RoomCycle> => {
  const response = await fetch(`${BASE_URL}/api/cycles/${cycleId}/pass`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to pass turn");
  }
  return await response.json();
};
