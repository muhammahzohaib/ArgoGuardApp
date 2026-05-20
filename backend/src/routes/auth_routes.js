const express = require('express');
const { body } = require('express-validator');
const { register, login, sendOtp, verifyOtp, socialLogin, getMe } = require('../controllers/auth_controller');
const { protect } = require('../middleware/auth_middleware');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    validate
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  login
);

router.post(
  '/send-otp',
  [
    body('email').isEmail().withMessage('Invalid email format'),
    validate
  ],
  sendOtp
);

router.post(
  '/verify-otp',
  [
    body('email').isEmail().withMessage('Invalid email format'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('OTP code must be 6 digits'),
    validate
  ],
  verifyOtp
);

router.post(
  '/social-login',
  [
    body('provider').notEmpty().withMessage('Provider is required'),
    body('token').notEmpty().withMessage('Token is required'),
    validate
  ],
  socialLogin
);

router.get('/me', protect, getMe);

module.exports = router;

