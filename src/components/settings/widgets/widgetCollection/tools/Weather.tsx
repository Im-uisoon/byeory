import { Sun, CloudRain, CloudSnow, Cloud, Wind, Droplets } from 'lucide-react';
import { WidgetWrapper } from '../../Shared';
import { useWidgetStorage } from '../SDK';

type WeatherType = 'sun' | 'rain' | 'cloud' | 'snow';

// 10. Weather Widget (날씨)
// 10. Weather Widget (날씨)
export function WeatherWidget({ gridSize }: { gridSize?: { w: number, h: number } }) {
    const [weather, setWeather] = useWidgetStorage<WeatherType>('widget-weather-state', 'sun');

    const nextWeather = () => {
        const flow: WeatherType[] = ['sun', 'cloud', 'rain', 'snow'];
        const nextIndex = (flow.indexOf(weather) + 1) % flow.length;
        setWeather(flow[nextIndex]);
    };

    const styles = {
        sun: {
            bg: 'bg-gradient-to-br from-blue-400 to-blue-200',
            text: 'text-white',
            subText: 'text-blue-50',
            icon: <Sun className="w-full h-full text-yellow-300 animate-[spin_10s_linear_infinite]" />,
            temp: '24°',
            desc: '맑음'
        },
        cloud: {
            bg: 'bg-gradient-to-br from-gray-400 to-gray-200',
            text: 'text-white',
            subText: 'text-gray-100',
            icon: <Cloud className="w-full h-full text-white animate-pulse" />,
            temp: '18°',
            desc: '흐림'
        },
        rain: {
            bg: 'bg-gradient-to-br from-slate-700 to-slate-500',
            text: 'text-white',
            subText: 'text-slate-300',
            icon: <CloudRain className="w-full h-full text-blue-200 animate-bounce" />,
            temp: '15°',
            desc: '비'
        },
        snow: {
            bg: 'bg-gradient-to-br from-indigo-300 to-white',
            text: 'text-slate-600',
            subText: 'text-slate-400',
            icon: <CloudSnow className="w-full h-full text-white animate-pulse" />,
            temp: '-2°',
            desc: '눈'
        }
    };

    const current = styles[weather];
    const isSmall = (gridSize?.w || 2) < 2;
    const isLarge = (gridSize?.w || 2) >= 4;

    // Small View (1x1)
    if (isSmall) {
        return (
            <WidgetWrapper className={`${current.bg} cursor-pointer`} onClick={nextWeather}>
                <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-14 h-14 filter drop-shadow-md -mb-2">
                        {current.icon}
                    </div>
                    <span className={`text-3xl font-bold ${current.text} drop-shadow-sm leading-none`}>{current.temp}</span>
                    <span className={`text-xs opacity-80 ${current.text} mt-1`}>{current.desc}</span>
                </div>
            </WidgetWrapper>
        );
    }

    // Large View (4x1)
    if (isLarge) {
        return (
            <WidgetWrapper className={`${current.bg} transition-all duration-500 overflow-hidden`}>
                <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-3xl opacity-50" />
                <div
                    className="relative w-full h-full flex items-center justify-between px-6 py-2 cursor-pointer"
                    onClick={nextWeather}
                >
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 filter drop-shadow-xl">{current.icon}</div>
                        <div>
                            <div className={`text-5xl font-bold tracking-tighter ${current.text} drop-shadow-sm`}>{current.temp}</div>
                            <div className={`text-sm ${current.text} opacity-90`}>{current.desc}, Seoul</div>
                        </div>
                    </div>

                    {/* Weekly Forecast Mockup for Large View */}
                    <div className="flex gap-4 border-l border-white/20 pl-6 my-1">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`flex flex-col items-center gap-1 ${current.subText}`}>
                                <span className="text-[10px] uppercase">MON</span>
                                <div className="w-6 h-6 scale-75 opacity-90">{current.icon}</div>
                                <span className="text-xs font-bold">{parseInt(current.temp) + i}°</span>
                            </div>
                        ))}
                    </div>
                </div>
            </WidgetWrapper>
        );
    }

    // Default Medium View (2x1)
    return (
        <WidgetWrapper className={`${current.bg} transition-all duration-500 overflow-hidden`}>
            <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-black/5 rounded-full blur-xl" />

            <div
                className="relative w-full h-full flex items-center justify-between p-4 cursor-pointer"
                onClick={nextWeather}
            >
                <div className="flex flex-col z-10">
                    <div className="flex items-start gap-1">
                        <span className={`text-5xl font-bold tracking-tighter ${current.text} drop-shadow-sm`}>{current.temp}</span>
                    </div>
                    <span className={`text-lg font-medium mt-1 ${current.text}`}>{current.desc}</span>
                    <span className={`text-xs ${current.subText} mt-0.5`}>Seoul, KR</span>

                    <div className="flex gap-3 mt-3">
                        <div className={`flex items-center gap-1 text-[10px] ${current.subText}`}>
                            <Droplets size={10} />
                            <span>42%</span>
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] ${current.subText}`}>
                            <Wind size={10} />
                            <span>3m/s</span>
                        </div>
                    </div>
                </div>

                <div className="z-10 w-20 h-20 filter drop-shadow-lg transform transition-transform active:scale-90 flex items-center justify-center">
                    {current.icon}
                </div>
            </div>
        </WidgetWrapper>
    );
}
