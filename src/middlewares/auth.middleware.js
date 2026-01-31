import jwt from 'jsonwebtoken';
import { fail } from '../utils/response.js';
import config from '../config/env.js';

export default function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return fail(res, 401, 'Authentication required');
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret);
      req.user = decoded;
      next();
    } catch (error) {
      return fail(res, 401, 'Invalid or expired token');
    }
  } catch (error) {
    return fail(res, 401, 'Authentication failed');
  }
}
