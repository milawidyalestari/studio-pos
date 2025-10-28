# 📦 Studio POS - Complete Distribution Package Guide

## 🎯 Overview

Sistem distribusi lengkap yang memungkinkan pengguna untuk menginstall PostgreSQL dan Studio POS dengan mudah, kemudian aplikasi akan otomatis setup database dan siap digunakan.

## 📁 Package Contents

```
Studio_POS_Complete_v1.0.0.zip
├── Studio_POS/
│   ├── Studio POS.exe                    # Main application
│   ├── Studio POS Setup 1.0.0.exe       # Installer (optional)
│   └── [other app files]                 # Resources, etc.
├── PostgreSQL_Installer/
│   ├── install_postgresql.bat            # Auto PostgreSQL installer
│   ├── setup_database.js                 # Database setup script
│   └── download_postgresql.bat           # Download script
├── Database_Migrations/
│   ├── 01-core-schema/                   # Core database schema
│   ├── 02-tables/                        # Additional tables
│   ├── 03-columns-updates/               # Column updates
│   ├── 04-functions-triggers/            # Functions & triggers
│   ├── 05-data-seeds/                    # Default data
│   ├── 06-permissions/                   # Roles & permissions
│   ├── apply_all_migrations.sql          # Apply all migrations
│   └── rollback_all_migrations.sql       # Rollback migrations
├── Documentation/
│   ├── INSTALLATION_GUIDE.md             # Installation guide
│   └── USER_MANUAL.md                    # User manual
└── README.txt                            # Quick start guide
```

## 🚀 Installation Flow

### **Step 1: Install PostgreSQL**
```bash
# Run as Administrator
PostgreSQL_Installer\install_postgresql.bat
```

**What it does:**
- Downloads PostgreSQL 15.4 installer
- Installs PostgreSQL silently
- Creates `studio_pos` database
- Sets up default user: `postgres` / `StudioPOS2024!`
- Configures service to start automatically

### **Step 2: Install Studio POS**
```bash
# Option A: Use installer
Studio_POS\Studio POS Setup 1.0.0.exe

# Option B: Run portable version
Studio_POS\Studio POS.exe
```

### **Step 3: First Run (Automatic Setup)**
1. **Launch Studio POS**
2. **Database Migration Screen** appears automatically
3. **Click "Setup Database"** button
4. **Wait for completion** (creates all tables, functions, triggers)
5. **Login screen** appears
6. **Login with:** `admin` / `admin123`

## 🔧 Technical Details

### **Database Configuration**
```javascript
// Default PostgreSQL settings
{
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'StudioPOS2024!',
  database: 'studio_pos'
}
```

### **Migration Process**
1. **Check Database Status** - Verify PostgreSQL connection
2. **Run Core Schema** - Create basic tables structure
3. **Create Additional Tables** - Orders, products, customers, etc.
4. **Setup Functions & Triggers** - Auto-update, inventory deduction
5. **Seed Default Data** - Categories, admin user, sample data
6. **Configure Permissions** - User roles and access control

### **Auto-Setup Features**
- ✅ **Database Detection** - Automatically detects PostgreSQL
- ✅ **Schema Migration** - Runs all migration scripts
- ✅ **Default User Creation** - Creates admin user
- ✅ **Error Handling** - Graceful error recovery
- ✅ **Progress Tracking** - Visual setup progress
- ✅ **Verification** - Confirms setup completion

## 📋 System Requirements

### **Minimum Requirements**
- **OS:** Windows 10/11 (64-bit)
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 2GB free space
- **Network:** Internet connection (for PostgreSQL download)

### **Recommended Requirements**
- **OS:** Windows 11 (64-bit)
- **RAM:** 8GB or more
- **Storage:** 5GB free space
- **Network:** Stable internet connection

## 🛠️ Troubleshooting

### **PostgreSQL Installation Issues**

#### **Problem: "Access Denied" Error**
```bash
# Solution: Run as Administrator
Right-click install_postgresql.bat → "Run as administrator"
```

#### **Problem: Port 5432 Already in Use**
```bash
# Solution: Check for existing PostgreSQL
netstat -an | findstr :5432

# If port is used, either:
# 1. Uninstall existing PostgreSQL
# 2. Change port in install_postgresql.bat
```

#### **Problem: Download Failed**
```bash
# Solution: Manual download
1. Run download_postgresql.bat
2. Or download from: https://www.postgresql.org/download/
3. Run installer manually
```

### **Studio POS Issues**

