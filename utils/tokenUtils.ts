import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

const ACCESS_SECRET = process.env.JWT_SECRET || 'default_access_secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'default_refresh_secret';

if (ACCESS_SECRET === 'default_access_secret' || REFRESH_SECRET === 'default_refresh_secret') {
    console.warn("ADVERTENCIA DE SEGURIDAD: JWT_SECRET o REFRESH_SECRET no están definidos en .env. Usando valores por defecto.");
}

export const generateAuthTokens = (user: IUser) => {
    const payload = { id: user._id }; 

    const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });

    return { accessToken, refreshToken };
};