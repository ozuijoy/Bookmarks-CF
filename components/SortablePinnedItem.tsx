import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bookmark } from '../types';

interface Props {
  bookmark: Bookmark;
  id: string; // Special ID with prefix
  editMode: boolean;
}

export const SortablePinnedItem: React.FC<Props> = ({ bookmark, id, editMode }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: id,
    disabled: !editMode
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  const handleClick = (e: React.MouseEvent) => {
    if (editMode) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex-shrink-0">
      <a 
        href={editMode ? undefined : bookmark.url} 
        target={editMode ? undefined : "_blank"} 
        rel={editMode ? undefined : "noreferrer"}
        title={bookmark.title}
        onClick={handleClick}
        className={`w-10 h-10 min-w-[2.5rem] bg-white/10 rounded-xl flex items-center justify-center border border-white/5 transition-all
          ${editMode ? 'cursor-move hover:bg-purple-600/50' : 'hover:bg-purple-500/80 hover:scale-105'}
        `}
        draggable={false} // Disable native drag
      >
        {bookmark.icon ? (
          <img 
            src={bookmark.icon} 
            className="w-5 h-5 object-contain pointer-events-none" 
            alt="" 
          />
        ) : (
          <span className="text-xs font-bold pointer-events-none">{bookmark.title.charAt(0)}</span>
        )}
      </a>
    </div>
  );
};