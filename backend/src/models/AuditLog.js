import { DataTypes } from 'sequelize';

const AuditLogModel = (sequelize) => {
  const AuditLog = sequelize.define(
    'AuditLog',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      admin_user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'admin_users',
          key: 'id',
        },
      },
      action: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      entity_type: {
        type: DataTypes.STRING(50),
      },
      entity_id: {
        type: DataTypes.INTEGER,
      },
      changes: {
        type: DataTypes.JSONB,
      },
    },
    {
      tableName: 'audit_logs',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );

  return AuditLog;
};

export default AuditLogModel;
