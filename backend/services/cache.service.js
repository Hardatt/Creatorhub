


const Redis = require("ioredis");

let redisClient = null;
let redisAvailable = false;


const memStore = new Map();


function connectRedis() {
  try {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      lazyConnect: true,
      
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





async function get(key) {
  if (redisAvailable) {
    const raw = await redisClient.get(key);
    return raw ? JSON.parse(raw) : null;
  }
  return memGet(key);
}



async function set(key, value, ttlSeconds = 300) {
  if (redisAvailable) {
    await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } else {
    memSet(key, value, ttlSeconds);
  }
}



async function del(key) {
  if (redisAvailable) {
    await redisClient.del(key);
  } else {
    memDel(key);
  }
}

module.exports = { get, set, del };
