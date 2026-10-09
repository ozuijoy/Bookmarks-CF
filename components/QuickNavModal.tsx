import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  groups: string[];
}

export const QuickNavModal: React.FC<Props> = ({ isOpen, onClose, groups }) => {
  if (!isOpen) return null;

  const handleJump = (group: string) => {
    onClose();
    // Locate the element
    const el = document.getElementById(`group-${encodeURIComponent(group)}`);
    if (el) {
        // Calculate offset to account for sticky header (approx 100px)
        const offset = 100;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    }
  };

  return (
    <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-[#1e293b]/90 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl animate-scaleIn"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
            快速跳轉
        </h2>
        
        <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
            {groups.map(group => (
                <button
                    key={group}
                    onClick={() => handleJump(group)}
                    className="text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-purple-600/80 hover:text-white text-gray-300 transition-all text-sm truncate border border-white/5"
                >
                    {group}
                </button>
            ))}
            {groups.length === 0 && (
                <div className="col-span-2 text-center text-gray-500 py-4">暫無分組</div>
            )}
        </div>
        
        <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
            <button onClick={onClose} className="text-sm text-gray-400 hover:text-white px-4 py-2">取消</button>
        </div>
      </div>
    </div>
  );
};