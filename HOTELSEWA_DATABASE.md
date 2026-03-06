# Using Existing hotelsewa Database

## Configuration Updated

✅ Backend now connects to existing `hotelsewa` database

### Connection String
```
mysql://root:@localhost:3306/hotelsewa
```

## Quick Setup

### Option 1: Automated Script
```bash
cd d:\OYO\OYO\backend
connect-hotelsewa.bat
```

### Option 2: Manual Setup
```bash
cd d:\OYO\OYO\backend\api

# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Sync schema (creates missing tables)
npx prisma db push

# 4. Start server
npm start
```

## Verify Connection

```bash
# Test database connection
curl http://localhost:4000/ready

# Should return: {"ok":true,"db":"up"}
```

## If You Have MySQL Password

Update `.env` file:
```bash
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/hotelsewa"
```

## Check Existing Tables

```bash
mysql -u root -e "USE hotelsewa; SHOW TABLES;"
```

## Prisma Will:
- ✅ Use existing tables if they match schema
- ✅ Create missing tables
- ✅ Add missing columns
- ⚠️ Won't delete existing data

## Start Server

```bash
cd d:\OYO\OYO\backend\api
npm start
```

Server runs on: http://localhost:4000

## Test Endpoints

```bash
# Health check
curl http://localhost:4000/health

# Database check
curl http://localhost:4000/ready

# Get hotels
curl http://localhost:4000/api/hotels
```

---

**Status**: ✅ Connected to hotelsewa database
**Updated**: Now
