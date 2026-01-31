/**
 * Success response helper
 */
export function ok(res, data = null, message = null, errors = null, status = 200) {
  return res.status(status).json({
    success: true,
    data,
    message,
    errors,
  });
}

/**
 * Error response helper
 */
export function fail(res, status = 500, message = 'Internal Server Error', errors = null) {
  return res.status(status).json({
    success: false,
    data: null,
    message,
    errors,
  });
}
