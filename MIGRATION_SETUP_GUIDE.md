# 🚀 Migration Setup Guide: Supabase → Local Database

## 📋 Overview
This guide will help you set up the migration system to transfer data from Supabase (cloud) to your local database in the Electron app.

## 🔧 Prerequisites

### 1. Supabase Project Setup
- ✅ Have an active Supabase project
- ✅ Access to Supabase Dashboard
- ✅ Project URL and API keys

### 2. Environment Variables Setup

#### Step 1: Create `.env` file
Create a `.env` file in your project root:

```bash
# .env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
NODE_ENV=development
```

#### Step 2: Get Supabase Credentials
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon/Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### Step 3: Update `.env` file
Replace the placeholder values with your actual credentials:

```env
VITE_SUPABASE_URL=https://abc123def456.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiYzEyM2RlZjQ1NiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjM0NTY3ODkwLCJleHAiOjE5NTAxNDM4OTB9.example
NODE_ENV=development
```

## 🧪 Testing the Setup

### 1. Start Electron App
```bash
npm run electron:dev
```

### 2. Check Migration Wizard
1. Open the app
2. Go to **Settings** → **Migration** tab
3. Check the **Supabase Configuration** status:
   - ✅ **Configured**: Environment variables are set correctly
   - ❌ **Not configured**: Missing or invalid environment variables

### 3. Test Database Operations
1. Go to **Settings** → **Test** tab
2. Click **Run Database Tests**
3. Verify all tests pass

## 🔄 Migration Process

### Step 1: Export from Supabase
- Connects to your Supabase project
- Exports all data: customers, products, orders, suppliers, employees, transactions, categories
- Validates data integrity

### Step 2: Validate Data
- Checks data structure
- Validates required fields
- Ensures data consistency

### Step 3: Import to Local
- Creates tables in local database
- Imports all data
- Verifies import success

## 📊 Migration Statistics

### Data Types Migrated:
- **Customers**: All customer records
- **Products**: All products and inventory
- **Orders**: All order history
- **Suppliers**: Supplier information
- **Employees**: Employee data
- **Transactions**: Financial transactions
- **Categories**: Product/transaction categories

### Performance Estimates:
- **Small Data** (< 1,000 records): 2-5 minutes
- **Medium Data** (1,000-10,000 records): 5-15 minutes
- **Large Data** (> 10,000 records): 15-30 minutes

## 🛡️ Safety Features

### Data Protection:
- ✅ **Read-only Export**: Doesn't modify Supabase data
- ✅ **Validation**: Checks data before import
- ✅ **Error Recovery**: Handles failures gracefully
- ✅ **Progress Tracking**: Real-time progress updates

### Backup Recommendations:
```bash
# Before migration:
# 1. Export from Supabase Dashboard
# 2. Download database dump
# 3. Create local backup after migration
```

## 🐛 Troubleshooting

### Common Issues:

#### 1. "Supabase client not initialized"
**Solution**: Check your `.env` file
```bash
# Verify .env file exists and has correct values
cat .env
```

#### 2. "Invalid URL" Error
**Solution**: Check Supabase URL format
```env
# Correct format:
VITE_SUPABASE_URL=https://your-project-id.supabase.co

# Wrong format:
VITE_SUPABASE_URL=your-project-id.supabase.co
```

#### 3. "Authentication Error"
**Solution**: Verify API key
```bash
# Check if key is correct in Supabase Dashboard
# Settings → API → anon/public key
```

#### 4. "Database Connection Error"
**Solution**: Restart Electron app
```bash
npm run electron:dev
```

### Debug Steps:
1. **Check Environment Variables**:
   ```javascript
   console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
   console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);
   ```

2. **Test Supabase Connection**:
   ```javascript
   // In browser console
   const { createClient } = require('@supabase/supabase-js');
   const supabase = createClient(url, key);
   const { data, error } = await supabase.from('customers').select('*');
   console.log('Test result:', data, error);
   ```

3. **Check Electron Database**:
   ```javascript
   // In Electron app
   console.log('Electron API:', window.electronAPI);
   ```

## 📝 Environment Variables Reference

### Required Variables:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Optional Variables:
```env
NODE_ENV=development
ELECTRON_IS_DEV=true
```

### File Structure:
```
studio-pos/
├── .env                    # Environment variables (create this)
├── .env.example           # Template (optional)
├── src/
│   ├── services/
│   │   └── migrationService.ts
│   └── components/
│       └── MigrationWizard.tsx
└── electron/
    └── main.js
```

## 🎯 Next Steps

After successful migration:

1. **Verify Data**: Check all data imported correctly
2. **Test Features**: Ensure all app features work with local data
3. **Switch to Local**: Update app configuration to use local database
4. **Backup Strategy**: Set up regular local database backups

## 📞 Support

If you encounter issues:

1. **Check Console**: Look for error messages in browser/Electron console
2. **Verify Setup**: Ensure all prerequisites are met
3. **Test Connection**: Verify Supabase connection works
4. **Check Logs**: Review migration progress and error logs

---

**Ready to migrate?** 🚀

1. Set up your `.env` file with Supabase credentials
2. Start the Electron app: `npm run electron:dev`
3. Go to Settings → Migration tab
4. Click "Start Migration"

Good luck with your migration! 🎉

