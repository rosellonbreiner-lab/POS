/**
 * In-memory Sliding Window Rate Limiter
 * Protege endpoints críticos contra ataques de fuerza bruta, credential stuffing y DoS.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Limpieza automática periódica cada 10 minutos
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetAt < now && (!record.blockedUntil || record.blockedUntil < now)) {
        rateLimitStore.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}

export interface RateLimitOptions {
  windowMs?: number; // Ventana de tiempo en ms (default: 15 min)
  maxAttempts?: number; // Máximo de intentos permitidos (default: 5)
  blockDurationMs?: number; // Duración del bloqueo temporal si se excede (default: 15 min)
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
} {
  const windowMs = options.windowMs || 15 * 60 * 1000;
  const maxAttempts = options.maxAttempts || 5;
  const blockDurationMs = options.blockDurationMs || 15 * 60 * 1000;
  const now = Date.now();

  const record = rateLimitStore.get(identifier);

  // Si está bloqueado activamente
  if (record?.blockedUntil && record.blockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  // Si no existe o la ventana expiró
  if (!record || record.resetAt < now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxAttempts - 1,
    };
  }

  // Incrementar intento
  record.count += 1;

  if (record.count > maxAttempts) {
    record.blockedUntil = now + blockDurationMs;
    const retryAfterSeconds = Math.ceil(blockDurationMs / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  return {
    allowed: true,
    remaining: maxAttempts - record.count,
  };
}

export function resetRateLimit(identifier: string) {
  rateLimitStore.delete(identifier);
}

