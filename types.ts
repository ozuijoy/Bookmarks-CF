
export interface Bookmark {
  id: string;
  title: string;
  url: string;
  icon?: string;
  category?: string;
  createdAt: number;
  isPinned?: boolean; // 是否置頂/快捷訪問
}

export interface RedirectRule {
  prefix: string;
  target: string;
}

export type WidgetType = 'none' | 'weather' | 'quote' | 'notes' | 'crypto' | 'calendar' | 'clock' | 'market';

export interface AppConfig {
  siteTitle: string;
  redirects: RedirectRule[];
  groupOrder?: string[]; // 分組排序列表
  collapsedGroups?: string[]; // 已摺疊的分組名稱列表
  backgroundImage?: string; // 自定義背景圖片 URL
  searchEngineUrl?: string; // 自定義搜索引擎前綴
  
  // View Settings (Synced)
  cardSize?: 'small' | 'medium' | 'large';
  cardMode?: 'standard' | 'icon-only';
  bgOverlayOpacity?: number; // 背景遮罩透明度 (0-100)
  bgBlur?: number; // 背景模糊度 px
  
  // New: Background Motion & Caching
  enableBgMotion?: boolean; // 是否開啟背景動態效果 (Ken Burns Effect)
  cachedWeatherBgUrl?: string; // 緩存的自動天氣背景 URL (存入 KV)

  // Font & Appearance Settings (New)
  fontScale?: number; // 字體大小縮放 (0.8 - 1.5, 默認為 1)
  fontColor?: string; // 全局字體顏色 (Hex)
  textShadowStrength?: number; // 字體陰影強度 (0 - 100)

  // Widgets
  leftWidget?: WidgetType;
  rightWidget?: WidgetType;
  widgetNote?: string; // 便籤內容
  
  // New Feature
  autoWeatherBg?: boolean; // 是否根據天氣自動切換背景
  customLocation?: string; // 自定義天氣位置 (城市名)
}

// Represents the data structure stored in Cloudflare KV
export interface KVData {
  bookmarks: Bookmark[];
  config: AppConfig;
}