
import React, { useRef, useState, useEffect } from 'react';
import type { PostData } from '../types';
import MiniPostViewer from './MiniPostPreview.tsx';

interface Props {
    post: PostData;
    width?: number; // Fallback or initial width
    height?: number; // Container height (unused for scaling, but kept for interface)
}

const PostThumbnail: React.FC<Props> = ({ post, width = 300, height = 300 }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const baseWidth = 800;

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const currentWidth = containerRef.current.clientWidth;
                // Avoid DBZ or zero-scale issues
                if (currentWidth > 0) {
                    setScale(currentWidth / baseWidth);
                }
            }
        };

        // Initial calc
        updateScale();

        const observer = new ResizeObserver(() => {
            updateScale();
        });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Dummy handler for read-only removed


    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                position: 'relative',
                backgroundColor: '#ffffff'
            }}
            className="pointer-events-none select-none"
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    // scale is handled by MiniPostViewer internally via zoom
                }}

            >
                <MiniPostViewer
                    title={post.title}
                    titleStyles={post.titleStyles || {
                        fontSize: '30px',
                        fontWeight: 'bold',
                        fontFamily: "'Noto Sans KR', sans-serif",
                        color: '#000000',
                        textAlign: 'left'
                    }}
                    styles={post.styles || {}}
                    blocks={post.blocks || []}
                    stickers={post.stickers || []}
                    floatingTexts={post.floatingTexts || []}
                    floatingImages={post.floatingImages || []}
                    scale={scale}
                    minHeight="100%"
                    hideTitle={true} // ✨ Hide redundant name in thumbnail
                />
            </div>
        </div>
    );
};

export default PostThumbnail;
