import { useState } from 'react';
import { WidgetWrapper } from '../Common';
import { useWidgetStorage } from '../SDK';
import { X } from 'lucide-react'; // Removing Plus

interface ReceiptPrinterProps {
    gridSize?: { w: number; h: number };
}

export function ReceiptPrinter({ gridSize }: ReceiptPrinterProps) {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const w = gridSize?.w || 2;
    const h = gridSize?.h || 1;

    interface Task {
        id: number;
        text: string;
        check: boolean;
    }

    // Default Tasks
    const [tasks, setTasks] = useWidgetStorage<Task[]>('receipt-tasks', [
        { id: 1, text: "Wake Up & Hydrate", check: true },
        { id: 2, text: "Morning Yoga", check: true },
        { id: 3, text: "Read 30 mins", check: false },
        { id: 4, text: "Write Implementation", check: true }
    ]);
    const [newTask, setNewTask] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const toggleCheck = (id: number) => {
        setTasks((prev: Task[]) => prev.map(t => t.id === id ? { ...t, check: !t.check } : t));
    };

    const addTask = () => {
        if (!newTask.trim()) return;
        setTasks((prev: Task[]) => [...prev, { id: Date.now(), text: newTask, check: false }]);
        setNewTask('');
        setIsAdding(false);
    };

    const removeTask = (id: number) => {
        setTasks((prev: Task[]) => prev.filter(t => t.id !== id));
    };

    const isSmall = w === 1;
    const isWide = w >= 3;
    const isTall = h >= 2;

    // Filter tasks based on size
    const displayTasks = isSmall
        ? tasks.slice(0, 2)
        : (isTall ? tasks : tasks.slice(0, 4));

    // Small View: Folded Receipt / Summary
    if (isSmall && !isTall) {
        return (
            <WidgetWrapper className="bg-transparent border-none shadow-none p-0 overflow-visible group flex items-center justify-center">
                <div className="w-full h-auto bg-white text-black font-mono text-[9px] p-2 shadow-md relative rotate-[-2deg] group-hover:rotate-0 transition-transform">
                    <div className="text-center border-b border-black pb-1 mb-1">
                        <span className="font-bold">* MEMO *</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span>DONE</span>
                        <span>{tasks.filter(t => t.check).length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>LEFT</span>
                        <span>{tasks.filter(t => !t.check).length}</span>
                    </div>
                    <div className="mt-2 text-center text-[7px] opacity-60">
                        KEEP FIGHTING
                    </div>
                </div>
            </WidgetWrapper>
        );
    }

    return (
        <WidgetWrapper className="bg-transparent border-none shadow-none p-0 overflow-visible group">
            <div className="relative w-full h-full flex flex-col items-center justify-start pt-1">
                {/* Receipt Paper */}
                <div className="w-full bg-white text-black font-mono text-[10px] p-4 shadow-lg relative transition-transform duration-300 min-h-full">

                    {/* Header */}
                    <div className="flex flex-col items-center mb-4">
                        <h3 className="text-xl font-bold tracking-tighter mb-1 uppercase">* MY DAY *</h3>
                        <p className="text-[8px] opacity-60">USER ID #SJ-2024</p>
                        <p className="text-[8px] opacity-60">{today} {time}</p>
                    </div>

                    <div className="w-full border-t border-dashed border-black/30 my-2"></div>

                    {/* Task List */}
                    <div className="space-y-1 w-full">
                        {displayTasks.map((task, idx) => (
                            <div key={task.id} className="flex justify-between items-start group/item">
                                <button
                                    onClick={() => toggleCheck(task.id)}
                                    className={`flex-1 text-left truncate pr-2 uppercase hover:underline ${task.check ? 'line-through opacity-50' : ''}`}
                                >
                                    {idx + 1}. {task.text}
                                </button>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => toggleCheck(task.id)}>{task.check ? '[OK]' : '[  ]'}</button>
                                    <button onClick={() => removeTask(task.id)} className="opacity-0 group-hover/item:opacity-100 text-red-500 hover:text-red-700 font-bold ml-1">x</button>
                                </div>
                            </div>
                        ))}
                        {isAdding ? (
                            <div className="flex items-center gap-1 mt-2">
                                <input
                                    autoFocus
                                    className="w-full text-[10px] border-b border-black outline-none bg-transparent"
                                    value={newTask}
                                    onChange={(e) => setNewTask(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                                    placeholder="New Task..."
                                />
                                <button onClick={() => setIsAdding(false)}><X size={10} /></button>
                            </div>
                        ) : (
                            (!isSmall && tasks.length < 10) && (
                                <button onClick={() => setIsAdding(true)} className="w-full text-center hover:bg-black/5 py-1 mt-1 opacity-50 hover:opacity-100 transition-opacity">
                                    + ADD ITEM
                                </button>
                            )
                        )}


                        {!isTall && tasks.length > 4 && (
                            <div className="text-center text-[8px] opacity-50 mt-1">... and {tasks.length - 4} more</div>
                        )}
                    </div>

                    <div className="w-full border-t border-dashed border-black/30 my-2"></div>

                    <div className="flex justify-between font-bold text-xs">
                        <span>PROGRESS</span>
                        <span>{Math.round((tasks.length > 0 ? tasks.filter(t => t.check).length / tasks.length : 0) * 100)}%</span>
                    </div>

                    {/* Footer (Bar code for Tall/Wide) */}
                    {(isTall || isWide) && (
                        <div className="mt-4 text-center">
                            <p className="text-[8px] mb-2">THANK YOU FOR YOUR EFFORT</p>
                            {/* Simple CSS Barcode */}
                            <div className="h-8 w-3/4 mx-auto flex items-end gap-[2px] justify-center opacity-80">
                                {[...Array(20)].map((_, i) => (
                                    <div key={i} className={`bg-black h-full`} style={{ width: Math.random() > 0.5 ? '2px' : '4px' }}></div>
                                ))}
                            </div>
                            <p className="text-[7px] mt-1 tracking-[4px]">1234 5678</p>
                        </div>
                    )}

                    {/* Bottom Jagged Edge */}
                    <div className="absolute -bottom-2 left-0 w-full h-3 bg-white" style={{
                        maskImage: 'linear-gradient(45deg, transparent 33.33%, #000 33.33%, #000 66.66%, transparent 66.66%), linear-gradient(-45deg, transparent 33.33%, #000 33.33%, #000 66.66%, transparent 66.66%)',
                        maskSize: '10px 20px',
                        maskRepeat: 'repeat-x',
                        WebkitMaskImage: 'linear-gradient(45deg, transparent 33.33%, #000 33.33%, #000 66.66%, transparent 66.66%), linear-gradient(-45deg, transparent 33.33%, #000 33.33%, #000 66.66%, transparent 66.66%)',
                        WebkitMaskSize: '10px 10px',
                        WebkitMaskRepeat: 'repeat-x',
                        background: 'white'
                    }}></div>
                </div>
            </div>
        </WidgetWrapper>
    );
}
