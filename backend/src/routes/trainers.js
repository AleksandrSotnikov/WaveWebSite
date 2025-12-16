import express from 'express';
import {
  getAllTrainers,
  getTrainerById,
  createTrainer,
  updateTrainer,
  getTrainerIncome,
  deleteTrainer,
} from '../controllers/trainerController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

/**
 * GET /api/trainers
 * Get all active trainers
 */
router.get('/', getAllTrainers);

/**
 * GET /api/trainers/:id
 * Get trainer by ID with sessions and income
 */
router.get('/:id', getTrainerById);

/**
 * GET /api/trainers/:id/income
 * Get trainer income for period
 * Query params: date_from (YYYY-MM-DD), date_to (YYYY-MM-DD)
 */
router.get('/:id/income', getTrainerIncome);

/**
 * POST /api/trainers
 * Create new trainer
 */
router.post('/', createTrainer);

/**
 * PUT /api/trainers/:id
 * Update trainer
 */
router.put('/:id', updateTrainer);

/**
 * DELETE /api/trainers/:id
 * Delete (deactivate) trainer
 */
router.delete('/:id', deleteTrainer);

export default router;
