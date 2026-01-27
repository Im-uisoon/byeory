import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // ✨ Added Import
import { useNavigate } from 'react-router-dom';
import type { PostData, CustomAlbum } from '../types';
// ✨ Added GalleryHorizontal for All Posts icon
import { Folder, Plus, PenLine, MoreVertical, Trash2, Edit, Sparkles, Lock, Users, Gift } from 'lucide-react';
import RenameAlbumModal from '../components/RenameAlbumModal';
import AlbumBook from '../components/albumCover/AlbumBook';
import type { AlbumCoverConfig } from '../components/albumCover/constants';
import CoverCustomizer from '../components/albumCover/CoverCustomizer';
import RoomSettingsModal from '../components/RoomSettingsModal';
import BookOpeningOverlay from './BookOpeningOverlay'; // ✨ Import Overlay


interface Props {
    posts: PostData[];
    customAlbums: CustomAlbum[];
    onAlbumClick: (id: string | null) => void;
    onCreateAlbum: () => void;
    onStartWriting: () => void;
    onUpdateAlbum: (id: string, updates: Partial<CustomAlbum>) => void;
    onDeleteAlbum: (id: string) => void;
    sortOption: 'name' | 'count' | 'newest' | 'favorites';
    setSortOption: (option: 'name' | 'count' | 'newest' | 'favorites') => void;
    onPostClick: (post: PostData) => void;
    onToggleFavorite: (id: number) => void;
    handleToggleAlbumFavorite: (id: string) => void;
    showConfirmModal?: (title: string, message: string, type?: 'info' | 'danger' | 'success', onConfirm?: () => void, singleButton?: boolean) => void;
}

