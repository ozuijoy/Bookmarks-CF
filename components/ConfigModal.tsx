import React, { useState, useEffect } from 'react';
import { GlassButton, GlassInput } from './ui/Glass';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentSearchEngine?: string;
  onSave: (config: { searchEngineUrl: string }) => void;
}

export const ConfigModal: React.FC<Props> = ({ 
  isOpen, onClose, 
  currentSearchEngine = '', onSave
}) => {
  const [searchUrl, setSearchUrl] = useState(currentSearchEngine);

  useEffect(() => {
    if (isOpen) {
      setSearchUrl(currentSearchEngine);
    }
  }, [currentSearchEngine, isOpen]);

  const handleSave = () => {
    onSave({ searchEngineUrl: searchUrl });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-[#1e293b] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          全局設置
        </h2>
        
        <div className="space-y-6">
          {/* 自定義搜索引擎 */}
          <div>
            <label className="block text-xs text-gray-400 mb-3 uppercase tracking-wider">默認搜索引擎前綴</label>
            <GlassInput 
                value={searchUrl} 
                onChange={(e) => setSearchUrl(e.target.value)}
                placeholder="例如: https://www.google.com/search?q="
                className="text-sm"
            />
            <p className="text-xs text-gray-500 mt-2 mb-3">當在搜索欄輸入內容並回車時使用。</p>
            
            <div className="flex gap-2">
                <button 
                  onClick={() => setSearchUrl('https://www.google.com/search?q=')}
                  className="px-2 py-1 text-xs bg-white/5 rounded hover:bg-white/10 text-gray-300"
                >
                  Google
                </button>
                <button 
                  onClick={() => setSearchUrl('https://www.bing.com/search?q=')}
                  className="px-2 py-1 text-xs bg-white/5 rounded hover:bg-white/10 text-gray-300"
                >
                  Bing
                </button>
                <button 
                  onClick={() => setSearchUrl('https://www.baidu.com/s?wd=')}
                  className="px-2 py-1 text-xs bg-white/5 rounded hover:bg-white/10 text-gray-300"
                >
                  Baidu
                </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/5">
          <GlassButton variant="ghost" onClick={onClose}>取消</GlassButton>
          <GlassButton onClick={handleSave}>保存設置</GlassButton>
        </div>
      </div>
    </div>
  );
};