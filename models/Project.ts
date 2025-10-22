// models/Project.ts

import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProject extends Document {
    _id: Types.ObjectId;
    name: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    dueDate: Date;
    progress: number;
    userId: Types.ObjectId; // Tipado correcto para la referencia
    createdAt: Date;
    updatedAt: Date;
}

const projectSchema: Schema<IProject> = new Schema({
    name: { 
        type: String, 
        required: true,
        trim: true,
    },
    status: { 
        type: String, 
        enum: ['Pending', 'In Progress', 'Completed'], 
        default: 'Pending',
        index: true,
    },
    dueDate: { 
        type: Date, 
        required: true,
    },
    progress: { 
        type: Number, 
        default: 0,
        min: 0,
        max: 100,
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true,
    },
}, {
    timestamps: true,
});

export default mongoose.model<IProject>('Project', projectSchema);