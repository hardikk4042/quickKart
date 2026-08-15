'use strict';

/**
 * src/config/env.js
 *
 * Central validated environment configuration.
 * Fails fast with a clear message if required variables are missing.
 * Nothing inside this module logs secrets.
 */

require('dotenv').config();

function required(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[env] Missing required environment variable: ${key}`);
  }
  return value;
}

function optional(key, defaultValue = undefined) {
  return process.env[key] ?? defaultValue;
}

const env = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: parseInt(optional('PORT', '3000'), 10),

  DATABASE_URL: required('DATABASE_URL'),

  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: optional('JWT_EXPIRES_IN', '15m'),

  // Reverse geocoding uses OpenStreetMap Nominatim (no API key required)
  // GOOGLE_MAPS_API_KEY removed — not needed

  CORS_ORIGIN: optional('CORS_ORIGIN', 'http://localhost:5173'),
};

module.exports = env;