#### **Problem: "Database Connection Failed"**
```bash
# Check PostgreSQL service
services.msc → PostgreSQL → Start

# Check connection settings
# Default: localhost:5432, postgres/StudioPOS2024!
```

#### **Problem: "Migration Failed"**
```bash
# Solution: Manual migration
1. Open Command Prompt as Administrator
2. cd to Database_Migrations folder
3. Run: psql -U postgres -d studio_pos -f apply_all_migrations.sql
```

#### **Problem: "Login Failed"**
```bash
# Default credentials:
Username: admin
Password: admin123

# If still fails, check users table:
psql -U postgres -d studio_pos -c "SELECT * FROM users;"
```

## 🔄 Manual Setup (Advanced)

### **Step 1: Manual PostgreSQL Setup**
```bash
# Download and install PostgreSQL manually
# Create database
psql -U postgres -c "CREATE DATABASE studio_pos;"
```

### **Step 2: Manual Database Migration**
```bash
# Run migration scripts
psql -U postgres -d studio_pos -f apply_all_migrations.sql

# Or run individual scripts
psql -U postgres -d studio_pos -f 01-core-schema/001_initial_database_setup.sql
psql -U postgres -d studio_pos -f 02-tables/001_orders_table.sql
# ... continue with other scripts
```

### **Step 3: Manual User Creation**
```sql
-- Create admin user
INSERT INTO users (id, username, password, email, role, full_name, is_active) 
VALUES ('admin', 'admin', 'admin123', 'admin@studio-pos.com', 'admin', 'Administrator', 1);
```

## 📊 Database Schema Overview

### **Core Tables**
- `users` - User accounts and authentication
- `transactions` - Financial transactions
- `categories` - Income/expense categories
- `orders` - Customer orders
- `products` - Product inventory
- `customers` - Customer information
- `suppliers` - Supplier information
- `employees` - Employee records

### **Key Features**
- **Auto-increment IDs** - UUID primary keys
- **Timestamps** - Created/updated timestamps
- **Indexes** - Performance optimization
- **Constraints** - Data integrity
- **Triggers** - Auto-update functionality
- **Functions** - Business logic

## 🎉 Success Indicators

### **PostgreSQL Installation Success**
- ✅ PostgreSQL service running
- ✅ Port 5432 accessible
- ✅ `studio_pos` database created
- ✅ `postgres` user can connect

### **Studio POS Setup Success**
- ✅ All tables created
- ✅ Functions and triggers installed
- ✅ Default data seeded
- ✅ Admin user created
- ✅ Login screen appears

### **Application Ready**
- ✅ Login with admin/admin123 works
- ✅ Dashboard loads successfully
- ✅ All modules accessible
- ✅ Database operations work

## 📞 Support

### **Common Issues & Solutions**
1. **Installation fails** → Run as Administrator
2. **Database connection fails** → Check PostgreSQL service
3. **Migration fails** → Check database permissions
4. **Login fails** → Verify user table data
5. **App crashes** → Check console logs

### **Log Files**
- **PostgreSQL logs:** `C:\Program Files\PostgreSQL\15\data\log\`
- **Studio POS logs:** Check console output
- **Migration logs:** Displayed in migration screen

### **Reset Everything**
```bash
# Complete reset
1. Uninstall PostgreSQL
2. Delete studio_pos database
3. Re-run install_postgresql.bat
4. Re-run Studio POS
```

## 🎯 Best Practices

### **For End Users**
1. **Always run as Administrator** for installation
2. **Keep PostgreSQL running** while using Studio POS
3. **Backup database regularly** using pg_dump
4. **Update Studio POS** when new versions available

### **For Developers**
1. **Test installation** on clean Windows machine
2. **Verify all migrations** work correctly
3. **Check error handling** for edge cases
4. **Document any custom changes**

---

## 🚀 **Ready to Distribute!**

Package ini sudah siap untuk didistribusikan ke pengguna. Semua komponen telah terintegrasi dengan baik:

✅ **PostgreSQL Auto Installer** - Install database otomatis
✅ **Studio POS Application** - Aplikasi utama
✅ **Database Migration System** - Setup database otomatis
✅ **Complete Documentation** - Panduan lengkap
✅ **Error Handling** - Penanganan error yang baik
✅ **User-Friendly Interface** - Interface yang mudah digunakan

**Total Package Size:** ~150MB (includes PostgreSQL installer)
**Installation Time:** ~5-10 minutes
**Setup Time:** ~2-3 minutes (first run)

**Studio POS siap untuk distribusi profesional!** 🎉

