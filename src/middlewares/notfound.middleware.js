import { fail } from '../utils/response.js';

export default function notFoundMiddleware(req, res) {
  return fail(res, 404, 'Not Found');
}



