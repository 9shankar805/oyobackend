// Load Balancer and Performance Monitor
class LoadBalancer {
  constructor() {
    this.servers = [];
    this.currentIndex = 0;
    this.healthChecks = new Map();
    this.metrics = {
      requests: 0,
      responses: 0,
      errors: 0,
      avgResponseTime: 0,
    };
  }

  // Add server to pool
  addServer(server) {
    this.servers.push({
      ...server,
      active: true,
      load: 0,
      responseTime: 0,
      errorCount: 0,
    });
  }

  // Round-robin load balancing
  getNextServer() {
    const activeServers = this.servers.filter(s => s.active);
    if (activeServers.length === 0) return null;
    
    const server = activeServers[this.currentIndex % activeServers.length];
    this.currentIndex++;
    return server;
  }

  // Weighted round-robin
  getWeightedServer() {
    const activeServers = this.servers.filter(s => s.active);
    if (activeServers.length === 0) return null;
    
    // Sort by load (ascending)
    activeServers.sort((a, b) => a.load - b.load);
    return activeServers[0];
  }

  // Health check
  async performHealthCheck(server) {
    try {
      const start = Date.now();
      const response = await fetch(`${server.url}/health`);
      const responseTime = Date.now() - start;
      
      if (response.ok) {
        server.active = true;
        server.responseTime = responseTime;
        server.errorCount = 0;
      } else {
        server.errorCount++;
        if (server.errorCount > 3) {
          server.active = false;
        }
      }
    } catch (error) {
      server.errorCount++;
      if (server.errorCount > 3) {
        server.active = false;
      }
    }
  }

  // Start health monitoring
  startHealthMonitoring() {
    setInterval(() => {
      this.servers.forEach(server => {
        this.performHealthCheck(server);
      });
    }, 30000); // Every 30 seconds
  }

  // Request routing middleware
  routeRequest() {
    return async (req, res, next) => {
      const start = Date.now();
      this.metrics.requests++;
      
      const server = this.getWeightedServer();
      if (!server) {
        return res.status(503).json({ error: 'No servers available' });
      }
      
      server.load++;
      
      // Add response time tracking
      res.on('finish', () => {
        const responseTime = Date.now() - start;
        this.metrics.responses++;
        this.metrics.avgResponseTime = 
          (this.metrics.avgResponseTime * (this.metrics.responses - 1) + responseTime) / 
          this.metrics.responses;
        
        server.load--;
        server.responseTime = responseTime;
        
        if (res.statusCode >= 400) {
          this.metrics.errors++;
          server.errorCount++;
        }
      });
      
      req.selectedServer = server;
      next();
    };
  }

  // Circuit breaker pattern
  createCircuitBreaker(server, threshold = 5) {
    return {
      state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
      failureCount: 0,
      lastFailureTime: null,
      
      async call(fn) {
        if (this.state === 'OPEN') {
          if (Date.now() - this.lastFailureTime > 60000) { // 1 minute
            this.state = 'HALF_OPEN';
          } else {
            throw new Error('Circuit breaker is OPEN');
          }
        }
        
        try {
          const result = await fn();
          if (this.state === 'HALF_OPEN') {
            this.state = 'CLOSED';
            this.failureCount = 0;
          }
          return result;
        } catch (error) {
          this.failureCount++;
          this.lastFailureTime = Date.now();
          
          if (this.failureCount >= threshold) {
            this.state = 'OPEN';
          }
          throw error;
        }
      }
    };
  }

  // Performance metrics
  getMetrics() {
    return {
      ...this.metrics,
      servers: this.servers.map(s => ({
        url: s.url,
        active: s.active,
        load: s.load,
        responseTime: s.responseTime,
        errorCount: s.errorCount,
      })),
      activeServers: this.servers.filter(s => s.active).length,
      totalServers: this.servers.length,
    };
  }

  // Auto-scaling logic
  shouldScaleUp() {
    const activeServers = this.servers.filter(s => s.active);
    const avgLoad = activeServers.reduce((sum, s) => sum + s.load, 0) / activeServers.length;
    const avgResponseTime = activeServers.reduce((sum, s) => sum + s.responseTime, 0) / activeServers.length;
    
    return avgLoad > 80 || avgResponseTime > 1000; // 80% load or 1s response time
  }

  shouldScaleDown() {
    const activeServers = this.servers.filter(s => s.active);
    const avgLoad = activeServers.reduce((sum, s) => sum + s.load, 0) / activeServers.length;
    
    return avgLoad < 20 && activeServers.length > 2; // 20% load and more than 2 servers
  }
}

module.exports = LoadBalancer;