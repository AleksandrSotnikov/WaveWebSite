import { DataTypes } from 'sequelize';

const TrainerModel = (sequelize) => {
  const Trainer = sequelize.define(
    'Trainer',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      full_name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          len: [3, 150],
        },
      },
      specialization: {
        type: DataTypes.STRING(100),
      },
      phone_number: {
        type: DataTypes.STRING(20),
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'trainers',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Trainer;
};

export default TrainerModel;
