import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../db/client'; // Prisma client
import { handleControllerError } from '../utils/errorHandler';

// Función para verificar que el proyecto existe y pertenece al usuario
const checkProjectOwnership = async (userId: string, projectId: string) => {
  return prisma.project.findFirst({
    where: { id: projectId, userId }
  });
};

// GET TASKS BY PROJECT ID
export const getTasks = async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) return res.status(401).json({ message: 'Autenticación requerida.' });

  try {
    const projectId = req.query.projectId as string;
    if (!projectId) return res.status(400).json({ message: 'projectId es obligatorio.' });

    const project = await checkProjectOwnership(req.user.id, projectId);
    if (!project) return res.status(404).json({ message: 'Proyecto no encontrado o no autorizado.' });

    const tasks = await prisma.task.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (err) {
    handleControllerError(err, res);
  }
};

// CREATE TASK
export const createTask = async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) return res.status(401).json({ message: 'Autenticación requerida.' });

  try {
    const { title, projectId } = req.body;
    if (!title || !projectId) return res.status(400).json({ message: 'Título y ProjectId son obligatorios.' });

    const project = await checkProjectOwnership(req.user.id, projectId);
    if (!project) return res.status(404).json({ message: 'Proyecto no encontrado o no autorizado.' });

    const task = await prisma.task.create({
      data: { title, projectId: project.id }
    });

    res.status(201).json(task);
  } catch (err) {
    handleControllerError(err, res);
  }
};

// UPDATE TASK
export const updateTask = async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) return res.status(401).json({ message: 'Autenticación requerida.' });

  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ message: 'Tarea no encontrada.' });

    const project = await checkProjectOwnership(req.user.id, task.projectId);
    if (!project) return res.status(403).json({ message: 'No autorizado para modificar esta tarea.' });

    const updatedTask = await prisma.task.update({
      where: { id },
      data: req.body
    });

    res.json(updatedTask);
  } catch (err) {
    handleControllerError(err, res);
  }
};

// DELETE TASK
export const deleteTask = async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) return res.status(401).json({ message: 'Autenticación requerida.' });

  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ message: 'Tarea no encontrada.' });

    const project = await checkProjectOwnership(req.user.id, task.projectId);
    if (!project) return res.status(403).json({ message: 'No autorizado para eliminar esta tarea.' });

    await prisma.task.delete({ where: { id } });

    res.json({ message: 'Tarea eliminada correctamente.' });
  } catch (err) {
    handleControllerError(err, res);
  }
};
