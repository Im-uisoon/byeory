import { createClient } from "@supabase/supabase-js";
import type { Block } from "../types";
import { LAYOUT_PRESETS } from "../constants";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

const BASE_URL = "http://localhost:8080";
const API_BASE_URL = `${BASE_URL}/api/posts`;
const API_ALBUM_URL = `${BASE_URL}/api/albums`;
const API_ROOM_URL = `${BASE_URL}/api/rooms`;
export const API_TEMPLATE_URL = `${BASE_URL}/api/templates`; // Fixed URL matching Controller
// Helper to safely decode URI components
const safeDecodeURIComponent = (str: string) => {
  try {
    return decodeURIComponent(str);
  } catch (e) {
    console.warn("URI Decode Failed:", str, e);
    return str; // Return original string or empty if completely broken
  }
};


export const cleanId = (id: string | number): string => {
  return String(id).replace(/^room-/, "");
};

// Singleton Pattern for Supabase Client
const getSupabaseClient = () => {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;

  const globalVar = window as any;
  if (!globalVar.__supabaseClient) {
    globalVar.__supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return globalVar.__supabaseClient;
};

export const supabase = getSupabaseClient();

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const deleteOldImage = async (oldUrl: string | null) => {
  if (!oldUrl) return;

  try {
    const filePath = oldUrl.split("/blog-assets/").pop();

    if (filePath && supabase) {
      const { error } = await supabase.storage
        .from("blog-assets")
        .remove([filePath]);

      if (error) {
        console.warn("기존 이미지 삭제 실패 (무시하고 진행):", error);
      }
    }
  } catch (e) {
    console.warn("삭제 로직 처리 중 오류:", e);
  }
};

export const uploadImageToSupabase = async (
  file: File
): Promise<string | null> => {
  if (!supabase) return null;
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}_${Math.random()
    .toString(36)
    .substring(7)}.${fileExt}`;
  const { error } = await supabase.storage
    .from("blog-assets")
    .upload(fileName, file);
  if (error) {
    console.error(error);
    return null;
  }
  const { data } = supabase.storage.from("blog-assets").getPublicUrl(fileName);
  return data.publicUrl;
};

// 🤖 AI 글 생성 로직 (편집자 모드)
export const generateBlogContent = async (
  topic: string,
  layoutId: string,
  tempImages: string[]
) => {
  const layout =
    LAYOUT_PRESETS.find((l) => l.id === layoutId) || LAYOUT_PRESETS[0];
  const structureTemplate = JSON.stringify(layout.structure);

  const MODEL_NAME = "gemini-2.5-flash";

  const prompt = `
        역할: 너는 사용자가 입력한 텍스트를 보기 좋게 다듬어서 배치해주는 '텍스트 편집자'야.
        
        [사용자 입력 텍스트]:
        "${topic}"
        
        [지시사항 - 절대 준수]:
        1. **창작 금지**: 사진에 대해 설명하거나, 사용자가 입력하지 않은 내용을 상상해서 덧붙이지 마.
        2. **내용 분배**: 사용자가 입력한 텍스트를 문맥에 맞게 잘라서 아래 [JSON 템플릿]의 "text" 필드에 나눠 담아줘.
        3. **연결성**: 글이 끊기지 않고 자연스럽게 이어지도록 문장을 다듬거나(오타 수정, 매끄러운 연결어 추가) 문단만 나눠.
        4. 만약 입력된 텍스트 양이 적다면, 억지로 늘리지 말고 담백하게 짧게 작성해.

        [JSON 템플릿 - 이 구조(type) 순서 그대로 채울 것]:
        ${structureTemplate}
        
        [출력 포맷]:
        오직 JSON Array만 출력해.
    `;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);

    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    text = text.replace(/```json|```/g, "").trim();

    let aiBlocks;
    try {
      aiBlocks = JSON.parse(text);
    } catch {
      return [];
    }

    let imgIndex = 0;
    const newBlocks: Block[] = aiBlocks.map((b: any, idx: number) => {
      let imageUrl = undefined;
      let imageUrl2 = undefined;

      if (b.type.includes("image")) {
        if (b.type === "image-double") {
          imageUrl =
            imgIndex < tempImages.length ? tempImages[imgIndex++] : null;
          imageUrl2 =
            imgIndex < tempImages.length ? tempImages[imgIndex++] : null;
        } else {
          imageUrl =
            imgIndex < tempImages.length ? tempImages[imgIndex++] : null;
        }
      }

      return {
        id: `ai-${Date.now()}-${idx}`,
        type: b.type,
        text: b.text || "",
        imageUrl,
        imageUrl2,
        imageRotation: 0,
        imageFit: "cover",
      };
    });

    return newBlocks;
  } catch (e) {
    console.error(e);
    throw new Error("AI 생성 실패");
  }
};

// Helper to sanitize coordinates
const sanitizeCoordinate = (val: any): number | string => {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    // Valid percentage (strictly numbers followed by %)
    if (/^-?\d+(\.\d+)?%$/.test(val)) return val;
    // Otherwise try to parse number (handles "50px", "123.4", etc.)
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// 게시글 단건 조회 (GET)
export const fetchPostById = async (id: string | number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("게시글 불러오기 실패");
    const p = await response.json();

    return {
      ...p,
      id: Number(p.id),
      tags: (p.hashtags || p.tags || [])
        .map((t: any) => {
          if (typeof t === "string") return t;
          return t.name || t.tag || t.tagName || "";
        })
        .filter(Boolean),
      stickers: (p.stickers || []).map((s: any) => ({
        ...s,
        x: sanitizeCoordinate(s.x),
        y: sanitizeCoordinate(s.y),
        w: sanitizeCoordinate(s.w),
        h: sanitizeCoordinate(s.h),
        opacity: s.opacity || 1,
        // Widget Persistence Decoding
        widgetType: s.url && s.url.startsWith('widget://')
          ? safeDecodeURIComponent(s.url.split('widget://')[1].split('?')[0])
          : undefined,
        widgetProps: s.url && s.url.startsWith('widget://')
          ? (() => {
            try {
              const params = new URLSearchParams(s.url.split('?')[1]);
              const propsStr = params.get('props');
              return propsStr ? JSON.parse(safeDecodeURIComponent(propsStr)) : {};
            } catch (e) {
              console.warn("Widget Props Parse Failed:", e);
              return {};
            }
          })()
          : undefined
      })),
      floatingTexts: (p.floatingTexts || []).map((t: any) => ({
        ...t,
        x: sanitizeCoordinate(t.x),
        y: sanitizeCoordinate(t.y),
        w: sanitizeCoordinate(t.w),
        h: sanitizeCoordinate(t.h),
        opacity: t.opacity || 1,
      })),
      floatingImages: (p.floatingImages || []).map((i: any) => ({
        ...i,
        x: sanitizeCoordinate(i.x),
        y: sanitizeCoordinate(i.y),
        w: sanitizeCoordinate(i.w),
        h: sanitizeCoordinate(i.h),
        opacity: i.opacity || 1,
      })),
      titleStyles: p.titleStyles || {},
      albumIds: (p.targetAlbumIds || []).map((t: any) => {
        if (typeof t === "object" && t !== null) return String(t.id);
        return String(t);
      }),
      isFavorite: p.isFavorite || false,
      mode: p.mode || "AUTO",
      isPublic: p.isPublic ?? true,
      styles: p.styles || {},
      visibility: p.isPublic === false ? "private" : "public",
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

// 게시글 목록 조회 (GET)
export const fetchPostsFromApi = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("게시글 불러오기 실패");
    const posts = await response.json();

    return posts.map((p: any) => ({
      ...p,
      id: Number(p.id),
      tags: (p.hashtags || p.tags || [])
        .map((t: any) => {
          if (typeof t === "string") return t;
          return t.name || t.tag || t.tagName || "";
        })
        .filter(Boolean),
      stickers: (p.stickers || []).map((s: any) => ({
        ...s,
        x: sanitizeCoordinate(s.x),
        y: sanitizeCoordinate(s.y),
        w: sanitizeCoordinate(s.w),
        h: sanitizeCoordinate(s.h),
        opacity: s.opacity || 1, // Fix invisible items
        // Widget Persistence Decoding
        widgetType: s.url && s.url.startsWith('widget://')
          ? safeDecodeURIComponent(s.url.split('widget://')[1].split('?')[0])
          : undefined,
        widgetProps: s.url && s.url.startsWith('widget://')
          ? (() => {
            try {
              const params = new URLSearchParams(s.url.split('?')[1]);
              const propsStr = params.get('props');
              return propsStr ? JSON.parse(safeDecodeURIComponent(propsStr)) : {};
            } catch (e) {
              console.warn("Widget Props Parse Failed:", e);
              return {};
            }
          })()
          : undefined
      })),
      floatingTexts: (p.floatingTexts || []).map((t: any) => ({
        ...t,
        x: sanitizeCoordinate(t.x),
        y: sanitizeCoordinate(t.y),
        w: sanitizeCoordinate(t.w),
        h: sanitizeCoordinate(t.h),
        opacity: t.opacity || 1, // Fix invisible items
      })),
      floatingImages: (p.floatingImages || []).map((i: any) => ({
        ...i,
        x: sanitizeCoordinate(i.x),
        y: sanitizeCoordinate(i.y),
        w: sanitizeCoordinate(i.w),
        h: sanitizeCoordinate(i.h),
        opacity: i.opacity || 1, // Fix invisible items
      })),
      titleStyles: p.titleStyles || {},
      albumIds: (p.targetAlbumIds || []).map((t: any) => {
        if (typeof t === "object" && t !== null) return String(t.id);
        return String(t);
      }),
      isFavorite: p.isFavorite || false,
      mode: p.mode || "AUTO",
      isPublic: p.isPublic ?? true,
      styles: p.styles || {}, // Paper Styles
      visibility: p.isPublic === false ? "private" : "public",
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

// 게시글 저장 (생성 POST / 수정 PUT)
export const savePostToApi = async (
  postData: any,
  isUpdate: boolean = false
) => {
  try {
    const url = isUpdate ? `${API_BASE_URL}/${postData.id}` : API_BASE_URL;
    const method = isUpdate ? "PUT" : "POST";

    const payload = {
      title: postData.title,
      titleStyles: postData.titleStyles || {},
      blocks: postData.blocks || [],
      stickers: (postData.stickers || []).map((s: any) => {
        // Widget Persistence Encoding
        if (s.widgetType) {
          return {
            ...s,
            url: `widget://${encodeURIComponent(s.widgetType)}?props=${encodeURIComponent(JSON.stringify(s.widgetProps || {}))}`
          };
        }
        return s;
      }),
      floatingTexts: postData.floatingTexts || [],
      floatingImages: postData.floatingImages || [],
      tags: postData.tags || [],
      mode: postData.mode || "AUTO",
      targetAlbumIds: (postData.albumIds || [])
        .map((id: any) => Number(id))
        .filter((n: number) => !isNaN(n)),
      isFavorite: postData.isFavorite || false,
      isPublic: postData.isPublic ?? true,
      styles: postData.styles, // Paper Styles
    };

    const response = await fetch(url, {
      method: method,
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Save failed with status:",
        response.status,
        "Body:",
        errorText
      );
      throw new Error(`저장 실패: ${response.status} ${errorText}`);
    }
    const savedPost = await response.json();

    return {
      ...savedPost,
      id: Number(savedPost.id),
      tags: (savedPost.hashtags || [])
        .map((t: any) => {
          if (typeof t === "string") return t;
          return t.name || t.tag || t.tagName || "";
        })
        .filter(Boolean),
      stickers: (savedPost.stickers || []).map((s: any) => ({
        ...s,
        x: sanitizeCoordinate(s.x),
        y: sanitizeCoordinate(s.y),
        w: sanitizeCoordinate(s.w),
        h: sanitizeCoordinate(s.h),
        opacity: s.opacity || 1, // Fix invisible items
        // Widget Persistence Decoding
        widgetType: s.url && s.url.startsWith('widget://')
          ? safeDecodeURIComponent(s.url.split('widget://')[1].split('?')[0])
          : undefined,
        widgetProps: s.url && s.url.startsWith('widget://')
          ? (() => {
            try {
              const params = new URLSearchParams(s.url.split('?')[1]);
              const propsStr = params.get('props');
              return propsStr ? JSON.parse(safeDecodeURIComponent(propsStr)) : {};
            } catch (e) {
              console.warn("Widget Props Parse Failed:", e);
              return {};
            }
          })()
          : undefined
      })),
      floatingTexts: (savedPost.floatingTexts || []).map((t: any) => ({
        ...t,
        x: sanitizeCoordinate(t.x),
        y: sanitizeCoordinate(t.y),
        w: sanitizeCoordinate(t.w),
        h: sanitizeCoordinate(t.h),
      })),
      floatingImages: (savedPost.floatingImages || []).map((i: any) => ({
        ...i,
        x: sanitizeCoordinate(i.x),
        y: sanitizeCoordinate(i.y),
        w: sanitizeCoordinate(i.w),
        h: sanitizeCoordinate(i.h),
        opacity: i.opacity || 1, // ✨ Fix invisible items
      })),
      titleStyles: savedPost.titleStyles || {},
      albumIds: (savedPost.targetAlbumIds || []).map((t: any) => {
        if (typeof t === "object" && t !== null) return String(t.id);
        return String(t);
      }),
      isFavorite: savedPost.isFavorite || false,
      mode: savedPost.mode || "AUTO",
      isPublic: savedPost.isPublic ?? true,
      styles: savedPost.styles || {}, // Paper Styles
      visibility: savedPost.isPublic === false ? "private" : "public",
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// 게시글 삭제
export const deletePostApi = async (id: string | number) => {
  try {
    const url = `${API_BASE_URL}/${id}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error("삭제 실패");
    return true;
  } catch (error) {
    console.error("삭제 API 오류:", error);
    return false;
  }
};

// 템플릿 복원 (PUT)
export const restorePostTemplateApi = async (templateId: number) => {
  try {
    const response = await fetch(`${API_TEMPLATE_URL}/${templateId}/restore`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`템플릿 복원 실패: ${response.status} ${errorText}`);
    }
    return true;
  } catch (error) {
    console.error("템플릿 복원 API 오류:", error);
    throw error;
  }
};

// 앨범 목록 조회 (GET)
export const fetchAlbumsFromApi = async () => {
  try {
    const response = await fetch(`${API_ALBUM_URL}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("앨범 불러오기 실패");
    const albums = await response.json();
    return albums.map((a: any) => {
      let mappedTag = a.tag;
      if (!mappedTag && a.representativeHashtag) {
        mappedTag = a.representativeHashtag.name || a.representativeHashtag.tag;
      }

      return {
        ...a,
        id: String(a.id),
        parentId: a.parentId ? String(a.parentId) : null,
        tag: mappedTag || null,
        type: "album",
        coverConfig: a.coverConfig || a.cover_config,
        postCount: a.postCount !== undefined ? a.postCount : 0,
        folderCount: a.folderCount !== undefined ? a.folderCount : 0,
      };
    });
  } catch (error) {
    console.error(error);
    return [];
  }
};

// 참여한 모임방 목록 조회 (GET) - 내 리스트
export const fetchRoomsFromApi = async () => {
  try {
    const response = await fetch(`${API_ROOM_URL}/my`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("모임방 불러오기 실패");
    const rooms = await response.json();
    return rooms.map((r: any) => ({
      ...r,
      id: `room-${r.id}`, // ID Prepend to prevent collision
      parentId: null,
      tag:
        r.tag ||
        (r.representativeHashtag
          ? r.representativeHashtag.name || r.representativeHashtag.tag
          : null),
      type: "room",
      role: r.role,
      ownerId: r.ownerId || (r.owner ? r.owner.id : null),
      ownerEmail: r.ownerEmail || (r.owner ? r.owner.email : null),
      coverConfig: r.coverConfig || r.cover_config,
      postCount: r.postCount !== undefined ? r.postCount : 0,
      folderCount: r.folderCount !== undefined ? r.folderCount : 0,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

// 모임방 입장 (POST)
export const joinRoomApi = async (roomId: string, password?: string) => {
  try {
    const numericId = cleanId(roomId);
    const response = await fetch(`${API_ROOM_URL}/${numericId}/join`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      let errorMessage = "모임방 입장에 실패했습니다.";
      try {
        const text = await response.text();
        if (text) {
          try {
            const err = JSON.parse(text);
            errorMessage = err.message || errorMessage;
          } catch (jsonError) {
            if (text.length < 200) {
              errorMessage = text;
            }
          }
        }
      } catch (e) { }
      throw new Error(errorMessage);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};

// 모임방 나가기 (DELETE) - 일반 멤버용
export const leaveRoomApi = async (roomId: string) => {
  try {
    const response = await fetch(`${API_ROOM_URL}/${cleanId(roomId)}/leave`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || "모임방 나가기 실패");
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

// 멤버 강퇴 (DELETE) - 방장용
export const kickMemberApi = async (roomId: string, userId: string) => {
  try {
    const response = await fetch(
      `${API_ROOM_URL}/${cleanId(roomId)}/members/${userId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) {
      throw new Error("멤버 강퇴 실패");
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

// 멤버 목록 조회 (GET)
export const fetchRoomMembersApi = async (roomId: string) => {
  try {
    const response = await fetch(`${API_ROOM_URL}/${cleanId(roomId)}/members`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("멤버 목록 불러오기 실패");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

// 모임방 삭제 (DELETE)
export const deleteRoomApi = async (roomId: string) => {
  try {
    const response = await fetch(`${API_ROOM_URL}/${cleanId(roomId)}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("모임방 삭제 실패");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

// 앨범 단건 조회 (GET)
export const fetchAlbumApi = async (id: string | number) => {
  try {
    const response = await fetch(`${API_ALBUM_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("앨범 정보 불러오기 실패");
    const album = await response.json();
    return {
      ...album,
      id: String(album.id),
      parentId: album.parentId ? String(album.parentId) : null,
      roomConfig: album.roomConfig,
      coverConfig: album.coverConfig || album.cover_config,
      postCount: album.postCount !== undefined ? album.postCount : 0,
      folderCount: album.folderCount !== undefined ? album.folderCount : 0,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

// 모임방 단건 조회 (GET)
export const fetchRoomApi = async (id: string | number) => {
  try {
    const response = await fetch(`${API_ROOM_URL}/${cleanId(id)}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("모임방 정보 불러오기 실패");
    const room = await response.json();
    return {
      ...room,
      id: `room-${room.id}`,
      parentId: null,
      roomConfig: {
        description: room.description,
        password: room.password,
      },
      coverConfig: room.coverConfig || room.cover_config,
      role: room.role,
      ownerId: room.ownerId || (room.owner ? room.owner.id : null),
      ownerEmail: room.ownerEmail || (room.owner ? room.owner.email : null),
      postCount: room.postCount !== undefined ? room.postCount : 0,
      folderCount: room.folderCount !== undefined ? room.folderCount : 0,
      type: "room",
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

// 앨범 생성 (POST)
export const createAlbumApi = async (albumData: any) => {
  try {
    const response = await fetch(`${API_ALBUM_URL}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(albumData),
    });
    if (!response.ok) throw new Error("앨범 생성 실패");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

// 모임방 생성 (POST)
// 모임방 생성 (POST)
export const createRoomApi = async (roomData: any) => {
  try {
    const response = await fetch(`${API_ROOM_URL}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(roomData),
    });

    if (!response.ok) {
      let errorMsg = "모임방 생성에 실패했습니다.";
      try {
        const errData = await response.json();
        if (errData.message) errorMsg = errData.message;
      } catch (e) {
        // JSON 파싱 실패 시 텍스트 읽기
        try {
          const text = await response.text();
          if (text && text.length < 100) errorMsg = text;
        } catch (t) { }
      }

      // 사용자 요청 반영: 구체적인 권한 안내 메시지 추가 (만약 403 Forbidden 등)
      if (response.status === 403 || errorMsg.includes("권한")) {
        throw new Error("방 생성 권한이 없습니다.\n(방 생성은 방장만 가능하거나 제한될 수 있습니다.)");
      }

      throw new Error(errorMsg);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error; // 에러를 호출부로 전파
  }
};

// 모임방 수정 (PUT)
export const updateRoomApi = async (id: string | number, roomData: any) => {
  try {
    const response = await fetch(`${API_ROOM_URL}/${cleanId(id)}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(roomData),
    });
    if (!response.ok) throw new Error("모임방 수정 실패");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

// 앨범 수정 (PUT)
export const updateAlbumApi = async (id: string | number, albumData: any) => {
  try {
    const response = await fetch(`${API_ALBUM_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(albumData),
    });
    if (!response.ok) throw new Error("앨범 수정 실패");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

// 앨범 삭제 (DELETE)
export const deleteAlbumApi = async (id: string | number) => {
  try {
    const response = await fetch(`${API_ALBUM_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("앨범 삭제 실패");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

// 앨범 콘텐츠 조회
export const fetchAlbumContents = async (
  albumId: string | number,
  providedPosts?: any[],
  providedAlbums?: any[],
  type: "album" | "room" = "album"
) => {
  const targetId = String(albumId);

  // 1. Special Folders: Use existing client-side logic (Fetch All)
  if (targetId === "__all__" || targetId === "__others__") {
    let posts = providedPosts;
    let albums = providedAlbums;

    if (!posts) posts = await fetchPostsFromApi();
    if (!albums) albums = await fetchAlbumsFromApi();

    const localPosts = posts || [];
    const localAlbums = albums || [];
    const contents: any[] = [];

    // Posts
    let matchedPosts: any[] = [];
    if (targetId === "__all__") {
      matchedPosts = localPosts;
    } else {
      // __others__ : Unclassified (No Tags)
      matchedPosts = localPosts.filter((p: any) => {
        const hasTags = p.tags && p.tags.length > 0;
        return !hasTags;
      });
    }
    matchedPosts.forEach((p: any) => contents.push({ type: "POST", data: p }));

    // Folders
    const matchedFolders = localAlbums
      .filter((a: any) => {
        if (targetId === "__all__") return a.parentId;
        return false;
      })
      .map((a: any) => {
        const parent = localAlbums.find(
          (p: any) => String(p.id) === String(a.parentId)
        );
        return {
          ...a,
          parentName: parent ? parent.name : null,
        };
      });

    // Add "Unclassified" (미분류) Folder if in All View
    if (targetId === "__all__") {
      const untaggedCount = localPosts.filter(
        (p: any) => !p.tags || p.tags.length === 0
      ).length;
      if (untaggedCount > 0) {
        matchedFolders.unshift({
          id: "__others__",
          name: "미분류",
          type: "FOLDER",
          parentId: null,
          isSystem: true,
          postCount: untaggedCount,
        });
      }
    }

    matchedFolders.forEach((a: any) =>
      contents.push({ type: "FOLDER", data: a })
    );

    // Sort
    const sortedFolders = matchedFolders.sort((a: any, b: any) => {
      if (a.id === "__others__") return -1;
      if (b.id === "__others__") return 1;
      return a.name.localeCompare(b.name);
    });
    const sortedPosts = matchedPosts.sort((a: any, b: any) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return [
      ...sortedFolders.map((d: any) => ({ type: "FOLDER" as const, data: d })),
      ...sortedPosts.map((d: any) => ({ type: "POST" as const, data: d })),
    ];
  }

  // 2. Specific Album or Room: Use Optimized Backend Endpoint
  try {
    let url = `${API_ALBUM_URL}/${targetId}/contents`;
    if (type === "room") {
      url = `${API_ROOM_URL}/${cleanId(targetId)}/posts`;
    }

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok)
      throw new Error(
        `${type === "room" ? "모임방" : "앨범"} 콘텐츠 불러오기 실패`
      );

    const data = await response.json();
    const contents: any[] = [];

    if (data.albums && Array.isArray(data.albums)) {
      data.albums.forEach((a: any) =>
        contents.push({ type: "FOLDER", data: a })
      );
    }
    if (data.posts && Array.isArray(data.posts)) {
      data.posts.forEach((p: any) =>
        contents.push({
          type: "POST",
          data: {
            ...p,
            tags: p.hashtags || p.tags || [],
            visibility: p.isPublic === false ? "private" : "public",
            stickers: (p.stickers || []).map((s: any) => ({
              ...s,
              x: sanitizeCoordinate(s.x),
              y: sanitizeCoordinate(s.y),
              w: sanitizeCoordinate(s.w),
              h: sanitizeCoordinate(s.h),
              opacity: s.opacity || 1,
              // Widget Persistence Decoding for Album View
              widgetType: s.url && s.url.startsWith('widget://')
                ? decodeURIComponent(s.url.split('widget://')[1].split('?')[0])
                : undefined,
              widgetProps: s.url && s.url.startsWith('widget://')
                ? JSON.parse(decodeURIComponent(new URLSearchParams(s.url.split('?')[1]).get('props') || '{}'))
                : undefined
            })),
          },
        })
      );
    }

    if (Array.isArray(data)) {
      data.forEach((item: any) => {
        if (item.type && item.content) {
          if (item.type === "POST") {
            contents.push({
              type: "POST",
              data: {
                ...item.content,
                tags: item.content.hashtags || item.content.tags || [],
                visibility:
                  item.content.isPublic === false ? "private" : "public",
                stickers: (item.content.stickers || []).map((s: any) => ({
                  ...s,
                  x: sanitizeCoordinate(s.x),
                  y: sanitizeCoordinate(s.y),
                  w: sanitizeCoordinate(s.w),
                  h: sanitizeCoordinate(s.h),
                  opacity: s.opacity || 1,
                  // Widget Persistence Decoding for Mixed View
                  widgetType: s.url && s.url.startsWith('widget://')
                    ? decodeURIComponent(s.url.split('widget://')[1].split('?')[0])
                    : undefined,
                  widgetProps: s.url && s.url.startsWith('widget://')
                    ? JSON.parse(decodeURIComponent(new URLSearchParams(s.url.split('?')[1]).get('props') || '{}'))
                    : undefined
                })),
              },
            });
          } else if (item.type === "FOLDER" || item.type === "ALBUM") {
            contents.push({
              type: "FOLDER",
              data: {
                ...item.content,
                id: String(item.content.id),
                parentId: item.content.parentId
                  ? String(item.content.parentId)
                  : null,
              },
            });
          }
          return;
        }

        if (item.name && !item.title) {
          contents.push({
            type: "FOLDER",
            data: {
              ...item,
              id: String(item.id),
              parentId: item.parentId ? String(item.parentId) : null,
            },
          });
        } else if (item.title) {
          contents.push({
            type: "POST",
            data: {
              ...item,
              tags: item.hashtags || item.tags || [],
              visibility: item.isPublic === false ? "private" : "public",
              stickers: (item.stickers || []).map((s: any) => ({
                ...s,
                x: sanitizeCoordinate(s.x),
                y: sanitizeCoordinate(s.y),
                w: sanitizeCoordinate(s.w),
                h: sanitizeCoordinate(s.h),
                opacity: s.opacity || 1,
                // Widget Persistence Decoding for Folder View
                widgetType: s.url && s.url.startsWith('widget://')
                  ? decodeURIComponent(s.url.split('widget://')[1].split('?')[0])
                  : undefined,
                widgetProps: s.url && s.url.startsWith('widget://')
                  ? JSON.parse(decodeURIComponent(new URLSearchParams(s.url.split('?')[1]).get('props') || '{}'))
                  : undefined
              })),
            },
          });
        }
      });
    }

    return contents;
  } catch (e) {
    console.error(e);
    return [];
  }
};

// 앨범 관리 (항목 추가/제거/이동) - Optimized API
export const manageAlbumContentApi = async (
  albumId: string | number,
  action: "ADD" | "REMOVE" | "MOVE",
  postId: string | number,
  sourceAlbumId?: string | number,
  containerType: "album" | "room" = "album"
) => {
  try {
    const payload: any = {
      action,
      contentId: Number(postId),
      type: "POST",
    };

    if (action === "MOVE" && sourceAlbumId) {
      payload.sourceAlbumId = Number(sourceAlbumId);
    }

    let url = `${API_ALBUM_URL}/${albumId}/manage`;
    if (containerType === "room") {
      url = `${API_ROOM_URL}/${cleanId(albumId)}/manage`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
};

// 앨범 항목 관리 Wrapper
export const manageAlbumItem = async (
  albumId: string | number,
  action: "ADD" | "REMOVE" | "MOVE",
  type: "POST" | "FOLDER",
  contentId: string | number,
  sourceAlbumId?: string | number,
  containerType: "album" | "room" = "album"
) => {
  // Post Management: Use Optimized Endpoint
  if (type === "POST") {
    const success = await manageAlbumContentApi(
      albumId,
      action,
      contentId,
      sourceAlbumId,
      containerType
    );
    if (success) {
      return true;
    }
    return false;
  }

  // Folder Management: Move Folder (Change Parent)
  if (type === "FOLDER") {
    const albums = await fetchAlbumsFromApi();
    const targetAlbum = albums.find(
      (a: any) => String(a.id) === String(contentId)
    );

    if (!targetAlbum) return false;

    // Note: Room logic usually doesn't involve moving folders INTO rooms in this strict sense yet,
    // unless rooms are folders. If room, ensure standard album update logic applies or ignore.
    if (containerType === "room") return false; // Folders inside rooms not yet fully supported via this generic method?

    const updated = await updateAlbumApi(contentId, {
      ...targetAlbum,
      parentId:
        action === "MOVE"
          ? albumId === "__all__"
            ? null
            : Number(albumId)
          : targetAlbum.parentId,
    });
    return !!updated;
  }

  return false;
};

// 나만의 템플릿 생성 (POST)
export const createPostTemplateApi = async (templateData: any) => {
  try {
    const response = await fetch(`${API_TEMPLATE_URL}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...templateData,
        stickers: (templateData.stickers || []).map((s: any) => {
          // Widget Persistence Encoding for Templates
          if (s.widgetType) {
            return {
              ...s,
              url: `widget://${encodeURIComponent(s.widgetType)}?props=${encodeURIComponent(JSON.stringify(s.widgetProps || {}))}`
            };
          }
          return s;
        })
      }),
    });
    if (!response.ok) throw new Error("템플릿 생성 실패");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

// 템플릿 상세 조회 (GET)
export const fetchPostTemplateById = async (templateId: string | number) => {
  try {
    const response = await fetch(`${API_TEMPLATE_URL}/${templateId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("템플릿 상세 조회 실패");
    const data = await response.json();
    return {
      ...data,
      stickers: (data.stickers || []).map((s: any) => ({
        ...s,
        x: sanitizeCoordinate(s.x),
        y: sanitizeCoordinate(s.y),
        w: sanitizeCoordinate(s.w),
        h: sanitizeCoordinate(s.h),
        opacity: s.opacity || 1,
        // Widget Persistence Decoding for Templates
        widgetType: s.url && s.url.startsWith('widget://')
          ? decodeURIComponent(s.url.split('widget://')[1].split('?')[0])
          : undefined,
        widgetProps: s.url && s.url.startsWith('widget://')
          ? JSON.parse(decodeURIComponent(new URLSearchParams(s.url.split('?')[1]).get('props') || '{}'))
          : undefined
      })),
      floatingTexts: (data.floatingTexts || []).map((text: any) => ({
        ...text,
        x: sanitizeCoordinate(text.x),
        y: sanitizeCoordinate(text.y),
        w: sanitizeCoordinate(text.w),
        h: sanitizeCoordinate(text.h),
      })),
      floatingImages: (data.floatingImages || []).map((img: any) => ({
        ...img,
        x: sanitizeCoordinate(img.x),
        y: sanitizeCoordinate(img.y),
        w: sanitizeCoordinate(img.w),
        h: sanitizeCoordinate(img.h),
      })),
    };
  } catch (error) {
    console.error("fetchPostTemplateById error", error);
    return null;
  }
};

// 내 템플릿 목록 조회 (GET)
export const fetchMyPostTemplatesApi = async (showHidden?: boolean) => {
  try {
    let url = `${API_TEMPLATE_URL}/my`;
    if (showHidden) {
      url += `?showHidden=${showHidden}`;
    }
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("템플릿 목록 불러오기 실패");
    const templates = await response.json();
    return templates.map((t: any) => ({
      ...t,
      thumbnailUrl: t.thumbnailUrl,
      stickers: (t.stickers || []).map((s: any) => ({
        ...s,
        x: sanitizeCoordinate(s.x),
        y: sanitizeCoordinate(s.y),
        w: sanitizeCoordinate(s.w),
        h: sanitizeCoordinate(s.h),
        opacity: s.opacity || 1, // Fix invisible items
        // Widget Persistence Decoding for Templates
        widgetType: s.url && s.url.startsWith('widget://')
          ? decodeURIComponent(s.url.split('widget://')[1].split('?')[0])
          : undefined,
        widgetProps: s.url && s.url.startsWith('widget://')
          ? JSON.parse(decodeURIComponent(new URLSearchParams(s.url.split('?')[1]).get('props') || '{}'))
          : undefined
      })),
      floatingTexts: (t.floatingTexts || []).map((text: any) => ({
        ...text,
        x: sanitizeCoordinate(text.x),
        y: sanitizeCoordinate(text.y),
        w: sanitizeCoordinate(text.w),
        h: sanitizeCoordinate(text.h),
      })),
      floatingImages: (t.floatingImages || []).map((img: any) => ({
        ...img,
        x: sanitizeCoordinate(img.x),
        y: sanitizeCoordinate(img.y),
        w: sanitizeCoordinate(img.w),
        h: sanitizeCoordinate(img.h),
      })),
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

// 템플릿 삭제 (DELETE)
export const deletePostTemplateApi = async (id: number) => {
  try {
    const response = await fetch(`${API_TEMPLATE_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("템플릿 삭제 실패");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
