import { DataTypes } from 'sequelize';

const ClientModel = (sequelize) => {
  const Client = sequelize.define(
    'Client',
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
      phone_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
          is: /^\+7\d{10}$/,
        },
      },
      messenger_link: {
        type: DataTypes.STRING(500),
      },
    },
    {
      tableName: 'clients',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Client;
};

export default ClientModel;
