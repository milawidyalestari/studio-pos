# 📊 Panduan Migrasi Data: Supabase Cloud → Database Local

## 🎯 Overview
Panduan lengkap untuk memigrasikan data dari Supabase cloud ke database lokal (PostgreSQL/MySQL) untuk aplikasi Studio POS.

## 🔄 Metode Migrasi

### **Metode 1: Export/Import via SQL Dump**

#### **Step 1: Export Data dari Supabase**

```bash
# 1. Install PostgreSQL client tools
# Windows: Download dari postgresql.org
# Linux: sudo apt install postgresql-client
# macOS: brew install postgresql

# 2. Export schema dan data dari Supabase
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
  --verbose \
  --clean \
  --no-acl \
  --no-owner \
  --format=custom \
  --file=studio_pos_backup.dump

# Atau export dalam format SQL
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
  --verbose \
  --clean \
  --no-acl \
  --no-owner \
  --format=plain \
  --file=studio_pos_backup.sql
```

#### **Step 2: Setup Database Local**

**PostgreSQL Local:**
```bash
# 1. Install PostgreSQL locally
# 2. Create database
createdb studio_pos

# 3. Import data
pg_restore --verbose --clean --no-acl --no-owner \
  --host=localhost --port=5432 --username=postgres \
  --dbname=studio_pos studio_pos_backup.dump

# Atau dari SQL file
psql -h localhost -p 5432 -U postgres -d studio_pos -f studio_pos_backup.sql
```

**MySQL Local:**
```bash
# 1. Install MySQL locally
# 2. Create database
mysql -u root -p -e "CREATE DATABASE studio_pos;"

# 3. Convert PostgreSQL dump to MySQL (manual conversion needed)
# Atau gunakan tools seperti pgloader
```

### **Metode 2: Export/Import via API (Recommended untuk Studio POS)**

#### **Step 1: Create Export Script**

```javascript
// scripts/export-supabase-data.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_KEY = 'your-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const tables = [
  'products',
  'customers', 
  'suppliers',
  'orders',
  'order_items',
  'transactions',
  'categories',
  'groups',
  'units',
  'payment_types',
  'employees',
  'roles',
  'materials',
  'product_materials',
  'inventory_movements'
];

async function exportData() {
  const exportData = {};
  
  for (const table of tables) {
    console.log(`Exporting ${table}...`);
    
    const { data, error } = await supabase
      .from(table)
      .select('*');
      
    if (error) {
      console.error(`Error exporting ${table}:`, error);
      continue;
    }
    
    exportData[table] = data;
    console.log(`✓ Exported ${data.length} records from ${table}`);
  }
  
  // Save to JSON file
  fs.writeFileSync('studio_pos_export.json', JSON.stringify(exportData, null, 2));
  console.log('✅ Export completed! File saved as studio_pos_export.json');
}

exportData().catch(console.error);
```

#### **Step 2: Create Import Script untuk Local Database**

```javascript
// scripts/import-to-local.js
import fs from 'fs';
import { Client } from 'pg'; // untuk PostgreSQL
// import mysql from 'mysql2/promise'; // untuk MySQL

async function importToPostgreSQL() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'studio_pos',
    user: 'postgres',
    password: 'your_password',
  });

  await client.connect();
  
  const exportData = JSON.parse(fs.readFileSync('studio_pos_export.json', 'utf8'));
  
  // Import dalam urutan yang benar (menghindari foreign key conflicts)
  const importOrder = [
    'roles', 'employees', 'categories', 'groups', 'units', 'payment_types',
    'customers', 'suppliers', 'materials', 'products', 'product_materials',
    'orders', 'order_items', 'transactions', 'inventory_movements'
  ];
  
  for (const table of importOrder) {
    if (!exportData[table]) continue;
    
    console.log(`Importing ${table}...`);
    
    // Disable foreign key checks temporarily
    await client.query('SET session_replication_role = replica;');
    
    for (const record of exportData[table]) {
      const columns = Object.keys(record).join(', ');
      const values = Object.values(record);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      
      const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
      
      try {
        await client.query(query, values);
      } catch (error) {
        console.error(`Error inserting into ${table}:`, error.message);
      }
    }
    
    // Re-enable foreign key checks
    await client.query('SET session_replication_role = DEFAULT;');
    
    console.log(`✓ Imported ${exportData[table].length} records to ${table}`);
  }
  
  await client.end();
  console.log('✅ Import completed!');
}

importToPostgreSQL().catch(console.error);
```

