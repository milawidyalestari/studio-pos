# Router Context Fix

## Masalah yang Ditemukan

Error: `useNavigate() may be used only in the context of a <Router> component.`

Error ini terjadi karena `useNavigate()` dan `useLocation()` digunakan di `NativeAppWrapper` yang berada di luar context `<Router>`.

## Analisis Masalah

### Root Cause:
- `NativeAppWrapper` berada di luar `<HashRouter>`
- `useNavigate()` dan `useLocation()` hanya bisa digunakan di dalam context `<Router>`
- State management dan navigation handling berada di level yang salah

### Struktur yang Bermasalah:
```tsx
<NativeAppWrapper>  // ❌ Di luar Router context
  <HashRouter>
    <Routes>
      // ... routes
    </Routes>
  </HashRouter>
</NativeAppWrapper>
```

## Solusi yang Diimplementasikan

### 1. Membuat Context untuk State Management

**File**: `src/context/NativeAppContext.tsx`

```tsx
interface NativeAppContextType {
  appState: AppState;
  currentUser: User | null;
  setAppState: (state: AppState) => void;
  setCurrentUser: (user: User | null) => void;
}
```

**Benefits:**
- ✅ Centralized state management
- ✅ Accessible dari komponen mana pun
- ✅ Clean separation of concerns

### 2. Membuat AppRouter Component

**File**: `src/components/AppRouter.tsx`

```tsx
export const AppRouter: React.FC<AppRouterProps> = ({ children }) => {
  const navigate = useNavigate();  // ✅ Di dalam Router context
  const location = useLocation();  // ✅ Di dalam Router context
  const { appState, currentUser } = useNativeApp();

  // Handle navigation after login success
  useEffect(() => {
    if (appState === 'ready' && currentUser && location.pathname === '/') {
      navigate('/dashboard', { replace: true });
    }
  }, [appState, currentUser, location.pathname, navigate]);

  return <>{children}</>;
};
```

**Benefits:**
- ✅ Navigation hooks berada di dalam Router context
- ✅ Proper navigation handling
- ✅ Clean component structure

### 3. Restructuring Component Hierarchy

**File**: `src/AppNative.tsx`

**Struktur Baru:**
```tsx
<NativeAppProvider>        // ✅ Context provider
  <NativeAppWrapper>       // ✅ State management
    <HashRouter>           // ✅ Router context
      <AppRouter>          // ✅ Navigation handling
        <Routes>           // ✅ Route definitions
          // ... routes
        </Routes>
      </AppRouter>
    </HashRouter>
  </NativeAppWrapper>
</NativeAppProvider>
```

### 4. Updating NativeAppWrapper

**File**: `src/components/NativeAppWrapper.tsx`

```tsx
export const NativeAppWrapper: React.FC<NativeAppWrapperProps> = ({ children }) => {
  const { appState, setAppState, currentUser, setCurrentUser } = useNativeApp();
  // ... rest of the logic
};
```

**Benefits:**
- ✅ Menggunakan context untuk state management
- ✅ Tidak menggunakan navigation hooks langsung
- ✅ Clean dan maintainable code

## Flow yang Diperbaiki

### Component Hierarchy:
```
App
├── ErrorBoundary
├── QueryClientProvider
├── AppProvider
├── RoleAccessProvider
├── NativeAppProvider          ← Context untuk state
├── NativeAppWrapper           ← State management
│   ├── HashRouter            ← Router context
│   │   └── AppRouter         ← Navigation handling
│   │       └── Routes        ← Route definitions
│   │           ├── Dashboard
│   │           ├── Orderan
│   │           └── ... other routes
│   └── (Conditional screens)
│       ├── Setup Wizard
│       ├── Login Screen
│       └── Migration Screen
```

### State Flow:
```
1. NativeAppProvider → Provides context
2. NativeAppWrapper → Manages app state
3. AppRouter → Handles navigation
4. Routes → Renders components
```

## Benefits

### ✅ **Fixed Issues:**
- No more `useNavigate()` context error
- Proper component hierarchy
- Clean separation of concerns

### ✅ **Improved Architecture:**
- Context-based state management
- Proper Router context usage
- Maintainable component structure

### ✅ **Better UX:**
- Smooth navigation after login
- Proper state management
- No routing conflicts

## Files Created/Modified

### New Files:
1. **`src/context/NativeAppContext.tsx`**
   - Context untuk state management
   - Type definitions
   - Provider component

2. **`src/components/AppRouter.tsx`**
   - Navigation handling component
   - Router context usage
   - Auto-redirect logic

### Modified Files:
1. **`src/AppNative.tsx`**
   - Added NativeAppProvider
   - Added AppRouter wrapper
   - Updated component hierarchy

2. **`src/components/NativeAppWrapper.tsx`**
   - Removed navigation hooks
   - Using context for state
   - Cleaner component logic

## Testing

### Test Case 1: Login Flow
1. Start aplikasi
2. Complete setup (if needed)
3. Login dengan admin/admin123
4. **Expected**: Redirect ke dashboard tanpa error

### Test Case 2: Navigation
1. Login berhasil
2. Navigate to different routes
3. **Expected**: No routing errors, smooth navigation

### Test Case 3: State Management
1. Login/logout
2. Check state persistence
3. **Expected**: State properly managed through context

## Dependencies

- `react-router-dom`: Navigation hooks
- `React Context API`: State management
- No new external dependencies

## Rollback Plan

Jika ada masalah, rollback dengan:
1. Remove NativeAppProvider dari AppNative.tsx
2. Remove AppRouter wrapper
3. Restore original NativeAppWrapper structure
4. Remove context files

## Verification

Setelah fix ini, aplikasi akan:
- ✅ No more Router context errors
- ✅ Proper navigation after login
- ✅ Clean component architecture
- ✅ Maintainable code structure





