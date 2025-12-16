import { Session, SessionAttendee, Subscription, Trainer, Client, IncomeCalculation } from '../models/index.js';
import { sequelize } from '../models/index.js';
import { Op } from 'sequelize';

const COMMISSION_RATE = 0.45;

// Helper: check subscription is active and belongs to client
const validateActiveSubscription = async (subscriptionId, clientId) => {
  const subscription = await Subscription.findByPk(subscriptionId);
  if (!subscription) {
    return { ok: false, code: 'SUBSCRIPTION_NOT_FOUND', message: 'Subscription not found' };
  }
  if (subscription.client_id !== clientId) {
    return { ok: false, code: 'SUBSCRIPTION_WRONG_CLIENT', message: 'Subscription does not belong to this client' };
  }
  const today = new Date();
  const exp = new Date(subscription.expiration_date);
  exp.setHours(0, 0, 0, 0);
  if (exp < today.setHours(0, 0, 0, 0) || subscription.status === 'expired') {
    return { ok: false, code: 'NO_ACTIVE_SUBSCRIPTION', message: 'Subscription is expired' };
  }
  return { ok: true, subscription };
};

// Helper: check for conflicts for trainer and clients at given time
const checkConflicts = async ({ trainer_id, date_time, sessionIdToExclude, clientIds }) => {
  const start = new Date(date_time);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // assume 1 hour session

  const whereBase = {
    date_time: {
      [Op.lt]: end,
    },
  };

  if (sessionIdToExclude) {
    whereBase.id = { [Op.ne]: sessionIdToExclude };
  }

  // Trainer conflicts
  const trainerConflict = await Session.findOne({
    where: {
      ...whereBase,
      trainer_id,
    },
  });

  if (trainerConflict) {
    return {
      ok: false,
      code: 'TRAINER_CONFLICT',
      message: 'Trainer already has a session at this time',
    };
  }

  // Client conflicts
  if (clientIds && clientIds.length > 0) {
    const conflicts = await SessionAttendee.findOne({
      include: [{ model: Session, as: 'session', where: whereBase }],
      where: {
        client_id: {
          [Op.in]: clientIds,
        },
      },
    });

    if (conflicts) {
      return {
        ok: false,
        code: 'CLIENT_CONFLICT',
        message: 'One of the clients already has a session at this time',
      };
    }
  }

  return { ok: true };
};

// Helper: calculate trainer income for a single session
const calculateSessionIncome = async ({ trainer_id, session_id }) => {
  // Load attendees and their subscriptions
  const attendees = await SessionAttendee.findAll({
    where: { session_id },
    include: [
      { model: Subscription, as: 'subscription' },
    ],
  });

  if (!attendees.length) {
    return null;
  }

  // Limited subscriptions: (x * 0.45) / n
  // Unlimited subscriptions: (x * 0.45) / total_sessions_in_period
  let totalIncome = 0;

  for (const attendee of attendees) {
    const sub = attendee.subscription;
    if (!sub) continue;

    if (sub.type === 'limited') {
      if (!sub.total_sessions || sub.total_sessions <= 0) continue;
      totalIncome += (parseFloat(sub.price) * COMMISSION_RATE) / sub.total_sessions;
    } else if (sub.type === 'unlimited') {
      // For MVP: approximate total_sessions for unlimited as number of sessions in current month
      const session = await Session.findByPk(session_id);
      const date = new Date(session.date_time);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const sessionsInMonth = await SessionAttendee.count({
        include: [{ model: Session, as: 'session', where: { date_time: { [Op.between]: [monthStart, monthEnd] } } }],
        where: { subscription_id: sub.id },
      });

      if (sessionsInMonth > 0) {
        totalIncome += (parseFloat(sub.price) * COMMISSION_RATE) / sessionsInMonth;
      }
    }
  }

  const incomePerSession = totalIncome / attendees.length;

  const income = await IncomeCalculation.create({
    trainer_id,
    session_id,
    total_income: totalIncome,
    income_per_session: incomePerSession,
    commission_rate: COMMISSION_RATE,
  });

  return income;
};

