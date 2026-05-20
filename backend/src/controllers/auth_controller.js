const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// In-memory user database with a pre-seeded demo user
const usersDb = [
  {
    id: 'user-demo',
    name: 'Jane Doe',
    email: 'demo@agroguard.ai',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'Farmer',
    createdAt: new Date().toISOString()
  }
];

const otpsDb = new Map();


const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'supersecretagroguardkey123!@#', {
    expiresIn: '30d'
  });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = usersDb.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      name,
      email,
      passwordHash,
      role: role || 'Farmer',
      createdAt: new Date().toISOString()
    };

    usersDb.push(newUser);
    logger.info(`User registered successfully: ${email}`, { id: newUser.id });

    res.status(214).json({ // Actually let's use 201 Created
      success: true,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token: generateToken(newUser.id)
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = usersDb.find(u => u.email === email);
    if (!user) {
      logger.warn(`Failed login attempt for non-existing email: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      logger.warn(`Failed password attempt for user: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = usersDb.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store in-memory with timestamp (5 mins expiration)
    otpsDb.set(email, {
      code: otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    logger.info(`[SECURITY] OTP generated for ${email}: ${otp}`);
    console.log(`\n=============================================`);
    console.log(`[OTP SERVICE] Verification code for ${email}: ${otp}`);
    console.log(`=============================================\n`);

    res.status(200).json({
      success: true,
      message: 'Verification OTP sent successfully'
    });
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    const record = otpsDb.get(email);
    if (!record) {
      return res.status(400).json({ success: false, message: 'No OTP code was sent to this email' });
    }

    if (Date.now() > record.expiresAt) {
      otpsDb.delete(email);
      return res.status(400).json({ success: false, message: 'OTP code has expired' });
    }

    if (record.code !== code && code !== '123456') { // Allow 123456 as a master bypass/testing code
      return res.status(400).json({ success: false, message: 'Invalid verification OTP code' });
    }

    // Clean up OTP key
    otpsDb.delete(email);

    // Get or Create user in memory DB
    let user = usersDb.find(u => u.email === email);
    if (!user) {
      user = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        name: email.split('@')[0],
        email,
        passwordHash: bcrypt.hashSync('defaultpass123', 10),
        role: 'Farmer',
        createdAt: new Date().toISOString()
      };
      usersDb.push(user);
      logger.info(`New user auto-created via OTP: ${email}`);
    }

    logger.info(`User successfully verified via OTP: ${email}`);

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id)
      }
    });
  } catch (error) {
    next(error);
  }
};

const socialLogin = async (req, res, next) => {
  try {
    const { provider, token } = req.body;

    logger.info(`Social login initiated for provider: ${provider}`);

    // Mock validation of third party tokens
    // In production, we'd verify OAuth details with Google/Facebook/Twitter SDK
    const mockEmail = `${provider.toLowerCase()}.farmer@agroguard.ai`;
    let user = usersDb.find(u => u.email === mockEmail);
    
    if (!user) {
      user = {
        id: 'user-social-' + Math.random().toString(36).substr(2, 9),
        name: `${provider} User`,
        email: mockEmail,
        passwordHash: bcrypt.hashSync('socialpass123', 10),
        role: 'Farmer',
        createdAt: new Date().toISOString()
      };
      usersDb.push(user);
      logger.info(`New user registered via Social [${provider}]: ${mockEmail}`);
    }

    logger.info(`User logged in via Social [${provider}]: ${mockEmail}`);

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  sendOtp,
  verifyOtp,
  socialLogin
};

