import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../db/client';
import { handleControllerError } from '../utils/errorHandler';

// GET PROJECTS
export const getProjects = async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) return res.status(401).json({ message: 'Autenticación requerida.' });

  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (err) {
    handleControllerError(err, res);
  }
};

// CREATE PROJECT
export const createProject = async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) return res.status(401).json({ message: 'Autenticación requerida.' });

  try {
    const { name, status, dueDate, progress } = req.body;

    if (!name || !dueDate) {
      return res.status(400).json({ message: 'El nombre y la fecha de vencimiento son obligatorios.' });
    }

    const project = await prisma.project.create({
      data: {
        name,
        status,
        dueDate: new Date(dueDate),
        progress: progress || 0,
        userId: req.user.id
      }
    });

    res.status(201).json(project);
  } catch (err) {
    handleControllerError(err, res);
  }
};

// UPDATE PROJECT
export const updateProject = async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) return res.status(401).json({ message: 'Autenticación requerida.' });

  try {
    const { id } = req.params;

    const project = await prisma.project.updateMany({
      where: { id, userId: req.user.id },
      data: req.body
    });

    if (project.count === 0) {
      return res.status(404).json({ message: 'Proyecto no encontrado o no autorizado.' });
    }

    const updatedProject = await prisma.project.findUnique({ where: { id } });
    res.json(updatedProject);
  } catch (err) {
    handleControllerError(err, res);
  }
};

// DELETE PROJECT
export const deleteProject = async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) return res.status(401).json({ message: 'Autenticación requerida.' });

  try {
    const { id } = req.params;

    const project = await prisma.project.deleteMany({
      where: { id, userId: req.user.id }
    });

    if (project.count === 0) {
      return res.status(404).json({ message: 'Proyecto no encontrado o no autorizado.' });
    }

    res.json({ message: 'Proyecto eliminado correctamente.' });
  } catch (err) {
    handleControllerError(err, res);
  }
};
