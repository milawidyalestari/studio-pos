import React from 'react';

interface TransparentWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const TransparentWrapper: React.FC<TransparentWrapperProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div 
      className={`min-h-screen bg-transparent flex items-center justify-center p-4 ${className}`}
      style={{
        background: 'transparent',
      }}
    >
      <div 
        className="w-full max-w-md mx-auto"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '15px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default TransparentWrapper;

