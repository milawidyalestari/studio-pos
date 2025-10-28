import React from 'react';

interface LoginWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const LoginWrapper: React.FC<LoginWrapperProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div 
      className={`min-h-screen bg-transparent flex items-center justify-center p-4 ${className}`}
      style={{
        background: 'transparent',
        position: 'relative',
      }}
    >
      {/* Floating login card */}
      <div 
        className="w-full max-w-md mx-auto"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.2)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {children}
      </div>
      
      {/* Subtle background overlay for better contrast */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.05) 0%, transparent 70%)',
        }}
      />
    </div>
  );
};

export default LoginWrapper;
