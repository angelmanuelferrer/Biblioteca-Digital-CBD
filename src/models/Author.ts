import { Schema, model, Document } from 'mongoose';

export interface IAuthor extends Document {
  name: string;
  bio?: string;
  birthDate?: Date;
  deathDate?: Date;
  nationality?: string;
  createdAt: Date;
  updatedAt: Date;
}

const authorSchema = new Schema<IAuthor>(
  {
    name:        { type: String, required: true },
    bio:         { type: String },
    birthDate:   { type: Date },
    deathDate:   { type: Date },
    nationality: { type: String },
  },
  { timestamps: true }
);

export default model<IAuthor>('Author', authorSchema);
