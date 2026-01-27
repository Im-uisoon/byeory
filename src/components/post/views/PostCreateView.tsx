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

const PostCreateView: React.FC<Props> = ({ editor, handleImagesUpload }) => {
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
        addWidgetSticker: handleAddWidgetSticker, // Alias to match JSX usage
        isPublic, setIsPublic,
        rawInput, setRawInput,
        selectedLayoutId, setSelectedLayoutId,
        tempImages, setTempImages,
        fileInputRef,
        isAiProcessing, handleAiGenerate,
        currentTags, setTags,
        applyPaperPreset,
        myTemplates, applyTemplate,
        selectedId, selectedIds, selectedType,
        handleSelect, handleUpdate, handleDelete,
        handleBlockImageUpload, handleSaveAsTemplate,
        paperStyles, title, setTitle, titleStyles,
        handleSave, handleDeleteTemplate,
        showHiddenTemplates, setShowHiddenTemplates, handleRestoreTemplate
    } = editor;

    const checkSoloActivityRestriction = () => {
        // ✨ 그룹 활동 혼자 쓰기 방지
        const restrictedTags = ['롤링페이퍼', '교환일기', 'rolling-paper', 'exchange-diary'];
        const hasRestrictedTag = editor.currentTags.some(tag => restrictedTags.includes(tag));
        const hasRestrictedTitle = restrictedTags.some(keyword => editor.title.includes(keyword));

        if (hasRestrictedTag || hasRestrictedTitle) {
            editor.showConfirmModal(
                '저장 불가',
                "롤링페이퍼와 교환일기는 친구들과 함께하는 활동입니다.\n[내 앨범 > + 버튼]을 눌러 '모임방'을 만든 뒤 이용해주세요.",
                'danger',
                undefined,
                true
            );
            return true; // Restricted
        }
        return false;
    };

    const handleConfirmSave = async () => {
        if (checkSoloActivityRestriction()) return; // ✨ Block if restricted

        // ... (기본 저장 로직 유지)
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

        // ✨ Auto-Generate Thumbnail
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

                    // Pass name first, then thumbnail URL
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
                ref={canvasRef}
                title={title} setTitle={setTitle}
                titleStyles={titleStyles}
                viewMode={'editor'}
                blocks={blocks} setBlocks={setBlocks}
                stickers={editor.stickers} floatingTexts={editor.floatingTexts}
                floatingImages={editor.floatingImages}
                selectedId={selectedId}
                selectedIds={selectedIds} // ✨ Pass Multi-Select State
                selectedType={selectedType}
                onSelect={(id, type, isMulti) => { // ✨ Handle Multi-Select
                    handleSelect(id, type, isMulti);
                }}
                onUpdate={(id, _, changes) => handleUpdate(id, changes)}
                onDelete={() => {
                    if (selectedId) handleDelete(selectedId);
                }}
                onBlockImageUpload={(id, file) => handleBlockImageUpload(file, id)}
                onBackgroundClick={() => {
                    handleSelect(null, null);
                }}
                paperStyles={paperStyles}
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
                            result.message,
                            result.type || (result.success ? 'success' : 'danger'),
                            undefined,
                            true
                        );
                    }
                }}
                onCancel={() => setViewMode('album')}
                onAddBlock={() => setBlocks([...blocks, { id: `m-${Date.now()}`, type: 'paragraph', text: '' }])}
                onAddFloatingText={addFloatingText}
                onAddSticker={addSticker}
                onAddFloatingImage={addFloatingImage}
                onAddWidgetSticker={handleAddWidgetSticker}
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
                onSaveAsTemplate={openTemplateNameModal} // ✨ Use Modal Opener
                myTemplates={myTemplates}
                applyTemplate={applyTemplate}
                onDeleteTemplate={handleDeleteTemplate} // ✨ Pass Delete Handler
                showHiddenTemplates={showHiddenTemplates}
                setShowHiddenTemplates={setShowHiddenTemplates}
                onRestoreTemplate={handleRestoreTemplate}
                onClearSelection={() => handleSelect(null, null)} // ✨ Clear selection when sidebar is clicked
            />

            {/* ✨ 저장 위치 선택 모달 */}
            <SavePostModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onConfirm={handleConfirmSave}
                currentTags={editor.currentTags}
                onTagsChange={editor.setTags}
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
                isPublic={editor.isPublic}
                setIsPublic={editor.setIsPublic}
            />
        </div>
    );
};

export default PostCreateView;
