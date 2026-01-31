import { fail } from '../utils/response.js';
import config from '../config/env.js';

export default function errorMiddleware(err, req, res, next) {
  // Log error stack in development
  if (config.nodeEnv === 'development') {
    console.error('Error:', err.stack);
  }

  // Default error
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || null;

  return fail(res, status, message, errors);
}



