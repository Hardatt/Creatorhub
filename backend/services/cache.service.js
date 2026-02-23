/**
 * Cache Service
 * Tries Redis first; falls back to an in-memory Map-based cache
 * so the app works without a running Redis instance.
 */
const Redis = require("ioredis");

let redisClient = null;
let redisAvailable = false;

// In-memory fallback store: key -> { value, expiresAt }
const memStore = new Map();

// Attempt Redis connection (non-blocking)
function connectRedis() {
  try {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      lazyConnect: true,
      // Do not crash if Redis is down
      enableOfflineQueue: false,
      retryStrategy: () => null,
    });

    redisClient.on("connect", () => {
      redisAvailable = true;
      console.log("[Cache] Redis connected");
    });

    redisClient.on("error", () => {
      redisAvailable = false;
    });

    redisClient.connect().catch(() => {
      redisAvailable = false;
      console.log("[Cache] Redis unavailable – using in-memory fallback");
    });
  } catch {
    redisAvailable = false;
    console.log("[Cache] Redis init failed – using in-memory fallback");
  }
}

connectRedis();

// ---------- In-memory helpers ----------

function memGet(key) {
  const entry = memStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memStore.delete(key);
    return null;
  }
  return entry.value;
}

function memSet(key, value, ttlSeconds) {
  memStore.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

function memDel(key) {
  memStore.delete(key);
}

// ---------- Public API ----------

/**
 * Get a cached value (parsed JSON).
 * @param {string} key
 * @returns {any|null}
 */
async function get(key) {
  if (redisAvailable) {
    const raw = await redisClient.get(key);
    return raw ? JSON.parse(raw) : null;
  }
  return memGet(key);
}

/**
 * Store a value in cache.
 * @param {string} key
 * @param {any} value  – will be JSON-serialized
 * @param {number} ttlSeconds
 */
async function set(key, value, ttlSeconds = 300) {
  if (redisAvailable) {
    await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } else {
    memSet(key, value, ttlSeconds);
  }
}

/**
 * Delete a key.
 * @param {string} key
 */
async function del(key) {
  if (redisAvailable) {
    await redisClient.del(key);
  } else {
    memDel(key);
  }
}

module.exports = { get, set, del };
