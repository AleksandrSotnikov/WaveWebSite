import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  });
});

// API Routes (to be implemented)
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({
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
    error: {
      status: 404,
      message: 'Endpoint not found',
      path: req.path,
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🎉 Wave Studio API started on http://localhost:${PORT}`);
  console.log(`📝 Timezone: ${process.env.TIMEZONE || 'UTC+6'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🚀 API docs: http://localhost:${PORT}/api\n`);
});

export default app;
