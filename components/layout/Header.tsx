import React, { RefObject, useRef, useEffect, useState } from 'react';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { SortablePinnedItem } from '../SortablePinnedItem';
import { GlassButton, GlassInput } from '../ui/Glass';
import { Bookmark, AppConfig } from '../../types';
import { WidgetRenderer } from '../Widgets';

// Icons
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
);
const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
);
const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
);
// 恢復為標準齒輪圖標
const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
);
const CompassIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3a9 9 0 100 18 9 9 0 000-18z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9.172 9.172a4 4 0 015.656 0" /></svg>
);
// Font/Theme Icon
const FontIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
);

interface Props {
  currentTime: Date;
  pinnedBookmarks: Bookmark[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchInputRef: RefObject<HTMLInputElement>;
  onSearchEnter: () => void;
  onOpenGroupModal: () => void;
  onOpenViewModal: () => void;
  onOpenQuickNav: () => void;
  onOpenFontSettings: () => void; // 新增回調
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  onAddBookmark: () => void;
  config: AppConfig | undefined;
  onUpdateConfig: (c: Partial<AppConfig>) => void;
  groups: string[];
}

export const Header: React.FC<Props> = ({
  currentTime,
  pinnedBookmarks,
  searchTerm,
  setSearchTerm,
  searchInputRef,
  onSearchEnter,
  onOpenGroupModal,
  onOpenViewModal,
  onOpenQuickNav,
  onOpenFontSettings,
  editMode,
  setEditMode,
  onAddBookmark,
  config,
  onUpdateConfig,
  groups
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickNavHovered, setIsQuickNavHovered] = useState(false);

  // 初始化時，如果是移動端，自動滾動到中間的“時間”模塊
  useEffect(() => {
    if (scrollContainerRef.current && timeRef.current) {
        if (window.innerWidth < 1280) {
            const container = scrollContainerRef.current;
            const timeEl = timeRef.current;
            const scrollLeft = timeEl.offsetLeft - (container.clientWidth / 2) + (timeEl.clientWidth / 2);
            container.scrollTo({ left: scrollLeft, behavior: 'auto' });
        }
    }
  }, []);

  // 搜索展開時自動聚焦
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen, searchInputRef]);

  // 處理搜索框失焦
  const handleSearchBlur = () => {
    if (!searchTerm) {
      setIsSearchOpen(false);
    }
  };

  // 下拉菜單跳轉邏輯
  const handleScrollToGroup = (group: string) => {
    setIsQuickNavHovered(false);
    const el = document.getElementById(`group-${encodeURIComponent(group)}`);
    if (el) {
        const offset = 100;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const showSearchInput = isSearchOpen || searchTerm.length > 0;

  return (
    <>
      {/* Date/Time & Widgets Container */}
      <div className="pt-8 pb-4 animate-fadeIn relative max-w-[1600px] mx-auto w-full px-0 xl:px-6">
          <div 
            ref={scrollContainerRef}
            className="flex flex-row xl:items-center xl:justify-center relative min-h-[120px] overflow-x-auto xl:overflow-visible snap-x snap-mandatory scrollbar-hide"
          >
            {/* Left Widget */}
            <div className="min-w-full xl:min-w-0 xl:flex xl:flex-1 justify-center xl:justify-end xl:pr-16 opacity-90 hover:opacity-100 transition-opacity snap-center flex items-center">
               <div className="scale-90 xl:scale-100">
                 {config && <WidgetRenderer type={config.leftWidget} config={config} onUpdateConfig={onUpdateConfig} />}
               </div>
            </div>

            {/* Center: Time */}
            <div 
                ref={timeRef}
                className="min-w-full xl:min-w-0 text-center select-none z-10 flex-shrink-0 snap-center flex flex-col items-center justify-center"
            >
                <div className="text-6xl md:text-8xl font-light text-white tracking-tighter tabular-nums drop-shadow-2xl">
                {currentTime.toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-lg md:text-xl text-purple-200/80 mt-2 font-light tracking-wide">
                {currentTime.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'long' })}
                </div>
                {/* Mobile Hint dots */}
                <div className="flex xl:hidden gap-1.5 mt-4 opacity-30">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
            </div>

            {/* Right Widget */}
            <div className="min-w-full xl:min-w-0 xl:flex xl:flex-1 justify-center xl:justify-start xl:pl-16 opacity-90 hover:opacity-100 transition-opacity snap-center flex items-center">
                <div className="scale-90 xl:scale-100">
                    {config && <WidgetRenderer type={config.rightWidget} config={config} onUpdateConfig={onUpdateConfig} />}
                </div>
            </div>
          </div>
      </div>

      {/* Toolbar */}
      <div className="sticky top-0 z-40 bg-black/20 backdrop-blur-md border-b border-white/5 transition-all duration-300">
        <div className="px-4 md:px-10 py-3 max-w-[1920px] mx-auto flex flex-col xl:flex-row justify-between items-center gap-4">
          
          {/* 左側：固定書籤 */}
          <div className="flex items-center gap-3 overflow-x-auto max-w-full xl:max-w-[40%] custom-scrollbar pb-1 xl:pb-0 order-2 xl:order-1 h-12">
            {pinnedBookmarks.length > 0 && (
              <SortableContext items={pinnedBookmarks.map(b => `pinned-${b.id}`)} strategy={horizontalListSortingStrategy}>
                <div className="flex gap-2 items-center">
                  {pinnedBookmarks.map(b => <SortablePinnedItem key={`pinned-${b.id}`} id={`pinned-${b.id}`} bookmark={b} editMode={editMode} />)}
                  <div className="w-px h-6 bg-white/10 mx-2"></div>
                </div>
              </SortableContext>
            )}
          </div>

          {/* 右側：功能按鈕組 */}
          <div className="flex flex-wrap justify-center gap-3 w-full xl:w-auto order-1 xl:order-2 items-center">
            
            {/* 搜索框 (可展開) */}
            <div className={`relative transition-all duration-300 ease-out overflow-hidden ${showSearchInput ? 'w-full md:w-64 opacity-100' : 'w-0 opacity-0'}`}>
              <GlassInput 
                ref={searchInputRef} 
                placeholder="搜索書籤或網絡..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSearchEnter();
                }} 
                onBlur={handleSearchBlur}
                className="w-full !bg-black/20 !border-white/10 focus:!bg-black/40 !py-2 pl-4 pr-10 text-sm h-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <SearchIcon />
              </div>
            </div>

            {/* 按鈕組 */}
            <div className="flex gap-2">
              {/* 搜索按鈕 (未展開時顯示) */}
              {!showSearchInput && (
                <GlassButton 
                    variant="ghost" 
                    onClick={() => setIsSearchOpen(true)} 
                    title="搜索" 
                    className="!bg-black/20 hover:!bg-black/40 !px-3 h-10 w-10 flex items-center justify-center rounded-xl"
                >
                    <SearchIcon />
                </GlassButton>
              )}

              {/* 快速跳轉 (指南針) */}
              <div 
                className="relative"
                onMouseEnter={() => setIsQuickNavHovered(true)}
                onMouseLeave={() => setIsQuickNavHovered(false)}
              >
                  <GlassButton 
                      variant="ghost" 
                      onClick={onOpenQuickNav} 
                      title="快速跳轉" 
                      className="!bg-black/20 hover:!bg-black/40 !px-3 h-10 w-10 flex items-center justify-center rounded-xl"
                  >
                      <CompassIcon />
                  </GlassButton>

                  <div className={`absolute top-full right-0 mt-2 w-48 bg-[#1e293b]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden hidden md:block transition-all duration-200 origin-top-right z-50 ${isQuickNavHovered ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                      <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {groups.length > 0 ? (
                            groups.map(group => (
                                <button
                                    key={group}
                                    onClick={() => handleScrollToGroup(group)}
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors truncate border-b border-white/5 last:border-0"
                                >
                                    {group}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">暫無分組</div>
                        )}
                      </div>
                  </div>
              </div>

              {/* 編輯模式開關 (常駐) */}
              <GlassButton 
                  variant="ghost" 
                  onClick={() => setEditMode(!editMode)} 
                  className={`!px-3 h-10 w-10 flex items-center justify-center rounded-xl ${editMode ? 'bg-purple-600/40 text-purple-100 border border-purple-500/50' : '!bg-black/20 hover:!bg-black/40'}`} 
                  title="編輯模式"
              >
                  <SettingsIcon />
              </GlassButton>

              {/* 以下按鈕僅在編輯模式下顯示 */}
              {editMode && (
                <div className="flex gap-2 animate-fadeIn">
                    <GlassButton 
                        variant="ghost" 
                        onClick={onOpenGroupModal} 
                        title="分組排序" 
                        className="!bg-black/20 hover:!bg-black/40 !px-3 h-10 w-10 flex items-center justify-center rounded-xl"
                    >
                        <ListIcon />
                    </GlassButton>
                    
                    <GlassButton 
                        variant="ghost" 
                        onClick={onOpenViewModal} 
                        title="視圖設置" 
                        className="!bg-black/20 hover:!bg-black/40 !px-3 h-10 w-10 flex items-center justify-center rounded-xl"
                    >
                        <EyeIcon />
                    </GlassButton>

                    <GlassButton 
                        variant="ghost" 
                        onClick={onOpenFontSettings} 
                        title="字體設置" 
                        className="!bg-black/20 hover:!bg-black/40 !px-3 h-10 w-10 flex items-center justify-center rounded-xl"
                    >
                        <FontIcon />
                    </GlassButton>
                    
                    <GlassButton 
                        variant="ghost"
                        onClick={onAddBookmark} 
                        title="添加書籤"
                        className="!bg-black/20 hover:!bg-black/40 !px-3 h-10 w-10 flex items-center justify-center rounded-xl"
                    >
                        <PlusIcon />
                    </GlassButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};