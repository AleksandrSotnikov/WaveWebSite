import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER || 'wave_user',
  password: process.env.DB_PASSWORD || 'wave_password',
  database: process.env.DB_NAME || 'wave_studio',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  timezone: '+06:00',
});

// Test connection
sequelize
  .authenticate()
  .then(() => {
    console.log('✅ Database connection established successfully.');
  })
  .catch((err) => {
    console.error('❌ Unable to connect to the database:', err);
    process.exit(1);
  });

export default sequelize;
