// src/config/constants.ts
import dotenv from 'dotenv';
dotenv.config();

// 🔐 Secretos y expiraciones
export const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';
export const REFRESH_SECRET = process.env.REFRESH_SECRET || 'default_refresh_secret';
export const ACCESS_TOKEN_EXP = '15m'; // duración del access token
export const REFRESH_TOKEN_EXP = '7d';  // duración del refresh token
