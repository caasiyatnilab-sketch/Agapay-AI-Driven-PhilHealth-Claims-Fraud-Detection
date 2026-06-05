const buckets = new Map();

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 24) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set to a strong value in production.');
  }

  return 'development-only-change-me-secret';
}

function getClientIp(req) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'local';
}

function assertRateLimit(req, { key = 'global', limit = 60, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const bucketKey = `${key}:${getClientIp(req)}`;
  const current = buckets.get(bucketKey) || { count: 0, resetAt: now + windowMs };

  if (current.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return;
  }

  current.count += 1;
  buckets.set(bucketKey, current);

  if (current.count > limit) {
    const retryAfter = Math.ceil((current.resetAt - now) / 1000);
    const error = new Error(`Too many requests. Try again in ${retryAfter} seconds.`);
    error.status = 429;
    throw error;
  }
}

function getErrorStatus(error, fallback = 500) {
  if (error.status) return error.status;
  if (error.message?.includes('token')) return 401;
  if (error.message === 'Unauthorized') return 403;
  return fallback;
}

module.exports = { getJwtSecret, getClientIp, assertRateLimit, getErrorStatus };
