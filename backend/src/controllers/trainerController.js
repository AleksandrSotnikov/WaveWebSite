import { Trainer, Session, IncomeCalculation } from '../models/index.js';
import { sequelize } from '../models/index.js';

// Get all trainers
export const getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.findAll({
      where: { is_active: true },
      include: [{ association: 'sessions', attributes: ['id', 'date_time'] }],
    });

    res.status(200).json({
      success: true,
      data: trainers,
      total: trainers.length,
    });
  } catch (error) {
    console.error('Error fetching trainers:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch trainers', code: 'FETCH_ERROR' },
    });
  }
};

// Get trainer by ID with income
export const getTrainerById = async (req, res) => {
  try {
    const { id } = req.params;

    const trainer = await Trainer.findByPk(id, {
      include: [
        { association: 'sessions', attributes: ['id', 'date_time'] },
        { association: 'income_calculations', attributes: ['id', 'total_income', 'session_id'] },
      ],
    });

    if (!trainer) {
      return res.status(404).json({
        success: false,
        error: { message: 'Trainer not found', code: 'NOT_FOUND' },
      });
    }

    res.status(200).json({
      success: true,
      data: trainer,
    });
  } catch (error) {
    console.error('Error fetching trainer:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch trainer', code: 'FETCH_ERROR' },
    });
  }
};

// Create trainer
export const createTrainer = async (req, res) => {
  try {
    const { full_name, specialization, phone_number } = req.body;

    // Validate required fields
    if (!full_name) {
      return res.status(400).json({
        success: false,
        error: { message: 'full_name is required', code: 'VALIDATION_ERROR' },
      });
    }

    const newTrainer = await Trainer.create({
      full_name,
      specialization,
      phone_number,
      is_active: true,
    });

    res.status(201).json({
      success: true,
      message: 'Trainer created successfully',
      data: newTrainer,
    });
  } catch (error) {
    console.error('Error creating trainer:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create trainer', code: 'CREATE_ERROR' },
    });
  }
};

// Update trainer
export const updateTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, specialization, phone_number, is_active } = req.body;

    const trainer = await Trainer.findByPk(id);
    if (!trainer) {
      return res.status(404).json({
        success: false,
        error: { message: 'Trainer not found', code: 'NOT_FOUND' },
      });
    }

    await trainer.update({
      full_name: full_name || trainer.full_name,
      specialization: specialization || trainer.specialization,
      phone_number: phone_number || trainer.phone_number,
      is_active: is_active !== undefined ? is_active : trainer.is_active,
    });

    res.status(200).json({
      success: true,
      message: 'Trainer updated successfully',
      data: trainer,
    });
  } catch (error) {
    console.error('Error updating trainer:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update trainer', code: 'UPDATE_ERROR' },
    });
  }
};

// Get trainer income for period
export const getTrainerIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const { date_from, date_to } = req.query;

    const trainer = await Trainer.findByPk(id);
    if (!trainer) {
      return res.status(404).json({
        success: false,
        error: { message: 'Trainer not found', code: 'NOT_FOUND' },
      });
    }

    let whereClause = { trainer_id: id };
    if (date_from && date_to) {
      whereClause.created_at = {
        [sequelize.Sequelize.Op.gte]: new Date(date_from),
        [sequelize.Sequelize.Op.lte]: new Date(date_to),
      };
    }

    const incomeCalcs = await IncomeCalculation.findAll({
      where: whereClause,
      include: [{ association: 'session', attributes: ['date_time'] }],
    });

    const totalIncome = incomeCalcs.reduce((sum, calc) => sum + parseFloat(calc.total_income), 0);

    res.status(200).json({
      success: true,
      data: {
        trainer_id: trainer.id,
        trainer_name: trainer.full_name,
        period: { from: date_from, to: date_to },
        sessions_count: incomeCalcs.length,
        total_income: totalIncome,
        sessions: incomeCalcs,
      },
    });
  } catch (error) {
    console.error('Error fetching trainer income:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch trainer income', code: 'FETCH_ERROR' },
    });
  }
};

// Delete trainer (soft delete - deactivate)
export const deleteTrainer = async (req, res) => {
  try {
    const { id } = req.params;

    const trainer = await Trainer.findByPk(id);
    if (!trainer) {
      return res.status(404).json({
        success: false,
        error: { message: 'Trainer not found', code: 'NOT_FOUND' },
      });
    }

    // Check if trainer has future sessions
    const futureSessionsCount = await Session.count({
      where: {
        trainer_id: id,
        date_time: { [sequelize.Sequelize.Op.gt]: new Date() },
      },
    });

    if (futureSessionsCount > 0) {
      return res.status(409).json({
        success: false,
        error: { message: 'Cannot delete trainer with future sessions', code: 'HAS_FUTURE_SESSIONS' },
      });
    }

    // Soft delete - deactivate
    await trainer.update({ is_active: false });

    res.status(200).json({
      success: true,
      message: 'Trainer deleted (deactivated) successfully',
    });
  } catch (error) {
    console.error('Error deleting trainer:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete trainer', code: 'DELETE_ERROR' },
    });
  }
};
