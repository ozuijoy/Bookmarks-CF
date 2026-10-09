import React, { useState, useEffect } from 'react';

const TriangleUpIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l-8 12h16L12 4z" /></svg>
);

export const ScrollToTop: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!showScrollTop) return null;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40 animate-fadeIn">
        <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="w-12 h-12 rounded-full bg-purple-600/90 hover:bg-purple-500 text-white shadow-xl backdrop-blur-md flex items-center justify-center transition-all hover:-translate-y-1 hover:shadow-2xl" 
            title="回到頂部"
        >
            <TriangleUpIcon />
        </button>
    </div>
  );
};