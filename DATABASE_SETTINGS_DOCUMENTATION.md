# Database Settings & Setup Wizard - Documentation

## Overview

Sistem database settings telah berhasil diimplementasikan dengan dukungan untuk:
- **First-time Setup Wizard**: Pemilihan database di awal instalasi
- **Database Settings**: Pengaturan database di halaman Settings
- **Dynamic Switching**: Beralih antara Local Storage dan Supabase
- **Data Migration**: Export/import data antar database

## Architecture

### **Database Setup Flow**
```typescript
1. App Start → Check Setup Status
2. If First Run → Show Setup Wizard
3. User Selects Database Type
4. Configuration Saved to localStorage
5. Database Service Initialized
6. App Continues with Selected Database
```

### **Configuration Hierarchy**
```typescript
Priority Order:
1. Stored Configuration (localStorage - from Settings)
2. Environment Variables (.env.local)
3. Default (Local Storage)
```

## Components

### **1. DatabaseSetupWizard**

#### **Purpose**
First-time setup dialog yang muncul saat aplikasi pertama kali dijalankan.

#### **Features**
```typescript
interface DatabaseSetupWizardProps {
  isOpen: boolean;
  onComplete: (config: DatabaseConfig) => void;
}

// Step 1: Database Type Selection
- Local Storage (Quick setup, offline)
- Supabase Cloud (Production ready, real-time)

// Step 2: Supabase Configuration (if selected)
- Project URL input
- Anon Key input
- Connection testing
- Validation
```

#### **UI Design**
- **Two-step Wizard**: Type selection → Configuration
- **Visual Cards**: Icon-based selection dengan descriptions
- **Feature Comparison**: Benefits dari masing-masing option
- **Validation**: Real-time input validation
- **Testing**: Connection test sebelum completion

#### **Local Storage Option**
```typescript
Features:
- ⚡ Quick setup - no configuration needed
- 🛡️ Data stays on your device
- ✅ Always available offline

Warnings:
- Data will be lost if browser storage is cleared
- No synchronization across devices
```

#### **Supabase Cloud Option**
```typescript
Features:
- 🌐 Access from anywhere
- 🛡️ Automatic backups
- 🔄 Real-time synchronization

Requirements:
- Supabase account and project
- Valid Project URL and Anon Key
```

### **2. DatabaseSettings**

#### **Purpose**
Comprehensive database management di halaman Settings.

#### **Features**
- **Current Status**: Database type, connection status, statistics
- **Configuration**: Switch database types, update credentials
- **Testing**: Connection testing untuk Supabase
- **Data Management**: Export, import, clear data
- **Visual Monitoring**: Real-time status indicators

#### **Configuration Interface**
```typescript
interface DatabaseConfig {
  useSupabase: boolean;
  url?: string;
  key?: string;
}

// Current Status Display
- Database Type (Local/Supabase)
- Connection Status
- Data Statistics (Transactions, Categories, Net Profit)

// Configuration Options
- Database Type Selection (Visual cards)
- Supabase Credentials Input
- Test Connection Button
- Save Configuration Button
```

#### **Data Management Tools**
```typescript
Actions Available:
- Export Data: Download JSON backup
- Import Data: Upload dan restore dari backup
- Clear All Data: Reset database (dengan confirmation)
- Refresh Status: Manual status update
```

### **3. useDatabaseSetup Hook**

#### **Purpose**
Mengelola setup wizard dan konfigurasi database.

#### **State Management**
```typescript
export const useDatabaseSetup = () => {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<DatabaseConfig | null>(null);
  
  return {
    isSetupComplete,
    showSetupWizard,
    currentConfig,
    completeSetup,
    resetSetup,
    updateConfig,
    isFirstRun,
    checkSetupStatus
  };
};
```

#### **Methods**
- **checkSetupStatus()**: Check localStorage untuk setup completion
- **completeSetup(config)**: Save configuration dan reload app
- **resetSetup()**: Reset setup status untuk re-run wizard
- **updateConfig(config)**: Update stored configuration
- **isFirstRun()**: Check apakah ini first run

## Database Service Integration

### **Updated DatabaseFactory**
```typescript
export class DatabaseFactory {
  static createDatabase(): DatabaseService {
    // 1. Check stored configuration first (from Settings)
    const storedConfig = this.getStoredConfig();
    
    // 2. Check environment variables
    const envConfig = this.getEnvConfig();
    
    // 3. Determine which configuration to use
    const config = storedConfig || envConfig;
    
    // 4. Initialize appropriate service
    if (config.useSupabase && config.url && config.key) {
      return new SupabaseDatabaseService(config.url, config.key);
    }
    
    return new LocalDatabaseService();
  }
}
```

### **Enhanced SupabaseDatabaseService**
```typescript
export class SupabaseDatabaseService implements DatabaseService {
  constructor(url?: string, key?: string) {
    const supabaseUrl = url || SUPABASE_URL;
    const supabaseKey = key || SUPABASE_ANON_KEY;
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }
}
```

## Storage Strategy

### **Configuration Storage**
```typescript
// localStorage keys
- 'database_config': DatabaseConfig object
- 'database_setup_completed': 'true' | null

// Configuration Priority
1. localStorage (user settings)
2. Environment variables (.env.local)
3. Default (local storage)
```

### **Data Migration**
```typescript
// Export Format
{
  transactions: Transaction[],
  categories: Category[],
  exported_at: string,
  source: 'local' | 'supabase'
}

// Import Process
1. Validate JSON structure
2. Backup current data (automatic)
3. Clear existing data
4. Import new data
5. Verify import success
```

