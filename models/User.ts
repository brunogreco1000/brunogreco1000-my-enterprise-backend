// models/User.ts
import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserModel extends Model<IUser> {
  findByEmailWithPassword(email: string): Promise<IUser | null>;
}

const userSchema: Schema<IUser> = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

userSchema.statics.findByEmailWithPassword = function (email: string) {
  return this.findOne({ email }).select('+password');
};

const User = mongoose.model<IUser, UserModel>('User', userSchema);
export default User;
