import { ok, fail } from '../utils/response.js';
import * as authService from '../services/auth.service.js';
import { sendWelcomeEmail } from '../services/emailService.js';
import { sendAdminNotification } from '../services/mailer.js';
import {
  ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  REFRESH_TOKEN_EXPIRES_IN_SECONDS,
} from '../utils/jwt.js';

/**
 * Build mobile-friendly login response data: keep existing user/accessToken/refreshToken, add optional fields.
 */
function buildLoginData(result) {
  const user = result.user || {};
  const displayName =
    (user.name && String(user.name).trim()) ||
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
    user.email ||
    null;
  const data = {
    ...result,
    user: {
      ...user,
      displayName: displayName || null,
      avatarUrl: user.avatarUrl ?? null,
      permissions: user.permissions ?? null,
    },
    tokenType: 'Bearer',
    expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    refreshExpiresIn: REFRESH_TOKEN_EXPIRES_IN_SECONDS,
    session: {
      issuedAt: new Date().toISOString(),
      clientHints: { recommendedHeader: 'Authorization: Bearer <accessToken>' },
    },
  };
  return data;
}

/**
 * Build mobile-friendly signup response data: keep existing user/accessToken/refreshToken/emailSent, add optional fields.
 */
function buildSignupData(result, emailSent) {
  const user = result.user || {};
  const displayName =
    (user.name && String(user.name).trim()) ||
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
    user.email ||
    null;
  const nextStep = emailSent === true ? 'verify_email' : 'none';
  const onboardingMessage =
    nextStep === 'verify_email' ? 'Check your email to verify your account.' : null;
  const data = {
    ...result,
    emailSent: !!emailSent,
    user: {
      ...user,
      displayName: displayName || null,
      avatarUrl: user.avatarUrl ?? null,
      permissions: user.permissions ?? null,
    },
    tokenType: 'Bearer',
    expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    refreshExpiresIn: REFRESH_TOKEN_EXPIRES_IN_SECONDS,
    onboarding: {
      nextStep,
      message: onboardingMessage,
    },
  };
  return data;
}

/**
 * Build mobile-friendly refresh response data: keep existing accessToken/refreshToken (if any), add optional fields.
 */
function buildRefreshData(result) {
  return {
    ...result,
    tokenType: 'Bearer',
    expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    refreshExpiresIn: result.refreshToken != null ? REFRESH_TOKEN_EXPIRES_IN_SECONDS : null,
    rotated: result.refreshToken != null,
  };
}

export async function login(req, res) {
  try {
    const result = await authService.login(req.body);
    const data = buildLoginData(result);
    return ok(res, data);
  } catch (error) {
    return fail(res, 401, error.message || 'Login failed');
  }
}

export async function signup(req, res) {
  try {
    const result = await authService.signup(req.body);

    const userFullName = `${result.user.firstName} ${result.user.lastName}`;
    let emailSent = false;
    try {
      emailSent = await sendWelcomeEmail({
        to: result.user.email,
        name: userFullName,
      });
    } catch {
      emailSent = false;
    }

    try {
      await sendAdminNotification(result.user);
    } catch (err) {
      console.error('[auth] Admin notification email failed:', err?.message || err);
    }

    const message = emailSent
      ? 'User registered successfully. A confirmation email has been sent.'
      : 'User registered successfully. We could not send a confirmation email—please check that email (SMTP) is configured.';

    const data = buildSignupData(result, emailSent);

    return res.status(201).json({
      success: true,
      data,
      message,
      errors: null,
    });
  } catch (error) {
    // Check if it's a duplicate email error
    if (error.message === 'Email already registered') {
      return fail(res, 409, error.message);
    }
    // Check for validation errors
    if (error.name === 'ValidationError' || error.name === 'ZodError') {
      return fail(res, 400, error.message || 'Validation failed');
    }
    // Log the full error for debugging
    console.error('Signup error:', error);
    return fail(res, 500, error.message || 'Signup failed');
  }
}

export async function refresh(req, res) {
  try {
    const result = await authService.refresh(req.body);
    const data = buildRefreshData(result);
    return ok(res, data);
  } catch (error) {
    return fail(res, 401, error.message || 'Token refresh failed');
  }
}

/**
 * Build logout response data: keep existing result; add optional fields only when result is an object.
 */
function buildLogoutData(result) {
  if (result != null && typeof result === 'object' && !Array.isArray(result)) {
    return {
      ...result,
      loggedOutAt: new Date().toISOString(),
      clientHints: { shouldClearTokens: true, nextAction: 'login' },
    };
  }
  return result;
}

export async function logout(req, res) {
  try {
    const result = await authService.logout(req.body);
    const data = buildLogoutData(result);
    return ok(res, data);
  } catch (error) {
    return fail(res, 500, error.message || 'Logout failed');
  }
}

/**
 * Request OTP by email (same response whether or not the email exists).
 */
export async function forgotPassword(req, res) {
  try {
    const { emailSent, userFound } = await authService.requestPasswordReset(req.body.email);

    if (userFound && !emailSent) {
      console.error('Password reset: user found but email failed to send for', req.body.email);
    }

    return ok(
      res,
      null,
      'If an account exists for this email, you will receive a password reset code shortly.'
    );
  } catch (error) {
    console.error('forgotPassword error:', error);
    return fail(res, 500, error.message || 'Request failed');
  }
}

/**
 * Submit OTP + new password.
 */
export async function resetPassword(req, res) {
  try {
    await authService.resetPasswordWithOtp(req.body);
    return ok(res, null, 'Your password has been reset. You can sign in with your new password.');
  } catch (error) {
    const msg = error.message || 'Reset failed';
    if (
      msg.includes('Invalid or expired') ||
      msg.includes('Too many incorrect')
    ) {
      return fail(res, 400, msg);
    }
    console.error('resetPassword error:', error);
    return fail(res, 500, msg);
  }
}
