import React, { useState, useEffect, useRef, memo } from 'react';
import { GlassCard } from './ui/Glass';
import { AppConfig } from '../types';
import { useWeather } from '../hooks/useWeather';

// Icons
const DropIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
);
const ArrowIcon = ({ deg }: { deg: number }) => (
    <svg className="w-3 h-3" style={{ transform: `rotate(${deg}deg)` }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
);

// --- Weather Widget ---
const WEATHER_CODES: Record<number, string> = {
    0: '晴朗', 1: '少雲', 2: '多雲', 3: '陰天',
    45: '霧', 48: '凍霧',
    51: '毛毛雨', 53: '中雨', 55: '大雨',
    61: '小雨', 63: '中雨', 65: '暴雨',
    71: '小雪', 73: '中雪', 75: '大雪',
    80: '陣雨', 81: '強陣雨', 82: '暴雨',
    95: '雷陣雨', 96: '雷陣雨伴冰雹', 99: '重雷陣雨'
};

interface WeatherWidgetProps {
    customLocation?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ customLocation }) => {
  // 傳入 customLocation，如果存在則優先使用
  const { weather, locationName, loading } = useWeather(true, customLocation);

  if (loading || !weather) return (
      <GlassCard className="flex items-center justify-center px-6 h-32 w-72 !bg-black/20 border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-400 text-sm">正在獲取天氣...</span>
          </div>
      </GlassCard>
  );

  const getWeatherIcon = (code: number, isDay: number) => {
      if (code === 0) return isDay ? '☀️' : '🌙';
      if (code <= 3) return '☁️';
      if (code <= 45) return '🌫️';
      if (code <= 67) return '🌧️';
      if (code <= 77) return '❄️';
      if (code > 90) return '⛈️';
      return '🌦️';
  };

  const weatherDesc = WEATHER_CODES[weather.weather_code] || '未知';

  return (
    <GlassCard className="flex items-center justify-between px-6 py-4 h-32 w-72 !bg-black/20 border-white/5 transition-transform hover:scale-105 group relative overflow-hidden">
        {/* 背景裝飾：根據白天黑夜顯示不同顏色光暈 */}
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl transition-all ${weather.is_day ? 'bg-orange-500/10 group-hover:bg-orange-500/20' : 'bg-blue-500/10 group-hover:bg-blue-500/20'}`}></div>

        {/* 左側：溫度與圖標 */}
        <div className="flex flex-col items-start z-10">
             <div className="flex items-center gap-2">
                 <span className="text-4xl filter drop-shadow-md">{getWeatherIcon(weather.weather_code, weather.is_day)}</span>
                 <div className="flex flex-col">
                    <span className="text-4xl font-light text-white leading-none tracking-tight">
                        {Math.round(weather.temperature_2m)}°
                    </span>
                 </div>
             </div>
             <span className="text-sm text-gray-300 mt-2 font-medium tracking-wider pl-1">
                 {weatherDesc}
             </span>
        </div>

        {/* 右側：詳細信息 */}
        <div className="flex flex-col items-end gap-2 text-right z-10">
             {/* 顯示具體的 locationName */}
             <div className="text-xs font-bold text-white bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-md max-w-[120px] truncate" title={locationName}>
                 {locationName}
             </div>
             
             <div className="flex flex-col gap-1.5 text-xs text-gray-400 mt-1">
                 <div className="flex items-center justify-end gap-1.5">
                     <DropIcon />
                     <span className="font-mono text-gray-300">{weather.relative_humidity_2m}%</span>
                 </div>
                 <div className="flex items-center justify-end gap-1.5">
                     <ArrowIcon deg={weather.wind_direction_10m} />
                     <span className="font-mono text-gray-300">{weather.wind_speed_10m} km/h</span>
                 </div>
             </div>
        </div>
    </GlassCard>
  );
};

// --- Quote Widget ---
export const QuoteWidget: React.FC = () => {
  const [quote, setQuote] = useState({ text: 'Loading...', author: '' });

  useEffect(() => {
      fetch('https://v1.hitokoto.cn/?c=i&c=k')
        .then(res => res.json())
        .then(data => setQuote({ text: data.hitokoto, author: data.from_who || data.from }))
        .catch(() => setQuote({ text: '心有猛虎，細嗅薔薇。', author: 'Sassoon' }));
  }, []);

  return (
    <GlassCard className="flex flex-col justify-center px-6 py-4 h-32 w-80 !bg-black/20 border-white/5 transition-transform hover:scale-105">
        <div className="relative">
            <span className="absolute -top-3 -left-2 text-4xl text-white/10 font-serif">“</span>
            <p className="text-sm text-gray-100 font-medium leading-relaxed line-clamp-2 italic px-2">
                {quote.text}
            </p>
            <span className="absolute -bottom-4 -right-1 text-4xl text-white/10 font-serif">”</span>
        </div>
        <p className="text-xs text-gray-400 mt-3 text-right font-medium tracking-wide">
            — {quote.author || '佚名'}
        </p>
    </GlassCard>
  );
};

// --- Market Widget (TradingView) ---
// 優化：改回 Mini Symbol Overview，使用 SSE:000001 (上證指數)
// 使用 dangerouslySetInnerHTML 避免 React DOM 注入腳本時的時序問題
export const MarketWidget: React.FC = memo(() => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        
        const scriptConfig = {
            "symbol": "SSE:000001", // 上證指數
            "width": "100%",
            "height": "100%",
            "locale": "zh_TW",
            "dateRange": "12M",
            "colorTheme": "dark",
            "isTransparent": true,
            "autosize": true,
            "largeChartUrl": ""
        };

        containerRef.current.innerHTML = '';
        
        const widgetContainer = document.createElement('div');
        widgetContainer.className = "tradingview-widget-container__widget h-full w-full";
        
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
        script.async = true;
        script.innerHTML = JSON.stringify(scriptConfig);

        containerRef.current.appendChild(widgetContainer);
        containerRef.current.appendChild(script);
    }, []);

    return (
        <GlassCard className="flex items-center justify-center p-0 h-32 w-72 !bg-black/20 border-white/5 transition-transform hover:scale-105 overflow-hidden relative">
             <div className="tradingview-widget-container w-full h-full p-2" ref={containerRef}>
                 {/* Widget injected here */}
             </div>
             {/* 遮擋底部版權條 */}
             <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-[#0f172a] to-transparent pointer-events-none"></div>
        </GlassCard>
    );
});
MarketWidget.displayName = "MarketWidget";

// --- Note Widget ---
interface NoteProps {
    content: string;
    onUpdate: (val: string) => void;
}
export const NoteWidget: React.FC<NoteProps> = ({ content, onUpdate }) => {
    const [localValue, setLocalValue] = useState(content);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== content) {
                onUpdate(localValue);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [localValue, content, onUpdate]);

    return (
        <GlassCard className="flex flex-col px-5 py-4 h-32 w-72 !bg-black/20 border-white/5 group relative transition-transform hover:scale-105">
             <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] text-purple-300 font-bold uppercase tracking-widest">Memo</span>
                 <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)]"></div>
             </div>
             <textarea 
                className="w-full h-full bg-transparent border-none resize-none text-sm text-gray-200 focus:outline-none custom-scrollbar leading-relaxed"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                placeholder="在此輸入便籤..."
                spellCheck={false}
             />
        </GlassCard>
    );
};

// --- Calendar Widget ---
export const CalendarWidget: React.FC = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDate = today.getDate();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); 

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="w-5 h-5" />);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const isToday = d === currentDate;
        days.push(
            <div 
                key={d} 
                className={`w-5 h-5 flex items-center justify-center text-[10px] rounded-full transition-all
                    ${isToday ? 'bg-purple-600 text-white font-bold shadow-lg scale-110' : 'text-gray-400'}`}
            >
                {d}
            </div>
        );
    }

    return (
        <GlassCard className="flex flex-col justify-center px-6 py-3 h-32 w-64 !bg-black/20 border-white/5 transition-transform hover:scale-105">
            <div className="text-xs font-bold text-gray-200 uppercase mb-2 flex justify-between items-center border-b border-white/5 pb-1">
                <span>{today.toLocaleDateString('en-US', { month: 'long' })}</span>
                <span className="text-purple-400">{currentYear}</span>
            </div>
            <div className="grid grid-cols-7 gap-1 justify-items-center">
                {['S','M','T','W','T','F','S'].map((d,i) => (
                    <span key={i} className="text-[9px] text-gray-500 font-bold">{d}</span>
                ))}
                {days}
            </div>
        </GlassCard>
    );
};

// --- Clock Widget (Small) ---
export const ClockWidget: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <GlassCard className="flex flex-col items-center justify-center px-6 h-32 w-64 !bg-black/20 border-white/5 transition-transform hover:scale-105">
            <div className="text-4xl font-mono font-bold text-white tracking-widest leading-none drop-shadow-md">
                {time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="flex items-center gap-2 mt-2">
                 <span className="text-xl font-mono text-purple-400">
                    {time.getSeconds().toString().padStart(2, '0')}
                 </span>
                 <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">seconds</span>
            </div>
        </GlassCard>
    );
};


interface RendererProps {
    type?: string;
    config: AppConfig;
    onUpdateConfig: (config: Partial<AppConfig>) => void;
}

export const WidgetRenderer: React.FC<RendererProps> = ({ type, config, onUpdateConfig }) => {
    if (!type || type === 'none') return null;

    switch (type) {
        case 'weather': return <WeatherWidget customLocation={config.customLocation} />;
        case 'quote': return <QuoteWidget />;
        case 'crypto': return <MarketWidget />;
        case 'market': return <MarketWidget />;
        case 'notes': return <NoteWidget content={config.widgetNote || ''} onUpdate={(val) => onUpdateConfig({ widgetNote: val })} />;
        case 'calendar': return <CalendarWidget />;
        case 'clock': return <ClockWidget />;
        default: return null;
    }
};