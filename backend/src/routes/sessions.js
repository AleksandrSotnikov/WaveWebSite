import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  createSession,
  getSessions,
  getSessionById,
  deleteSession,
} from '../controllers/sessionController.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

/**
 * GET /api/sessions
 * Get sessions list (filters: trainer_id, client_id, date_from, date_to)
 */
router.get('/', getSessions);

/**
 * GET /api/sessions/:id
 * Get single session by ID
 */
router.get('/:id', getSessionById);

/**
 * POST /api/sessions
 * Create new session with attendees
 */
router.post('/', createSession);

/**
 * DELETE /api/sessions/:id
 * Delete session and rollback limited subscription usage
 */
router.delete('/:id', deleteSession);

export default router;
