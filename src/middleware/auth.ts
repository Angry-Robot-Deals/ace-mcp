/**
 * Authentication Middleware
 * 
 * Validates Bearer token for API/MCP requests
 * Public endpoints: /, /health
 */

import { logger } from '../utils/logger';

export interface AuthRequest {
  headers: {
    authorization?: string;
  };
  path: string;
}

export interface AuthResult {
  authenticated: boolean;
  error?: string;
}

/**
 * Public endpoints that don't require authentication
 */
const PUBLIC_ENDPOINTS = [
  '/',
  '/health',
  '/index.html',
  '/style.css',
  '/app.js',
];

/**
 * Check if endpoint is public
 */
function isPublicEndpoint(path: string): boolean {
  return PUBLIC_ENDPOINTS.some(endpoint => 
    path === endpoint || path.startsWith('/static/')
  );
}

/**
 * Validate Bearer token
 */
export function validateBearerToken(request: AuthRequest): AuthResult {
  const { path, headers } = request;

  // Allow public endpoints
  if (isPublicEndpoint(path)) {
    return { authenticated: true };
  }

  // Check for Authorization header
  const authHeader = headers.authorization;
  if (!authHeader) {
    logger.warn(`Missing Authorization header for ${path}`);
    return {
      authenticated: false,
      error: 'Missing Authorization header. Bearer token required.',
    };
  }

  // Parse Bearer token
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    logger.warn(`Invalid Authorization header format for ${path}`);
    return {
      authenticated: false,
      error: 'Invalid Authorization header format. Expected: Bearer <token>',
    };
  }

  const token = parts[1];
  const expectedToken = process.env.API_BEARER_TOKEN;

  // Validate token exists in config
  if (!expectedToken) {
    logger.error('API_BEARER_TOKEN not configured in environment');
    return {
      authenticated: false,
      error: 'Server authentication not configured',
    };
  }

  // Compare tokens (constant-time comparison to prevent timing attacks)
  if (!constantTimeCompare(token, expectedToken)) {
    logger.warn(`Invalid Bearer token attempt for ${path}`);
    return {
      authenticated: false,
      error: 'Invalid Bearer token',
    };
  }

  // Token is valid
  return { authenticated: true };
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Express/Connect middleware wrapper
 */
export function authMiddleware(req: any, res: any, next: any): void {
  const authRequest: AuthRequest = {
    headers: req.headers,
    path: req.path || req.url,
  };

  const result = validateBearerToken(authRequest);

  if (!result.authenticated) {
    res.status(401).json({
      error: 'Unauthorized',
      message: result.error,
    });
    return;
  }

  next();
}

/**
 * Generate a secure random Bearer token
 * Usage: node -e "require('./dist/middleware/auth').generateToken()"
 */
export function generateToken(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}
