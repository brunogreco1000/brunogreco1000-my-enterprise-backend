// models/Task.ts

import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITask extends Document {
    _id: Types.ObjectId;
    title: string;
    completed: boolean;
    projectId: Types.ObjectId; // Tipado correcto para la referencia
    createdAt: Date;
    updatedAt: Date;
}

const taskSchema: Schema<ITask> = new Schema({
    title: { 
        type: String, 
        required: true,
        trim: true,
    },
    completed: { 
        type: Boolean, 
        default: false,
        index: true,
    },
    projectId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project', 
        required: true,
        index: true,
    },
}, {
    timestamps: true, 
});

export default mongoose.model<ITask>('Task', taskSchema);