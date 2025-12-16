import sequelize from '../config/database.js';
import AdminUserModel from './AdminUser.js';
import TrainerModel from './Trainer.js';
import ClientModel from './Client.js';
import SubscriptionModel from './Subscription.js';
import SessionModel from './Session.js';
import SessionAttendeeModel from './SessionAttendee.js';
import IncomeCalculationModel from './IncomeCalculation.js';
import AuditLogModel from './AuditLog.js';

// Initialize models
const AdminUser = AdminUserModel(sequelize);
const Trainer = TrainerModel(sequelize);
const Client = ClientModel(sequelize);
const Subscription = SubscriptionModel(sequelize);
const Session = SessionModel(sequelize);
const SessionAttendee = SessionAttendeeModel(sequelize);
const IncomeCalculation = IncomeCalculationModel(sequelize);
const AuditLog = AuditLogModel(sequelize);

// Define relationships
// Clients -> Subscriptions
Client.hasMany(Subscription, { foreignKey: 'client_id', as: 'subscriptions' });
Subscription.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

// Trainers -> Sessions
Trainer.hasMany(Session, { foreignKey: 'trainer_id', as: 'sessions' });
Session.belongsTo(Trainer, { foreignKey: 'trainer_id', as: 'trainer' });

// Sessions -> SessionAttendees
Session.hasMany(SessionAttendee, { foreignKey: 'session_id', as: 'attendees' });
SessionAttendee.belongsTo(Session, { foreignKey: 'session_id', as: 'session' });

// Clients -> SessionAttendees
Client.hasMany(SessionAttendee, { foreignKey: 'client_id', as: 'session_attendees' });
SessionAttendee.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

// Subscriptions -> SessionAttendees
Subscription.hasMany(SessionAttendee, { foreignKey: 'subscription_id', as: 'attendees' });
SessionAttendee.belongsTo(Subscription, { foreignKey: 'subscription_id', as: 'subscription' });

// Sessions -> IncomeCalculations
Session.hasMany(IncomeCalculation, { foreignKey: 'session_id', as: 'income_calculations' });
IncomeCalculation.belongsTo(Session, { foreignKey: 'session_id', as: 'session' });

// Trainers -> IncomeCalculations
Trainer.hasMany(IncomeCalculation, { foreignKey: 'trainer_id', as: 'income_calculations' });
IncomeCalculation.belongsTo(Trainer, { foreignKey: 'trainer_id', as: 'trainer' });

// AdminUsers -> AuditLogs
AdminUser.hasMany(AuditLog, { foreignKey: 'admin_user_id', as: 'audit_logs' });
AuditLog.belongsTo(AdminUser, { foreignKey: 'admin_user_id', as: 'admin_user' });

export {
  sequelize,
  AdminUser,
  Trainer,
  Client,
  Subscription,
  Session,
  SessionAttendee,
  IncomeCalculation,
  AuditLog,
};
