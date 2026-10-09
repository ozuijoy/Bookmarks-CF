import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  useSensor, 
  useSensors,
  TouchSensor,
  MouseSensor,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import { Bookmark } from './types';
import { DEFAULT_SITE_TITLE } from './services/storage';
import { downloadBookmarks, downloadBackupJSON } from './utils/exporter';
import { useAuth } from './hooks/useAuth';
import { useData } from './hooks/useData';
import { useWeather } from './hooks/useWeather';
import { useDragAndDrop } from './hooks/useDragAndDrop';

import { CardSize, CardMode } from './components/BookmarkCard';

// Layout Components
import { Background, getWeatherBgUrl } from './components/layout/Background'; // Import helper
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ModalLayer } from './components/layout/ModalLayer';
import { ContextMenuLayer } from './components/layout/ContextMenuLayer';
import { LoginScreen } from './components/LoginScreen';
import { BookmarkGrid } from './components/BookmarkGrid';
import { EditBar } from './components/EditBar';
import { ScrollToTop } from './components/ui/ScrollToTop';

const App: React.FC = () => {
  // --- Hooks ---
  const { isAuthenticated, password, loading: authLoading, login, logout } = useAuth();
  const { 
    data, 
    loading: dataLoading, 
    persist, 
    addOrUpdateBookmark, 
    deleteBookmark, 
    togglePin, 
    updateConfig, 
    importData, 
    moveCategory, 
    renameGroup,
    reorderGroups,
    toggleGroupCollapse 
  } = useData(isAuthenticated, password);

  const { weatherCode, isDay } = useWeather(!!data?.config?.autoWeatherBg, data?.config?.customLocation);

  // --- Background Caching Logic ---
  // 監聽天氣變化，更新 KV 中的緩存 URL
  useEffect(() => {
    if (!data?.config?.autoWeatherBg || weatherCode === null) return;

    const newUrl = getWeatherBgUrl(weatherCode, isDay);
    
    // 如果計算出的 URL 有效，且與當前緩存的不一致，則更新配置
    if (newUrl && newUrl !== data.config.cachedWeatherBgUrl) {
        // 使用 setTimeout 避免在渲染週期中直接更新狀態
        const timer = setTimeout(() => {
            updateConfig({ cachedWeatherBgUrl: newUrl });
            console.log("Weather background updated & cached:", newUrl);
        }, 1000);
        return () => clearTimeout(timer);
    }
  }, [weatherCode, isDay, data?.config?.autoWeatherBg, data?.config?.cachedWeatherBgUrl]);


  // --- UI State ---
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // View Settings State
  const [cardSize, setCardSize] = useState<CardSize>('medium');
  const [cardMode, setCardMode] = useState<CardMode>('standard');
  
  // Refs & Modals
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, bookmark: Bookmark } | null>(null);
  const [groupContextMenu, setGroupContextMenu] = useState<{ x: number, y: number, groupName: string } | null>(null);
  
  const [modals, setModals] = useState({
    edit: false,
    view: false,
    group: false,
    rename: false,
    duplicate: false,
    import: false,
    config: false,
    quickNav: false,
    font: false
  });
  
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [renamingTarget, setRenamingTarget] = useState<string>('');
  const [activeId, setActiveId] = useState<string | null>(null);

  // --- Effects ---
  useEffect(() => {
    if (data?.config) {
        if (data.config.cardSize) setCardSize(data.config.cardSize);
        if (data.config.cardMode) setCardMode(data.config.cardMode);
    }
  }, [data?.config]);

  useEffect(() => { document.title = data?.config?.siteTitle || DEFAULT_SITE_TITLE; }, [data?.config?.siteTitle]);
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !Object.values(modals).some(v => v)) {
         if (document.activeElement !== searchInputRef.current) {
             e.preventDefault();
             searchInputRef.current?.focus();
         }
      }
      if (e.key === 'Escape') {
          if (contextMenu) setContextMenu(null);
          else if (groupContextMenu) setGroupContextMenu(null);
          else if (Object.values(modals).some(v => v)) setModals(m => Object.keys(m).reduce((acc, k) => ({...acc, [k]: false}), {} as any));
          else if (document.activeElement === searchInputRef.current) searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [contextMenu, groupContextMenu, modals]);

  // DnD Logic Extracted
  const { handleDragEnd } = useDragAndDrop(data, persist, setActiveId);

  // --- Derived Data ---
  const filteredBookmarks = useMemo(() => {
    if (!data) return [];
    const q = searchTerm.toLowerCase();
    return data.bookmarks.filter(b => b.title.toLowerCase().includes(q) || b.url.toLowerCase().includes(q));
  }, [data, searchTerm]);

  const pinnedBookmarks = useMemo(() => data?.bookmarks.filter(b => b.isPinned) || [], [data]);
  
  const collapsedGroups = useMemo(() => {
    return new Set(data?.config?.collapsedGroups || []);
  }, [data?.config?.collapsedGroups]);
  
  const groupedBookmarks = useMemo(() => {
    const groups: Record<string, Bookmark[]> = {};
    filteredBookmarks.forEach(b => {
      const cat = b.category || '未分類';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(b);
    });
    return groups;
  }, [filteredBookmarks]);

  const sortedGroupKeys = useMemo(() => {
      const keys = Object.keys(groupedBookmarks);
      const order = data?.config?.groupOrder || [];
      return keys.sort((a, b) => {
          const indexA = order.indexOf(a);
          const indexB = order.indexOf(b);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return 0;
      });
  }, [groupedBookmarks, data?.config?.groupOrder]);

  const allGroups = useMemo(() => {
    if (!data) return [];
    const currentCategories = new Set(data.bookmarks.map(b => b.category || '未分類'));
    const savedOrder = data.config.groupOrder || [];
    return Array.from(new Set([...savedOrder, ...currentCategories]));
  }, [data]);

  const usageStats = useMemo(() => {
      if (!data) return { count: 0, sizeStr: '0 B', percent: 0 };
      const count = data.bookmarks.length;
      const MAX_SIZE = 25 * 1024 * 1024;
      const jsonString = JSON.stringify(data);
      const sizeBytes = new Blob([jsonString]).size; 
      let sizeStr = sizeBytes < 1024 ? `${sizeBytes} B` : sizeBytes < 1024 * 1024 ? `${(sizeBytes / 1024).toFixed(2)} KB` : `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`;
      const percent = Math.min((sizeBytes / MAX_SIZE) * 100, 100);
      return { count, sizeStr, percent };
  }, [data]);

  // 計算全局樣式
  const globalStyles = useMemo(() => {
      const cfg = data?.config;
      const scale = cfg?.fontScale || 1;
      const color = cfg?.fontColor || '#e2e8f0';
      // 陰影強度 0-100
      const shadowStrength = cfg?.textShadowStrength !== undefined ? cfg.textShadowStrength : 60;
      // 動態計算陰影: x y blur opacity
      const shadow = `0 ${1 + (shadowStrength/50)}px ${2 + (shadowStrength/20)}px rgba(0,0,0, ${0.3 + (shadowStrength/150)})`;

      return {
          '--app-font-scale': scale,
          '--app-font-color': color,
          fontSize: `${scale}rem`,
          color: color,
          textShadow: shadow
      } as React.CSSProperties;
  }, [data?.config]);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- Render ---
  if (authLoading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">Loading...</div>;

  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} />;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={(e) => setActiveId(e.active.id as string)} onDragEnd={handleDragEnd}>
      
      {/* 背景層 */}
      <Background config={data?.config} weatherCode={weatherCode} isDay={isDay} />

      {/* 內容層 - 應用全局字體設置 */}
      <div 
        className="relative z-10 flex flex-col min-h-screen"
        style={globalStyles}
      >
        <Header 
          currentTime={currentTime}
          pinnedBookmarks={pinnedBookmarks}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchInputRef={searchInputRef}
          onSearchEnter={() => {
              const url = filteredBookmarks.length === 1 ? filteredBookmarks[0].url : `${data?.config?.searchEngineUrl || 'https://www.google.com/search?q='}${encodeURIComponent(searchTerm.trim())}`;
              window.open(url, '_blank');
              searchInputRef.current?.blur();
          }}
          onOpenGroupModal={() => setModals(m => ({...m, group: true}))}
          onOpenViewModal={() => setModals(m => ({...m, view: true}))}
          onOpenQuickNav={() => setModals(m => ({...m, quickNav: true}))}
          onOpenFontSettings={() => setModals(m => ({...m, font: true}))}
          editMode={editMode}
          setEditMode={setEditMode}
          onAddBookmark={() => { setEditingBookmark(null); setModals(m => ({...m, edit: true})); }}
          config={data?.config}
          onUpdateConfig={updateConfig}
          groups={allGroups} // 傳遞分組數據用於頭部下拉菜單
        />

        <main className="flex-1 p-6 md:p-10 pb-0 max-w-[1920px] mx-auto w-full">
            <BookmarkGrid 
              loading={dataLoading}
              dataIds={data?.bookmarks.map(b => b.id) || []}
              groupedBookmarks={groupedBookmarks}
              sortedGroupKeys={sortedGroupKeys}
              collapsedGroups={collapsedGroups}
              onToggleGroup={toggleGroupCollapse}
              searchTerm={searchTerm}
              cardSize={cardSize}
              cardMode={cardMode}
              editMode={editMode}
              onEdit={(b) => { setEditingBookmark(b); setModals(m => ({...m, edit: true})); }}
              onDelete={deleteBookmark}
              onContextMenu={(e, b) => {
                  const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
                  const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
                  setContextMenu({ x: clientX, y: clientY, bookmark: b });
              }}
              onGroupContextMenu={(e, group) => {
                  setGroupContextMenu({ x: e.clientX, y: e.clientY, groupName: group });
              }}
              onImportClick={() => setModals(m => ({...m, import: true}))}
            />
        </main>
        
        <Footer count={usageStats.count} sizeStr={usageStats.sizeStr} percent={usageStats.percent} />
      </div>

      <ScrollToTop />

      <EditBar 
        isVisible={editMode}
        onImport={() => setModals(m => ({...m, import: true}))}
        onExport={() => data?.bookmarks && downloadBookmarks(data.bookmarks)}
        onBackup={() => data && downloadBackupJSON(data)}
        onCheckDuplicates={() => setModals(m => ({...m, duplicate: true}))}
        onOpenConfig={() => setModals(m => ({...m, config: true}))}
        onLogout={logout}
      />

      <ContextMenuLayer 
        contextMenu={contextMenu}
        setContextMenu={setContextMenu}
        groupContextMenu={groupContextMenu}
        setGroupContextMenu={setGroupContextMenu}
        allGroups={allGroups}
        onEditBookmark={(b) => { setEditingBookmark(b); setModals(m => ({...m, edit: true})); }}
        onDeleteBookmark={deleteBookmark}
        onTogglePin={togglePin}
        onMoveCategory={moveCategory}
        onRenameGroup={(groupName) => { setRenamingTarget(groupName); setModals(m => ({...m, rename: true})); }}
        onSortGroup={() => setModals(m => ({...m, group: true}))}
      />

      <ModalLayer 
        modals={modals}
        setModals={setModals}
        editingBookmark={editingBookmark}
        setEditingBookmark={setEditingBookmark}
        renamingTarget={renamingTarget}
        setRenamingTarget={setRenamingTarget}
        allGroups={allGroups}
        data={data}
        onAddOrUpdateBookmark={addOrUpdateBookmark}
        onImport={importData}
        onUpdateConfig={updateConfig}
        onReorderGroups={reorderGroups}
        onRenameGroup={renameGroup}
        onDeleteBookmark={deleteBookmark}
        cardSize={cardSize}
        setCardSize={setCardSize}
        cardMode={cardMode}
        setCardMode={setCardMode}
      />
    </DndContext>
  );
};

export default App;