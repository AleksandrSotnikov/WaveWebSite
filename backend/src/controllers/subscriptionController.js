import { Subscription, Client } from '../models/index.js';
import { sequelize } from '../models/index.js';

// Utility function to determine subscription status
const getSubscriptionStatus = (expirationDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expDate = new Date(expirationDate);
  expDate.setHours(0, 0, 0, 0);

  return expDate >= today ? 'active' : 'expired';
};

// Get all subscriptions (with filters)
export const getAllSubscriptions = async (req, res) => {
  try {
    const { client_id, status, type } = req.query;
    let whereClause = {};

    if (client_id) whereClause.client_id = client_id;
    if (type) whereClause.type = type;
    if (status) whereClause.status = status;

    const subscriptions = await Subscription.findAll({
      where: whereClause,
      include: [{ association: 'client', attributes: ['id', 'full_name', 'phone_number'] }],
    });

    // Update status if expired
    for (let sub of subscriptions) {
      const currentStatus = getSubscriptionStatus(sub.expiration_date);
      if (currentStatus !== sub.status) {
        await sub.update({ status: currentStatus });
      }
    }

    res.status(200).json({
      success: true,
      data: subscriptions,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch subscriptions', code: 'FETCH_ERROR' },
    });
  }
};

// Get subscription by ID
export const getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findByPk(id, {
      include: [{ association: 'client' }],
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: { message: 'Subscription not found', code: 'NOT_FOUND' },
      });
    }

    // Update status if expired
    const currentStatus = getSubscriptionStatus(subscription.expiration_date);
    if (currentStatus !== subscription.status) {
      await subscription.update({ status: currentStatus });
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch subscription', code: 'FETCH_ERROR' },
    });
  }
};

// Get client subscriptions
export const getClientSubscriptions = async (req, res) => {
  try {
    const { client_id } = req.params;

    // Verify client exists
    const client = await Client.findByPk(client_id);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: { message: 'Client not found', code: 'NOT_FOUND' },
      });
    }

    const subscriptions = await Subscription.findAll({
      where: { client_id },
    });

    res.status(200).json({
      success: true,
      data: subscriptions,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error('Error fetching client subscriptions:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch subscriptions', code: 'FETCH_ERROR' },
    });
  }
};

// Create subscription
export const createSubscription = async (req, res) => {
  try {
    const { client_id, type, price, total_sessions, start_date } = req.body;

    // Validate required fields
    if (!client_id || !type || !price || !start_date) {
      return res.status(400).json({
        success: false,
        error: { message: 'Missing required fields', code: 'VALIDATION_ERROR' },
      });
    }

    // Validate type
    if (!['limited', 'unlimited'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Type must be "limited" or "unlimited"', code: 'INVALID_TYPE' },
      });
    }

    // For limited subscriptions, total_sessions is required
    if (type === 'limited' && !total_sessions) {
      return res.status(400).json({
        success: false,
        error: { message: 'total_sessions required for limited subscriptions', code: 'VALIDATION_ERROR' },
      });
    }

    // Verify client exists
    const client = await Client.findByPk(client_id);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: { message: 'Client not found', code: 'NOT_FOUND' },
      });
    }

    // Calculate expiration date (1 month from start_date)
    const startDate = new Date(start_date);
    const expirationDate = new Date(startDate);
    expirationDate.setMonth(expirationDate.getMonth() + 1);

    const newSubscription = await Subscription.create({
      client_id,
      type,
      price,
      total_sessions: type === 'limited' ? total_sessions : null,
      sessions_used: 0,
      start_date,
      expiration_date: expirationDate.toISOString().split('T')[0],
      status: 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: newSubscription,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create subscription', code: 'CREATE_ERROR' },
    });
  }
};

// Update subscription
export const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { sessions_used, status } = req.body;

    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: { message: 'Subscription not found', code: 'NOT_FOUND' },
      });
    }

    // Validate sessions_used for limited subscriptions
    if (sessions_used !== undefined && subscription.type === 'limited') {
      if (sessions_used < 0 || sessions_used > subscription.total_sessions) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid sessions_used value', code: 'INVALID_SESSIONS' },
        });
      }
    }

    await subscription.update({
      sessions_used: sessions_used !== undefined ? sessions_used : subscription.sessions_used,
      status: status || subscription.status,
    });

    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      data: subscription,
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update subscription', code: 'UPDATE_ERROR' },
    });
  }
};

// Delete subscription
export const deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: { message: 'Subscription not found', code: 'NOT_FOUND' },
      });
    }

    await subscription.destroy();

    res.status(200).json({
      success: true,
      message: 'Subscription deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete subscription', code: 'DELETE_ERROR' },
    });
  }
};