const PostAlbumView: React.FC<Props> = ({ posts, customAlbums, onAlbumClick, onCreateAlbum, onStartWriting, onUpdateAlbum, onDeleteAlbum, sortOption, setSortOption, handleToggleAlbumFavorite, showConfirmModal }) => {
    // Key now refers to Album ID
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [roomSettingsId, setRoomSettingsId] = useState<string | null>(null);
    const [editingCoverId, setEditingCoverId] = useState<string | null>(null);
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
    const [isEasterEggOpen, setIsEasterEggOpen] = useState(false);
    const [openingAlbumId, setOpeningAlbumId] = useState<string | null>(null); // ✨ Animation State
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const payload = JSON.parse(jsonPayload);
                if (payload.email) setCurrentUserEmail(payload.email);
                else if (payload.sub && payload.sub.includes('@')) setCurrentUserEmail(payload.sub);
            } catch (e) { /* ignore */ }
        }
    }, []);

    const handleSaveCover = (config: AlbumCoverConfig) => {
        if (!editingCoverId) return;

        // Special albums (__all__, __others__) cannot save to backend in this simplified model 
        // unless we have a specific API for them or User Preference API. 
        // For now, ignoring Save for __all__ / __others__ as per 'Backend Only' instruction strictness (no LS).
        // OR: If they are virtual, we can't save them. User asked to remove LS. So they won't persist.
        if (editingCoverId === '__all__' || editingCoverId === '__others__') {
            if (showConfirmModal) {
                showConfirmModal("알림", "기본 보관함 커버는 현재 저장되지 않습니다.", "info", undefined, true);
            } else {
                alert("기본 보관함 커버는 현재 저장되지 않습니다.");
            }
            return;
        }

        const album = customAlbums.find(a => a.id === editingCoverId);
        if (album) {
            onUpdateAlbum(album.id, {
                name: album.name,
                tag: album.tag,
                parentId: album.parentId,
                coverConfig: config
            });
        }
        setEditingCoverId(null);
    };

    // ✨ Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setActiveDropdownId(null);
        };

        if (activeDropdownId) {
            window.addEventListener('click', handleClickOutside);
        }

        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, [activeDropdownId]);

    // ✨ Compute Album Stats
    const albumStats = useMemo(() => {
        const stats: Record<string, { count: number, folderCount: number, totalCount: number, lastDate: number, representativeTag: string | null }> = {};

        // Initialize stats with backend data as baseline
        customAlbums.forEach(a => {
            stats[a.id] = {
                count: a.postCount || 0, // ✨ Use Backend Count
                folderCount: a.folderCount || 0, // ✨ Use Backend Folder Count
                totalCount: a.postCount || 0, // Baseline total
                lastDate: a.createdAt ? new Date(a.createdAt).getTime() : 0, // ✨ Ensure Number
                representativeTag: a.tag || null // ✨ Search Tag
            };
        });

        // ✨ Recalculate Folder Counts (Client side adjustment if needed, or rely on backend?)
        // If backend provides folderCount, we might double count if we add here?
        // Let's assume for now we trust backend for counts.
        customAlbums.forEach(a => {
            if (a.parentId && stats[a.parentId]) {
                // If backend doesn't aggregate folder counts, we might need this.
                // But let's stick to simple "backend count" logic for now.
                // stats[a.parentId].folderCount++; 
            }
        });

        // ✨ Recalculate Dates & Infer Tags (BUT NOT COUNTS to match backend)
        posts.forEach(p => {
            // Parse Date (YYYY. MM. DD.)
            let pDate = 0;
            try {
                pDate = new Date(p.date.replace(/\./g, '-')).getTime();
                if (isNaN(pDate)) pDate = new Date(p.date).getTime();
                if (isNaN(pDate)) pDate = 0;
            } catch (e) { pDate = 0; }

            // 1. Direct Album Assignment
            if (p.albumIds && p.albumIds.length > 0) {
                p.albumIds.forEach(id => {
                    const idStr = String(id);
                    if (stats[idStr]) {
                        // stats[idStr].count++; // 🛑 Don't double count
                        // stats[idStr].totalCount++;
                        if (pDate > stats[idStr].lastDate) {
                            stats[idStr].lastDate = pDate;
                        }
                        // ✨ Infer Tag if missing
                        if (!stats[idStr].representativeTag && p.tags && p.tags.length > 0) {
                            stats[idStr].representativeTag = p.tags[0];
                        }
                    }
                });
            } else {
                // 2. Legacy Tag Matching (Fallback)
                const tags = p.tags || [];
                customAlbums.forEach(album => {
                    if (album.tag && tags.includes(album.tag)) {
                        // stats[album.id].count++;
                        // stats[album.id].totalCount++;
                        if (pDate > stats[album.id].lastDate) {
                            stats[album.id].lastDate = pDate;
                        }
                    }
                });
            }
        });

        // ✨ Filter Top Level Albums (No parentId) & Deduplicate by ID
        const topLevelAlbums = customAlbums
            .filter(a => !a.parentId)
            .filter((a, index, self) => index === self.findIndex(t => t.id === a.id));

        // Sort Albums
        const sortedAlbums = [...topLevelAlbums].sort((a, b) => {
            if (sortOption === 'name') return a.name.localeCompare(b.name);
            if (sortOption === 'count') return (stats[b.id].totalCount) - (stats[a.id].totalCount);
            if (sortOption === 'newest') return stats[b.id].lastDate - stats[a.id].lastDate;
            if (sortOption === 'favorites') {
                if (a.isFavorite === b.isFavorite) return a.name.localeCompare(b.name); // Secondary sort by name
                return a.isFavorite ? -1 : 1; // Favorites first
            }

            return 0;
        });

        return { sortedAlbums, stats };
    }, [posts, customAlbums, sortOption]);



    const handleMenuClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setActiveDropdownId(activeDropdownId === id ? null : id);
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const album = customAlbums.find(a => a.id === id);
        if (!album) return;

        // ✨ Delegate confirmation to the hook (onDeleteAlbum)
        onDeleteAlbum(id);
        setActiveDropdownId(null);
    };

    const formatStats = (info: { count: number, folderCount: number, totalCount: number }) => {
        const parts = [];
        if (info.folderCount > 0) parts.push(`폴더 ${info.folderCount}개`);
        if (info.totalCount >= 0) parts.push(`기록 ${info.totalCount}개`);
        if (parts.length === 0) return "비어있음";
        return parts.join(' · ');
    };



    return (
        <div>
            {/* 상단 헤더 (Start Writing Buttons etc) - Simplified inline for brevity or reuse existing code structure */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-[var(--border-color)] pb-4 space-y-4 md:space-y-0">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                        <button onClick={() => setIsEasterEggOpen(true)} className="transition-transform hover:scale-110 active:scale-95 focus:outline-none">
                            <Folder className="text-yellow-400 fill-yellow-400" size={32} />
                        </button>
                        내 앨범
                    </h2>
                    <p className="text-[var(--text-secondary)] text-sm mt-2 ml-1">나만의 추억 보관함입니다.</p>
                </div>
                <div className="flex flex-col md:flex-row items-end gap-3 w-full md:w-auto">
                    {/* Sort Options - Line 1 on Mobile */}
                    <div className="w-full md:w-auto overflow-x-auto hide-scrollbar pb-1 md:pb-0">
                        <div className="flex bg-[var(--bg-card-secondary)] rounded-lg p-1 h-10 md:h-12 items-center flex-shrink-0 w-max">
                            {(['name', 'newest', 'count', 'favorites'] as const).map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setSortOption(opt)}
                                    className={`px-3 md:px-3 py-1.5 md:py-3 text-[11px] md:text-xs font-bold rounded-md transition-all whitespace-nowrap ${sortOption === opt ? 'bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                >
                                    {{ name: '가나다순', newest: '최신순', count: '많은 기록순', favorites: '⭐ 즐겨찾기' }[opt]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons - Line 2 on Mobile */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <button onClick={onCreateAlbum} className="flex items-center gap-1 px-3 h-10 md:h-12 rounded-xl border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-card-secondary)] transition-all font-medium group flex-shrink-0"><Plus size={16} className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" /><Folder size={18} className="text-[var(--text-secondary)] group-hover:text-yellow-500 group-hover:fill-yellow-500 transition-colors" /></button>
                        <button onClick={() => onStartWriting()} className="flex items-center gap-2 px-4 md:px-5 h-10 md:h-12 rounded-xl bg-[var(--btn-bg)] text-[var(--btn-text)] font-bold hover:opacity-90 transition-all shadow-md shadow-indigo-500/20 whitespace-nowrap flex-shrink-0 flex-1 md:flex-none justify-center"><PenLine size={18} />기록 남기기</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {/* ✨ All Posts Card - Fixed Position */}
                {/* ✨ All Records Album (Replaces Uncategorized) */}
                {albumStats.sortedAlbums.map(album => {
                    const stats = albumStats.stats[album.id];

                    return (
                        <div key={album.id} onClick={() => {
                            // ✨ 모임방은 책 펼침 애니메이션 없이 바로 목록으로 이동
                            // type이 'room'이거나 ID가 'room-'으로 시작하면 모임방으로 판단
                            if (album.type === 'room' || album.id.startsWith('room-')) {
                                onAlbumClick(album.id);
                            } else {
                                setOpeningAlbumId(album.id);
                            }
                        }} className="relative group cursor-pointer">
                            {/* ✨ Wrap in motion.div for animation source */}
                            <motion.div layoutId={`album-cover-${album.id}`}>
                                <AlbumBook
                                    title={album.name}
                                    tag={album.tag || stats.representativeTag || undefined} // ✨ Use inferred tag
                                    count={album.type === 'room' ? undefined : formatStats(stats)}
                                    config={album.coverConfig}
                                    className="shadow-sm border border-transparent group-hover:shadow-md transition-shadow duration-300"
                                />
                            </motion.div>

                            {/* ✨ Room Indicator */}
                            {album.type === 'room' && (
                                <div className="absolute top-2 right-2 z-20 bg-black/60 backdrop-blur-sm text-white p-1 rounded-full shadow-sm">
                                    <div className="flex items-center justify-center w-5 h-5">
                                        {album.roomConfig?.password ? <Lock size={12} /> : <Users size={12} />}
                                    </div>
                                </div>
                            )}

                            {/* Favorite Button for Album */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleAlbumFavorite(album.id);
                                }}
                                className={`absolute top-2 left-2 p-1.5 rounded-full z-30 transition-all ${album.isFavorite ? 'text-yellow-400 opacity-100' : 'text-gray-300 opacity-0 group-hover:opacity-100 hover:text-yellow-400 hover:bg-white/50'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={album.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                            </button>

                            <div className="absolute top-2 right-2 z-30">
                                <button onClick={(e) => handleMenuClick(e, album.id)} className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
                                    <MoreVertical size={18} />
                                </button>
                                {activeDropdownId === album.id && (
                                    <div className="absolute top-8 right-0 bg-white border border-gray-200 shadow-xl rounded-xl w-48 py-2 z-50 animate-scale-up origin-top-right cursor-default" onClick={e => e.stopPropagation()}>
                                        {/* ✨ Room Info Option */}
                                        {album.type === 'room' && (
                                            <button onClick={(e) => { e.stopPropagation(); setRoomSettingsId(album.id); setActiveDropdownId(null); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-indigo-600 font-medium bg-indigo-50/50"><Users size={16} /> 모임 정보</button>
                                        )}
                                        {/* Customize Cover: Show for Albums OR Room Owners only */}
                                        {(album.type !== 'room' || album.role === 'OWNER' || (currentUserEmail && album.ownerEmail === currentUserEmail)) && (
                                            <button onClick={(e) => { e.stopPropagation(); setEditingCoverId(album.id); setActiveDropdownId(null); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"><Sparkles size={16} /> 표지 꾸미기</button>
                                        )}
                                        {/* Rename & Delete: Hide for Rooms (Managed in Room Info) */}
                                        {album.type !== 'room' && (
                                            <>
                                                <button onClick={(e) => { e.stopPropagation(); setRenamingId(album.id); setActiveDropdownId(null); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"><Edit size={16} /> 이름 변경</button>
                                                <button onClick={(e) => handleDeleteClick(e, album.id)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"><Trash2 size={16} /> 앨범 삭제</button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* ✨ All Posts Card - Fixed Position */}
                {/* ✨ All Records Album (Moved to End) */}
                <div onClick={() => setOpeningAlbumId('__all__')} className="relative group cursor-pointer">
                    <motion.div layoutId="album-cover-__all__">
                        <AlbumBook
                            title="모든 기록 보관함"
                            count={`기록 ${posts.length}개`}
                            // config={coverConfigs['__all__']} // Removed LS
                            className="shadow-sm border border-transparent group-hover:shadow-md transition-shadow duration-300"
                            showFullTitle={true}
                        />
                    </motion.div>
                    {/* Helper Menu for Cover Customization */}
                    <div className="absolute top-2 right-2 z-30">
                        <button onClick={(e) => handleMenuClick(e, '__all__')} className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
                            <MoreVertical size={18} />
                        </button>
                        {activeDropdownId === '__all__' && (
                            <div className="absolute top-8 right-0 bg-white border border-gray-200 shadow-xl rounded-xl w-48 py-2 z-50 animate-scale-up origin-top-right cursor-default" onClick={e => e.stopPropagation()}>
                                <button onClick={(e) => { e.stopPropagation(); setEditingCoverId('__all__'); setActiveDropdownId(null); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"><Sparkles size={16} /> 표지 꾸미기</button>
                            </div>
                        )}
                    </div>
                </div>



            </div>

            {/* Modals */}
            {/* 이름 변경 모달 - Need to fetch name from key */}
            <RenameAlbumModal
                isOpen={!!renamingId}
                onClose={() => setRenamingId(null)}
                // We need to resolve Name/Tag from ID to pass to legacy handler
                onSave={(newName) => {
                    if (renamingId) {
                        onUpdateAlbum(renamingId, { name: newName });
                        setRenamingId(null);
                    }
                }}
                currentName={renamingId ? customAlbums.find(a => a.id === renamingId)?.name || '' : ''}
                showConfirmModal={showConfirmModal}
            />
            {editingCoverId && (
                <CoverCustomizer
                    albumTitle={editingCoverId === '__all__' ? '모든 기록 보관함' : editingCoverId === '__others__' ? '미분류 보관함' : (customAlbums.find(a => a.id === editingCoverId)?.name || '')}
                    albumTag={(editingCoverId === '__all__' || editingCoverId === '__others__') ? undefined : (customAlbums.find(a => a.id === editingCoverId)?.tag || undefined)}
                    initialConfig={(editingCoverId === '__all__' || editingCoverId === '__others__') ? undefined : (customAlbums.find(a => a.id === editingCoverId)?.coverConfig || undefined)}
                    onSave={handleSaveCover}
                    onClose={() => setEditingCoverId(null)}
                />
            )}

            {/* ✨ Room Settings Modal */}
            {roomSettingsId && (
                <RoomSettingsModal
                    isOpen={!!roomSettingsId}
                    onClose={() => setRoomSettingsId(null)}
                    album={customAlbums.find(a => a.id === roomSettingsId)!}
                />
            )}

            {/* ✨ Easter Egg Modal */}
            {isEasterEggOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setIsEasterEggOpen(false)}>
                    <div className="bg-[var(--bg-card)] rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-[var(--border-color)] animate-scale-up" onClick={e => e.stopPropagation()}>
                        <div className="p-6 flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-yellow-100/50 rounded-full flex items-center justify-center text-yellow-500 mb-2 ring-4 ring-yellow-50">
                                <Gift size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[var(--text-primary)]">선물이 도착했어요!</h3>
                                <p className="text-[var(--text-secondary)] text-sm mt-2">
                                    특별한 선물을 준비했어요.<br />
                                    지금 바로 확인해보시겠어요?
                                </p>
                            </div>

                            <div className="flex gap-2 w-full mt-4">
                                <button
                                    onClick={() => setIsEasterEggOpen(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] font-medium hover:bg-[var(--bg-card-secondary)] transition-colors"
                                >
                                    아니요
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEasterEggOpen(false);
                                        navigate('/season-greeting');
                                    }}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold hover:opacity-90 transition-opacity shadow-md shadow-orange-500/20"
                                >
                                    확인해보기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ✨ Book Opening Overlay */}
            <AnimatePresence>
                {openingAlbumId && (() => {
                    const album = openingAlbumId === '__all__'
                        ? { id: '__all__', name: '모든 기록 보관함', count: `기록 ${posts.length}개`, tag: undefined } // ✨ Added tag: undefined
                        : customAlbums.find(a => a.id === openingAlbumId);

                    // ✨ Find first post for content preview
                    let overlayPost: PostData | undefined;
                    if (openingAlbumId === '__all__') {
                        overlayPost = posts[0];
                    } else if (album) {
                        // Filter posts belonging to this album
                        overlayPost = posts.find(p => {
                            // Ensure numeric comparison safety
                            if (p.albumIds && p.albumIds.includes(String(openingAlbumId))) return true;
                            // Fallback tag matching
                            if (album.tag && p.tags && p.tags.includes(album.tag)) return true;
                            return false;
                        });
                    }

                    if (!album && openingAlbumId !== '__all__') return null;

                    return (
                        <BookOpeningOverlay
                            key="album-overlay"
                            album={album}
                            post={overlayPost} // ✨ Pass first post for content
                            onAnimationComplete={() => {
                                // ✨ Navigate after animation
                                onAlbumClick(openingAlbumId);
                                setOpeningAlbumId(null);
                            }}
                            onClose={() => setOpeningAlbumId(null)}
                        />
                    );
                })()}
            </AnimatePresence>
        </div>
    );
};

export default PostAlbumView;
