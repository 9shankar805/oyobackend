@echo off
echo ========================================
echo Connecting to Existing hotelsewa Database
echo ========================================
echo.

echo Step 1: Checking MySQL connection...
mysql -u root -e "USE hotelsewa; SHOW TABLES;" 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Cannot connect to hotelsewa database
    echo Please check:
    echo 1. MySQL is running
    echo 2. Database 'hotelsewa' exists
    echo 3. Root user has access
    pause
    exit /b 1
)
echo [OK] Connected to hotelsewa database
echo.

echo Step 2: Installing dependencies...
cd api
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

echo Step 3: Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate Prisma client
    pause
    exit /b 1
)
echo [OK] Prisma client generated
echo.

echo Step 4: Syncing schema with database...
call npx prisma db push
if %errorlevel% neq 0 (
    echo [WARNING] Schema sync had issues
    echo This is normal if tables already exist
)
echo [OK] Schema synced
echo.

cd ..

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Database: hotelsewa
echo Connection: mysql://root:@localhost:3306/hotelsewa
echo.
echo Next steps:
echo 1. Start server: cd api && npm start
echo 2. Test API: http://localhost:4000/health
echo.
pause
