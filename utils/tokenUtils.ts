// utils/tokenUtils.ts
import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_SECRET || 'default_access_secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'default_refresh_secret';

// Tipado para Prisma User
interface PrismaUser {
  id: string;
  username?: string;
  email?: string;
}

export const generateAuthTokens = (user: PrismaUser) => {
  const payload = { id: user.id };
  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};