### **Metode 3: Realtime Sync (Advanced)**

#### **Setup Continuous Sync**

```javascript
// scripts/realtime-sync.js
import { createClient } from '@supabase/supabase-js';
import { Client } from 'pg';

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
const localClient = new Client({
  host: 'localhost',
  port: 5432,
  database: 'studio_pos',
  user: 'postgres',
  password: 'your_password',
});

// Setup realtime subscription
const setupRealtimeSync = () => {
  tables.forEach(table => {
    supabaseClient
      .channel(`${table}_changes`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table },
        (payload) => syncToLocal(table, payload)
      )
      .subscribe();
  });
};

const syncToLocal = async (table, payload) => {
  const { eventType, new: newRecord, old: oldRecord } = payload;
  
  switch (eventType) {
    case 'INSERT':
      await insertToLocal(table, newRecord);
      break;
    case 'UPDATE':
      await updateLocal(table, newRecord);
      break;
    case 'DELETE':
      await deleteFromLocal(table, oldRecord);
      break;
  }
};
```

## 🛠️ Implementasi dalam Studio POS

Mari saya buat komponen UI untuk migrasi data dalam aplikasi:

### **Data Migration Component**

```typescript
// src/components/DataMigration.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, Database, CheckCircle, XCircle } from 'lucide-react';

export const DataMigration = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const handleExportData = async () => {
    setIsExporting(true);
    setProgress(0);
    
    try {
      // Implementation will call the export service
      await exportDataFromSupabase((progress) => setProgress(progress));
      setStatus('Export completed successfully!');
    } catch (error) {
      setStatus(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    setIsImporting(true);
    setProgress(0);
    
    try {
      await importDataToLocal((progress) => setProgress(progress));
      setStatus('Import completed successfully!');
    } catch (error) {
      setStatus(`Import failed: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Migration Tools
          </CardTitle>
          <CardDescription>
            Export data from Supabase cloud and import to local database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={handleExportData}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export from Supabase'}
            </Button>
            
            <Button 
              onClick={handleImportData}
              disabled={isImporting}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isImporting ? 'Importing...' : 'Import to Local'}
            </Button>
          </div>
          
          {(isExporting || isImporting) && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">{progress}% completed</p>
            </div>
          )}
          
          {status && (
            <Alert>
              {status.includes('failed') ? 
                <XCircle className="h-4 w-4" /> : 
                <CheckCircle className="h-4 w-4" />
              }
              <AlertDescription>{status}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
```

## 🔧 Setup Commands

### **Package.json Scripts**

```json
{
  "scripts": {
    "export-supabase": "node scripts/export-supabase-data.js",
    "import-local": "node scripts/import-to-local.js",
    "migrate-data": "npm run export-supabase && npm run import-local"
  }
}
```

### **Environment Variables**

```env
# .env.local
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
LOCAL_DB_HOST=localhost
LOCAL_DB_PORT=5432
LOCAL_DB_NAME=studio_pos
LOCAL_DB_USER=postgres
LOCAL_DB_PASSWORD=your_password
```

## ⚠️ Important Notes

### **Before Migration:**
1. **Backup existing local data** (jika ada)
2. **Test migration** dengan subset data terlebih dahulu
3. **Check foreign key constraints** dan dependencies
4. **Verify schema compatibility** antara cloud dan local

### **During Migration:**
1. **Monitor progress** dan log errors
2. **Handle large datasets** dengan batching
3. **Disable foreign key constraints** temporarily
4. **Use transactions** untuk data consistency

### **After Migration:**
1. **Verify data integrity** dengan sample checks
2. **Update sequences/auto-increment** values
3. **Recreate indexes** jika diperlukan
4. **Test aplikasi** dengan data yang dimigrasikan

## 🚀 Execution Steps

```bash
# 1. Setup local database
createdb studio_pos

# 2. Run migration scripts
npm install
npm run export-supabase
npm run import-local

# 3. Verify migration
psql -d studio_pos -c "SELECT COUNT(*) FROM products;"
psql -d studio_pos -c "SELECT COUNT(*) FROM orders;"
```

Panduan ini memberikan fleksibilitas untuk memilih metode migrasi yang sesuai dengan kebutuhan Anda, dari simple export/import hingga realtime sync yang lebih advanced.
