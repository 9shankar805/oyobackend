@echo off
echo ========================================
echo OYO Backend - MySQL Migration Script
echo ========================================
echo.

echo Step 1: Checking MySQL installation...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] MySQL is not installed or not in PATH
    echo Please install MySQL from: https://dev.mysql.com/downloads/installer/
    pause
    exit /b 1
)
echo [OK] MySQL is installed
echo.

echo Step 2: Creating database...
echo Please enter your MySQL root password when prompted
mysql -u root -p < api\setup-mysql.sql
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create database
    pause
    exit /b 1
)
echo [OK] Database created
echo.

echo Step 3: Installing dependencies...
cd api
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

echo Step 4: Generating Prisma client...
call npm run db:generate
if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate Prisma client
    pause
    exit /b 1
)
echo [OK] Prisma client generated
echo.

echo Step 5: Pushing schema to MySQL...
call npm run db:push
if %errorlevel% neq 0 (
    echo [ERROR] Failed to push schema
    pause
    exit /b 1
)
echo [OK] Schema pushed to MySQL
echo.

echo Step 6: Seeding database (optional)...
set /p seed="Do you want to seed the database with sample data? (y/n): "
if /i "%seed%"=="y" (
    call npm run db:seed
    echo [OK] Database seeded
)
echo.

cd ..

echo ========================================
echo Migration Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Update .env file with your MySQL credentials
echo 2. Start the server: npm start
echo 3. Test API endpoints
echo.
echo For production deployment, see MYSQL_MIGRATION_GUIDE.md
echo.
pause
