// ✨ Import customAlbum for props
import React, { useState, useEffect } from 'react';
import CreateFolderModal from '../components/CreateFolderModal';
import RoomSettingsModal from '../components/RoomSettingsModal';
import NewCycleModal from '../components/NewCycleModal';
import RoomCycleList from '../components/RoomCycleList';
import type { PostData } from '../types';
import { ArrowLeft, Folder, PenLine, Trash2, X, Lock, Users, BookOpen } from 'lucide-react';
import PostBreadcrumb from '../components/PostBreadcrumb';
import { useBreadcrumbs } from '../hooks/useBreadcrumbs';
import { DndContext, useDraggable, useDroppable, type DragEndEvent, useSensors, useSensor, MouseSensor, TouchSensor } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import PostThumbnail from '../components/PostThumbnail';
import PostBookView from './PostBookView';
import { motion } from 'framer-motion';

// ✨ Helper Components for DnD
const DraggablePost = ({ id, children }: { id: string | number, children: React.ReactNode }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: id });
    const style = {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 100 : undefined,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none' // ✨ Mobile optimization
    };
    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            {children}
        </div>
    );
};

const DroppableFolder = ({ id, children }: { id: string, children: React.ReactNode }) => {
    const { setNodeRef, isOver } = useDroppable({ id: id });
    const style = {
        transform: isOver ? 'scale(1.05)' : undefined,
        transition: 'transform 0.2s ease',
        boxShadow: isOver ? '0 0 0 2px var(--btn-bg, #6366f1)' : undefined,
        borderRadius: '12px'
    };
    return (
        <div ref={setNodeRef} style={style}>
            {children}
        </div>
    );
};

interface Props {
    albumId: string | null;
    posts: PostData[];
    allPosts: PostData[]; // ✨ Needed for sub-album stats
    // onBack: () => void; // Unused
    onPostClick: (post: PostData) => void;
    onStartWriting: (initialAlbumId?: string) => void;
    onCreateAlbum: (name: string, tags: string[], parentId?: string | null) => Promise<string | null>; // Update signature
    // ✨ New Prop for looking up sub-albums
    customAlbums: any[];
    onAlbumClick: (id: string | null) => void;
    onDeletePost: (id: number | string) => void;
    onDeleteAlbum: (id: string) => void;
    onToggleFavorite: (id: number) => void; // ✨ New Prop
    onMovePost: (postId: string | number, targetAlbumId: string | null) => void; // ✨ DnD Prop
    onRefresh?: () => void; // ✨ Data Refresh Trigger
    showConfirmModal?: (title: string, message: string, type?: 'info' | 'danger' | 'success', onConfirm?: () => void, singleButton?: boolean) => void;
}

