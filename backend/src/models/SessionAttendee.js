import { DataTypes } from 'sequelize';

const SessionAttendeeModel = (sequelize) => {
  const SessionAttendee = sequelize.define(
    'SessionAttendee',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      session_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'sessions',
          key: 'id',
        },
      },
      client_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'clients',
          key: 'id',
        },
      },
      subscription_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'subscriptions',
          key: 'id',
        },
      },
    },
    {
      tableName: 'session_attendees',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );

  return SessionAttendee;
};

export default SessionAttendeeModel;
