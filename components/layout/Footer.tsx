import React from 'react';

const GitHubIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
);

const TelegramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.636 5.617-1.012 9.605-.623 1.506-2.094 1.487-2.883.82l-3.321-2.285c-.012-.012-3.816 3.165-3.816 3.165l-.479-2.697 6.436-5.86-7.85 4.881-2.613-.889c-.588-.204-.572-.733.116-1.002 2.766-1.085 9.873-3.843 14.806-5.694z"/></svg>
);

interface Props {
  count: number;
  sizeStr: string;
  percent: number;
}

export const Footer: React.FC<Props> = ({ count, sizeStr, percent }) => {
  // 根據佔用率決定顏色
  let barColor = 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]';
  let textColor = 'text-cyan-300';
  
  if (percent > 60) {
      barColor = 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]';
      textColor = 'text-yellow-300';
  }
  if (percent > 90) {
      barColor = 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
      textColor = 'text-red-300';
  }

  // 這裡的字體樣式強制固定，不繼承全局的 fontScale，防止佈局錯亂，但保證足夠清晰
  const staticTextStyle = {
      textShadow: '0 2px 4px rgba(0,0,0,0.8)', // 強制深色陰影
      fontSize: '1rem', // 強制大小，不受全局縮放影響
  };

  return (
    <footer className="w-full py-6 flex flex-col items-center justify-center gap-4 mt-auto border-t border-white/10 bg-[#0f172a]/80 backdrop-blur-xl relative z-20">
      
      <div className="flex items-center gap-8 md:gap-12 px-4">
        {/* 書籤統計 */}
        <div className="flex flex-col items-center gap-1" style={staticTextStyle}>
            <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">書籤數量</span>
            <span className="text-xl text-white font-mono leading-none font-bold">{count}</span>
        </div>

        {/* 分隔線 */}
        <div className="w-px h-10 bg-white/15"></div>

        {/* 存儲能量條 */}
        <div className="flex flex-col gap-2 w-48 md:w-56" style={staticTextStyle}>
             <div className="flex justify-between items-end text-xs">
                <span className="text-gray-400 uppercase tracking-widest font-bold">KV 存儲</span>
                <span className={`${textColor} font-mono tracking-wide font-bold`}>{sizeStr}</span>
             </div>
             
             {/* 槽體 */}
             <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-white/10 relative">
                {/* 能量條主體 */}
                <div 
                    className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                    style={{ width: `${Math.max(percent, 2)}%` }}
                ></div>
                {/* 掃描光效 */}
                <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2 -skew-x-12 translate-x-[-200%]"
                    style={{ animation: 'shimmer 2s infinite linear' }}
                ></div>
             </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="flex items-center gap-6 mt-2">
          {/* GitHub Link */}
          <a 
            href="https://github.com/dghjlcx/Nebula-Nav" 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center gap-2 opacity-50 hover:opacity-100 hover:text-white transition-all duration-300 text-xs font-medium"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
          >
            <GitHubIcon /> 
            <span>Open Source</span>
          </a>

          {/* Telegram Link */}
          <a 
            href="https://t.me/wo_shi_ni_ba_ba" 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center gap-2 opacity-50 hover:opacity-100 hover:text-blue-400 transition-all duration-300 text-xs font-medium"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
          >
            <TelegramIcon /> 
            <span>Contact Me</span>
          </a>
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-12deg); }
          100% { transform: translateX(350%) skewX(-12deg); }
        }
      `}</style>
    </footer>
  );
};