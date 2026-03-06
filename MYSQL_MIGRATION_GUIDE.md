# Database Migration Guide: SQLite to MySQL

## Overview
This guide helps you migrate from SQLite to MySQL for production readiness.

## Prerequisites

### 1. Install MySQL
**Windows:**
- Download MySQL Installer from https://dev.mysql.com/downloads/installer/
- Install MySQL Server 8.0+
- Set root password during installation

**macOS:**
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

**Linux:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

### 2. Verify MySQL Installation
```bash
mysql --version
mysql -u root -p
```

## Migration Steps

### Step 1: Create MySQL Database
```bash
# Login to MySQL
mysql -u root -p

# Run the setup script
source setup-mysql.sql

# Or manually create database
CREATE DATABASE oyo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

### Step 2: Update Environment Variables
```bash
# Edit .env file
DATABASE_URL="mysql://root:your_password@localhost:3306/oyo_db"
```

### Step 3: Generate Prisma Client
```bash
cd backend/api
npm run db:generate
```

### Step 4: Push Schema to MySQL
```bash
npm run db:push
```

### Step 5: Verify Migration
```bash
# Check tables were created
mysql -u root -p oyo_db -e "SHOW TABLES;"
```

### Step 6: Seed Database (Optional)
```bash
npm run db:seed
```

## Production Database Options

### Option 1: PlanetScale (Recommended)
- Serverless MySQL platform
- Free tier available
- Automatic backups
- Easy scaling
- https://planetscale.com

**Setup:**
1. Create account at planetscale.com
2. Create new database
3. Get connection string
4. Update DATABASE_URL in .env

```bash
DATABASE_URL="mysql://username:password@host.connect.psdb.cloud/database?sslaccept=strict"
```

### Option 2: AWS RDS MySQL
- Managed MySQL service
- High availability
- Automatic backups
- Scalable

**Setup:**
1. Create RDS MySQL instance in AWS Console
2. Configure security groups
3. Get endpoint URL
4. Update DATABASE_URL

```bash
DATABASE_URL="mysql://admin:password@database.region.rds.amazonaws.com:3306/oyo_db"
```

### Option 3: DigitalOcean Managed MySQL
- Simple setup
- Affordable pricing
- Automatic backups

**Setup:**
1. Create Managed MySQL database
2. Add trusted sources
3. Get connection details
4. Update DATABASE_URL

### Option 4: Google Cloud SQL
- Fully managed MySQL
- High performance
- Automatic backups

## Troubleshooting

### Error: "Can't connect to MySQL server"
```bash
# Check if MySQL is running
sudo systemctl status mysql  # Linux
brew services list           # macOS

# Start MySQL
sudo systemctl start mysql   # Linux
brew services start mysql    # macOS
```

### Error: "Access denied for user"
```bash
# Reset MySQL root password
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'new_password';
FLUSH PRIVILEGES;
exit;
```

### Error: "Unknown database"
```bash
# Create database manually
mysql -u root -p
CREATE DATABASE oyo_db;
exit;
```

### Error: "Prisma schema validation failed"
```bash
# Regenerate Prisma client
npx prisma generate
```

## Data Migration (If you have existing SQLite data)

### Export from SQLite
```bash
# Install sqlite3
npm install -g sqlite3

# Export data
sqlite3 prisma/dev.db .dump > sqlite_dump.sql
```

### Convert and Import to MySQL
```bash
# Manual conversion needed - SQLite and MySQL have different syntax
# Use online converters or manual SQL editing
# Then import:
mysql -u root -p oyo_db < converted_dump.sql
```

## Performance Optimization

### Add Indexes (Already in schema)
```sql
-- Prisma automatically creates indexes for:
-- - Foreign keys
-- - Unique fields
-- - @index directives
```

### Connection Pooling
Prisma automatically handles connection pooling. Configure in schema.prisma:
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  relationMode = "prisma"
}
```

## Backup Strategy

### Local Development
```bash
# Backup database
mysqldump -u root -p oyo_db > backup_$(date +%Y%m%d).sql

# Restore database
mysql -u root -p oyo_db < backup_20240101.sql
```

### Production
- Use managed database automatic backups
- Set up daily backup schedule
- Test restore procedures regularly

## Monitoring

### Check Database Size
```sql
SELECT 
  table_schema AS 'Database',
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'oyo_db'
GROUP BY table_schema;
```

### Check Table Sizes
```sql
SELECT 
  table_name AS 'Table',
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'oyo_db'
ORDER BY (data_length + index_length) DESC;
```

## Next Steps

1. ✅ MySQL installed and running
2. ✅ Database created
3. ✅ Schema migrated
4. ✅ Application connected
5. ⏭️ Test all API endpoints
6. ⏭️ Set up production database
7. ⏭️ Configure backups
8. ⏭️ Monitor performance

## Support

For issues:
- Prisma Docs: https://www.prisma.io/docs
- MySQL Docs: https://dev.mysql.com/doc/
- Stack Overflow: Tag with `prisma` and `mysql`
