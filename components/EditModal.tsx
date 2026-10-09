import React, { useState, useEffect, useRef } from 'react';
import { Bookmark } from '../types';
import { GlassButton, GlassInput } from './ui/Glass';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (b: Partial<Bookmark>) => void;
  initialData?: Bookmark | null;
  groups: string[]; // 接收全部分組列表
}

export const EditModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData, groups }) => {
  const [formData, setFormData] = useState({ title: '', url: '', category: '', icon: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        title: initialData.title,
        url: initialData.url,
        category: initialData.category || '',
        icon: initialData.icon || ''
      });
    } else if (isOpen) {
      // 默認選中第一個分組（如果有）或者 '未分類'
      setFormData({ title: '', url: '', category: '', icon: '' });
    }
  }, [isOpen, initialData]);

  // Image compression logic
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("圖片過大，請選擇小於 5MB 的圖片");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxSize = 128; // Limit to 128px to save KV space

        // Resize logic
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height *= maxSize / width));
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width *= maxSize / height));
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
             ctx.drawImage(img, 0, 0, width, height);
             // Compress to PNG
             const compressedBase64 = canvas.toDataURL('image/png', 0.8);
             setFormData(prev => ({ ...prev, icon: compressedBase64 }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#1e293b] border border-white/10 rounded-2xl p-6 shadow-2xl relative animate-fadeIn">
        <h2 className="text-xl font-semibold text-white mb-6">
          {initialData ? '編輯收藏' : '新建收藏'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1 ml-1">標題</label>
            <GlassInput 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="網站名稱"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 ml-1">鏈接地址</label>
            <GlassInput 
              value={formData.url} 
              onChange={e => setFormData({...formData, url: e.target.value})}
              placeholder="https://example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1 ml-1">分類</label>
              <GlassInput 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
                placeholder="選擇或輸入新分類"
                list="category-options" 
              />
              {/* 這裡使用 datalist 實現輸入框+下拉選擇 */}
              <datalist id="category-options">
                  {groups.map(g => (
                      <option key={g} value={g} />
                  ))}
              </datalist>
            </div>
             <div>
              <label className="block text-xs text-gray-400 mb-1 ml-1">圖標</label>
              <div className="flex gap-2">
                 {/* Hidden File Input */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                />
                
                {/* Preview or Input */}
                {formData.icon.startsWith('data:') ? (
                    <div 
                        className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 overflow-hidden cursor-pointer relative group"
                        onClick={() => fileInputRef.current?.click()}
                        title="點擊更換圖片"
                    >
                        <img src={formData.icon} alt="Icon" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        </div>
                    </div>
                ) : (
                    <GlassInput 
                        value={formData.icon} 
                        onChange={e => setFormData({...formData, icon: e.target.value})}
                        placeholder="URL"
                        className="flex-1 min-w-0"
                    />
                )}

                {/* Tools */}
                <div className="flex flex-col gap-1 justify-center">
                    <GlassButton 
                        type="button"
                        variant="ghost" 
                        className="px-2 py-1 h-auto text-xs"
                        onClick={() => fileInputRef.current?.click()}
                        title="上傳本地圖片"
                    >
                        上傳
                    </GlassButton>
                    <GlassButton 
                        type="button"
                        variant="ghost" 
                        className="px-2 py-1 h-auto text-xs"
                        onClick={() => {
                            try {
                            if(!formData.url) return;
                            let targetUrl = formData.url;
                            if (!targetUrl.startsWith('http')) targetUrl = `https://${targetUrl}`;
                            const domain = new URL(targetUrl).hostname;
                            setFormData({...formData, icon: `https://icons.duckduckgo.com/ip3/${domain}.ico`});
                            } catch(e) { /* ignore */ }
                        }}
                        title="自動獲取"
                    >
                        自動
                    </GlassButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <GlassButton variant="ghost" onClick={onClose}>取消</GlassButton>
          <GlassButton onClick={() => onSave(formData)}>保存</GlassButton>
        </div>
      </div>
    </div>
  );
};