import express from 'express';
import {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from '../controllers/clientController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

/**
 * GET /api/clients
 * Get all clients
 */
router.get('/', getAllClients);

/**
 * GET /api/clients/:id
 * Get client by ID
 */
router.get('/:id', getClientById);

/**
 * POST /api/clients
 * Create new client
 */
router.post('/', createClient);

/**
 * PUT /api/clients/:id
 * Update client
 */
router.put('/:id', updateClient);

/**
 * DELETE /api/clients/:id
 * Delete client
 */
router.delete('/:id', deleteClient);

export default router;
