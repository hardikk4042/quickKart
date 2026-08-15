'use strict';

/**
 * src/utils/logger.js
 *
 * Structured logger using console with JSON output in production.
 * Strips sensitive fields from all log output.
 * NEVER log passwords, hashes, tokens, or secrets.
 */

const env = require('../config/env');

const SENSITIVE_KEYS = ['password', 'passwordHash', 'token', 'secret', 'authorization', 'DATABASE_URL', 'JWT_SECRET'];

function redact(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = Array.isArray(obj) ? [...obj] : { ...obj };
  for (const key of Object.keys(out)) {
    if (SENSITIVE_KEYS.some(s => key.toLowerCase().includes(s.toLowerCase()))) {
      out[key] = '[REDACTED]';
    } else if (typeof out[key] === 'object') {
      out[key] = redact(out[key]);
    }
  }
  return out;
}

function formatMessage(level, message, meta = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...redact(meta),
  };
  return env.NODE_ENV === 'production' ? JSON.stringify(entry) : entry;
}

const logger = {
  info:  (message, meta) => console.log(formatMessage('info',  message, meta)),
  warn:  (message, meta) => console.warn(formatMessage('warn',  message, meta)),
  error: (message, meta) => console.error(formatMessage('error', message, meta)),
  debug: (message, meta) => {
    if (env.NODE_ENV === 'development') console.debug(formatMessage('debug', message, meta));
  },
};

module.exports = logger;
