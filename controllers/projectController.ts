// controllers/projectController.ts

import { Response } from 'express';
import mongoose from 'mongoose'; // Necesario para Types.ObjectId
import { AuthRequest } from '../middleware/authMiddleware';
import Project from '../models/Project';
import { handleControllerError } from '../utils/errorHandler';

// ----------------------------------------------------
// Nota: La conversión a ObjectId se hace en cada función.
// ----------------------------------------------------

// GET PROJECTS
export const getProjects = async (req: AuthRequest, res: Response) => {
    if (!req.user || !req.user.id) return res.status(401).json({ message: 'Autenticación requerida.' });
    
    try {
        const objectIdUserId = new mongoose.Types.ObjectId(req.user.id); // 🎯 FIX

        const projects = await Project.find({ userId: objectIdUserId }).lean();
        res.json(projects);
    } catch (err) {
        handleControllerError(err, res);
    }
};

// CREATE PROJECT
export const createProject = async (req: AuthRequest, res: Response) => {
    if (!req.user || !req.user.id) return res.status(401).json({ message: 'Autenticación requerida.' });

    try {
        const { name, status, dueDate, progress } = req.body;
        
        const objectIdUserId = new mongoose.Types.ObjectId(req.user.id); // 🎯 FIX

        // Validación simplificada, Mongoose manejará el resto
        if (!name || !dueDate) {
            return res.status(400).json({ message: 'El nombre y la fecha de vencimiento son obligatorios.' });
        }

        const project = await Project.create({ 
            name, 
            status, 
            dueDate, 
            progress,
            userId: objectIdUserId // Asignación con ObjectId
        });
        res.status(201).json(project);
    } catch (err) {
        handleControllerError(err, res);
    }
};

// UPDATE PROJECT
export const updateProject = async (req: AuthRequest, res: Response) => {
    if (!req.user || !req.user.id) return res.status(401).json({ message: 'Autenticación requerida.' });
    
    try {
        const objectIdUserId = new mongoose.Types.ObjectId(req.user.id); // 🎯 FIX
        
        // La búsqueda asegura que solo se actualice el proyecto del usuario autenticado
        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, userId: objectIdUserId },
            req.body,
            { new: true, runValidators: true } // runValidators asegura que Mongoose valide el req.body
        );
        
        if (!project) return res.status(404).json({ message: 'Proyecto no encontrado o no autorizado.' });
        res.json(project);
    } catch (err) {
        handleControllerError(err, res);
    }
};

// DELETE PROJECT
export const deleteProject = async (req: AuthRequest, res: Response) => {
    if (!req.user || !req.user.id) return res.status(401).json({ message: 'Autenticación requerida.' });
    
    try {
        const objectIdUserId = new mongoose.Types.ObjectId(req.user.id); // 🎯 FIX

        const project = await Project.findOneAndDelete({ 
            _id: req.params.id, 
            userId: objectIdUserId 
        });
        
        if (!project) return res.status(404).json({ message: 'Proyecto no encontrado o no autorizado.' });
        res.json({ message: 'Proyecto eliminado correctamente.' });
    } catch (err) {
        handleControllerError(err, res);
    }
};