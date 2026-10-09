import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Bookmark } from '../types';

interface Props {
  x: number;
  y: number;
  bookmark: Bookmark;
  groups: string[];
  onClose: () => void;
  onEdit: (b: Bookmark) => void;
  onDelete: (id: string) => void;
  onTogglePin: (b: Bookmark) => void;
  onMoveCategory: (b: Bookmark, newCategory: string) => void;
}

export const ContextMenu: React.FC<Props> = ({ 
  x, y, bookmark, groups, 
  onClose, onEdit, onDelete, onTogglePin, onMoveCategory 
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [submenu, setSubmenu] = useState<'none' | 'move'>('none');
  
  // 狀態：控制菜單的位置（top/bottom 互斥）
  const [position, setPosition] = useState<{top: number | string; left: number; bottom: number | string}>({ 
    top: y, 
    left: x, 
    bottom: 'auto' 
  });

  // 智能定位：防止菜單超出屏幕底部
  useLayoutEffect(() => {
    // 估算菜單最大高度（包含所有選項時）
    const ESTIMATED_HEIGHT = 320; 
    const windowHeight = window.innerHeight;
    
    // 如果點擊位置 + 菜單高度 > 視窗高度，則改為向上彈出
    if (y + ESTIMATED_HEIGHT > windowHeight) {
       setPosition({
           top: 'auto',
           bottom: windowHeight - y, // 底部距離 = 視窗高度 - 鼠標Y座標
           left: x
       });
    } else {
       setPosition({
           top: y,
           bottom: 'auto',
           left: x
       });
    }
  }, [x, y]); // 僅當座標變化時重新計算

  // 點擊外部關閉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    // 稍微延遲綁定，防止觸發右鍵的那一刻直接關閉
    const timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
        document.addEventListener('contextmenu', handleClickOutside);
    }, 100);
    
    return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('contextmenu', handleClickOutside);
    };
  }, [onClose]);

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bookmark.url);
    } catch (err) {
      console.error('Failed to copy', err);
    }
    onClose();
  };

  // 渲染子菜單：移動分組
  if (submenu === 'move') {
      return (
        <div 
            ref={menuRef}
            style={{ top: position.top, left: position.left, bottom: position.bottom }}
            className="fixed z-[100] w-48 bg-[#1e293b]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-1 animate-fadeIn overflow-hidden flex flex-col"
        >
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b border-white/5 flex justify-between items-center">
                <span>移動至...</span>
                <button onClick={() => setSubmenu('none')} className="hover:text-white px-1">✕</button>
            </div>
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                {groups.map(g => (
                    <button
                        key={g}
                        onClick={() => handleAction(() => onMoveCategory(bookmark, g))}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                            bookmark.category === g ? 'text-purple-400 bg-purple-500/10' : 'text-gray-200 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        <span className="truncate">{g}</span>
                        {bookmark.category === g && <span className="text-xs">✓</span>}
                    </button>
                ))}
            </div>
        </div>
      );
  }

  // 渲染主菜單
  return (
    <div 
      ref={menuRef}
      style={{ top: position.top, left: position.left, bottom: position.bottom }}
      className="fixed z-[100] w-48 bg-[#1e293b]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-1 animate-fadeIn overflow-hidden flex flex-col"
    >
      <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b border-white/5 truncate select-none">
        {bookmark.title}
      </div>
      
      <button 
        onClick={() => handleAction(() => window.open(bookmark.url, '_blank'))}
        className="text-left px-4 py-3 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-3"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        新標籤頁打開
      </button>

      <button 
        onClick={() => handleAction(() => onTogglePin(bookmark))}
        className="text-left px-4 py-3 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-3"
      >
         {bookmark.isPinned ? (
            <>
                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24"><path d="M16 12V4H8v8l-2 2v2h6v6h4v-6h6v-2l-2-2z"/></svg>
                取消快捷訪問
            </>
         ) : (
             <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                添加至快捷訪問
             </>
         )}
      </button>

      <button 
        onClick={handleCopy}
        className="text-left px-4 py-3 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-3"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
        複製鏈接
      </button>

      <div className="h-px bg-white/10 my-1 mx-2"></div>

      <button 
        onClick={(e) => { e.stopPropagation(); setSubmenu('move'); }}
        className="text-left px-4 py-3 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            移動分組
        </div>
        <svg className="w-3 h-3 text-gray-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>

      <button 
        onClick={() => handleAction(() => onEdit(bookmark))}
        className="text-left px-4 py-3 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-3"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        編輯
      </button>

      <button 
        onClick={() => handleAction(() => onDelete(bookmark.id))}
        className="text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors flex items-center gap-3"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        刪除
      </button>
    </div>
  );
};