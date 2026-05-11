import { z } from 'zod';
import mongoose from 'mongoose';

const objectId = z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), 'Invalid id');

const priceField = z
  .union([z.coerce.number().min(0), z.null()])
  .optional();

export const createTrendingCourseSchema = z.object({
  courseId: objectId,
  order: z.coerce.number().int().optional().default(0),
  price: priceField,
  isActive: z.coerce.boolean().optional().default(true),
});

export const updateTrendingCourseSchema = z
  .object({
    courseId: objectId.optional(),
    order: z.coerce.number().int().optional(),
    price: priceField,
    isActive: z.coerce.boolean().optional(),
  })
  .refine(
    (d) =>
      d.courseId != null ||
      d.order !== undefined ||
      d.price !== undefined ||
      d.isActive !== undefined,
    { message: 'Provide at least one of: courseId, order, price, isActive' }
  );
