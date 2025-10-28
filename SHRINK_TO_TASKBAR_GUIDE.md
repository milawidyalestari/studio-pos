# 🎬 Shrink to Taskbar Animation Guide

## Overview
Aplikasi Studio POS sekarang memiliki animasi **shrink to taskbar** yang canggih yang memberikan efek visual yang smooth ketika minimize dan restore window. Animasi ini menciptakan pengalaman user yang premium dengan transisi yang natural dan professional.

## 🎯 Fitur Animasi Shrink to Taskbar

### 1. **Shrink Animation (Minimize)**
- **Effect**: Window mengecil secara bertahap sambil bergerak ke bawah
- **Scale**: 1 → 0.3 → 0.1 (mengecil secara smooth)
- **Movement**: translateY(0) → translateY(50vh) → translateY(100vh)
- **Opacity**: 1 → 0.7 → 0 (fade out)
- **Duration**: 500ms dengan cubic-bezier easing

### 2. **Expand Animation (Restore)**
- **Effect**: Window membesar dari taskbar ke posisi normal
- **Scale**: 0.1 → 0.3 → 1 (membesar secara smooth)
- **Movement**: translateY(100vh) → translateY(50vh) → translateY(0)
- **Opacity**: 0 → 0.7 → 1 (fade in)
- **Duration**: 500ms dengan cubic-bezier easing

### 3. **Visual Effects**
- **Overlay Effects**: Gradient overlay selama transisi
- **Smooth Transitions**: Cubic-bezier easing untuk natural movement
- **State Management**: Proper state handling untuk minimize/restore
- **Event Handling**: Custom events untuk window state changes

## 📁 Komponen yang Dibuat

### 1. **WindowTransitionEffect.tsx**
```tsx
// Komponen utama yang menangani animasi shrink/expand
export const WindowTransitionEffect: React.FC<WindowTransitionEffectProps> = ({ children }) => {
  const { isMinimizing, isRestoring, isVisible } = useWindowState();
  
  return (
    <div className={`
      transition-all duration-500 ease-in-out
      ${isMinimizing ? 'animate-shrink-to-taskbar' : ''}
      ${isRestoring ? 'animate-expand-from-taskbar' : ''}
      ${!isVisible ? 'opacity-0' : 'opacity-100'}
    `}>
      {children}
    </div>
  );
};
```

### 2. **WindowStateManager.tsx**
```tsx
// Context provider untuk mengelola window state
export const WindowStateProvider: React.FC<WindowStateProviderProps> = ({ children }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  // Event listeners untuk window state changes
  // State management untuk animations
};
```

### 3. **Enhanced WindowControls.tsx**
```tsx
// Window controls dengan custom events
const handleMinimize = async () => {
  // Dispatch custom event untuk transition effect
  window.dispatchEvent(new CustomEvent('window-minimize-start'));
  
  // Delay untuk smooth transition
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Actual minimize action
  await electronAPI.window.minimize();
};
```

## 🎨 CSS Animations

