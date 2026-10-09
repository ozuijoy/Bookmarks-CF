import React, { useState, useEffect } from 'react';
import { GlassButton } from './ui/Glass';
import { AppConfig } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config?: AppConfig;
  onUpdateConfig: (config: Partial<AppConfig>) => void;
}

export const FontSettingsModal: React.FC<Props> = ({ 
  isOpen, onClose, config, onUpdateConfig
}) => {
  const [scale, setScale] = useState(1);
  const [color, setColor] = useState('#e2e8f0');
  const [shadowStrength, setShadowStrength] = useState(60);

  useEffect(() => {
    if (config) {
        setScale(config.fontScale || 1);
        setColor(config.fontColor || '#e2e8f0');
        setShadowStrength(config.textShadowStrength !== undefined ? config.textShadowStrength : 60);
    }
  }, [config, isOpen]);

  const handleSave = () => {
    onUpdateConfig({
        fontScale: scale,
        fontColor: color,
        textShadowStrength: shadowStrength
    });
    onClose();
  };

  const handleReset = () => {
      setScale(1);
      setColor('#e2e8f0');
      setShadowStrength(60);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-[#1e293b]/90 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            全局字體設置
        </h2>
        
        <div className="space-y-6">
          
          {/* Font Scale */}
          <div>
            <div className="flex justify-between items-end mb-2">
                <label className="text-xs text-gray-400 uppercase tracking-wider">整體大小縮放</label>
                <span className="text-sm font-medium text-purple-300">
                    {Math.round(scale * 100)}%
                </span>
            </div>
            <input 
                type="range" 
                min="0.8" 
                max="1.3" 
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Text Color */}
          <div>
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">主要文字顏色</label>
            <div className="flex gap-2">
                <input 
                    type="color" 
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded bg-transparent border border-white/20 cursor-pointer"
                />
                <div 
                    className="flex-1 rounded border border-white/10 flex items-center px-3 text-sm"
                    style={{ backgroundColor: color, color: '#000' }} // Preview bg, black text
                >
                    <span className="opacity-80 font-mono">{color}</span>
                </div>
            </div>
          </div>

          {/* Text Shadow Strength */}
          <div>
            <div className="flex justify-between items-end mb-2">
                <label className="text-xs text-gray-400 uppercase tracking-wider">文字陰影深度</label>
                <span className="text-sm font-medium text-purple-300">
                    {shadowStrength}
                </span>
            </div>
            <input 
                type="range" 
                min="0" 
                max="100" 
                step="5"
                value={shadowStrength}
                onChange={(e) => setShadowStrength(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="mt-2 p-2 bg-white/5 rounded text-center">
                <span style={{ 
                    color: color, 
                    fontSize: `${16 * scale}px`,
                    textShadow: `0 ${1 + (shadowStrength/50)}px ${2 + (shadowStrength/20)}px rgba(0,0,0, ${0.3 + (shadowStrength/150)})`
                }}>
                    預覽 Text Effect
                </span>
            </div>
          </div>

        </div>

        <div className="flex justify-between mt-8 pt-4 border-t border-white/5">
            <GlassButton variant="ghost" onClick={handleReset} className="text-xs !px-3">恢復默認</GlassButton>
            <div className="flex gap-3">
                <GlassButton variant="ghost" onClick={onClose}>取消</GlassButton>
                <GlassButton onClick={handleSave}>保存</GlassButton>
            </div>
        </div>
      </div>
    </div>
  );
};