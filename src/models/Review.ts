import { Schema, model, Document, Types } from 'mongoose';

export interface IReview extends Document {
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    userId:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookId:  { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
  },
  { timestamps: true }
);

reviewSchema.index({ bookId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ userId: 1, bookId: 1 }, { unique: true });

export default model<IReview>('Review', reviewSchema);
