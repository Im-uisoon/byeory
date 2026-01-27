import React, { useState, useEffect } from 'react';
import { Lock, ChevronDown } from 'lucide-react';

const TagSettings: React.FC = () => {
    const [isTagExpanded, setIsTagExpanded] = useState(false);
    const [privateTags, setPrivateTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [isSavingTags, setIsSavingTags] = useState(false);

    useEffect(() => {
        const fetchPrivateTags = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            try {
                const response = await fetch('http://localhost:8080/api/persona/settings', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data && Array.isArray(data.excludedHashtags)) {
                        setPrivateTags(data.excludedHashtags);
                    } else if (data && Array.isArray(data)) {
                        setPrivateTags(data);
                    } else {
                        setPrivateTags([]);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch excluded tags", e);
            }
        };

        if (isTagExpanded) {
            fetchPrivateTags();
        }
    }, [isTagExpanded]);

    const handleAddTag = () => {
        const tag = tagInput.trim().replace(/^#/, '');
        if (!tag) return;

        if (!privateTags.includes(tag)) {
            setPrivateTags(prev => [...prev, tag]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setPrivateTags(prev => prev.filter(tag => tag !== tagToRemove));
    };

    const handleSaveTags = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        setIsSavingTags(true);
        try {
            const response = await fetch('http://localhost:8080/api/persona/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ excludedHashtags: privateTags })
            });

            if (response.ok) {
                alert("저장되었습니다.");
            } else {
                alert("저장에 실패했습니다.");
            }
        } catch (e) {
            console.error("Failed to save excluded tags", e);
            alert("저장 중 오류가 발생했습니다.");
        } finally {
            setIsSavingTags(false);
        }
    };

    return (
        <div>
            <button
                onClick={() => setIsTagExpanded(!isTagExpanded)}
                className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between hover:opacity-80"
            >
                <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 theme-text-secondary" />
                    <div>
                        <span className="block theme-text-primary">비공개 태그 설정</span>
                        <span className="text-sm theme-text-secondary">AI 분석에서 제외할 태그</span>
                    </div>
                </div>
                <ChevronDown className={`w-5 h-5 theme-text-secondary transition-transform duration-200 ${isTagExpanded ? 'transform rotate-180' : ''}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ${isTagExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-6 py-4 theme-bg-card-secondary border-t theme-border">
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleAddTag();
                                }
                            }}
                            placeholder="#태그 입력 (스페이스바로 추가)"
                            className="flex-1 px-4 py-2 rounded-xl text-sm border theme-border theme-bg-card theme-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)] placeholder:text-gray-400"
                        />
                        <button
                            onClick={handleSaveTags}
                            disabled={!!tagInput.trim() || isSavingTags}
                            className="px-6 py-2 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                            style={{ backgroundColor: 'var(--btn-bg)' }}
                        >
                            {isSavingTags ? '저장 중...' : '저장'}
                        </button>
                    </div>

                    {tagInput.trim().length > 0 && (
                        <p className="text-xs text-red-500 mb-2 pl-2">
                            * 입력 중인 태그가 있습니다. 엔터나 스페이스바를 눌러 추가해주세요.
                        </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                        {privateTags.length === 0 && (
                            <p className="text-xs theme-text-secondary py-2">등록된 제외 태그가 없습니다.</p>
                        )}
                        {privateTags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => handleRemoveTag(tag)}
                                className="group flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-sm font-medium transition-all hover:bg-red-100 hover:text-red-600 theme-bg-card theme-text-primary border theme-border"
                            >
                                <span>#{tag}</span>
                                <div className="w-4 h-4 rounded-full theme-bg-card-secondary group-hover:bg-red-200 flex items-center justify-center">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </div>
                            </button>
                        ))}
                    </div>
                    <p className="mt-3 text-xs theme-text-secondary flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        등록된 태그가 포함된 일기는 AI 분석 및 통계에서 제외됩니다.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TagSettings;
