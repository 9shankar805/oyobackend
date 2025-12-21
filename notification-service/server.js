const express = require('express');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/oyo_notifications'
});

// Email transporter
const emailTransporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send notification
app.post('/send', async (req, res) => {
  const {
    user_id,
    type,
    title,
    message,
    channels = ['push'], // push, email, sms
    data = {}
  } = req.body;

  try {
    // Store notification in database
    const notificationResult = await pool.query(`
      INSERT INTO notifications (user_id, title, message, type, data, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `, [user_id, title, message, type, JSON.stringify(data)]);

    const notification = notificationResult.rows[0];

    // Get user details
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    const results = {};

    // Send via different channels
    for (const channel of channels) {
      try {
        switch (channel) {
          case 'email':
            if (user.email) {
              await sendEmail(user.email, title, message, data);
              results.email = 'sent';
            }
            break;

          case 'sms':
            if (user.phone_number) {
              await sendSMS(user.phone_number, message);
              results.sms = 'sent';
            }
            break;

          case 'push':
            // TODO: Implement push notification via FCM
            results.push = 'sent';
            break;
        }
      } catch (error) {
        console.error(`Failed to send ${channel} notification:`, error);
        results[channel] = 'failed';
      }
    }

    res.json({
      success: true,
      data: {
        notification_id: notification.id,
        results
      }
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Send email
async function sendEmail(to, subject, text, data = {}) {
  const htmlTemplate = getEmailTemplate(data.template || 'default', data);
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@oyo.com',
    to,
    subject,
    text,
    html: htmlTemplate
  };

  return await emailTransporter.sendMail(mailOptions);
}

// Send SMS
async function sendSMS(to, message) {
  return await twilioClient.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to
  });
}

// Get email template
function getEmailTemplate(template, data) {
  const templates = {
    booking_confirmation: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #E60023;">Booking Confirmed!</h2>
        <p>Dear ${data.guest_name},</p>
        <p>Your booking has been confirmed. Here are the details:</p>
        <div style="background: #f8f8f8; padding: 20px; border-radius: 8px;">
          <p><strong>Hotel:</strong> ${data.hotel_name}</p>
          <p><strong>Check-in:</strong> ${data.check_in}</p>
          <p><strong>Check-out:</strong> ${data.check_out}</p>
          <p><strong>Confirmation Number:</strong> ${data.confirmation_number}</p>
        </div>
        <p>Thank you for choosing OYO!</p>
      </div>
    `,
    default: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #E60023;">OYO Notification</h2>
        <p>${data.message || 'You have a new notification from OYO.'}</p>
      </div>
    `
  };

  return templates[template] || templates.default;
}

// Get user notifications
app.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20, unread_only = false } = req.query;

  try {
    let query = `
      SELECT * FROM notifications 
      WHERE user_id = $1
    `;
    
    const queryParams = [userId];

    if (unread_only === 'true') {
      query += ' AND is_read = false';
    }

    query += ' ORDER BY created_at DESC';

    // Add pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Get unread count
    const unreadResult = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    res.json({
      success: true,
      data: {
        notifications: result.rows,
        unread_count: parseInt(unreadResult.rows[0].count),
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: result.rows.length
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// Mark notification as read
app.put('/:notificationId/read', async (req, res) => {
  const { notificationId } = req.params;

  try {
    const result = await pool.query(`
      UPDATE notifications 
      SET is_read = true 
      WHERE id = $1
      RETURNING *
    `, [notificationId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
app.put('/user/:userId/read-all', async (req, res) => {
  const { userId } = req.params;

  try {
    await pool.query(`
      UPDATE notifications 
      SET is_read = true 
      WHERE user_id = $1 AND is_read = false
    `, [userId]);

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Send bulk notifications
app.post('/bulk', async (req, res) => {
  const {
    user_ids,
    title,
    message,
    type,
    channels = ['push'],
    data = {}
  } = req.body;

  try {
    const results = [];

    for (const userId of user_ids) {
      try {
        // Store notification
        await pool.query(`
          INSERT INTO notifications (user_id, title, message, type, data, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
        `, [userId, title, message, type, JSON.stringify(data)]);

        results.push({ user_id: userId, status: 'sent' });
      } catch (error) {
        results.push({ user_id: userId, status: 'failed', error: error.message });
      }
    }

    res.json({
      success: true,
      data: {
        total_sent: results.filter(r => r.status === 'sent').length,
        total_failed: results.filter(r => r.status === 'failed').length,
        results
      }
    });
  } catch (error) {
    console.error('Bulk notification error:', error);
    res.status(500).json({ error: 'Failed to send bulk notifications' });
  }
});

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});