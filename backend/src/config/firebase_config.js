const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

let firebaseApp = null;

try {
  const serviceAccountPath = path.join(__dirname, '../../config/firebase-service-account.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    logger.info('Firebase Admin SDK initialized successfully.');
  } else {
    logger.warn('Firebase configuration file not found at: ' + serviceAccountPath + '. Running Firebase service in Mock mode.');
  }
} catch (error) {
  logger.error('Failed to initialize Firebase Admin SDK. Falling back to mock mode.', { error: error.message });
}

module.exports = {
  admin,
  firebaseApp,
  isMock: !firebaseApp
};
