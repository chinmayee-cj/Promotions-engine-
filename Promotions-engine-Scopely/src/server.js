import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config.js';
import promotionsRouter from './routes/promotions.js';
import { register } from './metrics.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv
  });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error.message);
  }
});

// API routes
app.use('/api/v1/promotions', promotionsRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
const server = app.listen(config.port, () => {
  console.log(`🚀 Promotion Rule Engine running on port ${config.port}`);
  console.log(`📊 Metrics available at http://localhost:${config.port}/metrics`);
  console.log(`🏥 Health check at http://localhost:${config.port}/health`);
  console.log(`🎮 Environment: ${config.nodeEnv}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

export default app;
