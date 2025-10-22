import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { generateAuthTokens } from '../utils/tokenUtils';
import { AuthRequest } from '../middleware/authMiddleware';

const ACCESS_SECRET = process.env.JWT_SECRET || 'default_access_secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'default_refresh_secret';

const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    path: '/api/auth/refresh',
    maxAge: 7*24*60*60*1000
  });
};

export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: 'Correo ya registrado' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, password: hashedPassword }) as IUser;

    const { accessToken, refreshToken } = generateAuthTokens(newUser);
    setRefreshTokenCookie(res, refreshToken);

    return res.status(201).json({
      message: 'Registro exitoso',
      user: { username: newUser.username, email: newUser.email },
      accessToken
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }) as IUser | null;
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Credenciales inválidas' });

    const { accessToken, refreshToken } = generateAuthTokens(user);
    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      message: 'Login exitoso',
      user: { username: user.username, email: user.email },
      accessToken
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No token proporcionado' });

  try {
    const payload = jwt.verify(token, REFRESH_SECRET) as { id: string };
    const user = await User.findById(payload.id) as IUser | null;
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const { accessToken, refreshToken: newRefreshToken } = generateAuthTokens(user);
    setRefreshTokenCookie(res, newRefreshToken);

    return res.status(200).json({
      message: 'Token renovado',
      user: { username: user.username, email: user.email },
      accessToken
    });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Usuario no autenticado' });

    const user = await User.findById(req.user.id).select('username email');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    return res.status(200).json({ user: { username: user.username, email: user.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};
