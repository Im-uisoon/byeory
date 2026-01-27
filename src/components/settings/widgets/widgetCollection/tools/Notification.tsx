import { Bell } from 'lucide-react';
import { WidgetWrapper } from '../../Shared';
import { useWidgetStorage } from '../SDK';

// 11. Notification (알림 설정)
export function NotificationSet() {
    const [isOn, setIsOn] = useWidgetStorage('widget-notification-ison', true);

    return (
        <WidgetWrapper className="bg-gray-50">
            <div className="w-full h-full flex flex-col justify-center p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-600 flex items-center gap-1"><Bell size={12} /> 일기 알림</span>
                    <div
                        onClick={() => setIsOn(!isOn)}
                        className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${isOn ? 'bg-green-400' : 'bg-gray-300'}`}
                    >
                        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${isOn ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-2 text-center">
                    <span className="text-lg font-mono font-bold text-gray-800">22:00</span>
                </div>
                <p className="text-[9px] text-gray-400 text-center mt-1">매일 밤, 하루를 기록하세요</p>
            </div>
        </WidgetWrapper>
    );
}
