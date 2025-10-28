import React from 'react';

interface WindowTransitionOverlayProps {
  isAnimating: boolean;
  animationType: 'minimize' | 'maximize' | 'close' | null;
  children: React.ReactNode;
}

export const WindowTransitionOverlay: React.FC<WindowTransitionOverlayProps> = ({
  isAnimating,
  animationType,
  children
}) => {
  const getAnimationClass = () => {
    if (!isAnimating || !animationType) return '';
    
    switch (animationType) {
      case 'minimize':
        return 'animate-window-minimize';
      case 'maximize':
        return 'animate-window-maximize';
      case 'close':
        return 'animate-window-close';
      default:
        return '';
    }
  };

  return (
    <div className={`transition-all duration-300 ease-in-out ${getAnimationClass()}`}>
      {children}
      
      {/* Animation Overlay */}
      {isAnimating && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {animationType === 'minimize' && (
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 animate-fade-out" />
          )}
          {animationType === 'maximize' && (
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent animate-fade-in" />
          )}
          {animationType === 'close' && (
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/20 to-transparent animate-close-effect" />
          )}
        </div>
      )}
    </div>
  );
};

export default WindowTransitionOverlay;
