import React, { useState } from 'react';
import { GlassCard, GlassInput, GlassButton } from './ui/Glass';
import { DEFAULT_SITE_TITLE } from '../services/storage';

interface Props {
  onLogin: (password: string) => Promise<boolean>;
}

export const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [inputPassword, setInputPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onLogin(inputPassword);
    if (!success) alert("訪問密碼錯誤");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-animate p-4">
      <GlassCard className="w-full max-w-md p-8 flex flex-col items-center">
        <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mb-6 shadow-2xl border border-white/10 hover:scale-105 transition-transform duration-500">
          <img src="/favicon.svg" alt="Logo" className="w-16 h-16 drop-shadow-md" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">{DEFAULT_SITE_TITLE}</h1>
        <p className="text-gray-400 mb-8 text-center">訪問受限，請驗證身份。</p>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <GlassInput 
            type="password" 
            placeholder="請輸入訪問密碼" 
            value={inputPassword} 
            onChange={(e) => setInputPassword(e.target.value)} 
            className="text-center tracking-widest"
          />
          <GlassButton type="submit" className="w-full py-3">進入系統</GlassButton>
        </form>
        <div className="mt-8 text-xs text-gray-500">基於 Cloudflare Pages & KV 構建</div>
      </GlassCard>
    </div>
  );
};