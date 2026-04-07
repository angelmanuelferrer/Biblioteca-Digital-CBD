import { Schema, model, Document } from 'mongoose';

export type UserRole = 'ADMIN' | 'USER';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name:         { type: String, required: true },
    email:        { type: String, required: true },
    passwordHash: { type: String, required: true },
    role:         { type: String, enum: ['ADMIN', 'USER'], default: 'USER' },
    active:       { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

export default model<IUser>('User', userSchema);
