import express from 'express';
import {
  getAllSubscriptions,
  getSubscriptionById,
  getClientSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from '../controllers/subscriptionController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

/**
 * GET /api/subscriptions
 * Get all subscriptions (with filters)
 * Query params: client_id, status (active/expired), type (limited/unlimited)
 */
router.get('/', getAllSubscriptions);

/**
 * GET /api/subscriptions/:id
 * Get subscription by ID
 */
router.get('/:id', getSubscriptionById);

/**
 * GET /api/subscriptions/client/:client_id
 * Get all subscriptions for a specific client
 */
router.get('/client/:client_id', getClientSubscriptions);

/**
 * POST /api/subscriptions
 * Create new subscription
 * Body: client_id, type (limited/unlimited), price, total_sessions (for limited), start_date
 */
router.post('/', createSubscription);

/**
 * PUT /api/subscriptions/:id
 * Update subscription (sessions_used, status)
 */
router.put('/:id', updateSubscription);

/**
 * DELETE /api/subscriptions/:id
 * Delete subscription
 */
router.delete('/:id', deleteSubscription);

export default router;
