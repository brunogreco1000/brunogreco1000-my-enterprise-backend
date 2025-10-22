import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';

const JWT_SECRET: Secret = process.env.JWT_SECRET as Secret;

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username?: string;
    email?: string;
  };
}

const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // Buscar token en header Authorization
    const authHeader = req.header('Authorization');
    if (authHeader?.startsWith('Bearer ')) token = authHeader.replace('Bearer ', '');

    // Si no hay token, llamar a /refresh automáticamente
    if (!token && req.cookies?.refreshToken) {
      const refreshToken = req.cookies.refreshToken;
      const REFRESH_SECRET: Secret = process.env.REFRESH_SECRET as Secret;
      const payload = jwt.verify(refreshToken, REFRESH_SECRET) as { id: string };
      token = jwt.sign({ id: payload.id }, JWT_SECRET, { expiresIn: '15m' }); // renovar temporal
      // opcional: guardar token temporal en req.header para downstream
      req.headers['authorization'] = `Bearer ${token}`;
    }

    if (!token) return res.status(401).json({ message: 'No token, autorización denegada.' });

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username?: string; email?: string };
    req.user = decoded;
    next();
  } catch (err) {
    console.error('authMiddleware error:', err);
    res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

export default authMiddleware;
