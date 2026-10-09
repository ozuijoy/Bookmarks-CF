import React from 'react';

interface GlassProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassProps> = ({ children, className = '', ...props }) => (
  <div 
    className={`bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl hover:shadow-2xl hover:border-white/20 transition-all duration-300 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const GlassInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <input 
    ref={ref}
    {...props}
    className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all ${props.className || ''}`}
  />
));

export const GlassButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'danger' | 'ghost' }> = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: "bg-purple-600/80 hover:bg-purple-500/80 text-white",
    danger: "bg-red-500/80 hover:bg-red-400/80 text-white",
    ghost: "bg-white/5 hover:bg-white/10 text-gray-200"
  };
  
  return (
    <button 
      {...props}
      className={`${variants[variant]} backdrop-blur-md px-6 py-2 rounded-xl font-medium transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
};