// Create session with attendees
export const createSession = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { trainer_id, date_time, timezone = 'UTC+6', clients, subscriptions } = req.body;

    if (!trainer_id || !date_time || !Array.isArray(clients) || !Array.isArray(subscriptions)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: { message: 'trainer_id, date_time, clients[], subscriptions[] are required', code: 'VALIDATION_ERROR' },
      });
    }

    if (clients.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: { message: 'At least one client is required', code: 'NO_CLIENTS' },
      });
    }

    if (clients.length !== subscriptions.length) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: { message: 'clients and subscriptions arrays must be same length', code: 'ARRAY_LENGTH_MISMATCH' },
      });
    }

    // Validate trainer exists
    const trainer = await Trainer.findByPk(trainer_id);
    if (!trainer || !trainer.is_active) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: { message: 'Trainer not found or inactive', code: 'TRAINER_NOT_FOUND' },
      });
    }

    // Conflict detection
    const conflictCheck = await checkConflicts({
      trainer_id,
      date_time,
      clientIds: clients,
    });
    if (!conflictCheck.ok) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        error: { message: conflictCheck.message, code: conflictCheck.code },
      });
    }

    // Create session
    const session = await Session.create({
      trainer_id,
      date_time,
      timezone,
      notes: req.body.notes || null,
    }, { transaction });

    // Validate subscriptions and create attendees
    for (let i = 0; i < clients.length; i++) {
      const clientId = clients[i];
      const subId = subscriptions[i];

      const validation = await validateActiveSubscription(subId, clientId);
      if (!validation.ok) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          error: { message: validation.message, code: validation.code },
        });
      }

      const subscription = validation.subscription;

      // For limited subscriptions – decrement sessions_used
      if (subscription.type === 'limited') {
        if (subscription.sessions_used >= subscription.total_sessions) {
          await transaction.rollback();
          return res.status(409).json({
            success: false,
            error: { message: 'No remaining sessions on subscription', code: 'NO_SESSIONS_LEFT' },
          });
        }

        await subscription.update({
          sessions_used: subscription.sessions_used + 1,
        }, { transaction });
      }

      await SessionAttendee.create({
        session_id: session.id,
        client_id: clientId,
        subscription_id: subId,
      }, { transaction });
    }

    // Calculate income
    const income = await calculateSessionIncome({ trainer_id, session_id: session.id });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: {
        session,
        income,
      },
    });
  } catch (error) {
    console.error('Error creating session:', error);
    await transaction.rollback();
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create session', code: 'CREATE_ERROR' },
    });
  }
};

// Get sessions (with filters)
export const getSessions = async (req, res) => {
  try {
    const { trainer_id, client_id, date_from, date_to } = req.query;

    const whereClause = {};
    if (trainer_id) whereClause.trainer_id = trainer_id;
    if (date_from && date_to) {
      whereClause.date_time = {
        [Op.between]: [new Date(date_from), new Date(date_to)],
      };
    }

    const sessions = await Session.findAll({
      where: whereClause,
      include: [
        { model: Trainer, as: 'trainer', attributes: ['id', 'full_name'] },
        {
          model: SessionAttendee,
          as: 'attendees',
          include: [
            { model: Client, as: 'client', attributes: ['id', 'full_name'] },
            { model: Subscription, as: 'subscription', attributes: ['id', 'type', 'status'] },
          ],
          ...(client_id ? { where: { client_id } } : {}),
        },
      ],
      order: [['date_time', 'ASC']],
    });

    res.status(200).json({
      success: true,
      data: sessions,
      total: sessions.length,
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch sessions', code: 'FETCH_ERROR' },
    });
  }
};

// Get single session
export const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await Session.findByPk(id, {
      include: [
        { model: Trainer, as: 'trainer', attributes: ['id', 'full_name'] },
        {
          model: SessionAttendee,
          as: 'attendees',
          include: [
            { model: Client, as: 'client', attributes: ['id', 'full_name'] },
            { model: Subscription, as: 'subscription', attributes: ['id', 'type', 'status'] },
          ],
        },
      ],
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: { message: 'Session not found', code: 'NOT_FOUND' },
      });
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch session', code: 'FETCH_ERROR' },
    });
  }
};

// Delete session
export const deleteSession = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const session = await Session.findByPk(id, { transaction });
    if (!session) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: { message: 'Session not found', code: 'NOT_FOUND' },
      });
    }

    // Load attendees to rollback limited subscription sessions_used
    const attendees = await SessionAttendee.findAll({ where: { session_id: id }, transaction });

    for (const attendee of attendees) {
      const subscription = await Subscription.findByPk(attendee.subscription_id, { transaction });
      if (subscription && subscription.type === 'limited' && subscription.sessions_used > 0) {
        await subscription.update({
          sessions_used: subscription.sessions_used - 1,
        }, { transaction });
      }
    }

    await SessionAttendee.destroy({ where: { session_id: id }, transaction });
    await IncomeCalculation.destroy({ where: { session_id: id }, transaction });
    await session.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    await transaction.rollback();
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete session', code: 'DELETE_ERROR' },
    });
  }
};
