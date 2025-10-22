import { Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export const handleControllerError = (err: unknown, res: Response) => {
  console.error('SERVER ERROR:', err);

  // Known Prisma error
  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        const field = (err.meta?.target as string[]).join(', ');
        return res.status(409).json({ message: `El campo ${field} ya existe y debe ser único.` });
      case 'P2003':
        return res.status(400).json({ message: 'Referencia a otro recurso no válida.' });
      default:
        return res.status(400).json({ message: 'Error de restricción en la base de datos.' });
    }
  }

  // Otros errores
  return res.status(500).json({ message: 'Error interno del servidor.' });
};

