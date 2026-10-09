import React, { useState, useEffect, useRef } from 'react';
import { Bookmark } from '../types';
import { StorageService } from '../services/storage';
import { GlassCard } from './ui/Glass';

export type CardSize = 'small' | 'medium' | 'large';
export type CardMode = 'standard' | 'icon-only';

interface Props {
  bookmark: Bookmark;
  onEdit: (b: Bookmark) => void;
  onDelete: (id: string) => void;
  editMode: boolean;
  size?: CardSize;
  mode?: CardMode;
  // 新增：右鍵/長按回調，傳遞鼠標位置或觸摸位置
  onContextMenuRequest: (e: React.MouseEvent | React.TouchEvent, b: Bookmark) => void;
}

export const BookmarkCard: React.FC<Props> = ({ 
  bookmark, 
  onEdit, 
  onDelete, 
  editMode,
  size = 'medium',
  mode = 'standard',
  onContextMenuRequest
}) => {
  // 狀態：圖片源
  const [imgSrc, setImgSrc] = useState<string>('');
  const [hasError, setHasError] = useState(false);
  
  // 長按邏輯狀態
  const timerRef = useRef<any>(null);
  const isLongPressRef = useRef(false);

  // 初始化圖片源
  useEffect(() => {
    if (bookmark.icon) {
      setImgSrc(bookmark.icon);
      setHasError(false);
    } else {
      setImgSrc(StorageService.getFavicon(bookmark.url));
      setHasError(false);
    }
  }, [bookmark]);

  const handleError = () => {
    if (bookmark.icon && imgSrc === bookmark.icon) {
      const autoIcon = StorageService.getFavicon(bookmark.url);
      if (autoIcon) {
        setImgSrc(autoIcon);
        return;
      }
    }
    setHasError(true);
  };

  // --- 處理右鍵菜單 (Desktop) ---
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // 阻止瀏覽器默認菜單
    e.stopPropagation();
    onContextMenuRequest(e, bookmark);
  };

  // --- 處理長按 (Mobile) ---
  const handleTouchStart = (e: React.TouchEvent) => {
    isLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      // 長按觸發，傳遞事件
      onContextMenuRequest(e, bookmark);
      
      // 嘗試震動反饋 (Android)
      if (navigator.vibrate) navigator.vibrate(50);
    }, 600); // 600ms 長按閾值
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleTouchMove = () => {
    // 如果手指移動了，取消長按（避免滾動時誤觸）
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  // 如果觸發了長按或處於編輯模式，點擊鏈接時應該阻止跳轉
  const handleClick = (e: React.MouseEvent) => {
    if (editMode || isLongPressRef.current) {
      e.preventDefault();
      e.stopPropagation();
      // 重置狀態
      isLongPressRef.current = false; 
    }
  };

  // 動態尺寸配置
  const sizeClasses = {
    small: {
      card: mode === 'icon-only' ? 'h-16 w-16' : 'h-24',
      icon: 'w-8 h-8',
      textBase: '0.75rem', // text-xs
      padding: 'p-2'
    },
    medium: {
      card: mode === 'icon-only' ? 'h-24 w-24' : 'h-32',
      icon: 'w-12 h-12',
      textBase: '0.875rem', // text-sm
      padding: 'p-4'
    },
    large: {
      card: mode === 'icon-only' ? 'h-32 w-32' : 'h-40',
      icon: 'w-16 h-16',
      textBase: '1rem', // text-base
      padding: 'p-6'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <GlassCard 
      className={`group relative flex flex-col items-center justify-center 
        hover:-translate-y-1 hover:z-50 cursor-pointer overflow-visible transition-all duration-300 select-none
        ${currentSize.card} ${currentSize.padding} ${mode === 'icon-only' ? 'rounded-2xl mx-auto' : 'w-full'}
        ${editMode ? 'cursor-move' : ''}
      `}
      // 綁定右鍵事件
      onContextMenu={handleContextMenu} // Native prop for GlassCard div
    >
      {/* 編輯模式按鈕 (保留舊的操作方式) */}
      {editMode && (
        <div className="absolute -top-2 -right-2 flex gap-1 z-30 opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(bookmark); }}
            className="p-1.5 bg-blue-500 rounded-full shadow-lg hover:bg-blue-400 text-xs text-white"
            onPointerDown={(e) => e.stopPropagation()} // 防止拖拽幹擾點擊按鈕
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(bookmark.id); }}
            className="p-1.5 bg-red-500 rounded-full shadow-lg hover:bg-red-400 text-xs text-white"
            onPointerDown={(e) => e.stopPropagation()} // 防止拖拽幹擾點擊按鈕
          >
             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      <a 
        href={editMode ? undefined : bookmark.url} 
        target={editMode ? undefined : "_blank"} 
        rel={editMode ? undefined : "noopener noreferrer"}
        className={`w-full h-full flex flex-col items-center justify-center gap-3 z-10 relative ${editMode ? 'pointer-events-none' : ''}`}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onContextMenu={(e) => e.preventDefault()} 
        onDragStart={(e) => e.preventDefault()}
      >
        {/* 圖標區域 */}
        <div className={`${currentSize.icon} rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
          {!hasError && imgSrc ? (
            <img 
              src={imgSrc} 
              alt="" 
              className="w-full h-full object-contain drop-shadow-md"
              onError={handleError}
              draggable={false}
            />
          ) : (
            <div className="w-full h-full bg-white/10 rounded-full flex items-center justify-center">
               <span className="text-white/50 font-bold">{bookmark.title.charAt(0)}</span>
            </div>
          )}
        </div>

        {/* 標準模式下的文本標籤 - 動態應用樣式 */}
        {mode === 'standard' && (
          <span 
            className="font-medium text-center line-clamp-1 w-full px-1 transition-colors"
            style={{
                fontSize: `calc(${currentSize.textBase} * var(--app-font-scale, 1))`,
                color: 'var(--app-font-color, #e2e8f0)' // 優先使用自定義顏色，回退到 gray-200
            }}
          >
            {bookmark.title}
          </span>
        )}

        {/* 懸浮提示 Tooltip */}
        {!editMode && (
        <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 w-max max-w-[200px] flex flex-col items-center">
             <div className="w-2 h-2 bg-gray-900/90 transform rotate-45 -mb-1 border-t border-l border-white/10"></div>
            <div className="bg-gray-900/90 backdrop-blur-xl text-white text-sm font-medium px-3 py-2 rounded-lg text-center leading-tight border border-white/10 shadow-2xl">
              {bookmark.title}
            </div>
        </div>
        )}
      </a>
      
      {/* 背景發光特效 */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/0 via-purple-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
    </GlassCard>
  );
};