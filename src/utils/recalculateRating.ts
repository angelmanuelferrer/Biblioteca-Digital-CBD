import { Types } from 'mongoose';
import Review from '../models/Review';
import Book from '../models/Book';

export async function recalculateBookRating(bookId: string): Promise<void> {
  const bookObjectId = new Types.ObjectId(bookId);

  const [result] = await Review.aggregate<{ avg: number; count: number }>([
    { $match: { bookId: bookObjectId } },
    {
      $group: {
        _id: null,
        avg:   { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const averageRating = result ? Math.round(result.avg * 10) / 10 : 0;
  const ratingsCount  = result ? result.count : 0;

  await Book.findByIdAndUpdate(bookId, { averageRating, ratingsCount });
}
