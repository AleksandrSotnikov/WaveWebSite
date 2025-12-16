import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getTrainerReport,
  getClientReport,
  getDateReport,
} from '../controllers/reportController.js';

const router = express.Router();

// Apply auth middleware to all report routes
router.use(verifyToken);

/**
 * GET /api/reports/trainer/:trainer_id
 * Query: date_from, date_to, format=json|csv|pdf|html
 */
router.get('/trainer/:trainer_id', getTrainerReport);

/**
 * GET /api/reports/client/:client_id
 * Query: date_from, date_to, format=json|csv|pdf|html
 */
router.get('/client/:client_id', getClientReport);

/**
 * GET /api/reports/date
 * Query: date_from, date_to, format=json|csv|pdf|html
 */
router.get('/date', getDateReport);

export default router;
