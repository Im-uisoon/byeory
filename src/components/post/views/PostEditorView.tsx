import React from 'react';
import EditorCanvas from '../components/editor/EditorCanvas';
import EditorSidebar from '../components/editor/EditorSidebar';
import { usePostEditor } from '../hooks/usePostEditor';

import SavePostModal from '../components/SavePostModal';


import { domToPng } from 'modern-screenshot';
import { uploadImageToSupabase } from '../api';

interface Props {
    editor: ReturnType<typeof usePostEditor>;
    handleImagesUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

import InputModal from '../../common/InputModal'; // ✨ Import InputModal

// ...

const PostEditorView: React.FC<Props> = ({ editor, handleImagesUpload }) => {
    const [isSaveModalOpen, setIsSaveModalOpen] = React.useState(false);
    const canvasRef = React.useRef<HTMLDivElement>(null);

    // ✨ Input Modal State
    const [templateInputModal, setTemplateInputModal] = React.useState({
        isOpen: false,
        defaultValue: ''
    });

    // ✨ Destructure Editor State & Handlers
    const {
        setViewMode,
        blocks, setBlocks,
        addFloatingText, addFloatingImage, addSticker,
        addWidgetSticker, // Variable name for JSX
        isPublic, setIsPublic,
        rawInput, setRawInput,
        selectedLayoutId, setSelectedLayoutId,
        tempImages, setTempImages,
        fileInputRef,
        isAiProcessing, handleAiGenerate,
        currentTags, setTags,
        applyPaperPreset,
        myTemplates, applyTemplate,
        selectedId, selectedType,
        handleUpdate, handleDelete,
        handleBlockImageUpload, handleSaveAsTemplate,
        paperStyles, title, setTitle, titleStyles,
        handleSave, currentPostId, selectedAlbumId,
        handleDeleteTemplate,
        showHiddenTemplates, setShowHiddenTemplates, handleRestoreTemplate
    } = editor;


    const checkSoloActivityRestriction = () => {
        // ✨ 그룹 활동 혼자 쓰기 방지 (이미 저장된 글도 수정 시 체크 - 정책에 따라 다를 수 있으나 사용자 요구사항 '하지도 못하게' 반영)
        // 단, 이미 RoomID가 있는 경우는 괜찮은데, 여기서 RoomID를 알 방법이... editor.mode === 'room'?
        // 하지만 PostEditorView는 일반 글 수정용이고, RoomCycle은 RollingPaperView를 씀.
        // 따라서 여기서 수정하는 글은 '개인 글'일 확률이 높음. 
        // 기존에 잘못 만들어진 글을 수정 못하게 막는 효과도 있음.

        const restrictedTags = ['롤링페이퍼', '교환일기', 'rolling-paper', 'exchange-diary'];
        const hasRestrictedTag = editor.currentTags.some(tag => restrictedTags.includes(tag));

        if (hasRestrictedTag) {
            editor.showConfirmModal(
                '수정 제한',
                "이 활동은 모임방 전용 활동입니다.\n현재 개인 공간에서는 수정할 수 없습니다.",
                'danger',
                undefined,
                true
            );
            return true; // Restricted
        }
        return false;
    };

    const handleConfirmSave = async () => {
        if (checkSoloActivityRestriction()) return;

        // ... (기본 저장 로직)
        const result = await editor.handleSave(); // 실제 저장 로직
        setIsSaveModalOpen(false);

        if (result?.message) {
            editor.showConfirmModal(
                result.success ? '저장 완료' : '저장 실패',
                result.message,
                result.type || (result.success ? 'success' : 'danger'),
                undefined,
                true
            );
        }
    };

    const openTemplateNameModal = () => {
        setTemplateInputModal({ isOpen: true, defaultValue: '' });
    };

    const handleSaveAsTemplateFinal = async (name: string) => {
        // ✨ Logic moved from wrapper

        // ✨ Auto-Generate Thumbnail (Synced with CreatePage)
        if (canvasRef.current) {
            try {
                const dataUrl = await domToPng(canvasRef.current, {
                    scale: 0.5,
                    // backgroundColor: '#ffffff',
                });

                if (dataUrl) {
                    const blob = await (await fetch(dataUrl)).blob();
                    const file = new File([blob], `tmpl-${Date.now()}.png`, { type: "image/png" });
                    const url = await uploadImageToSupabase(file);
                    handleSaveAsTemplate(name, url || undefined);
                } else {
                    handleSaveAsTemplate(name);
                }
            } catch (e: any) {
                console.warn("Thumbnail capture failed", e);
                handleSaveAsTemplate(name);
            }
        } else {
            handleSaveAsTemplate(name);
        }
    };

    return (
        <div className="flex flex-col xl:flex-row h-auto min-h-[85vh] gap-6 relative">
            {/* ✨ Input Modal for Template Name */}
            <InputModal
                isOpen={templateInputModal.isOpen}
                onClose={() => setTemplateInputModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={handleSaveAsTemplateFinal}
                title="템플릿 저장"
                message="이 디자인을 '나만의 템플릿'으로 저장하시겠습니까?"
                placeholder="템플릿 이름을 입력해주세요"
                confirmText="저장하기"
            />

            {/* 메인 캔버스 */}
            {/* 메인 캔버스 */}
            <EditorCanvas
                ref={canvasRef} // ✨ Pass Ref
                title={title} setTitle={setTitle}
                titleStyles={titleStyles}
                viewMode={'editor'}
                blocks={blocks} setBlocks={setBlocks}
                stickers={editor.stickers} floatingTexts={editor.floatingTexts}
                floatingImages={editor.floatingImages}
                selectedId={selectedId}
                selectedType={selectedType}
                onSelect={(id, type) => {
                    editor.setSelectedId(id);
                    editor.setSelectedType(type);
                }}
                onUpdate={(id, _, changes) => handleUpdate(id, changes)}
                onDelete={() => {
                    if (selectedId) handleDelete(selectedId);
                }}
                onBlockImageUpload={(id, file) => handleBlockImageUpload(file, id)}
                onBackgroundClick={() => {
                    editor.setSelectedId(null);
                    editor.setSelectedType(null);
                }}
                paperStyles={paperStyles} // ✨ Pass Styles
                onAddFloatingText={addFloatingText} // ✨ Pass Handler
            />

            {/* 오른쪽 사이드바 */}
            <EditorSidebar
                isSaving={editor.isSaving}
                onSave={() => {
                    // ✨ Validation: Check Title & Content
                    if (!title.trim()) {
                        editor.showConfirmModal('입력 확인', "제목을 입력해주세요!", 'danger', undefined, true);
                        return;
                    }
                    const hasContent = blocks.some(b => b.text?.trim() || b.imageUrl || b.imageUrl2) ||
                        editor.stickers.length > 0 ||
                        editor.floatingTexts.length > 0 ||
                        editor.floatingImages.length > 0;

                    if (!hasContent) {
                        editor.showConfirmModal('입력 확인', "내용을 입력해주세요!", 'danger', undefined, true);
                        return;
                    }

                    setIsSaveModalOpen(true);
                }}
                onTempSave={async () => {
                    const result = await handleSave(true);
                    if (result?.message) {
                        editor.showConfirmModal(
                            result.success ? '임시 저장' : '저장 실패',
                            result.success ? (
                                <div className="text-center">
                                    <span>임시 저장되었습니다.</span>
                                    <div className="mt-2 flex items-center justify-center gap-1.5 flex-wrap">
                                        <button className="px-2 py-0.5 rounded-md text-xs font-bold bg-[var(--btn-bg)] text-[var(--btn-text)] shadow-sm">
                                            #임시저장
                                        </button>
                                        <span>에서 확인 가능합니다.</span>
                                    </div>
                                </div>
                            ) : result.message,
                            result.type || (result.success ? 'success' : 'danger'),
                            undefined,
                            true
                        );
                    }
                }} // ✨ Temp Save Handler
                onCancel={() => {
                    const proceed = () => {
                        editor.closeConfirmModal(); // ✨ Close modal immediately
                        // ✨ Cancel Logic: Smart Navigation
                        // If it's a draft (Temp Save), go back to List (Album/Folder)
                        // If it's a published post (Edit), go back to Read Mode
                        const isDraft = currentTags.includes('임시저장');

                        if (currentPostId && !isDraft) {
                            setViewMode('read');
                        } else {
                            // Draft or New Post -> Go to Album/Folder
                            if (selectedAlbumId && selectedAlbumId !== '__all__' && selectedAlbumId !== '__others__') {
                                setViewMode('folder');
                            } else {
                                setViewMode('album');
                            }
                        }
                    };

                    // ✨ Check Dirty
                    if (editor.isDirty) {
                        editor.showConfirmModal(
                            "나가기 확인",
                            "작성 중인 내용이 저장되지 않았습니다. 정말 나가시겠습니까?",
                            "danger",
                            proceed
                        );
                    } else {
                        proceed();
                    }
                }}
                onAddBlock={() => setBlocks([...blocks, { id: `m-${Date.now()}`, type: 'paragraph', text: '' }])}
                onAddFloatingText={addFloatingText}
                onAddSticker={addSticker}
                onAddFloatingImage={addFloatingImage}
                onAddWidgetSticker={addWidgetSticker}
                // ✨ 공개 여부 제어
                isPublic={isPublic}
                setIsPublic={setIsPublic}
                rawInput={rawInput} setRawInput={setRawInput}
                selectedLayoutId={selectedLayoutId} setSelectedLayoutId={setSelectedLayoutId}
                tempImages={tempImages} setTempImages={setTempImages}
                fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>} handleImagesUpload={handleImagesUpload}
                onAiGenerate={handleAiGenerate} isAiProcessing={isAiProcessing}
                currentTags={currentTags}
                onTagsChange={setTags}
                applyPaperPreset={applyPaperPreset}
                onSaveAsTemplate={openTemplateNameModal}
                myTemplates={myTemplates}
                applyTemplate={applyTemplate}
                onDeleteTemplate={handleDeleteTemplate} // ✨ Pass Delete Handler
                showHiddenTemplates={showHiddenTemplates}
                setShowHiddenTemplates={setShowHiddenTemplates}
                onRestoreTemplate={handleRestoreTemplate}
            />

            <SavePostModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onConfirm={handleConfirmSave}
                currentTags={currentTags}
                onTagsChange={setTags}
                customAlbums={editor.customAlbums}
                isSaving={editor.isSaving}
                selectedAlbumIds={editor.targetAlbumIds}
                onAlbumIdsChange={editor.setTargetAlbumIds}
                onCreateAlbum={editor.handleCreateAlbum}
                onDeleteAlbum={editor.handleDeleteAlbum}
                mode={editor.mode}
                setMode={editor.setMode}
                isFavorite={editor.isFavorite}
                setIsFavorite={editor.setIsFavorite}
                isPublic={isPublic}
                setIsPublic={setIsPublic}
            />
        </div>
    );
};

export default PostEditorView;
