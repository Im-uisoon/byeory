import React, { useState, useEffect } from 'react';
import { Rss, ExternalLink, RefreshCw } from 'lucide-react';
import { useWidgetStorage } from '../SDK';

export function RSSReader({ gridSize }: { gridSize?: { w: number; h: number } }) {
    const [url, setUrl] = useWidgetStorage('widget-rss-url', '');
    const [feed, setFeed] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFeed = async (e?: React.FormEvent, overrideUrl?: string) => {
        if (e) e.preventDefault();

        const targetUrl = overrideUrl || url;
        if (!targetUrl) return;

        setLoading(true);
        setError(null);

        if (overrideUrl) setUrl(overrideUrl);

        // CORS Issue Note:
        // Browsers block fetching XML/RSS from different domains.
        // In a real app, we need a backend proxy: /api/rss?url=...
        // For this demo, we can try using a public CORS proxy like 'cors-anywhere' or 'rss2json' API.
        // Let's use rss2json generic API for demo purposes as it returns JSON.

        try {
            const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(targetUrl)}`;
            const res = await fetch(apiUrl);
            const data = await res.json();

            if (data.status === 'ok') {
                setFeed(data.items.slice(0, 5)); // Keep top 5
            } else {
                setError('Failed to load feed.');
            }
        } catch (err) {
            setError('Network error (CORS?)');
        } finally {
            setLoading(false);
        }
    };

    // Auto-load on mount if URL exists
    useEffect(() => {
        if (url) {
            fetchFeed(undefined, url);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isSmall = (gridSize?.w || 2) < 2;

    if (isSmall) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-2 theme-bg-card rounded-xl shadow-sm border theme-border overflow-hidden group">
                <Rss size={20} className="text-orange-500 mb-1" />
                {feed.length > 0 ? (
                    <span className="text-[8px] leading-tight font-bold theme-text-primary text-center line-clamp-2">
                        {feed[0].title}
                    </span>
                ) : (
                    <span className="text-[8px] theme-text-secondary">RSS</span>
                )}
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-4 theme-bg-card rounded-xl shadow-sm border theme-border overflow-hidden">

            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <Rss size={16} className="text-orange-500" />
                <span className="text-xs font-bold theme-text-primary">RSS Reader</span>
            </div>

            {/* Input */}
            <form onSubmit={fetchFeed} className="flex gap-2 mb-3">
                <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Feed URL..."
                    className="flex-1 text-xs px-2 py-1.5 rounded theme-bg-input border theme-border outline-none focus:border-[var(--btn-bg)]"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="p-1.5 rounded bg-[var(--btn-bg)] text-white hover:opacity-90 disabled:opacity-50"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
            </form>

            {/* Presets */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide">
                {[
                    { label: '뉴스', url: 'https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko' },
                    { label: '과학/기술', url: 'https://news.google.com/rss/headlines/section/topic/SCITECH?hl=ko&gl=KR&ceid=KR:ko' },
                    { label: '엔터', url: 'https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=ko&gl=KR&ceid=KR:ko' },
                    { label: '경제', url: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=ko&gl=KR&ceid=KR:ko' },
                    { label: '스포츠', url: 'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=ko&gl=KR&ceid=KR:ko' },
                ].map((preset) => (
                    <button
                        key={preset.label}
                        onClick={() => fetchFeed(undefined, preset.url)}
                        className="flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-bold theme-bg-card-secondary theme-text-secondary border theme-border hover:theme-bg-primary hover:text-white transition-colors"
                    >
                        {preset.label}
                    </button>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div className="text-[10px] text-red-500 mb-2 px-1">
                    {error}
                </div>
            )}

            {/* Feed List */}
            <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide space-y-2">
                {feed.length === 0 && !loading && !error && (
                    <div className="text-center py-4 text-[10px] theme-text-secondary">
                        No feed loaded.
                    </div>
                )}

                {feed.map((item, idx) => (
                    <div key={idx} className="p-2 rounded-lg theme-bg-card-secondary hover:bg-[var(--bg-card-secondary)] transition-colors group">
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="block">
                            <h4 className="text-xs font-bold theme-text-primary mb-1 line-clamp-2 group-hover:text-[var(--btn-bg)] transition-colors">
                                {item.title}
                            </h4>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-[9px] theme-text-secondary">
                                    {new Date(item.pubDate).toLocaleDateString()}
                                </span>
                                <ExternalLink size={10} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}
