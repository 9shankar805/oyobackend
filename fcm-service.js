const { firebaseConfig } = require('./firebase-config');

class FCMService {
  constructor() {
    this.config = firebaseConfig;
    console.log('📱 FCM Service initialized');
  }

  async sendNotification(userToken, notification) {
    try {
      // Simulate FCM notification for testing
      const fcmPayload = {
        to: userToken,
        notification: {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || 'default',
          sound: 'default'
        },
        data: notification.data || {}
      };

      console.log('📤 Sending FCM notification:', fcmPayload);
      
      // In production, use Firebase Admin SDK to send actual notifications
      // For testing, we'll simulate success
      return {
        success: true,
        messageId: 'fcm_' + Date.now(),
        payload: fcmPayload
      };
    } catch (error) {
      console.error('❌ FCM notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendToMultipleUsers(userTokens, notification) {
    try {
      const results = [];
      
      for (const token of userTokens) {
        const result = await this.sendNotification(token, notification);
        results.push({ token, result });
      }
      
      return {
        success: true,
        results: results,
        totalSent: results.filter(r => r.result.success).length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendBookingNotification(bookingData) {
    const notification = {
      title: '🏨 Booking Confirmed!',
      body: `Your booking at ${bookingData.hotelName} is confirmed for ${bookingData.checkIn}`,
      icon: 'booking_icon',
      data: {
        type: 'booking_confirmed',
        bookingId: bookingData.bookingId,
        hotelId: bookingData.hotelId
      }
    };

    return await this.sendNotification(bookingData.userToken, notification);
  }

  async sendPaymentNotification(paymentData) {
    const notification = {
      title: '💳 Payment Successful!',
      body: `Payment of ₹${paymentData.amount} processed successfully`,
      icon: 'payment_icon',
      data: {
        type: 'payment_success',
        paymentId: paymentData.paymentId,
        amount: paymentData.amount
      }
    };

    return await this.sendNotification(paymentData.userToken, notification);
  }

  async sendChatNotification(messageData) {
    const notification = {
      title: `💬 New message from ${messageData.senderName}`,
      body: messageData.message,
      icon: 'chat_icon',
      data: {
        type: 'new_message',
        bookingId: messageData.bookingId,
        senderId: messageData.senderId
      }
    };

    return await this.sendNotification(messageData.receiverToken, notification);
  }

  async sendHotelApprovalNotification(hotelData) {
    const notification = {
      title: '🎉 Hotel Approved!',
      body: `Your hotel "${hotelData.hotelName}" has been approved and is now live!`,
      icon: 'approval_icon',
      data: {
        type: 'hotel_approved',
        hotelId: hotelData.hotelId
      }
    };

    return await this.sendNotification(hotelData.ownerToken, notification);
  }
}

module.exports = new FCMService();