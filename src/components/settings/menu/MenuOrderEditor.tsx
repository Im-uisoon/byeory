import React, { useRef, useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useMenu } from './MenuSettings';
import type { MenuItem } from './MenuSettings';
import { GripVertical, X, Save, RotateCcw, ArrowUp, ArrowDown, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* -------------------------------------------------------------------------------------------------
 * Sortable List Item
 * -----------------------------------------------------------------------------------------------*/
interface SortableItemProps {
    id: string;
    index: number;
    text: string;
    moveItem: (dragIndex: number, hoverIndex: number) => void;
    icon: React.ElementType; // LucideIcon type
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({
    id, index, text, moveItem, icon: Icon, onMoveUp, onMoveDown, isFirst, isLast
}) => {
    const ref = useRef<HTMLDivElement>(null);

    const [{ handlerId }, drop] = useDrop({
        accept: 'MENU_SORT_ITEM',
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        hover(item: any, monitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;

            if (dragIndex === hoverIndex) {
                return;
            }

            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = (clientOffset as any).y - hoverBoundingRect.top;

            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }

            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }

            moveItem(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: 'MENU_SORT_ITEM',
        item: () => {
            return { id, index };
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const opacity = isDragging ? 0.3 : 1;
    // Apply drag and drop refs to the entire container
    drag(drop(ref));

    return (
        <motion.div
            layout
            ref={ref}
            style={{ opacity }}
            data-handler-id={handlerId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-between p-2 mb-2 theme-bg-card-secondary theme-border border rounded-xl hover:bg-black/5 transition-colors group cursor-grab active:cursor-grabbing shadow-sm"
        >
            <div className="flex items-center gap-4">
                {/* Drag Handle - Visual Only now since whole card is draggable */}
                <div className="p-1 theme-text-secondary group-hover:theme-text-primary transition-colors">
                    <GripVertical size={20} />
                </div>

                {/* Icon & Text */}
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg theme-bg-card theme-text-primary">
                        <Icon size={18} />
                    </div>
                    <span className="font-medium theme-text-primary select-none">{text}</span>
                </div>
            </div>

            {/* Manual Move Controls (Visible on Hover/Focus) */}
            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                    disabled={isFirst}
                    className={`p-1 rounded-md transition-colors ${isFirst
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'theme-text-secondary hover:bg-black/10 hover:theme-text-primary'}`}
                    title="위로 이동"
                >
                    <ArrowUp size={16} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                    disabled={isLast}
                    className={`p-1 rounded-md transition-colors ${isLast
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'theme-text-secondary hover:bg-black/10 hover:theme-text-primary'}`}
                    title="아래로 이동"
                >
                    <ArrowDown size={16} />
                </button>
            </div>
        </motion.div>
    );
};


/* -------------------------------------------------------------------------------------------------
 * Menu Order Editor Container
 * -----------------------------------------------------------------------------------------------*/
interface MenuOrderEditorProps {
    onBack?: () => void;
    onClose?: () => void;
}

export const MenuOrderEditor: React.FC<MenuOrderEditorProps> = ({ onBack, onClose }) => {
    const { menuItems, setMenuItems } = useMenu();
    // Local state for editing
    const [localItems, setLocalItems] = useState<MenuItem[]>([]);

    // Initialize local state
    useEffect(() => {
        setLocalItems(menuItems);
    }, []);

    const moveItem = (dragIndex: number, hoverIndex: number) => {
        const updatedItems = [...localItems];
        const [draggedItem] = updatedItems.splice(dragIndex, 1);
        updatedItems.splice(hoverIndex, 0, draggedItem);
        setLocalItems(updatedItems);
    };

    const handleMoveUp = (index: number) => {
        if (index <= 0) return;
        moveItem(index, index - 1);
    };

    const handleMoveDown = (index: number) => {
        if (index >= localItems.length - 1) return;
        moveItem(index, index + 1);
    };

    const handleReset = () => {
        setLocalItems(menuItems);
    };

    const handleSave = async () => {
        const orderIds = localItems.map(item => item.id);
        localStorage.setItem('menuOrder', JSON.stringify(orderIds));

        setMenuItems(localItems);

        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                await fetch('http://localhost:8080/api/setting/menu', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ menuOrder: orderIds })
                });
            } catch (e) {
                console.error("Failed to save menu order", e);
            }
        }

        if (onBack) onBack();
        else if (onClose) onClose();
    };


    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2 -ml-2 rounded-full hover:bg-black/5 theme-text-secondary transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                    )}
                    <h2 className="text-xl font-bold theme-text-primary">메뉴 순서 편집</h2>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-black/5 theme-text-secondary transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar">
                <p className="theme-text-secondary mb-3 text-sm">
                    드래그하거나 화살표를 사용하여 순서를 변경할 수 있습니다.
                </p>

                <div className="flex flex-col">
                    <AnimatePresence>
                        {localItems.map((item, index) => (
                            <SortableItem
                                key={item.id}
                                index={index}
                                id={item.id}
                                text={item.name}
                                icon={item.icon}
                                moveItem={moveItem}
                                onMoveUp={() => handleMoveUp(index)}
                                onMoveDown={() => handleMoveDown(index)}
                                isFirst={index === 0}
                                isLast={index === localItems.length - 1}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex justify-end gap-3 pt-4 theme-border border-t shrink-0">
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium theme-text-secondary hover:bg-black/5 transition-colors"
                >
                    <RotateCcw size={16} />
                    초기화
                </button>
                <button
                    onClick={handleSave}
                    className="theme-btn flex items-center gap-2 px-6 py-2 rounded-lg shadow-lg font-bold transition-all"
                >
                    <Save size={16} />
                    저장
                </button>
            </div>
        </div>
    );
};

// export default MenuOrderEditor;
