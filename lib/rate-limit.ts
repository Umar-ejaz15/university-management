export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

/**
 * Simple in-memory rate limiter using sliding window algorithm
 * For production with multiple servers, consider Redis-based solution
 */
export class RateLimiter {
  private store: Map<string, RateLimitRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if request is allowed under rate limit
   */
  async check(
    identifier: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const record = this.store.get(identifier);

    // No existing record or window expired
    if (!record || now >= record.resetTime) {
      const resetTime = now + config.windowMs;
      this.store.set(identifier, {
        count: 1,
        resetTime,
      });

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime,
      };
    }

    // Within window, check if limit exceeded
    if (record.count >= config.maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);

      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
        retryAfter,
      };
    }

    // Increment count and allow
    record.count++;
    this.store.set(identifier, record);

    return {
      allowed: true,
      remaining: config.maxRequests - record.count,
      resetTime: record.resetTime,
    };
  }

  /**
   * Reset rate limit for a specific identifier
   */
  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [identifier, record] of this.store.entries()) {
      if (now >= record.resetTime) {
        this.store.delete(identifier);
      }
    }
  }

  /**
   * Clean up interval on shutdown
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Pre-configured rate limiters for different use cases
export const adminActionLimiter = new RateLimiter();
export const authLimiter = new RateLimiter();

// Rate limit configurations
export const ADMIN_ACTION_LIMIT: RateLimitConfig = {
  windowMs: 60000, // 1 minute
  maxRequests: 10, // 10 requests per minute
};

export const AUTH_LIMIT: RateLimitConfig = {
  windowMs: 900000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
};
