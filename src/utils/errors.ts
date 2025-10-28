/**
 * Base error class for ACE MCP Server.
 */
export class ACEError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ACEError';
    Object.setPrototypeOf(this, ACEError.prototype);
  }
}

/**
 * Error thrown by LLM providers.
 */
export class LLMProviderError extends ACEError {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'LLMProviderError';
    Object.setPrototypeOf(this, LLMProviderError.prototype);
  }
}

/**
 * Error thrown for configuration issues.
 */
export class ConfigurationError extends ACEError {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message);
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}
