const Redis = require('redis');

// Advanced Caching System
class CacheManager {
  constructor() {
    this.redis = Redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    });
    
    this.memoryCache = new Map();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
    };
  }

  // Multi-level caching (Memory + Redis)
  async get(key) {
    // Level 1: Memory cache
    if (this.memoryCache.has(key)) {
      this.cacheStats.hits++;
      return this.memoryCache.get(key);
    }
    
    // Level 2: Redis cache
    try {
      const value = await this.redis.get(key);
      if (value) {
        const parsed = JSON.parse(value);
        this.memoryCache.set(key, parsed); // Promote to memory
        this.cacheStats.hits++;
        return parsed;
      }
    } catch (error) {
      console.error('Redis get error:', error);
    }
    
    this.cacheStats.misses++;
    return null;
  }

  // Set with TTL
  async set(key, value, ttl = 3600) {
    this.cacheStats.sets++;
    
    // Memory cache (limited size)
    if (this.memoryCache.size < 1000) {
      this.memoryCache.set(key, value);
    }
    
    // Redis cache
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  // Cache invalidation patterns
  async invalidatePattern(pattern) {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      
      // Clear memory cache entries matching pattern
      for (const key of this.memoryCache.keys()) {
        if (key.includes(pattern.replace('*', ''))) {
          this.memoryCache.delete(key);
        }
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  // Hotel search caching
  async cacheHotelSearch(searchParams, results) {
    const key = `search:${JSON.stringify(searchParams)}`;
    await this.set(key, results, 1800); // 30 minutes
  }

  async getCachedHotelSearch(searchParams) {
    const key = `search:${JSON.stringify(searchParams)}`;
    return await this.get(key);
  }

  // User session caching
  async cacheUserSession(userId, sessionData) {
    const key = `session:${userId}`;
    await this.set(key, sessionData, 86400); // 24 hours
  }

  // Hotel availability caching
  async cacheHotelAvailability(hotelId, date, availability) {
    const key = `availability:${hotelId}:${date}`;
    await this.set(key, availability, 300); // 5 minutes
  }

  // Cache warming
  async warmCache() {
    console.log('Starting cache warming...');
    
    // Pre-load popular hotels
    const popularHotels = await this.getPopularHotels();
    for (const hotel of popularHotels) {
      const key = `hotel:${hotel.id}`;
      await this.set(key, hotel, 7200);
    }
    
    console.log('Cache warming completed');
  }

  // Cache statistics
  getStats() {
    const hitRate = this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses);
    return {
      ...this.cacheStats,
      hitRate: (hitRate * 100).toFixed(2) + '%',
      memorySize: this.memoryCache.size,
    };
  }

  // Placeholder for popular hotels query
  async getPopularHotels() {
    return []; // Would fetch from database
  }
}

module.exports = CacheManager;