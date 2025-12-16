import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { sequelize } from './models/index.js';
import authRoutes from './routes/auth.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: sequelize.authenticate() ? 'connected' : 'disconnected',
  });
});

// API Info
app.get('/api', (req, res) => {
  res.json({
    message: 'Wave Studio API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      clients: '/api/clients',
      trainers: '/api/trainers',
      subscriptions: '/api/subscriptions',
      sessions: '/api/sessions',
      reports: '/api/reports',
    },
  });
});

// Routes
app.use('/api/auth', authRoutes);
// Additional routes will be added here
// app.use('/api/clients', clientRoutes);
// app.use('/api/trainers', trainerRoutes);
// app.use('/api/subscriptions', subscriptionRoutes);
// app.use('/api/sessions', sessionRoutes);
// app.use('/api/reports', reportRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({
    success: false,
    error: {
      status,
      message,
      timestamp: new Date().toISOString(),
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      status: 404,
      message: 'Endpoint not found',
      path: req.path,
    },
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Sync database models (use alter:true for development)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Database models synchronized successfully.');

    // Start listening
    app.listen(PORT, () => {
      console.log(`\n🎉 Wave Studio API started on http://localhost:${PORT}`);
      console.log(`📝 Timezone: ${process.env.TIMEZONE || 'UTC+6'}`);
      console.log(`❤️  Health check: http://localhost:${PORT}/health`);
      console.log(`🚀 API docs: http://localhost:${PORT}/api\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
