import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { KVData } from '../types';

export const useDragAndDrop = (
  data: KVData | null, 
  persist: (data: KVData) => Promise<void>, 
  setActiveId: (id: string | null) => void
) => {
  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || !data) return;
    if (active.id === over.id) return;

    const activeString = String(active.id);
    const overString = String(over.id);
    const isPinnedDrag = activeString.startsWith('pinned-');

    let updatedBookmarks = [...data.bookmarks];
    let changed = false;

    if (isPinnedDrag) {
        if (!overString.startsWith('pinned-')) return;
        const realActiveId = activeString.replace('pinned-', '');
        const realOverId = overString.replace('pinned-', '');
        const oldIndex = data.bookmarks.findIndex(b => b.id === realActiveId);
        const newIndex = data.bookmarks.findIndex(b => b.id === realOverId);

        if (oldIndex !== -1 && newIndex !== -1) {
             updatedBookmarks = arrayMove(data.bookmarks, oldIndex, newIndex);
             changed = true;
        }
    } else {
        if (overString.startsWith('pinned-')) return;
        const oldIndex = data.bookmarks.findIndex((b) => b.id === active.id);
        const newIndex = data.bookmarks.findIndex((b) => b.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            const activeItem = data.bookmarks[oldIndex];
            const overItem = data.bookmarks[newIndex];
            updatedBookmarks = arrayMove(data.bookmarks, oldIndex, newIndex);
            
            // 如果拖到了不同分類的元素上，更新分類
            if (activeItem.category !== overItem.category) {
                updatedBookmarks = updatedBookmarks.map(b => 
                    b.id === activeItem.id ? { ...b, category: overItem.category } : b
                );
            }
            changed = true;
        }
    }

    if (changed) {
         await persist({ ...data, bookmarks: updatedBookmarks });
    }
  };

  return { handleDragEnd };
};