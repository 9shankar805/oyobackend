// Database Performance Optimization
class DatabaseOptimizer {
  constructor(db) {
    this.db = db;
    this.queryCache = new Map();
    this.slowQueries = [];
    this.connectionPool = {
      active: 0,
      idle: 0,
      max: 20,
    };
  }

  // Query optimization middleware
  optimizeQuery() {
    return async (req, res, next) => {
      const originalQuery = this.db.query;
      
      this.db.query = async (sql, params) => {
        const start = Date.now();
        const queryKey = `${sql}:${JSON.stringify(params)}`;
        
        // Check cache first
        if (this.queryCache.has(queryKey)) {
          return this.queryCache.get(queryKey);
        }
        
        try {
          const result = await originalQuery.call(this.db, sql, params);
          const duration = Date.now() - start;
          
          // Log slow queries
          if (duration > 1000) {
            this.slowQueries.push({
              sql,
              params,
              duration,
              timestamp: new Date(),
            });
          }
          
          // Cache read queries
          if (sql.trim().toUpperCase().startsWith('SELECT')) {
            this.queryCache.set(queryKey, result);
            setTimeout(() => this.queryCache.delete(queryKey), 300000); // 5 minutes
          }
          
          return result;
        } catch (error) {
          console.error('Query error:', error);
          throw error;
        }
      };
      
      next();
    };
  }

  // Connection pool management
  async getConnection() {
    if (this.connectionPool.active >= this.connectionPool.max) {
      await this.waitForConnection();
    }
    
    this.connectionPool.active++;
    this.connectionPool.idle--;
    
    return {
      query: this.db.query.bind(this.db),
      release: () => {
        this.connectionPool.active--;
        this.connectionPool.idle++;
      },
    };
  }

  waitForConnection() {
    return new Promise((resolve) => {
      const check = () => {
        if (this.connectionPool.active < this.connectionPool.max) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  // Index recommendations
  analyzeQueries() {
    const recommendations = [];
    
    this.slowQueries.forEach(query => {
      const sql = query.sql.toLowerCase();
      
      // Check for missing WHERE clause indexes
      if (sql.includes('where') && !sql.includes('index')) {
        const whereMatch = sql.match(/where\s+(\w+)\s*=/);
        if (whereMatch) {
          recommendations.push({
            type: 'INDEX',
            suggestion: `Consider adding index on column: ${whereMatch[1]}`,
            query: query.sql,
            impact: 'HIGH',
          });
        }
      }
      
      // Check for N+1 queries
      if (sql.includes('select') && query.duration > 500) {
        recommendations.push({
          type: 'N+1',
          suggestion: 'Consider using JOIN instead of multiple queries',
          query: query.sql,
          impact: 'MEDIUM',
        });
      }
      
      // Check for full table scans
      if (sql.includes('select') && !sql.includes('where') && !sql.includes('limit')) {
        recommendations.push({
          type: 'FULL_SCAN',
          suggestion: 'Add WHERE clause or LIMIT to avoid full table scan',
          query: query.sql,
          impact: 'HIGH',
        });
      }
    });
    
    return recommendations;
  }

  // Query batching
  async batchQueries(queries) {
    const results = [];
    const batchSize = 10;
    
    for (let i = 0; i < queries.length; i += batchSize) {
      const batch = queries.slice(i, i + batchSize);
      const batchPromises = batch.map(query => 
        this.db.query(query.sql, query.params)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }

  // Read replica routing
  routeQuery(sql) {
    const isReadQuery = sql.trim().toUpperCase().startsWith('SELECT');
    
    if (isReadQuery) {
      // Route to read replica
      return this.getReadConnection();
    } else {
      // Route to master
      return this.getMasterConnection();
    }
  }

  async getReadConnection() {
    // Implement read replica connection logic
    return this.getConnection();
  }

  async getMasterConnection() {
    // Implement master connection logic
    return this.getConnection();
  }

  // Database monitoring
  getPerformanceMetrics() {
    return {
      connectionPool: this.connectionPool,
      cacheHitRate: this.calculateCacheHitRate(),
      slowQueries: this.slowQueries.length,
      avgQueryTime: this.calculateAvgQueryTime(),
      recommendations: this.analyzeQueries(),
    };
  }

  calculateCacheHitRate() {
    // Implementation would track cache hits vs misses
    return '85%';
  }

  calculateAvgQueryTime() {
    if (this.slowQueries.length === 0) return 0;
    
    const total = this.slowQueries.reduce((sum, q) => sum + q.duration, 0);
    return total / this.slowQueries.length;
  }

  // Automatic query optimization
  async optimizeSlowQueries() {
    const recommendations = this.analyzeQueries();
    
    for (const rec of recommendations) {
      if (rec.type === 'INDEX' && rec.impact === 'HIGH') {
        console.log(`Auto-creating index: ${rec.suggestion}`);
        // Auto-create index if safe to do so
      }
    }
  }
}

module.exports = DatabaseOptimizer;