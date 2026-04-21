import { Model, FilterQuery } from 'mongoose';

export interface PageInfo {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pageInfo: PageInfo;
}

export async function paginate<T>(
  model: Model<T>,
  filter: FilterQuery<T>,
  page: number,
  limit: number
): Promise<PaginatedResult<T>> {
  const safePage  = Math.max(1, page);
  const safeLimit = Math.max(1, Math.min(limit, 100)); // cap at 100
  const skip = (safePage - 1) * safeLimit;

  const [items, totalItems] = await Promise.all([
    model.find(filter).skip(skip).limit(safeLimit).exec(),
    model.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalItems / safeLimit);

  return {
    items,
    pageInfo: {
      page: safePage,
      limit: safeLimit,
      totalItems,
      totalPages,
      hasNextPage:      safePage < totalPages,
      hasPreviousPage:  safePage > 1,
    },
  };
}
