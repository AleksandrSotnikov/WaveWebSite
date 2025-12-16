import { DataTypes } from 'sequelize';

const IncomeCalculationModel = (sequelize) => {
  const IncomeCalculation = sequelize.define(
    'IncomeCalculation',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      trainer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'trainers',
          key: 'id',
        },
      },
      session_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'sessions',
          key: 'id',
        },
      },
      total_income: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      income_per_session: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      commission_rate: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0.45,
      },
    },
    {
      tableName: 'income_calculations',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );

  return IncomeCalculation;
};

export default IncomeCalculationModel;
