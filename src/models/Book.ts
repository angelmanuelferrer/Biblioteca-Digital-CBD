import { Schema, model, Document, Types } from 'mongoose';

export interface IBook extends Document {
  title: string;
  isbn?: string;
  description?: string;
  publishedYear?: number;
  genres: string[];
  authorIds: Types.ObjectId[];
  averageRating: number;
  ratingsCount: number;
  availableCopies: number;
  totalCopies: number;
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<IBook>(
  {
    title:           { type: String, required: true },
    isbn:            { type: String },
    description:     { type: String },
    publishedYear:   { type: Number },
    genres:          { type: [String], default: [] },
    authorIds:       [{ type: Schema.Types.ObjectId, ref: 'Author' }],
    averageRating:   { type: Number, default: 0 },
    ratingsCount:    { type: Number, default: 0 },
    availableCopies: { type: Number, default: 0 },
    totalCopies:     { type: Number, required: true },
  },
  { timestamps: true }
);

bookSchema.index({ title: 'text', description: 'text' });
bookSchema.index({ genres: 1 });
bookSchema.index({ authorIds: 1 });
bookSchema.index({ averageRating: -1 });
bookSchema.index({ availableCopies: 1 });

export default model<IBook>('Book', bookSchema);