const PostFolderView: React.FC<Props> = ({ albumId, allPosts, onPostClick, onStartWriting, onCreateAlbum, customAlbums, onAlbumClick, onDeletePost, onDeleteAlbum, onToggleFavorite, onRefresh, showConfirmModal }) => {
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    // ✨ Default to Book View (User Requirement: Album -> Book -> Folder)
    // We will validate if posts exist before rendering
    const [isBookViewOpen, setIsBookViewOpen] = useState(true);
    const [roomSettingsId, setRoomSettingsId] = useState<string | null>(null); // ✨ Room Settings Modal State
    const [isCycleModalOpen, setIsCycleModalOpen] = useState(false); // ✨ New Cycle Modal State
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false); // ✨ Favorites Filter State

    // ✨ Local State for API Data
    const [contents, setContents] = useState<{ type: 'POST' | 'FOLDER', data: any }[]>([]);
    const [currentAlbum, setCurrentAlbum] = useState<any | null>(null); // ✨ Current Album Info
    const [isLoading, setIsLoading] = useState(false);

    // ✨ Animation States (Removed Overlay Logic)
    // const [openingPostId, setOpeningPostId] = useState<string | number | null>(null);
    // const [isOpeningLoading, setIsOpeningLoading] = useState(false);
    const [startIndex, setStartIndex] = useState(0);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); // For "Add Existing"

    // ✨ Local State for Refreshing RoomCycleList
    const [refreshKey, setRefreshKey] = useState(0);

    // ✨ Fetch Contents
    const loadContents = async () => {
        if (albumId) {
            // Loading state only if no data (initial load) to prevent flicker on update
            if (contents.length === 0) setIsLoading(true);
            try {
                const api = await import('../api');

                // 1. Determine Type from CustomAlbums
                // albumId is potentially prefixed (e.g., 'room-1')
                const targetAlbum = customAlbums.find(a => String(a.id) === String(albumId));
                const isSpecial = albumId === '__all__' || albumId === '__others__';

                // ✨ Fix: Prevent 400 Error by skipping fetch if album not found in loaded list
                if (!isSpecial && !targetAlbum) {
                    setIsLoading(false);
                    return;
                }

                const type = targetAlbum?.type || 'album';

                // ✨ Fix: Strip prefix strictly for API calls
                const realId = String(albumId).replace('room-', '');

                // 2. Fetch Contents with Type
                const data = await api.fetchAlbumContents(realId, allPosts, customAlbums, type as 'album' | 'room');
                setContents(data as any);

                // 3. Fetch Current Album/Room Details (for Breadcrumbs & Root Path)
                if (albumId !== '__all__' && albumId !== '__others__') {
                    let albumInfo;
                    if (type === 'room') {
                        // Use Room API
                        albumInfo = await api.fetchRoomApi(realId);
                    } else {
                        // Use Album API
                        albumInfo = await api.fetchAlbumApi(realId);
                    }

                    if (albumInfo) {
                        setCurrentAlbum({
                            id: String(albumId), // Keep prefixed ID for frontend consistency
                            name: albumInfo.name,
                            parentId: albumInfo.parentId ? String(albumInfo.parentId) : null,
                            type: albumInfo.type || type // Ensure type is set
                        });
                    }
                } else {
                    setCurrentAlbum(null);
                }

            } catch (e) {
                console.error("Failed to load album contents", e);
            } finally {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        loadContents();
    }, [albumId, allPosts, customAlbums /* ✨ Added customAlbums to trigger refresh on folder creation */]);

    // ✨ Derived Lists from Local Content
    const folders = contents.filter(c => c.type === 'FOLDER').map(c => c.data);
    const localPosts = contents.filter(c => c.type === 'POST').map(c => c.data as PostData);

    // ✨ Filtered Posts
    const displayedPosts = showFavoritesOnly
        ? localPosts.filter(p => p.isFavorite)
        : localPosts;

    // ✨ Check if current view is a Room
    const isRoom = React.useMemo(() => {
        if (!albumId) return false;
        const target = customAlbums.find(a => String(a.id) === String(albumId));
        return target?.type === 'room' || String(albumId).startsWith('room-');
    }, [albumId, customAlbums]);

    // ✨ Augmented Albums for Breadcrumbs (Include current if missing from global list)
    const augmentedAlbums = React.useMemo(() => {
        if (!currentAlbum) return customAlbums;
        const exists = customAlbums.some(a => String(a.id) === String(currentAlbum.id));
        if (exists) return customAlbums;
        return [...customAlbums, currentAlbum];
    }, [customAlbums, currentAlbum]);

    // ✨ Use Breadcrumb Hook
    const breadcrumbItems = useBreadcrumbs(albumId, augmentedAlbums, onAlbumClick);

    // ✨ Item Management Handlers
    const handleManageItem = async (action: 'ADD' | 'REMOVE', type: 'POST' | 'FOLDER', id: string | number) => {
        if (!albumId) return;
        const api = await import('../api');

        const realAlbumId = String(albumId).replace('room-', '');
        // Determine container type
        const targetAlbum = customAlbums.find(a => String(a.id) === String(albumId));
        const containerType = (targetAlbum?.type === 'room' || String(albumId).startsWith('room-')) ? 'room' : 'album';

        await api.manageAlbumItem(realAlbumId, action, type, id, undefined, containerType);
        loadContents(); // ✨ Trigger explicit refresh locally
        onRefresh?.();
        // Also refresh global posts to update album counts or tags if needed
    };

    // ✨ Recursive Stats Calculation (Using trusted API counts)
    const getRecursiveStats = (targetId: string) => {
        const targetAlbum = customAlbums.find(a => String(a.id) === targetId);
        const count = targetAlbum?.postCount ?? 0;
        return { count, totalCount: count }; // User requested exact backend value
    };

    // ✨ Effect to handle deletion request from parent or other components if needed
    const handleCreateFolder = (name: string) => {
        return onCreateAlbum(name, [], albumId);
    };

    // ✨ Handle Drag End (Local Implementation via API)
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const isActivePost = localPosts.some(p => String(p.id) === String(active.id));
        if (!isActivePost) return;

        const overData = over.data.current;
        let targetFolderId: string | null = null;

        // 1. Detect target (Folder item OR Breadcrumb item)
        if (overData?.type === 'BREADCRUMB') {
            targetFolderId = overData.albumId !== undefined ? (overData.albumId === null ? null : String(overData.albumId)) : null;
        } else {
            targetFolderId = String(over.id);
        }

        // Prevent moving to itself or same parent equivalent if logic exists (simplified here)
        if (String(active.id) === String(targetFolderId)) return;

        // ✨ 1. Optimistic UI Update (IMMEDIATE)
        const previousContents = [...contents]; // Backup for rollback
        setContents(prev => {
            const newContents: typeof prev = [];
            prev.forEach(item => {
                // Remove moved post
                if (item.type === 'POST' && String(item.data.id) === String(active.id)) {
                    return;
                }
                // Update target folder count
                if (item.type === 'FOLDER' && String(item.data.id) === String(targetFolderId)) {
                    newContents.push({
                        ...item,
                        data: {
                            ...item.data,
                            postCount: (item.data.postCount || 0) + 1
                        }
                    });
                    return;
                }
                newContents.push(item);
            });
            return newContents;
        });

        // ✨ 2. API Call (Background)
        try {
            const api = await import('../api');
            let success = false;

            // Determine params
            const targetIsRoom = targetFolderId ? String(targetFolderId).startsWith('room-') : false;
            const realTargetId = targetFolderId ? String(targetFolderId).replace('room-', '') : '__all__';

            if (albumId && albumId !== '__all__' && albumId !== '__others__') {
                const realAlbumId = String(albumId).replace('room-', '');
                success = await api.manageAlbumItem(
                    realTargetId,
                    'MOVE',
                    'POST',
                    active.id,
                    realAlbumId,
                    targetIsRoom ? 'room' : 'album'
                );
            } else {
                success = await api.manageAlbumItem(
                    realTargetId,
                    'ADD',
                    'POST',
                    active.id,
                    undefined,
                    targetIsRoom ? 'room' : 'album'
                );
            }

            if (success) {
                // ✨ 3. Sync Global State eventually
                onRefresh?.();
            } else {
                throw new Error("API Failed");
            }
        } catch (e) {
            console.error("Move failed, rolling back", e);
            // ✨ Rollback on Failure
            setContents(previousContents);
            alert("이동에 실패했습니다.");
        }
    }


    // ✨ Handle Post Click - Navigate to single post read mode
    const handleGridPostClick = async (post: PostData) => {
        // Navigate to single post read view instead of book view
        onPostClick(post);
    };



    // ✨ DnD Sensors
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    // ✨ Picker State
    const [selectedPickerIds, setSelectedPickerIds] = useState<string[]>([]);
    const pickerCandidates = allPosts.filter(p => !localPosts.some(lp => lp.id === p.id)); // Exclude already in album

    return (
        <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
            <div>
                {/* Navigation & Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 relative z-50 space-y-4 md:space-y-0">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={() => {
                                const parent = augmentedAlbums.find(a => String(a.id) === String(albumId))?.parentId;
                                onAlbumClick(parent || null);
                            }}
                            className="p-3 hover:bg-[var(--bg-card-secondary)] rounded-full transition text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div className="flex items-center text-lg font-medium overflow-hidden">
                            <PostBreadcrumb items={breadcrumbItems} />

                            {/* ✨ Favorites Toggle (Visible in lists) */}
                            {!isRoom && (
                                <button
                                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                    className={`ml-3 p-1.5 rounded-full transition-all ${showFavoritesOnly
                                        ? 'bg-yellow-100 text-yellow-500 shadow-sm'
                                        : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-card-secondary)] hover:text-yellow-400'
                                        }`}
                                    title={showFavoritesOnly ? "모든 기록 보기" : "즐겨찾기만 보기"}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={showFavoritesOnly ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                </button>
                            )}

                            {/* ✨ Book View Toggle */}
                            {!isRoom && displayedPosts.length > 0 && (
                                <button
                                    onClick={() => setIsBookViewOpen(true)}
                                    className="ml-2 p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors"
                                    title="책 뷰로 보기"
                                >
                                    <BookOpen size={20} />
                                </button>
                            )}

                            {/* ✨ Room Settings Trigger */}
                            {(() => {
                                const activeAlbum = augmentedAlbums.find(a => String(a.id) === String(albumId));
                                if (activeAlbum?.type === 'room') {
                                    return (
                                        <button
                                            onClick={() => setRoomSettingsId(albumId!)}
                                            className="ml-2 p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors"
                                            title="모임 정보"
                                        >
                                            <Users size={18} />
                                        </button>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto justify-start md:justify-end pb-2 md:pb-0">
                        {(() => {
                            const targetAlbum = customAlbums.find(a => String(a.id) === String(albumId));
                            const isRoom = targetAlbum?.type === 'room' || String(albumId).startsWith('room-');

                            if (isRoom) {
                                // ✨ Room View: Show only "New RoomCycle" button
                                // Ideally check for Owner permission, but for now show to all or check role if available
                                return (
                                    <button
                                        onClick={() => setIsCycleModalOpen(true)}
                                        className="flex items-center gap-2 px-4 md:px-6 h-10 md:h-12 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 text-sm md:text-base whitespace-nowrap flex-shrink-0 flex-1 md:flex-none justify-center"
                                    >
                                        <PenLine size={20} />
                                        새 활동 시작
                                    </button>
                                );
                            }

                            // ✨ Normal Album View: Show standard buttons
                            return (
                                <>
                                    {/* ✨ Add Existing Item Button */}
                                    {albumId && albumId !== '__all__' && albumId !== '__others__' && (
                                        <button
                                            onClick={() => setIsAddModalOpen(true)}
                                            className="flex items-center gap-2 px-4 h-10 md:h-12 text-sm md:text-base font-bold text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-card-secondary)] hover:text-[var(--text-primary)] rounded-xl transition-colors whitespace-nowrap flex-shrink-0"
                                        >
                                            <Folder size={18} />
                                            항목 추가
                                        </button>
                                    )}

                                    {albumId !== '__all__' && !augmentedAlbums.find(a => String(a.id) === String(albumId))?.parentId && (
                                        <button
                                            onClick={() => setIsCreateFolderOpen(true)}
                                            className="flex items-center gap-2 px-4 h-10 md:h-12 text-sm md:text-base font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-transparent hover:border-indigo-200 whitespace-nowrap flex-shrink-0"
                                        >
                                            <Folder size={18} />
                                            폴더 추가
                                        </button>
                                    )}

                                    {albumId && albumId !== '__all__' && (
                                        <button
                                            onClick={() => onStartWriting(albumId)}
                                            className="flex items-center gap-2 px-4 md:px-6 h-10 md:h-12 rounded-xl bg-[var(--btn-bg)] text-[var(--btn-text)] font-bold hover:opacity-90 transition-all shadow-md shadow-indigo-500/20 text-sm md:text-base whitespace-nowrap flex-shrink-0 flex-1 md:flex-none justify-center"
                                        >
                                            <PenLine size={20} />
                                            기록 남기기
                                        </button>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>


                {/* ✨ Room Cycle List (Only for Rooms) */}
                {(() => {
                    const targetAlbum = customAlbums.find(a => String(a.id) === String(albumId));
                    const isRoom = targetAlbum?.type === 'room' || String(albumId).startsWith('room-');
                    if (isRoom) {
                        return <RoomCycleList roomId={String(albumId).replace('room-', '')} refreshTrigger={refreshKey} />;
                    }
                    return null;
                })()}

                {/* Folders Display */}
                {folders.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <Folder size={20} className="text-yellow-500" />
                            폴더
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {folders.map((album: any) => (
                                <DroppableFolder key={album.id} id={album.id}>
                                    <div
                                        onClick={() => onAlbumClick(album.id)}
                                        className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)] hover:shadow-md transition cursor-pointer flex flex-col items-center justify-center gap-2 group relative h-full"
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteAlbum(album.id);
                                            }}
                                            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                        {/* ✨ Room Indicator */}
                                        {album.type === 'room' && (
                                            <div className="absolute top-2 left-2 z-20 bg-black/60 backdrop-blur-sm text-white p-1 rounded-full shadow-sm">
                                                <div className="flex items-center justify-center w-4 h-4">
                                                    {album.roomConfig?.password ? <Lock size={10} /> : <Users size={10} />}
                                                </div>
                                            </div>
                                        )}

                                        <Folder size={40} className={`transition-colors ${album.type === 'room' ? 'text-indigo-400' : 'text-indigo-200 group-hover:text-indigo-400'}`} />

                                        {/* ✨ Parent Name Context */}
                                        {album.parentName && (
                                            <span className="text-[10px] text-indigo-500 font-medium bg-indigo-50 px-1.5 py-0.5 rounded-md truncate max-w-full">
                                                {album.parentName}
                                            </span>
                                        )}

                                        <span className="font-bold text-[var(--text-primary)] truncate max-w-full text-center">{album.name}</span>
                                        {/* Stats approximation */}
                                        <span className="text-[10px] text-[var(--text-secondary)]">
                                            {album.type === 'room' ? '모임방' : (album.id === '__others__' ? '자동 분류' : '폴더')}
                                            <span className="mx-1">·</span>
                                            {(() => {
                                                // ✨ Prefer explicit count if available (for system folders like __others__)
                                                if (album.postCount !== undefined) return `${album.postCount}개`;
                                                const stats = getRecursiveStats(String(album.id));
                                                return `${stats.totalCount}개`;
                                            })()}
                                        </span>
                                    </div>
                                </DroppableFolder>
                            ))}
                        </div>
                    </div>
                )}

                {/* Posts Display */}
                {!isRoom && (
                    <>
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            {showFavoritesOnly ? (
                                <>
                                    <span className="text-yellow-500">⭐</span>
                                    즐겨찾기 ({displayedPosts.length})
                                </>
                            ) : (
                                `기록들 (${displayedPosts.length})`
                            )}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {displayedPosts.length === 0 ? (
                                <div className="col-span-full py-20 text-center text-gray-400">
                                    {isLoading ? "로딩 중..." : (
                                        showFavoritesOnly
                                            ? "즐겨찾기한 기록이 없습니다."
                                            : "이 폴더에는 아직 글이 없습니다."
                                    )}
                                </div>
                            ) : (
                                displayedPosts.map(p => (
                                    <DraggablePost key={p.id} id={p.id}>
                                        <motion.div
                                            layoutId={`post-cover-${p.id}`}
                                            onClick={() => handleGridPostClick(p)}
                                            className="bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-color)] hover:shadow-md cursor-pointer transition transform hover:-translate-y-1 relative group h-80 flex flex-col overflow-hidden"
                                        >
                                            {/* 1. Top - Thumbnail (60%) */}
                                            <div className="h-[60%] w-full bg-white relative overflow-hidden">
                                                <PostThumbnail post={p} width={400} height={320} />

                                                {/* Overlay Gradient for depth */}
                                                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                                            </div>

                                            {/* 2. Bottom - Info (40%) */}
                                            <div className="h-[40%] p-5 flex flex-col justify-between bg-[var(--bg-card)]">
                                                <div className="space-y-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="font-bold text-[var(--text-primary)] text-lg line-clamp-1 leading-tight">{p.title}</h4>
                                                        {/* ✨ Visibility Indicator */}
                                                        {p.visibility === 'private' && (
                                                            <div className="text-gray-400 p-0.5" title="나만 보기">
                                                                <Lock size={14} />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Hashtags */}
                                                    <div className="flex flex-wrap gap-1.5 items-center">
                                                        {/* ✨ Draft Badge */}
                                                        {p.tags?.includes('#임시저장') && (
                                                            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                                                임시저장
                                                            </span>
                                                        )}

                                                        {p.tags && p.tags.filter(t => t !== '#임시저장').length > 0 ? (
                                                            <>
                                                                {p.tags.filter(t => t !== '#임시저장').slice(0, 2).map((t: string) => (
                                                                    <span key={t} className="text-[11px] font-medium text-indigo-500 bg-indigo-50/50 px-2 py-0.5 rounded-md truncate max-w-[80px]">#{t}</span>
                                                                ))}
                                                                {p.tags.filter(t => t !== '#임시저장').length > 2 && (
                                                                    <span className="text-[10px] text-[var(--text-secondary)] font-medium">+{p.tags.filter(t => t !== '#임시저장').length - 2}</span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            !p.tags?.includes('#임시저장') && <span className="text-[11px] text-[var(--text-secondary)] opacity-50">태그 없음</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Footer: Actions & Date */}
                                                <div className="flex items-end justify-between mt-2 pt-2 border-t border-[var(--border-color)]/50">
                                                    <span className="text-[11px] font-medium text-[var(--text-secondary)] tracking-tight">
                                                        {p.date}
                                                    </span>

                                                    <div className="flex gap-1" onPointerDown={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onToggleFavorite(p.id);
                                                            }}
                                                            className={`p-1.5 rounded-lg transition-all ${p.isFavorite ? 'text-yellow-400 bg-yellow-400/10' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)] hover:text-[var(--text-primary)]'}`}
                                                            title="즐겨찾기"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={p.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                                        </button>

                                                        {(albumId === '__all__' || albumId === '__others__') ? (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onDeletePost(p.id);
                                                                }}
                                                                className="p-1.5 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="영구 삭제"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (showConfirmModal) {
                                                                        showConfirmModal("앨범에서 제거", "이 앨범에서 제거하시겠습니까?", 'danger', () => {
                                                                            handleManageItem('REMOVE', 'POST', p.id);
                                                                        });
                                                                    }
                                                                }}
                                                                className="p-1.5 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="앨범에서 제거"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </DraggablePost>
                                ))
                            )}
                        </div>
                    </>
                )}

                {/* Modals */}
                <CreateFolderModal
                    isOpen={isCreateFolderOpen}
                    onClose={() => setIsCreateFolderOpen(false)}
                    onCreate={handleCreateFolder}
                    showConfirmModal={showConfirmModal}
                />

                {/* ✨ Picker Modal */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-[var(--bg-modal)] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] border border-[var(--border-color)] backdrop-blur-md">
                            <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
                                <h3 className="font-bold text-lg text-[var(--text-primary)]">게시물 추가하기</h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-[var(--bg-card-secondary)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><X size={24} /></button>
                            </div>
                            <div className="p-4 overflow-y-auto space-y-2 flex-1 custom-scrollbar">
                                {pickerCandidates.length === 0 ? <div className="text-center py-10 text-[var(--text-tertiary)]">추가할 수 있는 기록이 없습니다.</div> :
                                    pickerCandidates.map(p => (
                                        <div key={p.id}
                                            onClick={() => {
                                                if (selectedPickerIds.includes(String(p.id))) setSelectedPickerIds(prev => prev.filter(id => id !== String(p.id)));
                                                else setSelectedPickerIds(prev => [...prev, String(p.id)]);
                                            }}
                                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedPickerIds.includes(String(p.id)) ? 'border-indigo-500 bg-indigo-50/10' : 'border-[var(--border-color)] hover:bg-[var(--bg-card-secondary)]'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPickerIds.includes(String(p.id)) ? 'bg-indigo-500 border-indigo-500' : 'border-[var(--border-color)] bg-[var(--bg-card-secondary)]'}`}>
                                                {selectedPickerIds.includes(String(p.id)) && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-[var(--text-primary)]">{p.title}</div>
                                                <div className="text-xs text-[var(--text-secondary)]">{p.date}</div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                            <div className="p-4 border-t border-[var(--border-color)] flex justify-end gap-2">
                                <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)] rounded-lg transition-colors">취소</button>
                                <button
                                    onClick={async () => {
                                        for (const id of selectedPickerIds) {
                                            await handleManageItem('ADD', 'POST', id);
                                        }
                                        setSelectedPickerIds([]);
                                        setIsAddModalOpen(false);
                                    }}
                                    disabled={selectedPickerIds.length === 0}
                                    className="px-6 py-2 text-sm font-bold bg-[var(--btn-bg)] text-[var(--btn-text)] rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-indigo-500/20"
                                >
                                    {selectedPickerIds.length}개 추가
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* ✨ Book View Modal - 모임방에서는 책 뷰를 표시하지 않음 */}
                {!isRoom && isBookViewOpen && displayedPosts.length > 0 && (
                    <PostBookView
                        posts={displayedPosts}
                        currentAlbum={currentAlbum} // ✨ Pass album for Back Cover
                        onClose={() => {
                            // Close Book View
                            setIsBookViewOpen(false);
                            // Navigate to Album List (Exit Folder) immediately after book view closes (it does its own animation)
                            onAlbumClick(null);
                        }}
                        startIndex={startIndex}
                        onOpenList={() => setIsBookViewOpen(false)} // ✨ Stay in folder, just close book
                    />
                )}

                {/* ✨ Room Settings Modal */}
                {roomSettingsId && (
                    <RoomSettingsModal
                        isOpen={!!roomSettingsId}
                        onClose={() => setRoomSettingsId(null)}
                        album={augmentedAlbums.find(a => a.id === roomSettingsId)!}
                    />
                )}

                {/* ✨ New Cycle Modal */}
                <NewCycleModal
                    isOpen={isCycleModalOpen}
                    onClose={() => setIsCycleModalOpen(false)}
                    roomId={String(albumId).replace('room-', '')}
                    showConfirmModal={showConfirmModal}
                    onSuccess={() => {
                        loadContents();
                        onRefresh?.();
                        setRefreshKey(prev => prev + 1);
                    }}
                />
            </div>
        </DndContext >
    );
};

export default PostFolderView;
