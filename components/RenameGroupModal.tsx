import React, { useState, useEffect } from 'react';
import { GlassButton, GlassInput } from './ui/Glass';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  oldName: string;
  onRename: (oldName: string, newName: string) => void;
}

export const RenameGroupModal: React.FC<Props> = ({ isOpen, onClose, oldName, onRename }) => {
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewName(oldName);
    }
  }, [isOpen, oldName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && newName !== oldName) {
      onRename(oldName, newName.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-[#1e293b] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-white mb-6">重命名分組</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <GlassInput 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="輸入新的分組名稱"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3">
            <GlassButton type="button" variant="ghost" onClick={onClose}>取消</GlassButton>
            <GlassButton type="submit">確定</GlassButton>
          </div>
        </form>
      </div>
    </div>
  );
};