import React from 'react';
import { Bookmark } from '../../types';
import { ContextMenu } from '../ContextMenu';
import { GroupContextMenu } from '../GroupContextMenu';

interface Props {
  contextMenu: { x: number, y: number, bookmark: Bookmark } | null;
  setContextMenu: (v: { x: number, y: number, bookmark: Bookmark } | null) => void;
  groupContextMenu: { x: number, y: number, groupName: string } | null;
  setGroupContextMenu: (v: { x: number, y: number, groupName: string } | null) => void;
  allGroups: string[];
  
  // Actions
  onEditBookmark: (b: Bookmark) => void;
  onDeleteBookmark: (id: string) => void;
  onTogglePin: (b: Bookmark) => void;
  onMoveCategory: (b: Bookmark, newCategory: string) => void;
  
  // Group Actions
  onRenameGroup: (groupName: string) => void;
  onSortGroup: () => void;
}

export const ContextMenuLayer: React.FC<Props> = ({
  contextMenu, setContextMenu,
  groupContextMenu, setGroupContextMenu,
  allGroups,
  onEditBookmark, onDeleteBookmark, onTogglePin, onMoveCategory,
  onRenameGroup, onSortGroup
}) => {
  return (
    <>
      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          bookmark={contextMenu.bookmark} 
          groups={allGroups}
          onClose={() => setContextMenu(null)}
          onEdit={onEditBookmark}
          onDelete={onDeleteBookmark} 
          onTogglePin={onTogglePin} 
          onMoveCategory={onMoveCategory}
        />
      )}
      
      {groupContextMenu && (
        <GroupContextMenu
          x={groupContextMenu.x} 
          y={groupContextMenu.y} 
          groupName={groupContextMenu.groupName}
          onClose={() => setGroupContextMenu(null)}
          onRename={() => onRenameGroup(groupContextMenu.groupName)}
          onSort={onSortGroup}
        />
      )}
    </>
  );
};