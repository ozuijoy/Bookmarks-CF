import React from 'react';
import { GlassCard } from './ui/Glass';

const DuplicateIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
);

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);

interface Props {
  isVisible: boolean;
  onImport: () => void;
  onExport: () => void;
  onBackup: () => void;
  onCheckDuplicates: () => void;
  onOpenConfig: () => void;
  onLogout: () => void;
}

export const EditBar: React.FC<Props> = ({ 
  isVisible, onImport, onExport, onBackup, onCheckDuplicates, onOpenConfig, onLogout 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-40 px-4 animate-fadeIn flex justify-center pointer-events-none">
      {/* Wrapper to handle centering but allowing content to scroll if wider */}
      <div className="max-w-full overflow-x-auto scrollbar-hide pointer-events-auto rounded-2xl">
        <GlassCard className="flex gap-4 p-2 px-4 shadow-2xl border-white/20 bg-black/60 items-center whitespace-nowrap min-w-max">
          <span className="text-xs text-purple-300 mr-2 hidden sm:inline">左鍵拖拽可排序</span>
          <div className="w-px h-4 bg-white/10 hidden sm:block"></div>
          <button onClick={onOpenConfig} className="text-sm text-blue-300 hover:text-blue-100 px-2 py-1 flex items-center gap-1 font-medium"><SettingsIcon /> 設置</button>
          <div className="w-px bg-white/10"></div>
          <button onClick={onImport} className="text-sm text-gray-300 hover:text-white px-2 py-1">導入</button>
          <div className="w-px bg-white/10"></div>
          <button onClick={onExport} className="text-sm text-gray-300 hover:text-white px-2 py-1">導出</button>
          <div className="w-px bg-white/10"></div>
          <button onClick={onBackup} className="text-sm text-purple-300 hover:text-purple-100 px-2 py-1 font-medium">備份</button>
          <div className="w-px bg-white/10"></div>
          <button onClick={onCheckDuplicates} className="text-sm text-yellow-400 hover:text-yellow-200 px-2 py-1 flex items-center gap-1"><DuplicateIcon /> 查重</button>
          <div className="w-px bg-white/10"></div>
          <button onClick={onLogout} className="text-sm text-red-400 hover:text-red-300 px-2 py-1">退出</button>
        </GlassCard>
      </div>
    </div>
  );
};