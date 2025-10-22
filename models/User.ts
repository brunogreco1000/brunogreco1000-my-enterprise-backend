import mongoose, { Schema, Document, Types, Model } from 'mongoose';

interface UserModel extends Model<IUser> {
    findByEmailWithPassword(email: string): Promise<IUser | null>;
}

export interface IUser extends Document {
    _id: Types.ObjectId;
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema: Schema<IUser> = new Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { 
        type: String, 
        required: true,
        select: false, // Excluye el hash por defecto
    }, 
}, {
    timestamps: true,
});

userSchema.statics.findByEmailWithPassword = function(email: string): Promise<IUser | null> {
    return this.findOne({ email }).select('+password');
};

export default mongoose.model<IUser, UserModel>('User', userSchema);




