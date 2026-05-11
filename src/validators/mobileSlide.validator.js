import { z } from 'zod';
import mongoose from 'mongoose';

const objectId = z
  .string()
  .refine((id) => mongoose.Types.ObjectId.isValid(id), 'Invalid id');

const optionalObjectIdOrNull = z
  .union([objectId, z.literal(''), z.null()])
  .optional()
  .transform((v) => (v === '' || v === undefined ? null : v));

const typeField = z
  .union([z.enum(['course', 'certificate']), z.literal(''), z.null()])
  .optional()
  .transform((v) => (v === '' || v === undefined ? null : v));

/**
 * Note: validators run after multer; image presence is checked in the controller.
 */
export const createMobileSlideSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(200),
    body: z.string().max(2000).optional().default(''),
    type: typeField,
    courseId: optionalObjectIdOrNull,
    certificateId: optionalObjectIdOrNull,
    order: z.coerce.number().int().optional().default(0),
    isActive: z.coerce.boolean().optional().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'course' && !data.courseId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['courseId'],
        message: 'courseId is required when type is "course"',
      });
    }
    if (data.type === 'certificate' && !data.certificateId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['certificateId'],
        message: 'certificateId is required when type is "certificate"',
      });
    }
  });

export const updateMobileSlideSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    body: z.string().max(2000).optional(),
    type: typeField,
    courseId: optionalObjectIdOrNull,
    certificateId: optionalObjectIdOrNull,
    order: z.coerce.number().int().optional(),
    isActive: z.coerce.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'course' && data.courseId === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['courseId'],
        message: 'courseId is required when type is "course"',
      });
    }
    if (data.type === 'certificate' && data.certificateId === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['certificateId'],
        message: 'certificateId is required when type is "certificate"',
      });
    }
  });
