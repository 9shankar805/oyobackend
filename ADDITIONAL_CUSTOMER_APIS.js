// ADD THESE ENDPOINTS TO customer.js

// ============ SAVED HOTELS ============

// Get saved hotels
router.get("/saved", requireAuth, async (req, res) => {
  try {
    const { prisma } = require("../lib/prisma");
    
    const saved = await prisma.savedHotel.findMany({
      where: { userId: req.user.id },
      include: {
        hotel: {
          include: {
            images: true,
            rooms: { where: { isActive: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, saved: saved.map(s => s.hotel) });
  } catch (error) {
    console.error("Get saved hotels error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch saved hotels" });
  }
});

// Add to saved
router.post("/saved/:hotelId", requireAuth, async (req, res) => {
  try {
    const { prisma } = require("../lib/prisma");
    const { hotelId } = req.params;

    const saved = await prisma.savedHotel.create({
      data: {
        id: uuid(),
        userId: req.user.id,
        hotelId,
      },
    });

    res.status(201).json({ success: true, message: "Hotel saved successfully" });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ success: false, message: "Hotel already saved" });
    }
    console.error("Save hotel error:", error);
    res.status(500).json({ success: false, message: "Failed to save hotel" });
  }
});

// Remove from saved
router.delete("/saved/:hotelId", requireAuth, async (req, res) => {
  try {
    const { prisma } = require("../lib/prisma");
    const { hotelId } = req.params;

    await prisma.savedHotel.deleteMany({
      where: {
        userId: req.user.id,
        hotelId,
      },
    });

    res.json({ success: true, message: "Hotel removed from saved" });
  } catch (error) {
    console.error("Remove saved hotel error:", error);
    res.status(500).json({ success: false, message: "Failed to remove saved hotel" });
  }
});

// ============ WALLET TRANSACTIONS ============

// Get wallet transactions
router.get("/wallet/transactions", requireAuth, async (req, res) => {
  try {
    const { prisma } = require("../lib/prisma");

    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user.id },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!wallet) {
      return res.json({ success: true, transactions: [] });
    }

    res.json({ success: true, transactions: wallet.transactions });
  } catch (error) {
    console.error("Get wallet transactions error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch transactions" });
  }
});

// Add money to wallet
router.post("/wallet/add", requireAuth, async (req, res) => {
  try {
    const { prisma } = require("../lib/prisma");
    const { amount, paymentMethod, transactionId } = req.body;

    let wallet = await prisma.wallet.findUnique({
      where: { userId: req.user.id },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          id: uuid(),
          userId: req.user.id,
          balance: 0,
        },
      });
    }

    const newBalance = wallet.balance + amount;

    await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      }),
      prisma.walletTransaction.create({
        data: {
          id: uuid(),
          walletId: wallet.id,
          type: "credit",
          amount,
          description: `Added via ${paymentMethod}`,
          referenceId: transactionId,
          balanceBefore: wallet.balance,
          balanceAfter: newBalance,
        },
      }),
    ]);

    res.json({ success: true, balance: newBalance, message: "Money added successfully" });
  } catch (error) {
    console.error("Add money error:", error);
    res.status(500).json({ success: false, message: "Failed to add money" });
  }
});

module.exports = router;