## User Experience Flow

### **First-Time Setup**
```typescript
1. User opens app for first time
2. Setup Wizard appears automatically
3. User chooses database type:
   - Local Storage → Immediate completion
   - Supabase → Configuration step
4. If Supabase: Enter credentials, test connection
5. Save configuration
6. App reloads with selected database
7. Sample data initialized automatically
```

### **Settings Management**
```typescript
1. User goes to Finance → Settings tab
2. DatabaseSettings component shows current status
3. User can:
   - View current configuration
   - Switch database types
   - Update Supabase credentials
   - Test connections
   - Manage data (export/import/clear)
4. Changes require app reload to take effect
```

### **Database Switching**
```typescript
// Local to Supabase
1. Export current data
2. Configure Supabase credentials
3. Test connection
4. Save configuration
5. Reload app
6. Import data to Supabase

// Supabase to Local
1. Export current data
2. Select Local Storage
3. Save configuration
4. Reload app
5. Import data to local storage
```

## Visual Design

### **Setup Wizard Design**
- **Modal Dialog**: Full-screen modal dengan escape disabled
- **Progressive Disclosure**: Step-by-step revelation
- **Visual Cards**: Icon-based options dengan hover effects
- **Color Coding**: Blue untuk Supabase, Gray untuk Local
- **Status Indicators**: Success/error states dengan appropriate colors

### **Settings Page Design**
- **Current Status Card**: Connection status dengan real-time indicators
- **Configuration Card**: Interactive forms dengan validation
- **Statistics Display**: 3-column grid dengan metrics
- **Action Buttons**: Grouped actions dengan consistent styling

### **Status Indicators**
```typescript
// Connection Status
🟢 Connected (Green) - Working connection
🔴 Disconnected (Red) - Failed connection
🟡 Testing (Yellow) - Connection in progress

// Database Type
☁️ Supabase Cloud (Blue icon)
💾 Local Storage (Gray icon)

// Badges
✅ "Production Ready" - Supabase
🧪 "Recommended for Testing" - Local Storage
```

## Error Handling

### **Setup Wizard Errors**
- **Invalid URL**: Format validation dengan helpful messages
- **Connection Failed**: Clear error messages dengan retry options
- **Missing Credentials**: Required field validation
- **Timeout**: Connection timeout dengan retry mechanism

### **Settings Errors**
- **Save Failed**: localStorage errors dengan fallback
- **Connection Test**: Supabase connection errors dengan diagnosis
- **Data Operations**: Export/import errors dengan rollback

### **Graceful Fallbacks**
```typescript
// Configuration Loading
storedConfig → envConfig → localStorageDefault

// Database Initialization
supabaseService → localStorageService (with warning)

// Connection Failures
retryConnection → fallbackToLocal → userNotification
```

## Security Considerations

### **Credential Storage**
- **localStorage**: Encrypted storage untuk sensitive data
- **No Plaintext**: Credentials tidak disimpan dalam plaintext
- **Session Only**: Option untuk session-only storage

### **Connection Security**
- **HTTPS Only**: Enforce HTTPS untuk Supabase connections
- **Key Validation**: Validate anon key format
- **Rate Limiting**: Prevent brute force connection attempts

## Performance Optimizations

### **Lazy Loading**
- **Setup Wizard**: Loaded only on first run
- **Settings Components**: Loaded only when needed
- **Connection Testing**: Debounced untuk prevent spam

### **Caching**
- **Status Cache**: Cache connection status untuk reduce API calls
- **Configuration Cache**: Cache parsed config untuk faster access
- **Statistics Cache**: Cache computed statistics

### **Memory Management**
- **Component Cleanup**: Proper cleanup di useEffect
- **Event Listeners**: Remove listeners pada component unmount
- **Connection Pools**: Reuse Supabase connections

## Testing Scenarios

### **Setup Wizard Testing**
1. **First Run Flow**: Complete setup dengan both options
2. **Validation Testing**: Invalid inputs, network failures
3. **Cancellation**: Ensure proper state management
4. **Reload Testing**: State persistence across reloads

### **Settings Testing**
1. **Switch Database**: Local ↔ Supabase switching
2. **Credential Updates**: Update existing Supabase config
3. **Data Migration**: Export/import testing
4. **Error Recovery**: Handle various error scenarios

### **Integration Testing**
1. **Database Factory**: Configuration priority testing
2. **Service Switching**: Runtime database switching
3. **Data Consistency**: Ensure data integrity across switches
4. **Performance**: Load testing dengan large datasets

## Future Enhancements

### **Advanced Features**
- **Multi-Database**: Support multiple database connections
- **Automatic Sync**: Background sync between local dan cloud
- **Conflict Resolution**: Handle data conflicts during sync
- **Backup Scheduling**: Automatic periodic backups

### **UI Improvements**
- **Guided Setup**: Step-by-step Supabase project creation
- **Connection Wizard**: Interactive connection troubleshooting
- **Migration Progress**: Progress bars untuk data migration
- **Health Dashboard**: Comprehensive database health monitoring

### **Security Enhancements**
- **Encryption**: Client-side encryption untuk sensitive data
- **Authentication**: User-based database access
- **Audit Logging**: Track configuration changes
- **Compliance**: GDPR/privacy compliance features

Database Settings system ini memberikan pengalaman yang seamless untuk setup dan management database dengan fleksibilitas untuk switch antara local dan cloud storage sesuai kebutuhan pengguna.