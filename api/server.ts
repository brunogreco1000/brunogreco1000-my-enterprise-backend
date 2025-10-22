import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// === Conexión a DB y rutas ===
import connectDB from '../config/db';
import authRoutes from '../routes/authRoutes';
import projectRoutes from '../routes/projectRoutes';
import taskRoutes from '../routes/taskRoutes';
import authMiddleware, { AuthRequest } from '../middleware/authMiddleware';

const app = express();

// FLAG para saber si la DB se conectó
let isDbConnected = false;

// --- Inicialización del servidor ---
const initializeApp = async () => {
    try {
        console.log('--- Intentando conectar a la DB ---');
        await connectDB();
        isDbConnected = true;
        console.log('--- DB conectada exitosamente ---');
    } catch (error) {
        console.error('*** ERROR CRÍTICO DE CONEXIÓN A LA DB ***');
        console.error(error);
        isDbConnected = false;
    }

    // --- Configuración de CORS ---
    const allowedOrigins = [
        'http://localhost:3000', // desarrollo local
        'https://my-enterprise-app-git-main-bruno-grecos-projects.vercel.app', // frontend principal
        'https://my-enterprise-app-plum.vercel.app', // frontend alternativo
        // Agrega aquí tu dominio final de producción si lo tienes
    ];

    app.use(cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true); // permite Postman/curl
            if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
                return callback(null, true); // permite todos los subdominios de Vercel
            }
            return callback(new Error(`CORS no permitido para el origen: ${origin}`), false);
        },
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
        methods: ['GET','POST','PUT','DELETE','OPTIONS']
    }));

    // --- Middlewares ---
    app.use(cookieParser());
    app.use(express.json());

    // --- Rutas de API ---
    app.use('/auth', authRoutes);
    app.use('/projects', authMiddleware, projectRoutes);
    app.use('/tasks', authMiddleware, taskRoutes);

    // --- Ruta de prueba usuario autenticado ---
    app.get('/auth/me', authMiddleware, (req: AuthRequest, res: Response) => {
        if (!isDbConnected) {
            console.warn('Advertencia: La DB no estaba conectada al llamar /auth/me');
        }
        if (!req.user) return res.status(401).json({ message: 'Usuario no autenticado' });
        res.json({ user: req.user, dbStatus: isDbConnected ? 'Conectado' : 'Falló' });
    });

    // --- Middleware de manejo de errores ---
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error(err.stack);
        const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
        res.status(statusCode).json({
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : {}
        });
    });

    // --- Solo para desarrollo local ---
    if (process.env.NODE_ENV !== 'production') {
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
    }
};

// Inicializa la app
initializeApp();

// --- Export para Vercel ---
export default app;
