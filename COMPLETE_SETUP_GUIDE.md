# Complete Database Setup for hotelsewa

## Issue Found
The existing `hotelsewa` database has 2 hotels but missing required columns.

## Solution: Manual Migration

### Step 1: Run MySQL Commands

Open MySQL command line or MySQL Workbench and run:

```sql
USE hotelsewa;

-- Add missing columns with defaults
ALTER TABLE hotels 
  ADD COLUMN city VARCHAR(191) DEFAULT 'Unknown',
  ADD COLUMN state VARCHAR(191) DEFAULT 'Unknown',
  ADD COLUMN pincode VARCHAR(191) DEFAULT '000000',
  ADD COLUMN phone VARCHAR(191) DEFAULT '0000000000',
  ADD COLUMN email VARCHAR(191) DEFAULT 'noemail@example.com';

-- Make columns NOT NULL
ALTER TABLE hotels 
  MODIFY COLUMN city VARCHAR(191) NOT NULL,
  MODIFY COLUMN state VARCHAR(191) NOT NULL,
  MODIFY COLUMN pincode VARCHAR(191) NOT NULL,
  MODIFY COLUMN phone VARCHAR(191) NOT NULL,
  MODIFY COLUMN email VARCHAR(191) NOT NULL;
```

### Step 2: Sync Prisma Schema

```bash
cd d:\OYO\OYO\backend\api
npx prisma db push
```

### Step 3: Start Server

```bash
npm start
```

## Alternative: Fresh Start (Loses existing data)

If you don't need existing data:

```bash
cd d:\OYO\OYO\backend\api
npx prisma db push --force-reset
npm start
```

## Verify Setup

```bash
# Test health
curl http://localhost:5555/health

# Test database
curl http://localhost:5555/ready

# Get hotels
curl http://localhost:5555/api/hotels
```

## All Tables Created

After migration, these tables will exist:

### Core Tables
- ✅ users (customers, owners, admins)
- ✅ hotels
- ✅ rooms
- ✅ bookings
- ✅ payments
- ✅ reviews

### Communication
- ✅ messages
- ✅ conversations
- ✅ notifications

### Features
- ✅ offers
- ✅ amenities
- ✅ documents
- ✅ support_tickets
- ✅ withdrawals

### Calendar System
- ✅ calendar_daily_data
- ✅ calendar_bookings
- ✅ calendar_room_availability
- ✅ calendar_pricing
- ✅ calendar_analytics

### Chat System
- ✅ chat_conversations
- ✅ chat_messages
- ✅ chat_online_status
- ✅ chat_analytics

### Analytics
- ✅ offer_analytics

### Wallet System
- ✅ wallets
- ✅ wallet_transactions

### Coupons
- ✅ coupons
- ✅ coupon_usages

### Saved Hotels
- ✅ saved_hotels

## API Endpoints Available

### Customer App APIs
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/google
- GET /api/customer/hotels
- GET /api/customer/hotels/:id
- POST /api/customer/bookings
- GET /api/customer/bookings
- POST /api/customer/payments
- GET /api/customer/profile
- POST /api/customer/reviews
- GET /api/customer/wallet
- POST /api/customer/wallet/add
- GET /api/customer/coupons
- POST /api/customer/ai-chat

### Hotel Owner App APIs
- POST /api/owner-auth/login
- POST /api/owner-auth/register
- GET /api/hotel-owner/hotels
- POST /api/hotel-owner/hotels
- GET /api/hotel-owner/:id
- PUT /api/hotel-owner/:id
- GET /api/hotel-owner/rooms
- POST /api/hotel-owner/rooms
- GET /api/hotel-owner/bookings
- GET /api/hotel-owner/earnings
- POST /api/hotel-owner/offers
- GET /api/hotel-owner/calendar
- GET /api/hotel-owner/analytics
- POST /api/hotel-registration

### Admin Dashboard APIs
- GET /api/admin/users
- GET /api/admin/hotels
- GET /api/admin/hotels/pending
- POST /api/admin/hotels/:id/approve
- POST /api/admin/hotels/:id/reject
- GET /api/admin/bookings
- GET /api/admin/stats
- GET /api/admin/revenue

## Next Steps

1. Run SQL migration above
2. Sync Prisma schema
3. Start backend server
4. Test all endpoints
5. Start Flutter apps
6. Start admin dashboard

---

**Status**: Ready after manual migration
**Database**: hotelsewa
**Port**: 5555
