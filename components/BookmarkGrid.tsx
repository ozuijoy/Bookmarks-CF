import React, { useMemo } from 'react';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { Bookmark } from '../types';
import { SortableBookmark } from './SortableBookmark';
import { CardSize, CardMode } from './BookmarkCard';
import { GlassButton } from './ui/Glass';

// Icons
const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
);
const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
);

interface Props {
  loading: boolean;
  dataIds: string[]; // 用於 SortableContext 的 ID 列表
  groupedBookmarks: Record<string, Bookmark[]>;
  sortedGroupKeys: string[];
  collapsedGroups: Set<string>;
  onToggleGroup: (group: string) => void;
  searchTerm: string;
  cardSize: CardSize;
  cardMode: CardMode;
  editMode: boolean;
  
  // Event Handlers
  onEdit: (b: Bookmark) => void;
  onDelete: (id: string) => void;
  onContextMenu: (e: React.MouseEvent | React.TouchEvent, b: Bookmark) => void;
  onGroupContextMenu: (e: React.MouseEvent, group: string) => void;
  onImportClick: () => void;
}

export const BookmarkGrid: React.FC<Props> = ({
  loading,
  dataIds,
  groupedBookmarks,
  sortedGroupKeys,
  collapsedGroups,
  onToggleGroup,
  searchTerm,
  cardSize,
  cardMode,
  editMode,
  onEdit,
  onDelete,
  onContextMenu,
  onGroupContextMenu,
  onImportClick
}) => {

  const layoutClasses = useMemo(() => {
    if (cardMode === 'icon-only') return 'flex flex-wrap gap-4 sm:gap-6 content-start';
    const base = 'grid';
    switch(cardSize) {
      case 'small': return `${base} grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3`;
      case 'medium': return `${base} grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4`;
      case 'large': return `${base} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-5`;
      default: return `${base} grid-cols-2 gap-4`;
    }
  }, [cardSize, cardMode]);

  if (loading) {
      return <div className="text-white text-center mt-20">正在同步數據...</div>;
  }

  // 空狀態
  if (Object.keys(groupedBookmarks).length === 0) {
    return (
      <div className="text-center text-gray-400 mt-20">
        <p className="text-lg">{searchTerm ? '沒有找到相關書籤。' : '暫無收藏。'}</p>
        {searchTerm && <p className="text-sm mt-2">按 <span className="font-bold text-white">Enter</span> 鍵在網絡上搜索</p>}
        {!searchTerm && (
            <div className="mt-6 flex justify-center gap-4">
                <GlassButton onClick={onImportClick}>導入書籤</GlassButton>
            </div>
        )}
      </div>
    );
  }

  return (
    <SortableContext items={dataIds} strategy={rectSortingStrategy}>
      {sortedGroupKeys.map((category) => {
        const groupItems = groupedBookmarks[category];
        const count = groupItems.length;
        const isCollapsed = collapsedGroups.has(category);
        const shouldShowContent = !!searchTerm || !isCollapsed;

        return (
          // 增加 ID 以便快速跳轉 (使用 encodeURIComponent 避免特殊字符問題)
          <div key={category} id={`group-${encodeURIComponent(category)}`} className="mb-6 animate-fadeIn transition-all scroll-mt-24">
            {/* 分組標題欄 - 升級為通欄磨砂效果 */}
            <div 
              className={`
                group flex items-center justify-between px-4 py-3 mb-4 rounded-xl 
                bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 
                backdrop-blur-sm cursor-pointer select-none transition-all duration-200
                ${!shouldShowContent ? 'opacity-70' : 'opacity-100'}
              `}
              onClick={() => onToggleGroup(category)}
              onContextMenu={(e) => { e.preventDefault(); onGroupContextMenu(e, category); }}
              title="左鍵點擊摺疊/展開，右鍵點擊管理"
            >
              <div className="flex items-center gap-3">
                 <div className={`p-1 rounded-full bg-white/5 transition-transform duration-300 ${shouldShowContent ? 'rotate-0' : '-rotate-90'}`}>
                    <ChevronDownIcon />
                 </div>
                 {/* 應用字體顏色變量 */}
                 <h2 
                    className="font-medium text-lg tracking-wide transition-colors"
                    style={{ color: 'var(--app-font-color, #fff)' }}
                 >
                    {category}
                 </h2>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-xs text-gray-400 bg-black/20 px-2 py-0.5 rounded-full font-mono">{count}</span>
              </div>
            </div>

            {shouldShowContent && (
              <div className={`${layoutClasses} animate-slideDown origin-top`}>
                {groupItems.map((bookmark) => (
                  <SortableBookmark 
                    key={bookmark.id} 
                    bookmark={bookmark} 
                    editMode={editMode}
                    size={cardSize}
                    mode={cardMode}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onContextMenuRequest={onContextMenu}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </SortableContext>
  );
};