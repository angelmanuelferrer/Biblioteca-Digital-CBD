import { Schema, model, Document, Types } from 'mongoose';

export type LoanStatus = 'ACTIVE' | 'RETURNED' | 'LATE';

export interface ILoan extends Document {
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
  loanDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: LoanStatus;
  createdAt: Date;
  updatedAt: Date;
}

const loanSchema = new Schema<ILoan>(
  {
    userId:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookId:     { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    loanDate:   { type: Date, default: Date.now },
    dueDate:    { type: Date, required: true },
    returnDate: { type: Date },
    status:     { type: String, enum: ['ACTIVE', 'RETURNED', 'LATE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

loanSchema.index({ userId: 1 });
loanSchema.index({ bookId: 1 });
loanSchema.index({ userId: 1, status: 1 });
loanSchema.index({ dueDate: 1, status: 1 });

export default model<ILoan>('Loan', loanSchema);
