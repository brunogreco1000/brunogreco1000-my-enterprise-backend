// controllers/taskController.ts

import { Response } from 'express';
import mongoose, { Types } from 'mongoose'; // Necesario para Types.ObjectId
import { AuthRequest } from '../middleware/authMiddleware'; 
import Task from '../models/Task';
import Project from '../models/Project'; 
import { handleControllerError } from '../utils/errorHandler'; 

// Función de utilidad para asegurar que el proyecto existe y pertenece al usuario
const checkProjectOwnership = async (userId: string, projectId: string) => {
    if (!Types.ObjectId.isValid(projectId)) return null;
    
    const project = await Project.findOne({ 
        _id: projectId, 
        userId: new Types.ObjectId(userId) // 🎯 FIX
    });
    return project;
};

// GET TASKS BY PROJECT ID
export const getTasks = async (req: AuthRequest, res: Response) => {
    if (!req.user || !req.user.id) return res.status(401).json({ message: 'Autenticación requerida.' });
    
    try {
        const { projectId } = req.query;

        // Seguridad: Verificar que el projectId existe y pertenece al usuario
        const project = await checkProjectOwnership(req.user.id, projectId as string);
        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado o no autorizado.' });
        }

        const tasks = await Task.find({ projectId: project._id }).lean();
        res.json(tasks);
        
    } catch (err) {
        handleControllerError(err, res);
    }
};

// CREATE TASK
export const createTask = async (req: AuthRequest, res: Response) => {
    if (!req.user || !req.user.id) return res.status(401).json({ message: 'Autenticación requerida.' });

    try {
        const { title, projectId } = req.body;

        if (!title || !projectId) {
            return res.status(400).json({ message: 'Título y ProjectId son obligatorios.' });
        }

        // Seguridad: Verificar que el projectId existe y pertenece al usuario
        const project = await checkProjectOwnership(req.user.id, projectId);
        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado o no autorizado.' });
        }
        
        const task = await Task.create({ title, projectId: project._id });
        res.status(201).json(task);
        
    } catch (err) {
        handleControllerError(err, res);
    }
};

// UPDATE TASK
export const updateTask = async (req: AuthRequest, res: Response) => {
    if (!req.user || !req.user.id) return res.status(401).json({ message: 'Autenticación requerida.' });

    try {
        const { id } = req.params;
        
        // 1. Verificar la pertenencia del proyecto asociado a la tarea
        const taskToUpdate = await Task.findById(id);
        if (!taskToUpdate) return res.status(404).json({ message: 'Tarea no encontrada.' });
        
        const ownerProject = await checkProjectOwnership(req.user.id, taskToUpdate.projectId.toString());
        if (!ownerProject) {
            return res.status(403).json({ message: 'No autorizado para modificar esta tarea.' });
        }

        // 2. Actualizar (incluyendo validación y devolviendo el nuevo objeto)
        const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        
        res.json(updatedTask);
        
    } catch (err) {
        handleControllerError(err, res);
    }
};

// DELETE TASK
export const deleteTask = async (req: AuthRequest, res: Response) => {
    if (!req.user || !req.user.id) return res.status(401).json({ message: 'Autenticación requerida.' });

    try {
        const { id } = req.params;

        // 1. Buscar la tarea para obtener su projectId
        const taskToDelete = await Task.findById(id);
        if (!taskToDelete) return res.status(404).json({ message: 'Tarea no encontrada.' });

        // 2. Seguridad: Verificar la pertenencia del proyecto
        const ownerProject = await checkProjectOwnership(req.user.id, taskToDelete.projectId.toString());
        if (!ownerProject) {
            return res.status(403).json({ message: 'No autorizado para eliminar esta tarea.' });
        }

        // 3. Eliminar la tarea
        await Task.deleteOne({ _id: id });

        res.json({ message: 'Tarea eliminada correctamente.' });
        
    } catch (err) {
        handleControllerError(err, res);
    }
};