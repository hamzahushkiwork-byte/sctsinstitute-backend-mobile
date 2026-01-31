import { fail } from '../utils/response.js';

/**
 * Middleware to validate request body using Zod schema
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return fail(res, 422, 'Validation failed', errors);
    }

    req.body = result.data;
    next();
  };
}



