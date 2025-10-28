/**
 * Tests for Authentication Middleware
 */

import { validateBearerToken, AuthRequest } from '../auth';

describe('Authentication Middleware', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.API_BEARER_TOKEN = 'test-token-12345';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('validateBearerToken', () => {
    it('should allow public endpoints without token', () => {
      const request: AuthRequest = {
        headers: {},
        path: '/',
      };

      const result = validateBearerToken(request);
      expect(result.authenticated).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should allow /health endpoint without token', () => {
      const request: AuthRequest = {
        headers: {},
        path: '/health',
      };

      const result = validateBearerToken(request);
      expect(result.authenticated).toBe(true);
    });

    it('should allow static files without token', () => {
      const request: AuthRequest = {
        headers: {},
        path: '/static/logo.png',
      };

      const result = validateBearerToken(request);
      expect(result.authenticated).toBe(true);
    });

    it('should reject API requests without Authorization header', () => {
      const request: AuthRequest = {
        headers: {},
        path: '/api/generate',
      };

      const result = validateBearerToken(request);
      expect(result.authenticated).toBe(false);
      expect(result.error).toContain('Missing Authorization header');
    });

    it('should reject requests with invalid Authorization format', () => {
      const request: AuthRequest = {
        headers: {
          authorization: 'InvalidFormat token',
        },
        path: '/api/generate',
      };

      const result = validateBearerToken(request);
      expect(result.authenticated).toBe(false);
      expect(result.error).toContain('Invalid Authorization header format');
    });

    it('should reject requests with invalid token', () => {
      const request: AuthRequest = {
        headers: {
          authorization: 'Bearer wrong-token',
        },
        path: '/api/generate',
      };

      const result = validateBearerToken(request);
      expect(result.authenticated).toBe(false);
      expect(result.error).toContain('Invalid Bearer token');
    });

    it('should accept requests with valid token', () => {
      const request: AuthRequest = {
        headers: {
          authorization: 'Bearer test-token-12345',
        },
        path: '/api/generate',
      };

      const result = validateBearerToken(request);
      expect(result.authenticated).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept MCP requests with valid token', () => {
      const request: AuthRequest = {
        headers: {
          authorization: 'Bearer test-token-12345',
        },
        path: '/mcp/tools',
      };

      const result = validateBearerToken(request);
      expect(result.authenticated).toBe(true);
    });

    it('should handle missing API_BEARER_TOKEN in config', () => {
      delete process.env.API_BEARER_TOKEN;

      const request: AuthRequest = {
        headers: {
          authorization: 'Bearer some-token',
        },
        path: '/api/generate',
      };

      const result = validateBearerToken(request);
      expect(result.authenticated).toBe(false);
      expect(result.error).toContain('Server authentication not configured');
    });

    it('should be case-sensitive for token comparison', () => {
      const request: AuthRequest = {
        headers: {
          authorization: 'Bearer TEST-TOKEN-12345',
        },
        path: '/api/generate',
      };

      const result = validateBearerToken(request);
      expect(result.authenticated).toBe(false);
    });

    it('should reject tokens with extra characters', () => {
      const request: AuthRequest = {
        headers: {
          authorization: 'Bearer test-token-12345extra',
        },
        path: '/api/generate',
      };

      const result = validateBearerToken(request);
      expect(result.authenticated).toBe(false);
    });
  });
});
