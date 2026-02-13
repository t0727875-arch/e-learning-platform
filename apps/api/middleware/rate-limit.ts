import type { Request, Response, NextFunction } from "express";
import { getRedisClient } from "../lib/redis";

// Fallback in-memory store when Redis is unavailable
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const fallbackStores: Map<string, RateLimitStore> = new Map();
let redisAvailable = true;

function cleanupStore(store: RateLimitStore, now: number) {
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
  storeName?: string;
}

export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = "Too many requests, please try again later.",
    keyGenerator = (req) => {
      const userId = (req as any).user?.claims?.sub;
      return userId || req.ip || "anonymous";
    },
    storeName = "default",
  } = options;

  // Initialize fallback store
  if (!fallbackStores.has(storeName)) {
    fallbackStores.set(storeName, {});
  }

  const fallbackStore = fallbackStores.get(storeName)!;
  const windowSeconds = Math.ceil(windowMs / 1000);

  // Cleanup fallback store periodically
  setInterval(() => {
    cleanupStore(fallbackStore, Date.now());
  }, windowMs);

  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `ratelimit:${storeName}:${keyGenerator(req)}`;
    const now = Date.now();

    try {
      // Try Redis first
      if (redisAvailable) {
        const redis = await getRedisClient();

        // Use Redis INCR with EXPIRE for atomic rate limiting
        const count = await redis.incr(key);

        if (count === 1) {
          // First request in window, set expiration
          await redis.expire(key, windowSeconds);
        }

        const ttl = await redis.ttl(key);
        const resetTime = ttl > 0 ? ttl : windowSeconds;
        const remaining = Math.max(0, max - count);

        res.setHeader("X-RateLimit-Limit", max);
        res.setHeader("X-RateLimit-Remaining", remaining);
        res.setHeader("X-RateLimit-Reset", resetTime);

        if (count > max) {
          res.setHeader("Retry-After", resetTime);
          return res.status(429).json({
            error: "Too Many Requests",
            message,
            retryAfter: resetTime,
          });
        }

        return next();
      }
    } catch (error) {
      console.error('[RateLimit] Redis error, falling back to memory:', error);
      redisAvailable = false;

      // Retry Redis after 30 seconds
      setTimeout(() => {
        redisAvailable = true;
      }, 30000);
    }

    // Fallback to in-memory rate limiting
    if (!fallbackStore[key] || fallbackStore[key].resetTime < now) {
      fallbackStore[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
    } else {
      fallbackStore[key].count++;
    }

    const remaining = Math.max(0, max - fallbackStore[key].count);
    const resetTime = Math.ceil((fallbackStore[key].resetTime - now) / 1000);

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", resetTime);

    if (fallbackStore[key].count > max) {
      res.setHeader("Retry-After", resetTime);
      return res.status(429).json({
        error: "Too Many Requests",
        message,
        retryAfter: resetTime,
      });
    }

    next();
  };
}

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many authentication attempts. Please try again in 15 minutes.",
  storeName: "auth",
});

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: "Too many requests. Please slow down.",
  storeName: "api",
});

export const strictRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Rate limit exceeded for this action. Please wait before trying again.",
  storeName: "strict",
});

export const quizRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: "Too many quiz attempts. Please wait before starting another quiz.",
  storeName: "quiz",
});
