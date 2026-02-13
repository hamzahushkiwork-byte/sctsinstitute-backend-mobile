/**
 * Success response helper
 * Includes accessToken in response when res.locals.accessToken is set (authenticated requests)
 */
export function ok(
  res,
  data = null,
  message = null,
  errors = null,
  status = 200,
) {
  const payload = {
    success: true,
    data,
    message,
    errors,
    test: "test ok",
  };
  if (res.locals && res.locals.accessToken) {
    payload.accessToken = res.locals.accessToken;
  }
  return res.status(status).json(payload);
}

/**
 * Error response helper
 * Includes accessToken in response when res.locals.accessToken is set (authenticated requests)
 */
export function fail(
  res,
  status = 500,
  message = "Internal Server Error",
  errors = null,
) {
  const payload = {
    success: false,
    data: null,
    message,
    errors,
  };
  if (res.locals && res.locals.accessToken) {
    payload.accessToken = res.locals.accessToken;
  }
  return res.status(status).json(payload);
}
