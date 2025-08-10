# Studio POS - Migration Guide

## Overview

This guide explains how to migrate your Studio POS application from local storage to a proper database system. The migration process will move all your existing data (transactions, categories, cash register configurations, products, and settings) from the browser's local storage to a PostgreSQL database.

## Prerequisites

Before starting the migration, ensure you have:

1. **Database Setup**: A PostgreSQL database server running and accessible
2. **Database Credentials**: Connection details (host, port, username, password, database name)
3. **Backup**: A complete backup of your current local storage data
4. **Application Access**: Studio POS application running and accessible

## Database Setup

### 1. Install PostgreSQL

- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **macOS**: Use Homebrew: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql postgresql-contrib` (Ubuntu/Debian)

### 2. Create Database

```sql
-- Connect to PostgreSQL as superuser
sudo -u postgres psql

-- Create database and user
CREATE DATABASE studio_pos;
CREATE USER studio_pos_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE studio_pos TO studio_pos_user;

-- Connect to the new database
\c studio_pos

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO studio_pos_user;
```

### 3. Run Migration Scripts

Execute the migration scripts in order:

```bash
# Connect to your database
psql -h localhost -U studio_pos_user -d studio_pos

# Run the initial schema migration
\i src/migrations/001_initial_schema.sql

# Run the migration functions
\i src/migrations/002_migrate_local_storage.sql
```

## Migration Process

### Step 1: Backup Your Data

Before starting migration, create a backup of your current data:

1. Open Studio POS application
2. Navigate to **Settings** → **Migration Tool**
3. Click **"Backup Local Storage"**
4. Save the backup file to a secure location

### Step 2: Configure Database Connection

1. Update your environment variables or configuration file:

```env
# .env file
VITE_DATABASE_URL=postgresql://studio_pos_user:your_password@localhost:5432/studio_pos
VITE_DATABASE_HOST=localhost
VITE_DATABASE_PORT=5432
VITE_DATABASE_NAME=studio_pos
VITE_DATABASE_USER=studio_pos_user
VITE_DATABASE_PASSWORD=your_secure_password
```

### Step 3: Start Migration

1. Open the **Migration Tool** from Settings
2. Review the migration overview
3. Click **"Start Migration"**
4. Monitor the progress in real-time
5. Wait for completion

### Step 4: Verify Migration

After migration completes:

1. Check the migration status for all tables
2. Verify data integrity in your database
3. Test the application functionality
4. Keep your local storage backup as a safety measure

## Migration Details

### What Gets Migrated

| Data Type | Description | Storage Location |
|-----------|-------------|------------------|
| **Categories** | Income/expense categories | `categories` table |
| **Transactions** | Financial transactions | `transactions` table |
| **Cash Register Configs** | Hardware configurations | `cash_register_configs` table |
| **Products** | Product catalog | `products` table |
| **App Settings** | Application configuration | `app_settings` table |

### Migration Process Flow

```
Local Storage → Validation → Database Insert → Verification → Status Update
```

### Data Validation

During migration, the system:

- Checks for duplicate records
- Validates data integrity
- Handles missing or corrupted data gracefully
- Provides detailed error reporting

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Error**: "Failed to connect to database"

**Solution**:
- Verify database server is running
- Check connection credentials
- Ensure firewall allows connections
- Verify database exists and is accessible

#### 2. Migration Stuck

**Error**: Migration progress stops

**Solution**:
- Check database logs for errors
- Verify sufficient disk space
- Check database connection stability
- Restart migration if necessary

#### 3. Data Loss Concerns

**Error**: Missing data after migration

**Solution**:
- Restore from backup
- Check migration logs
- Verify database constraints
- Contact support if needed

### Recovery Procedures

#### Restore from Backup

1. Open Migration Tool
2. Click "Restore from Backup"
3. Select your backup file
4. Confirm restoration
5. Verify data integrity

#### Partial Migration Recovery

1. Check migration status
2. Identify failed tables
3. Restore specific data from backup
4. Re-run migration for failed tables

## Post-Migration

### 1. Update Application Configuration

Ensure your application points to the new database:

```typescript
// Update database service configuration
const databaseConfig = {
  type: 'postgresql',
  host: process.env.VITE_DATABASE_HOST,
  port: process.env.VITE_DATABASE_PORT,
  database: process.env.VITE_DATABASE_NAME,
  username: process.env.VITE_DATABASE_USER,
  password: process.env.VITE_DATABASE_PASSWORD
};
```

### 2. Test Functionality

Verify all features work correctly:

- [ ] Financial transactions
- [ ] Category management
- [ ] Cash register operations
- [ ] Product management
- [ ] Settings persistence

### 3. Performance Monitoring

Monitor database performance:

- Query execution times
- Connection pool usage
- Disk I/O performance
- Memory usage

## Security Considerations

### Database Security

1. **Strong Passwords**: Use complex, unique passwords
2. **Network Security**: Restrict database access to application servers
3. **Regular Updates**: Keep PostgreSQL updated
4. **Backup Encryption**: Encrypt backup files
5. **Access Control**: Limit database user privileges

### Application Security

1. **Environment Variables**: Never commit credentials to version control
2. **Connection Pooling**: Use connection pooling for better security
3. **Input Validation**: Validate all database inputs
4. **SQL Injection**: Use parameterized queries

## Backup Strategy

### Automated Backups

Set up regular database backups:

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U studio_pos_user studio_pos > backup_$DATE.sql
gzip backup_$DATE.sql
```

### Backup Retention

- **Daily backups**: Keep for 7 days
- **Weekly backups**: Keep for 4 weeks
- **Monthly backups**: Keep for 12 months
- **Yearly backups**: Keep indefinitely

## Support and Maintenance

### Regular Maintenance

1. **Database Optimization**: Regular VACUUM and ANALYZE
2. **Index Maintenance**: Monitor and optimize indexes
3. **Log Rotation**: Manage database logs
4. **Performance Tuning**: Monitor and adjust configuration

### Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review application logs
3. Check database logs
4. Contact technical support

## Migration Checklist

### Pre-Migration

- [ ] Database server installed and running
- [ ] Database created with proper permissions
- [ ] Migration scripts ready
- [ ] Local storage backup created
- [ ] Application configuration updated
- [ ] Team notified of maintenance window

### During Migration

- [ ] Migration tool opened
- [ ] Progress monitored
- [ ] Errors addressed immediately
- [ ] Completion verified
- [ ] Data integrity checked

### Post-Migration

- [ ] Application functionality tested
- [ ] Performance monitored
- [ ] Backup strategy implemented
- [ ] Team trained on new system
- [ ] Documentation updated

## Conclusion

The migration from local storage to a proper database system will significantly improve your Studio POS application's reliability, performance, and scalability. Follow this guide carefully, and don't hesitate to seek help if you encounter any issues.

Remember: **Always backup your data before starting any migration process!**
