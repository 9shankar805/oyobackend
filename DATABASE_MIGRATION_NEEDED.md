# Database Schema Updates Required

## Missing Tables for Customer App APIs

### 1. Wallet Table
```prisma
model Wallet {
  id            String   @id @default(uuid())
  userId        String   @unique
  balance       Float    @default(0)
  currency      String   @default("INR")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions  WalletTransaction[]
  
  @@map("wallets")
}

model WalletTransaction {
  id            String   @id @default(uuid())
  walletId      String
  type          String   // credit, debit
  amount        Float
  description   String?
  referenceId   String?  // booking/payment reference
  balanceBefore Float
  balanceAfter  Float
  createdAt     DateTime @default(now())
  
  wallet        Wallet   @relation(fields: [walletId], references: [id], onDelete: Cascade)
  
  @@index([walletId])
  @@map("wallet_transactions")
}
```

### 2. Coupon Table
```prisma
model Coupon {
  id            String   @id @default(uuid())
  code          String   @unique
  title         String
  description   String?
  discountType  String   // percentage, fixed
  discountValue Float
  minAmount     Float?
  maxDiscount   Float?
  validFrom     DateTime
  validTo       DateTime
  usageLimit    Int?
  usedCount     Int      @default(0)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  usages        CouponUsage[]
  
  @@map("coupons")
}

model CouponUsage {
  id        String   @id @default(uuid())
  couponId  String
  userId    String
  bookingId String?
  usedAt    DateTime @default(now())
  
  coupon    Coupon   @relation(fields: [couponId], references: [id], onDelete: Cascade)
  
  @@index([couponId])
  @@index([userId])
  @@map("coupon_usages")
}
```

### 3. SavedHotel Table
```prisma
model SavedHotel {
  id        String   @id @default(uuid())
  userId    String
  hotelId   String
  createdAt DateTime @default(now())
  
  @@unique([userId, hotelId])
  @@index([userId])
  @@index([hotelId])
  @@map("saved_hotels")
}
```

## Update User Model
Add to User model:
```prisma
wallet            Wallet?
savedHotels       SavedHotel[]
```

## Migration Steps
1. Add models to schema.prisma
2. Run: `npx prisma migrate dev --name add_wallet_coupon_saved`
3. Run: `npx prisma generate`
4. Restart backend server
