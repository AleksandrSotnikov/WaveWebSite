import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AdminUser } from '../models/index.js';

const COMMISSION_RATE = 0.45;
const JWT_EXPIRY = process.env.JWT_EXPIRE || '7d';

// Register new admin
export const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Validate password
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Password must be at least 8 characters with letters and numbers',
          code: 'INVALID_PASSWORD',
        },
      });
    }

    // Check if user exists
    const existingUser = await AdminUser.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Username already exists',
          code: 'USERNAME_EXISTS',
        },
      });
    }

    // Hash password
    const password_hash = await bcryptjs.hash(password, 10);

    // Create user
    const newUser = await AdminUser.create({
      username,
      password_hash,
      email,
      role: 'admin',
    });

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await AdminUser.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid username or password',
          code: 'INVALID_CREDENTIALS',
        },
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Account is inactive',
          code: 'ACCOUNT_INACTIVE',
        },
      });
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid username or password',
          code: 'INVALID_CREDENTIALS',
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    // Update last login
    await user.update({ last_login: new Date() });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};

// Logout (client-side, just info)
export const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
};
