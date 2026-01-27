import React, { useState } from 'react';
import { X, Sparkles, Folder, Users, Lock } from 'lucide-react';
import AlbumBook from './albumCover/AlbumBook';
import CoverCustomizer from './albumCover/CoverCustomizer';
import type { AlbumCoverConfig } from './albumCover/constants';
import { COVER_COLORS } from './albumCover/constants';

import type { CustomAlbum } from '../types';

interface CreateAlbumModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, tag: string | null, parentId: string | null, type: 'album' | 'room', roomConfig?: any, coverConfig?: any) => void;
    albums: CustomAlbum[];
    showConfirmModal?: (title: string, message: string, type?: 'info' | 'danger' | 'success', onConfirm?: () => void, singleButton?: boolean) => void;
}
const CreateAlbumModal: React.FC<CreateAlbumModalProps> = ({ isOpen, onClose, onSave, showConfirmModal }) => {
    const [name, setName] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [mode, setMode] = useState<'album' | 'room'>('album');

    // Room Fields
    const [description, setDescription] = useState('');
    const [password, setPassword] = useState('');

    // Cover Config State
    const [coverConfig, setCoverConfig] = useState<AlbumCoverConfig>({
        type: 'solid',
        value: COVER_COLORS[0].value,
        spineColor: COVER_COLORS[0].spine,
        labelColor: COVER_COLORS[0].text
    });
    const [isEditingCover, setIsEditingCover] = useState(false);

    if (!isOpen) return null;

    const generatePassword = () => {
        const chars = "0123456789";
        let pw = "";
        for (let i = 0; i < 4; i++) {
            pw += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(pw);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            if (showConfirmModal) {
                showConfirmModal("입력 확인", "이름을 입력해주세요.", "danger", undefined, true);
            } else {
                alert("이름을 입력해주세요.");
            }
            return;
        }

        try {
            if (mode === 'room') {
                const roomConfig = {
                    description,
                    password: password || undefined,
                };
                // Await the save operation
                await onSave(name, selectedTag || null, null, 'room', roomConfig, coverConfig);
            } else {
                // Standard Album
                await onSave(name, selectedTag || null, null, 'album', undefined, coverConfig);
            }
            // Only close if no error thrown (or handled) and we want to close
            handleClose();
        } catch (e) {
            // Error handling should be done by onSave (handleCreateAlbum), showing the generic error modal
            // We just catch here to prevent unhandled rejection if it bubbles up
        }
    };

    const handleClose = () => {
        // Reset state
        setName('');
        setSelectedTag(null);
        setMode('album');
        setDescription('');
        setPassword('');

        setCoverConfig({
            type: 'solid',
            value: COVER_COLORS[0].value,
            spineColor: COVER_COLORS[0].spine,
            labelColor: COVER_COLORS[0].text
        });
        setIsEditingCover(false);
        onClose();
    };





    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className={`bg-[var(--bg-modal)] rounded-2xl w-full max-w-2xl p-6 shadow-2xl transform transition-all animate-scale-up max-h-[90vh] overflow-y-auto custom-scrollbar backdrop-blur-md ${isEditingCover ? 'hidden' : ''}`}> {/* Hide when customizer is open to prevent stacking issues visually if needed, though usually customizer is overlay */}
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2 bg-[var(--bg-card-secondary)] p-1 rounded-lg">
                        <button
                            onClick={() => setMode('album')}
                            className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-1.5 ${mode === 'album' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700 hover:bg-black/5'}`}
                        >
                            <Folder size={14} /> 일반 앨범
                        </button>
                        <button
                            onClick={() => setMode('room')}
                            className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-1.5 ${mode === 'room' ? 'bg-indigo-500 shadow text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-black/5'}`}
                        >
                            <Users size={14} /> 모임방
                        </button>
                    </div>
                    <button onClick={handleClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col gap-5">
                    {/* 1. 기본 정보 (공통) */}
                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">
                            {mode === 'room' ? '모임 이름' : '앨범 이름'} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={mode === 'room' ? "예: 우당탕탕 교환일기" : "예: 맛집 탐방, 여행 기록"}
                            className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-secondary)] text-[var(--text-primary)] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                        />
                    </div>

                    {/* ✨ 2. 모임방 전용 필드 */}
                    {mode === 'room' && (
                        <div className="space-y-4 animate-fade-in">
                            <div>
                                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">
                                    모임 설명
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="어떤 모임인지 간단히 소개해부세요."
                                    rows={2}
                                    className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-secondary)] text-[var(--text-primary)] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition resize-none"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-bold text-[var(--text-secondary)] flex items-center gap-1">
                                        <Lock size={14} /> 비밀번호 설정 <span className="text-red-500">*</span>
                                    </label>
                                    <button
                                        onClick={generatePassword}
                                        className="text-xs text-indigo-500 font-bold hover:underline"
                                    >
                                        자동 생성
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="설정 시 입장할 때 필요합니다"
                                        className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-secondary)] text-[var(--text-primary)] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition pl-10"
                                        maxLength={8}
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Lock size={16} />
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* 3. 해시태그 (공통 -> 순서 변경됨) */}
                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">
                            해시태그 <span className="text-xs font-normal text-[var(--text-tertiary)]">(선택)</span>
                        </label>
                        <div className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 transition bg-[var(--bg-card-secondary)] flex items-center gap-2">
                            <span className="text-indigo-500 font-bold ml-1">#</span>
                            <input
                                type="text"
                                value={selectedTag || ''}
                                onChange={(e) => setSelectedTag(e.target.value)}
                                placeholder="태그 입력"
                                className="flex-1 outline-none bg-transparent font-medium text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
                                maxLength={10}
                            />
                        </div>
                    </div>

                    {/* 4. 표지 설정 (공통 -> 순서 변경됨) */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-bold text-[var(--text-secondary)]">
                                표지 설정
                            </label>
                            <button
                                onClick={() => setIsEditingCover(true)}
                                className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline"
                            >
                                <Sparkles size={12} />
                                꾸미기
                            </button>
                        </div>

                        <div className="flex justify-center bg-[var(--bg-card-secondary)] rounded-xl p-6 border border-[var(--border-color)] relative">
                            <AlbumBook
                                title={name || (mode === 'room' ? "새 모임" : "새 앨범")}
                                tag={selectedTag || undefined} // Pass the selected tag
                                config={coverConfig}
                                className="w-32 shadow-md"
                            />
                            {mode === 'room' && (
                                <div className="absolute top-4 right-4 bg-white/50 backdrop-blur-sm p-1.5 rounded-full z-10">
                                    <Users size={16} className="text-indigo-600" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4 pt-2">
                        <button
                            onClick={handleClose}
                            className="flex-1 py-3 px-4 bg-[var(--bg-card-secondary)] text-[var(--text-secondary)] rounded-xl font-bold hover:bg-[var(--border-color)] transition"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSave}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold hover:opacity-90 shadow-lg shadow-indigo-500/20 transition text-[var(--btn-text)] ${mode === 'room' ? 'bg-indigo-600' : 'bg-[var(--btn-bg)]'}`}
                        >
                            {mode === 'room' ? '모임방 만들기' : (selectedTag ? '앨범 만들기' : '폴더 만들기')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Editing Logic */}
            {isEditingCover && (
                <CoverCustomizer
                    albumTitle={name || (mode === 'room' ? "새 모임" : "새 앨범")}
                    albumTag={selectedTag || undefined}
                    initialConfig={coverConfig}
                    onSave={(newConfig) => {
                        setCoverConfig(newConfig);
                        setIsEditingCover(false);
                    }}
                    onClose={() => setIsEditingCover(false)}
                />
            )}
        </div>
    );
};

export default CreateAlbumModal;
