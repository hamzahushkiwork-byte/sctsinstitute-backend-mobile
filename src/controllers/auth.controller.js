import { ok, fail } from '../utils/response.js';
import * as authService from '../services/auth.service.js';
import { sendWelcomeEmail } from '../services/emailService.js';
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
    
    // Attempt to send welcome email asynchronously (don't block response)
    // Use setImmediate to ensure registration response is sent first
    let emailSent = false;
    const userFullName = `${result.user.firstName} ${result.user.lastName}`;
    
    // Try to send email, but don't wait for it
    setImmediate(async () => {
      try {
        emailSent = await sendWelcomeEmail({
          to: result.user.email,
          name: userFullName,
        });
      } catch (error) {
        // Email sending errors are already logged in emailService
        emailSent = false;
      }
    });

    // For now, attempt synchronous send with timeout to get emailSent status
    // If it takes too long, we'll return emailSent: false
    try {
      const emailPromise = sendWelcomeEmail({
        to: result.user.email,
        name: userFullName,
      });
      
      // Wait max 2 seconds for email to send
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => resolve(false), 2000);
      });
      
      emailSent = await Promise.race([emailPromise, timeoutPromise]);
    } catch (error) {
      // Email failed, but registration succeeded
      emailSent = false;
    }

    const message = emailSent
      ? 'User registered successfully'
      : 'Registered, but email failed to send';
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
