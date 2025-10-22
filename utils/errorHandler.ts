// utils/errorHandler.ts

import { Response } from 'express';
import mongoose from 'mongoose';

export const handleControllerError = (err: any, res: Response) => {
    console.error('SERVER ERROR:', err);

    // Mongoose Validation Error (400)
    if (err instanceof mongoose.Error.ValidationError) {
        const messages = Object.values(err.errors).map((e: any) => e.message);
        return res.status(400).json({ 
            message: 'Falló la validación de datos.', 
            errors: messages 
        });
    }

    // Mongoose Cast Error (400 - ID inválido)
    if (err instanceof mongoose.Error.CastError) {
        return res.status(400).json({ 
            message: `Formato de ID inválido en el campo ${err.path}.` 
        });
    }

    // Error de Duplicidad (409)
    if (err.code && err.code === 11000) {
        const field = Object.keys(err.keyValue).join(', ');
        return res.status(409).json({ 
            message: `El campo ${field} ya existe y debe ser único.` 
        });
    }

    // Otros errores internos (500)
    res.status(500).json({ 
        message: 'Error interno del servidor.' 
    });
};