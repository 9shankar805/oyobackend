const express = require('express');
const { Pool } = require('pg');
const { body, validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/oyo_payments'
});

// Process payment
app.post('/', [
  body('booking_id').isUUID(),
  body('amount').isFloat({ min: 0 }),
  body('payment_method').isIn(['credit_card', 'debit_card', 'upi', 'wallet']),
  body('currency').isLength({ min: 3, max: 3 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    booking_id,
    amount,
    currency = 'INR',
    payment_method,
    payment_details,
    billing_address
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create payment record
    const paymentResult = await client.query(`
      INSERT INTO payments (booking_id, amount, currency, payment_method, status, created_at)
      VALUES ($1, $2, $3, $4, 'processing', NOW())
      RETURNING *
    `, [booking_id, amount, currency, payment_method]);

    const payment = paymentResult.rows[0];

    // Process payment based on method
    let paymentIntent;
    if (payment_method === 'credit_card' || payment_method === 'debit_card') {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        payment_method: payment_details.payment_method_id,
        confirm: true,
        metadata: {
          booking_id,
          payment_id: payment.id
        }
      });
    }

    // Update payment status
    const status = paymentIntent?.status === 'succeeded' ? 'completed' : 'failed';
    const transactionId = paymentIntent?.id || `txn_${Date.now()}`;

    await client.query(`
      UPDATE payments 
      SET status = $1, transaction_id = $2, gateway_response = $3, processed_at = NOW()
      WHERE id = $4
    `, [status, transactionId, JSON.stringify(paymentIntent), payment.id]);

    // Update booking payment status
    if (status === 'completed') {
      await client.query(`
        UPDATE bookings 
        SET payment_status = 'completed', status = 'confirmed'
        WHERE id = $1
      `, [booking_id]);
    }

    await client.query('COMMIT');

    res.json({
      success: status === 'completed',
      data: {
        payment_id: payment.id,
        transaction_id: transactionId,
        status,
        amount,
        currency,
        payment_method,
        processed_at: new Date().toISOString()
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Payment processing error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  } finally {
    client.release();
  }
});

// Get payment details
app.get('/:paymentId', async (req, res) => {
  const { paymentId } = req.params;

  try {
    const result = await pool.query(`
      SELECT p.*, b.confirmation_number, h.name as hotel_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN hotels h ON b.hotel_id = h.id
      WHERE p.id = $1
    `, [paymentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: 'Failed to get payment details' });
  }
});

// Process refund
app.post('/:paymentId/refund', [
  body('amount').optional().isFloat({ min: 0 }),
  body('reason').isLength({ min: 1 })
], async (req, res) => {
  const { paymentId } = req.params;
  const { amount, reason } = req.body;

  try {
    // Get original payment
    const paymentResult = await pool.query(
      'SELECT * FROM payments WHERE id = $1 AND status = \'completed\'',
      [paymentId]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found or not eligible for refund' });
    }

    const payment = paymentResult.rows[0];
    const refundAmount = amount || payment.amount;

    // Process refund with Stripe
    let refund;
    if (payment.transaction_id.startsWith('pi_')) {
      refund = await stripe.refunds.create({
        payment_intent: payment.transaction_id,
        amount: Math.round(refundAmount * 100),
        reason: 'requested_by_customer'
      });
    }

    // Create refund record
    await pool.query(`
      INSERT INTO payments (booking_id, amount, currency, payment_method, status, transaction_id, created_at)
      VALUES ($1, $2, $3, 'refund', 'completed', $4, NOW())
    `, [payment.booking_id, -refundAmount, payment.currency, refund?.id || `refund_${Date.now()}`]);

    res.json({
      success: true,
      data: {
        refund_id: refund?.id,
        amount: refundAmount,
        status: 'completed',
        reason
      }
    });
  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({ error: 'Refund processing failed' });
  }
});

// Webhook for payment status updates
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await pool.query(`
        UPDATE payments 
        SET status = 'completed', processed_at = NOW()
        WHERE transaction_id = $1
      `, [paymentIntent.id]);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await pool.query(`
        UPDATE payments 
        SET status = 'failed', processed_at = NOW()
        WHERE transaction_id = $1
      `, [failedPayment.id]);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});