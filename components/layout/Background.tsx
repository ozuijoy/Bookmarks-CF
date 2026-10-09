import React, { useMemo } from 'react';
import { AppConfig } from '../../types';

interface Props {
  config?: AppConfig;
  weatherCode: number | null;
  isDay: boolean;
}

// Export this utility so App.tsx can use it to cache the URL
export const getWeatherBgUrl = (code: number, isDay: boolean): string => {
    const w = 1920;
    const q = 80;
    const base = 'https://images.unsplash.com';
    
    // Helper to format url
    const url = (id: string) => `${base}/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;

    if (!isDay) {
        // Night / Clear Night
        if (code <= 2) return url('1532074205216-d0e1f4b87368'); // Starry Sky
        return url('1500740516770-92bd00440258'); // Cloudy Night
    }

    // Day
    if (code === 0 || code === 1) return url('1601297183305-6df142704ea2'); // Sunny Blue Sky
    if (code === 2 || code === 3) return url('1534088568595-a066f410bcda'); // Cloudy
    if (code === 45 || code === 48) return url('1487621167305-5d248087c724'); // Fog
    if (code >= 51 && code <= 67) return url('1519692933481-e145521014f7'); // Rain
    if (code >= 71 && code <= 77) return url('1477601263568-180e2c6d046e'); // Snow
    if (code >= 95) return url('1605727216801-e27ce1ca0d13'); // Thunder

    // Default: Abstract Gradient
    return ''; 
};

export const Background: React.FC<Props> = ({ config, weatherCode, isDay }) => {
  // Background Logic
  const bgStyle = useMemo(() => {
      // 1. Custom User Background (Highest Priority if manually set and NOT auto weather)
      // 如果用戶沒有開啟自動天氣，且設置了自定義背景，則使用自定義背景
      if (!config?.autoWeatherBg && config?.backgroundImage) {
          return { backgroundImage: `url(${config.backgroundImage})` };
      }

      // 2. Auto Weather Background
      if (config?.autoWeatherBg) {
          // 優先使用 KV 中緩存的 URL，避免閃爍
          if (config.cachedWeatherBgUrl) {
              return { backgroundImage: `url(${config.cachedWeatherBgUrl})` };
          }
          // 如果沒有緩存，但有實時天氣代碼，則計算 (這種情況通常只發生在第一次開啟功能時)
          if (weatherCode !== null) {
              const weatherBg = getWeatherBgUrl(weatherCode, isDay);
              if (weatherBg) {
                   return { backgroundImage: `url(${weatherBg})` };
              }
          }
      }

      // 3. Fallback to Custom BG if auto weather is off (legacy logic)
      if (config?.backgroundImage) {
        return { backgroundImage: `url(${config.backgroundImage})` };
      }

      // 4. Default Gradient (Handled by class)
      return {};
  }, [config?.backgroundImage, config?.autoWeatherBg, config?.cachedWeatherBgUrl, weatherCode, isDay]);
  
  // 背景遮罩樣式 (Opacity & Blur)
  const bgOverlayStyle = useMemo(() => {
      const opacity = config?.bgOverlayOpacity !== undefined ? config.bgOverlayOpacity / 100 : 0.4;
      const blur = config?.bgBlur !== undefined ? config.bgBlur : 0;
      
      return {
          backgroundColor: `rgba(0,0,0, ${opacity})`,
          backdropFilter: blur > 0 ? `blur(${blur}px)` : 'none',
          WebkitBackdropFilter: blur > 0 ? `blur(${blur}px)` : 'none',
      };
  }, [config?.bgOverlayOpacity, config?.bgBlur]);

  // 檢查是否顯示自定義/天氣背景
  const hasCustomBg = !!bgStyle.backgroundImage;
  const enableMotion = config?.enableBgMotion !== false; // 默認為 true (或者 undefined時為 true)

  return (
    <>
      {/* 1. 獨立背景層 (Fixed Position) */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-[#0f172a]">
          <div 
            className={`absolute inset-0 transition-all duration-1000 ease-in-out
                ${!hasCustomBg ? 'bg-gradient-animate' : ''}
                ${hasCustomBg && enableMotion ? 'animate-ken-burns' : ''}
            `}
            style={{
                ...bgStyle,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
          />
      </div>
      
      {/* 2. 獨立遮罩層 (Fixed Position) */}
      {hasCustomBg && (
          <div 
            className="fixed inset-0 z-0 pointer-events-none transition-all duration-300" 
            style={bgOverlayStyle}
          />
      )}
    </>
  );
};