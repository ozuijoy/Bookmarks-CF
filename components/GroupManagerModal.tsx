import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter, 
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor, 
  useSensors, 
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  verticalListSortingStrategy, 
  useSortable,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GlassButton } from './ui/Glass';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  groups: string[];
  onReorder: (newOrder: string[]) => void;
}

const SortableItem = ({ id }: { id: string }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as 'relative',
    touchAction: 'manipulation' as const, // 關鍵：允許滾動，但讓 dnd-kit 捕獲長按
  };

  return (
    <div 
        ref={setNodeRef} 
        style={style} 
        {...attributes} 
        {...listeners}
        className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 cursor-grab active:cursor-grabbing group transition-colors select-none"
    >
        <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            <span className="text-gray-200 font-medium">{id}</span>
        </div>
    </div>
  );
};

export const GroupManagerModal: React.FC<Props> = ({ isOpen, onClose, groups, onReorder }) => {
  const [items, setItems] = useState<string[]>([]);
  
  // 配置傳感器：桌面端立即拖拽，移動端需長按 250ms
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8, // 防止點擊時的微小抖動被誤判為拖拽
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 核心修復：延遲 250ms 激活，區分“滾動”和“拖拽”
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (isOpen) {
      setItems(groups);
    }
  }, [isOpen, groups]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over?.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = () => {
    onReorder(items);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#1e293b] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[80vh]">
        <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
           分組排序
        </h2>
        <p className="text-sm text-gray-400 mb-6">移動端請長按拖拽，桌面端可直接拖拽。</p>
        
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[200px]">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                        {items.map((group) => (
                            <SortableItem key={group} id={group} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
          <GlassButton variant="ghost" onClick={onClose}>取消</GlassButton>
          <GlassButton onClick={handleSave}>保存</GlassButton>
        </div>
      </div>
    </div>
  );
};