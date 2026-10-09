import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BookmarkCard, CardSize, CardMode } from './BookmarkCard';
import { Bookmark } from '../types';

interface Props {
  bookmark: Bookmark;
  onEdit: (b: Bookmark) => void;
  onDelete: (id: string) => void;
  editMode: boolean;
  size?: CardSize;
  mode?: CardMode;
  onContextMenuRequest: (e: React.MouseEvent | React.TouchEvent, b: Bookmark) => void;
}

export const SortableBookmark: React.FC<Props> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: props.bookmark.id,
    disabled: !props.editMode // 只有編輯模式下可以拖拽
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 'auto',
    touchAction: 'none' // Prevent scrolling while dragging on touch devices if implemented
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <BookmarkCard {...props} />
    </div>
  );
};