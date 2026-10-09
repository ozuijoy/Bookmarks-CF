import { useState, useEffect } from 'react';

export interface WeatherData {
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    weather_code: number;
    is_day: number;
}

interface UseWeatherResult {
    weather: WeatherData | null;
    locationName: string;
    loading: boolean;
    weatherCode: number | null; // 便於外部獲取 code
    isDay: boolean;
}

// 簡單的緩存機制
let cachedWeather: WeatherData | null = null;
let cachedLocation = '定位中...';
let lastFetchTime = 0;
// 記錄上次請求的自定義位置，如果位置變了需要強制刷新
let lastCustomLocation: string | undefined = undefined;

export const useWeather = (enabled: boolean = true, customLocation?: string): UseWeatherResult => {
    const [weather, setWeather] = useState<WeatherData | null>(cachedWeather);
    const [locationName, setLocationName] = useState(cachedLocation);
    const [loading, setLoading] = useState(!cachedWeather);

    useEffect(() => {
        if (!enabled) return;

        // 如果有緩存，且時間小於10分鐘，且自定義位置沒有發生變化，則使用緩存
        const isSameLocation = customLocation === lastCustomLocation;
        if (cachedWeather && (Date.now() - lastFetchTime < 1000 * 60 * 10) && isSameLocation) {
            setWeather(cachedWeather);
            setLocationName(cachedLocation);
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                let lat: number, lon: number, city: string = '未知位置';

                // 1. 優先處理自定義位置 (Geocoding Search)
                if (customLocation && customLocation.trim() !== '') {
                    try {
                        const searchRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(customLocation)}&count=1&language=zh&format=json`);
                        const searchData = await searchRes.json();
                        
                        if (searchData.results && searchData.results.length > 0) {
                            lat = searchData.results[0].latitude;
                            lon = searchData.results[0].longitude;
                            city = searchData.results[0].name;
                        } else {
                            // 搜索不到，拋錯進入 fallback 或顯示錯誤
                            throw new Error('City not found');
                        }
                    } catch (e) {
                        console.warn("Custom location failed, falling back to auto.");
                        city = '位置無效';
                        // 防止無限重試，設置默認座標 (北京) 或終止
                        lat = 39.9042;
                        lon = 116.4074;
                    }
                } else {
                    // 2. 自動定位邏輯
                    try {
                        // 2.1 瀏覽器定位
                        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
                        });
                        lat = pos.coords.latitude;
                        lon = pos.coords.longitude;
                        
                        // 反向地理編碼獲取城市名
                        try {
                            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1&language=zh`);
                            const geoData = await geoRes.json();
                            if (geoData.results && geoData.results.length > 0) {
                                city = geoData.results[0].name;
                            } else {
                                city = '當前位置';
                            }
                        } catch (e) {
                            city = '本地';
                        }

                    } catch (geoError) {
                        // 2.2 IP 定位降級
                        const ipRes = await fetch('https://ipapi.co/json/');
                        const ipData = await ipRes.json();
                        lat = ipData.latitude;
                        lon = ipData.longitude;
                        city = ipData.city || ipData.region || '網絡定位';
                    }
                }

                // 3. 獲取天氣數據
                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,is_day&timezone=auto`);
                const weatherData = await weatherRes.json();

                if (weatherData.current) {
                    cachedWeather = weatherData.current;
                    cachedLocation = city;
                    lastFetchTime = Date.now();
                    lastCustomLocation = customLocation;
                    
                    setWeather(weatherData.current);
                    setLocationName(city);
                }
            } catch (e) {
                console.error("Weather hook failed", e);
                setLocationName('離線');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [enabled, customLocation]);

    return {
        weather,
        locationName,
        loading,
        weatherCode: weather?.weather_code ?? null,
        isDay: weather?.is_day === 1
    };
};