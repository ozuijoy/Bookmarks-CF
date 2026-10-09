import React, { useState, useMemo } from 'react';
import { Bookmark } from '../types';
import { GlassButton } from './ui/Glass';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  onDelete: (id: string) => void;
}

type DuplicateType = 'url' | 'title' | 'domain';

// 智能獲取根域名 (忽略子域和協議)
const getRootDomain = (urlStr: string) => {
    try {
        let safeUrl = urlStr.trim();
        // Handle undefined or empty
        if (!safeUrl) return 'unknown';
        // Add protocol if missing for URL parsing
        if (!safeUrl.startsWith('http')) {
             safeUrl = 'https://' + safeUrl;
        }
        
        const hostname = new URL(safeUrl).hostname;
        
        // IP address check (return as is)
        if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) return hostname;

        const parts = hostname.split('.');
        if (parts.length <= 2) return hostname;
        
        const last = parts[parts.length - 1];
        const secondLast = parts[parts.length - 2];
        
        // Common SLDs that are part of the TLD structure (e.g., .co.uk, .com.cn)
        const compoundSLDs = ['co', 'com', 'net', 'org', 'gov', 'edu', 'ac', 'mil', 'ne', 'or'];
        
        // Logic: if last part is 2 chars (ccTLD) AND 2nd last is a common SLD, take last 3 parts.
        // Example: google.co.uk -> co.uk (match) -> google.co.uk
        // Example: google.com.hk -> com.hk (match) -> google.com.hk
        // Example: google.com -> com (match) -> but last is 3 chars? No, last is 'com'. Logic below handles it.
        
        if (last.length === 2 && compoundSLDs.includes(secondLast)) {
            return parts.slice(-3).join('.');
        }
        
        return parts.slice(-2).join('.');
    } catch (e) {
        return 'unknown';
    }
};

export const DuplicateManagerModal: React.FC<Props> = ({ isOpen, onClose, bookmarks, onDelete }) => {
  const [activeTab, setActiveTab] = useState<DuplicateType>('url');

  // Calculate stats for all tabs at once
  const stats = useMemo(() => {
    if (!isOpen) return { url: [], title: [], domain: [] };

    const calculate = (type: DuplicateType) => {
        const map = new Map<string, Bookmark[]>();
        
        bookmarks.forEach(b => {
            let key = '';
            if (type === 'url') {
                // Ignore trailing slashes for URL matching
                key = b.url.trim().replace(/\/$/, '');
            } else if (type === 'title') {
                key = b.title.trim().toLowerCase();
            } else if (type === 'domain') {
                key = getRootDomain(b.url);
            }

            if (key && key !== 'unknown') {
                if (!map.has(key)) map.set(key, []);
                map.get(key)?.push(b);
            }
        });

        // Filter: only keep groups with > 1 item
        return Array.from(map.entries())
            .filter(([_, list]) => list.length > 1)
            .map(([key, items]) => ({ key, items }))
            .sort((a, b) => b.items.length - a.items.length); // Sort by count desc
    };

    return {
        url: calculate('url'),
        title: calculate('title'),
        domain: calculate('domain')
    };

  }, [isOpen, bookmarks]);

  const currentList = stats[activeTab];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl bg-[#1e293b]/95 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            書籤整理工具
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-4 bg-black/20 p-1.5 rounded-xl self-start">
            <button 
                onClick={() => setActiveTab('url')}
                className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${activeTab === 'url' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
                <span>重複鏈接</span>
                <span className="bg-white/20 px-1.5 rounded text-xs min-w-[1.5rem]">{stats.url.length}</span>
            </button>
            <button 
                onClick={() => setActiveTab('title')}
                className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${activeTab === 'title' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
                <span>重複標題</span>
                <span className="bg-white/20 px-1.5 rounded text-xs min-w-[1.5rem]">{stats.title.length}</span>
            </button>
            <button 
                onClick={() => setActiveTab('domain')}
                className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${activeTab === 'domain' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
                <span>相同域名</span>
                <span className="bg-white/20 px-1.5 rounded text-xs min-w-[1.5rem]">{stats.domain.length}</span>
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 min-h-[300px]">
            {currentList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <p>
                        {activeTab === 'domain' ? '沒有發現包含多個書籤的相同域名。' : '太棒了！沒有發現重複項。'}
                    </p>
                </div>
            ) : (
                currentList.map((group, idx) => (
                    <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <div className="flex items-center justify-between mb-3">
                             <div className="text-xs text-purple-300 font-mono bg-purple-500/10 px-2 py-1 rounded truncate max-w-[80%]">
                                {activeTab === 'title' ? `標題: "${group.key}"` : group.key}
                            </div>
                            <span className="text-xs text-gray-500">{group.items.length} 個項目</span>
                        </div>
                       
                        <div className="space-y-2">
                            {group.items.map(item => (
                                <div key={item.id} className="flex items-center justify-between bg-black/20 p-2 rounded-lg group hover:bg-black/40 transition-colors">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        {item.icon ? (
                                            <img src={item.icon} className="w-5 h-5 rounded-full object-cover shrink-0" alt="" />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[10px]">{item.title[0]}</div>
                                        )}
                                        <div className="min-w-0">
                                            <div className="text-sm text-gray-200 truncate" title={item.title}>{item.title}</div>
                                            <div className="text-xs text-gray-500 truncate" title={item.url}>{item.url}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 ml-2">
                                        <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">{item.category || '未分類'}</span>
                                        <button 
                                            onClick={() => onDelete(item.id)}
                                            className="p-1.5 text-red-400 hover:text-red-200 hover:bg-red-500/20 rounded-lg transition-colors"
                                            title="刪除此項"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
          <GlassButton onClick={onClose} className="px-8">完成</GlassButton>
        </div>
      </div>
    </div>
  );
};