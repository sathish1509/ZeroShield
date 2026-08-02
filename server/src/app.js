import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import { notFoundHandler } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';

const app = express();

// Helmet security HTTP headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
app.use(helmet());

// CORS configuration with explicit client origin whitelist
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
);

// Global rate limiting
app.use('/api', globalRateLimiter);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/', (_req, res) => {
  res.json({
    status: 'success',
    message: 'ZeroShield Zero-Trust Security API Gateway is Live & Running!',
    healthCheck: '/api/health',
    version: 'v3.4'
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'success',
    data: {
      status: 'ok',
      service: 'ZeroShield API Engine',
      environment: env.NODE_ENV,
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;