### **Shrink to Taskbar Animation**
```css
@keyframes shrink-to-taskbar {
  0% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
  50% {
    transform: scale(0.3) translateY(50vh);
    opacity: 0.7;
  }
  100% {
    transform: scale(0.1) translateY(100vh);
    opacity: 0;
  }
}

.animate-shrink-to-taskbar {
  animation: shrink-to-taskbar 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

### **Expand from Taskbar Animation**
```css
@keyframes expand-from-taskbar {
  0% {
    transform: scale(0.1) translateY(100vh);
    opacity: 0;
  }
  50% {
    transform: scale(0.3) translateY(50vh);
    opacity: 0.7;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.animate-expand-from-taskbar {
  animation: expand-from-taskbar 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

## 🚀 Cara Kerja

### **Minimize Flow**
1. **User clicks minimize button** → Button shows loading state
2. **Custom event dispatched** → `window-minimize-start` event
3. **Animation triggered** → `animate-shrink-to-taskbar` class applied
4. **Window shrinks** → Scale down dari 1 → 0.3 → 0.1
5. **Window moves down** → translateY dari 0 → 50vh → 100vh
6. **Window fades out** → Opacity dari 1 → 0.7 → 0
7. **Actual minimize** → Electron window.minimize() called
8. **Animation complete** → State reset

### **Restore Flow**
1. **User clicks taskbar icon** → Window focus event
2. **Custom event dispatched** → `window-restore-start` event
3. **Animation triggered** → `animate-expand-from-taskbar` class applied
4. **Window expands** → Scale up dari 0.1 → 0.3 → 1
5. **Window moves up** → translateY dari 100vh → 50vh → 0
6. **Window fades in** → Opacity dari 0 → 0.7 → 1
7. **Window restored** → Window becomes visible
8. **Animation complete** → State reset

## 🎭 Visual Effects

### **Overlay Effects**
```tsx
{/* Minimize Transition Overlay */}
{isMinimizing && (
  <div className="fixed inset-0 bg-black/20 pointer-events-none z-50 animate-fade-out" />
)}

{/* Restore Transition Overlay */}
{isRestoring && (
  <div className="fixed inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent pointer-events-none z-50 animate-fade-in" />
)}
```

### **Transform Effects**
```tsx
style={{
  transform: isMinimizing 
    ? 'scale(0.1) translateY(100vh)' 
    : isRestoring 
      ? 'scale(1) translateY(0)' 
      : 'scale(1) translateY(0)',
  transformOrigin: 'center center'
}}
```

## 🔧 Event System

### **Custom Events**
```typescript
// Minimize event
window.dispatchEvent(new CustomEvent('window-minimize-start'));

// Restore event
window.dispatchEvent(new CustomEvent('window-restore-start'));

// Maximize event
window.dispatchEvent(new CustomEvent('window-maximize-start'));
```

### **Event Listeners**
```typescript
// Listen for window events
window.addEventListener('focus', handleWindowRestore);
window.addEventListener('show', handleWindowRestore);
window.addEventListener('hide', handleWindowMinimize);
window.addEventListener('minimize', handleWindowMinimize);

// Custom event handlers
window.addEventListener('window-minimize-start', handleMinimizeStart);
window.addEventListener('window-restore-start', handleRestoreStart);
```

## 📱 User Experience

### **Smooth Transitions**
- **Natural Movement**: Animasi mengikuti prinsip fisika natural
- **Visual Feedback**: Clear indication bahwa window sedang minimize/restore
- **Responsive**: Immediate response saat button diklik
- **Professional**: Animasi yang smooth dan polished

### **Performance Optimized**
- **CSS Animations**: Menggunakan CSS animations untuk performa terbaik
- **Hardware Acceleration**: Transform dan opacity untuk GPU acceleration
- **Efficient State Management**: Minimal re-renders
- **Event Debouncing**: Mencegah multiple animations

## 🎯 Integration

### **Layout Integration**
```tsx
// Layout.tsx
<WindowStateProvider>
  <WindowTransitionEffect>
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* App content */}
    </div>
  </WindowTransitionEffect>
</WindowStateProvider>
```

### **Window Controls Integration**
```tsx
// TitleBar.tsx
<TitleBar 
  title="Studio POS" 
  useAnimatedControls={true}
/>
```

## 🔍 Troubleshooting

### **Problem: Animasi tidak muncul**
**Solution:**
1. Pastikan `WindowStateProvider` sudah wrap aplikasi
2. Cek apakah CSS animations sudah ter-load
3. Pastikan event listeners sudah ter-register
4. Verify Electron API tersedia

### **Problem: Animasi terlalu cepat/lambat**
**Solution:**
1. Adjust duration di CSS animations
2. Modify timing di JavaScript handlers
3. Customize easing functions
4. Adjust delay values

### **Problem: Window tidak restore dengan benar**
**Solution:**
1. Pastikan event listeners untuk focus/show sudah aktif
2. Cek state management untuk isRestoring
3. Verify custom events sudah di-dispatch
4. Pastikan animation state reset dengan benar

## 🚀 Advanced Features

### **Customizable Animations**
```css
/* Customize animation duration */
.animate-shrink-to-taskbar {
  animation-duration: 500ms; /* Adjust as needed */
}

/* Customize easing */
.animate-expand-from-taskbar {
  animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

### **Multiple Animation Styles**
```typescript
// Different animation styles
const animationStyles = {
  shrink: 'animate-shrink-to-taskbar',
  expand: 'animate-expand-from-taskbar',
  fast: 'animate-shrink-to-taskbar-fast',
  slow: 'animate-shrink-to-taskbar-slow'
};
```

## 📋 Testing Checklist

- [ ] Minimize animation smooth dan natural
- [ ] Restore animation smooth dan natural
- [ ] Window state management bekerja dengan benar
- [ ] Event system berfungsi dengan baik
- [ ] Visual effects muncul dengan benar
- [ ] Performance tetap optimal
- [ ] Tidak ada memory leaks
- [ ] Animasi tidak conflict dengan UI lainnya
- [ ] State reset dengan benar setelah animasi
- [ ] Custom events ter-dispatch dengan benar

## 🎉 Kesimpulan

Fitur **shrink to taskbar** telah berhasil diimplementasikan dengan:

- ✅ **Smooth Animations**: Transisi yang natural dan professional
- ✅ **Visual Effects**: Overlay dan gradient effects yang menarik
- ✅ **State Management**: Proper handling untuk window states
- ✅ **Event System**: Custom events untuk coordination
- ✅ **Performance**: Optimized dengan CSS animations
- ✅ **User Experience**: Responsive dan intuitive

Aplikasi Studio POS sekarang memiliki animasi minimize/restore yang sangat smooth dan professional, memberikan pengalaman user yang premium dengan efek visual yang menarik! 🚀

## 🎨 Animation Showcase

### **Minimize Animation**
1. User clicks minimize button
2. Window starts shrinking dengan scale down
3. Window moves down ke taskbar dengan translateY
4. Window fades out dengan opacity transition
5. Overlay effect muncul untuk visual feedback
6. Window minimize ke taskbar
7. Animation complete

### **Restore Animation**
1. User clicks taskbar icon
2. Window starts expanding dari taskbar
3. Window moves up dari taskbar dengan translateY
4. Window fades in dengan opacity transition
5. Gradient overlay effect muncul
6. Window restore ke posisi normal
7. Animation complete

Animasi ini memberikan pengalaman yang sangat smooth dan professional, membuat aplikasi terasa seperti native desktop application dengan efek visual yang menarik! 🎬✨
