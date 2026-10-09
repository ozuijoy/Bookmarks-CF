import React, { useRef, useState } from 'react';
import { GlassButton } from './ui/Glass';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (content: string) => void;
}

export const ImportModal: React.FC<Props> = ({ isOpen, onClose, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImport(content);
        onClose();
      }
    };
    reader.onerror = () => setError("讀取文件失敗");
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#1e293b] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-white mb-2">導入數據</h2>
        <p className="text-sm text-gray-400 mb-6">
          支持導入: <br/>
          1. 瀏覽器導出的 HTML 書籤文件。<br/>
          2. Bookmarks-CF 導出的 JSON 備份文件。
        </p>
        
        <input 
          type="file" 
          accept=".html,.json" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:bg-white/5 transition-colors mb-4"
        >
          <p className="text-gray-300">點擊選擇文件 (.html / .json)</p>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <div className="flex justify-end gap-3">
          <GlassButton variant="ghost" onClick={onClose}>取消</GlassButton>
        </div>
      </div>
    </div>
  );
};