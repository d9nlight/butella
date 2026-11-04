/**
 * Lightweight in-memory rate limiter for serverless & edge environments.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic cleanup of expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  intervalMs: number; // Window size in milliseconds
  maxRequests: number; // Maximum allowed requests within window
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { intervalMs: 60 * 1000, maxRequests: 10 }
): { isAllowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const existing = rateLimitStore.get(identifier);

  if (!existing || now > existing.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + options.intervalMs,
    });
    return {
      isAllowed: true,
      remaining: options.maxRequests - 1,
      resetInMs: options.intervalMs,
    };
  }

  if (existing.count >= options.maxRequests) {
    return {
      isAllowed: false,
      remaining: 0,
      resetInMs: Math.max(0, existing.resetTime - now),
    };
  }

  existing.count += 1;
  return {
    isAllowed: true,
    remaining: options.maxRequests - existing.count,
    resetInMs: Math.max(0, existing.resetTime - now),
  };
}

/**
 * Extracts a client IP from NextRequest headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
