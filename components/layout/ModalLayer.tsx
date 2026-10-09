import React from 'react';
import { Bookmark, KVData } from '../../types';
import { CardSize, CardMode } from '../BookmarkCard';
import { EditModal } from '../EditModal';
import { ImportModal } from '../ImportModal';
import { ViewSettingsModal } from '../ViewSettingsModal';
import { GroupManagerModal } from '../GroupManagerModal';
import { RenameGroupModal } from '../RenameGroupModal';
import { DuplicateManagerModal } from '../DuplicateManagerModal';
import { ConfigModal } from '../ConfigModal';
import { QuickNavModal } from '../QuickNavModal';
import { FontSettingsModal } from '../FontSettingsModal';

interface ModalsState {
  edit: boolean;
  view: boolean;
  group: boolean;
  rename: boolean;
  duplicate: boolean;
  import: boolean;
  config: boolean;
  quickNav: boolean;
  font: boolean; // 新增
}

interface Props {
  modals: ModalsState;
  setModals: React.Dispatch<React.SetStateAction<ModalsState>>;
  editingBookmark: Bookmark | null;
  setEditingBookmark: (b: Bookmark | null) => void;
  renamingTarget: string;
  setRenamingTarget: (s: string) => void;
  
  // Data props
  allGroups: string[];
  data: KVData | null;
  
  // Handlers
  onAddOrUpdateBookmark: (b: Partial<Bookmark>, id?: string) => void;
  onImport: (content: string) => void;
  onUpdateConfig: (config: Partial<any>) => void;
  onReorderGroups: (order: string[]) => void;
  onRenameGroup: (oldName: string, newName: string) => void;
  onDeleteBookmark: (id: string) => void;
  
  // Settings
  cardSize: CardSize;
  setCardSize: (s: CardSize) => void;
  cardMode: CardMode;
  setCardMode: (m: CardMode) => void;
}

export const ModalLayer: React.FC<Props> = ({
  modals, setModals, 
  editingBookmark, setEditingBookmark,
  renamingTarget, setRenamingTarget,
  allGroups, data,
  onAddOrUpdateBookmark, onImport, onUpdateConfig, onReorderGroups, onRenameGroup, onDeleteBookmark,
  cardSize, setCardSize, cardMode, setCardMode
}) => {
  return (
    <>
      <EditModal 
        isOpen={modals.edit} 
        onClose={() => setModals(m => ({...m, edit: false}))} 
        onSave={(b) => { 
            if (editingBookmark) {
                onAddOrUpdateBookmark(b, editingBookmark.id);
            } else {
                onAddOrUpdateBookmark(b);
            }
            setModals(m => ({...m, edit: false})); 
            setEditingBookmark(null); 
        }} 
        initialData={editingBookmark} 
        groups={allGroups} 
      />
      <ImportModal isOpen={modals.import} onClose={() => setModals(m => ({...m, import: false}))} onImport={onImport} />
      
      <ViewSettingsModal 
        isOpen={modals.view} 
        onClose={() => setModals(m => ({...m, view: false}))} 
        size={cardSize} setSize={setCardSize} 
        mode={cardMode} setMode={setCardMode} 
        currentBg={data?.config?.backgroundImage} 
        config={data?.config}
        onUpdateConfig={onUpdateConfig}
      />
      
      <FontSettingsModal 
        isOpen={modals.font}
        onClose={() => setModals(m => ({...m, font: false}))}
        config={data?.config}
        onUpdateConfig={onUpdateConfig}
      />

      <ConfigModal 
        isOpen={modals.config}
        onClose={() => setModals(m => ({...m, config: false}))}
        currentSearchEngine={data?.config?.searchEngineUrl}
        onSave={(cfg) => onUpdateConfig(cfg)}
      />

      <QuickNavModal 
        isOpen={modals.quickNav}
        onClose={() => setModals(m => ({...m, quickNav: false}))}
        groups={allGroups}
      />

      <GroupManagerModal isOpen={modals.group} onClose={() => setModals(m => ({...m, group: false}))} groups={allGroups} onReorder={onReorderGroups} />
      <RenameGroupModal isOpen={modals.rename} onClose={() => setModals(m => ({...m, rename: false}))} oldName={renamingTarget} onRename={(o, n) => { onRenameGroup(o, n); setRenamingTarget(''); }} />
      <DuplicateManagerModal isOpen={modals.duplicate} onClose={() => setModals(m => ({...m, duplicate: false}))} bookmarks={data?.bookmarks || []} onDelete={onDeleteBookmark} />
    </>
  );
};