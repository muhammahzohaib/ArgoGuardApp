const { admin, isMock } = require('../config/firebase_config');
const logger = require('../utils/logger');

const sendPushNotification = async (token, payload) => {
  if (isMock) {
    logger.info('[MOCK FIREBASE] Sending push notification...', {
      token,
      title: payload.notification.title,
      body: payload.notification.body
    });
    return { success: true, messageId: 'mock-msg-id-' + Math.random().toString(36).substr(2, 9) };
  }

  try {
    const message = {
      token: token,
      notification: {
        title: payload.notification.title,
        body: payload.notification.body
      },
      data: payload.data || {}
    };

    const response = await admin.messaging().send(message);
    logger.info('Firebase push notification sent successfully', { response });
    return { success: true, messageId: response };
  } catch (error) {
    logger.error('Failed to send Firebase notification', { error: error.message });
    throw error;
  }
};

module.exports = {
  sendPushNotification
};
