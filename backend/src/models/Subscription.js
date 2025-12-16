import { DataTypes } from 'sequelize';

const SubscriptionModel = (sequelize) => {
  const Subscription = sequelize.define(
    'Subscription',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      client_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'clients',
          key: 'id',
        },
      },
      type: {
        type: DataTypes.ENUM('limited', 'unlimited'),
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      total_sessions: {
        type: DataTypes.INTEGER,
        validate: {
          min: 1,
        },
      },
      sessions_used: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      expiration_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('active', 'expired'),
        defaultValue: 'active',
      },
    },
    {
      tableName: 'subscriptions',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Subscription;
};

export default SubscriptionModel;
