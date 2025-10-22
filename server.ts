import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors, { CorsOptions } from 'cors';
import connectDB, { getDbStatus } from './config/db';

const app = express();

// --- Configuración CORS ---
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Postman o server-to-server
    const allowedOrigins = [
      'https://my-enterprise-app-plum.vercel.app',
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''
    ];
    if (allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('CORS not allowed'));
  },
  credentials: true,
};

// --- Middlewares ---
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// --- Endpoints ---
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'API running',
    dbStatus: getDbStatus(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/debug', (req: Request, res: Response) => {
  res.json({
    dbStatus: getDbStatus(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      MONGO_URI: process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 20) + '...' : 'undefined',
    }
  });
});

// --- 404 handler ---
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: `Route not found - ${req.originalUrl}` });
});

// --- Error handler global ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error('🔥 Global error:', err.message, err.stack);
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// --- Inicializar DB y servidor ---
(async () => {
  console.log('🔹 Inicializando server...');
  await connectDB();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log('🔹 DB Status:', getDbStatus());
  });
})();

export default app;
