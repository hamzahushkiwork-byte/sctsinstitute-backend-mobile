import { ok, fail } from '../utils/response.js';
import * as authService from '../services/auth.service.js';
import { sendWelcomeEmail } from '../services/emailService.js';

export async function login(req, res) {
  try {
    const result = await authService.login(req.body);
    return ok(res, result);
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

    // Return response with emailSent flag
    const message = emailSent 
      ? 'User registered successfully' 
      : 'Registered, but email failed to send';
    
    return res.status(201).json({
      success: true,
      data: {
        ...result,
        emailSent,
      },
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
    return ok(res, result);
  } catch (error) {
    return fail(res, 401, error.message || 'Token refresh failed');
  }
}

export async function logout(req, res) {
  try {
    const result = await authService.logout(req.body);
    return ok(res, result);
  } catch (error) {
    return fail(res, 500, error.message || 'Logout failed');
  }
}
