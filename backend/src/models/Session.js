import { DataTypes } from 'sequelize';

const SessionModel = (sequelize) => {
  const Session = sequelize.define(
    'Session',
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
      date_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      timezone: {
        type: DataTypes.STRING(50),
        defaultValue: 'UTC+6',
      },
      notes: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: 'sessions',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Session;
};

export default SessionModel;
