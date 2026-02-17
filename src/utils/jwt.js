import jwt from 'jsonwebtoken';
import config from '../config/env.js';

/** Access token expiry: 15m in seconds (for API responses). */
export const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 15 * 60;

/** Refresh token expiry: 7d in seconds (for API responses). */
export const REFRESH_TOKEN_EXPIRES_IN_SECONDS = 7 * 24 * 60 * 60;

/**
 * Sign access token
 * @param {Object} payload - Token payload
 * @returns {string} Signed access token
 */
export function signAccessToken(payload) {
  return jwt.sign(payload, config.jwt.accessSecret, { expiresIn: '15m' });
}

/**
 * Sign refresh token
 * @param {Object} payload - Token payload
 * @returns {string} Signed refresh token
 */
export function signRefreshToken(payload) {
  return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: '7d' });
}

/**
 * Verify refresh token
 * @param {string} token - Refresh token to verify
 * @returns {Object} Decoded token payload
 */
export function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret);
}

/**
 * Verify access token
 * @param {string} token - Access token to verify
 * @returns {Object} Decoded token payload
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.accessSecret);
}



