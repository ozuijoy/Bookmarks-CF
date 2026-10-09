import React, { useEffect, useRef, useLayoutEffect, useState } from 'react';

interface Props {
  x: number;
  y: number;
  groupName: string;
  onClose: () => void;
  onRename: () => void;
  onSort: () => void;
}

export const GroupContextMenu: React.FC<Props> = ({ 
  x, y, groupName, onClose, onRename, onSort
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: y, left: x });

  // 智能定位：防止溢出屏幕
  useLayoutEffect(() => {
    if (menuRef.current) {
        const rect = menuRef.current.getBoundingClientRect();
        let newTop = y;
        let newLeft = x;

        if (y + rect.height > window.innerHeight) {
            newTop = y - rect.height;
        }
        if (x + rect.width > window.innerWidth) {
            newLeft = x - rect.width;
        }

        setPosition({ top: newTop, left: newLeft });
    }
  }, [x, y]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
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

  return (
    <div 
      ref={menuRef}
      style={{ top: position.top, left: position.left }}
      className="fixed z-[100] w-40 bg-[#1e293b]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-1 animate-fadeIn overflow-hidden flex flex-col"
    >
      <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b border-white/5 truncate">
        分組: {groupName}
      </div>
      
      <button 
        onClick={() => handleAction(onRename)}
        className="text-left px-4 py-3 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-3"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        重命名
      </button>

      <button 
        onClick={() => handleAction(onSort)}
        className="text-left px-4 py-3 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-3"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        分組排序
      </button>
    </div>
  );
};