import { Bookmark, KVData } from '../types';

// Set to true for Cloudflare Pages deployment
const USE_CLOUD_API = true; 
const STORAGE_KEY = 'nebula_nav_data';

// 獲取環境變量中的標題，默認為 '星雲導航'
// Safely access import.meta.env
export const DEFAULT_SITE_TITLE = (import.meta as any).env?.VITE_SITE_TITLE || '星雲導航';

// Initial Data for Demo (Fallback)
const DEFAULT_DATA: KVData = {
  config: {
    siteTitle: DEFAULT_SITE_TITLE,
    redirects: [],
    groupOrder: ['開發', '媒體', '常用', '未分類'],
    collapsedGroups: [],
    cardSize: 'medium',
    cardMode: 'standard',
    leftWidget: 'weather',
    rightWidget: 'quote',
    widgetNote: '在這裡記下你的待辦事項...'
  },
  bookmarks: [
    { id: '1', title: 'GitHub', url: 'https://github.com', category: '開發', createdAt: Date.now(), isPinned: true },
    { id: '2', title: 'YouTube', url: 'https://youtube.com', category: '媒體', createdAt: Date.now() },
  ]
};

export const StorageService = {
  async verifyPassword(password: string): Promise<boolean> {
    if (USE_CLOUD_API) {
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        return res.ok;
      } catch (e) {
        return false;
      }
    } else {
      return password === 'admin';
    }
  },

  async getData(): Promise<KVData> {
    if (USE_CLOUD_API) {
      try {
        const res = await fetch('/api/data');
        if (res.status === 404) return DEFAULT_DATA; 
        if (!res.ok) throw new Error('Failed to fetch data');
        
        const data = await res.json();
        
        // 關鍵修復：數據完整性檢查
        if (data && (!data.config || !data.bookmarks)) {
           return {
             ...DEFAULT_DATA,
             ...data,
             config: {
                ...DEFAULT_DATA.config,
                ...data.config,
                groupOrder: data.config?.groupOrder || DEFAULT_DATA.config.groupOrder,
                collapsedGroups: data.config?.collapsedGroups || [],
                cardSize: data.config?.cardSize || 'medium',
                cardMode: data.config?.cardMode || 'standard',
                leftWidget: data.config?.leftWidget || 'none',
                rightWidget: data.config?.rightWidget || 'none',
                widgetNote: data.config?.widgetNote || '',
                siteTitle: DEFAULT_SITE_TITLE
             },
             bookmarks: data.bookmarks || []
           };
        }
        
        // 確保 config 對象存在
        if (!data.config) {
            data.config = { ...DEFAULT_DATA.config };
        }

        // 默認值填充
        data.config.siteTitle = DEFAULT_SITE_TITLE;
        if (!data.config.groupOrder) data.config.groupOrder = [];
        if (!data.config.collapsedGroups) data.config.collapsedGroups = [];
        if (!data.config.cardSize) data.config.cardSize = 'medium';
        if (!data.config.cardMode) data.config.cardMode = 'standard';
        if (!data.config.leftWidget) data.config.leftWidget = 'none';
        if (!data.config.rightWidget) data.config.rightWidget = 'none';

        return data;
      } catch (error) {
        console.error("Data fetch error, using default", error);
        return DEFAULT_DATA;
      }
    } else {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return DEFAULT_DATA;
      }
      const parsed = JSON.parse(stored);
      if (parsed.config) {
          parsed.config.siteTitle = DEFAULT_SITE_TITLE;
      }
      return parsed;
    }
  },

  async saveData(data: KVData, password?: string): Promise<void> {
    const dataToSave = {
        ...data,
        config: {
            ...data.config,
            siteTitle: DEFAULT_SITE_TITLE
        }
    };

    if (USE_CLOUD_API) {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}` 
        },
        body: JSON.stringify(dataToSave)
      });
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      await new Promise(r => setTimeout(r, 500));
    }
  },

  getFavicon(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    } catch (e) {
      return '';
    }
  }
};