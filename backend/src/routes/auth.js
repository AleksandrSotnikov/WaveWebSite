import express from 'express';
import { register, login, logout } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register new admin user
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Login and get JWT token
 */
router.post('/login', login);

/**
 * POST /api/auth/logout
 * Logout (client should remove token)
 */
router.post('/logout', verifyToken, logout);

export default router;
