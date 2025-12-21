const ddosProtection = require('./security/ddos-protection');
const securityTester = require('./security/penetration-testing');
const RecommendationEngine = require('./ai/recommendation-engine');
const AIchatbot = require('./ai/chatbot');
const CacheManager = require('./performance/caching');
const LoadBalancer = require('./performance/load-balancer');
const DatabaseOptimizer = require('./performance/database-optimization');

// Infrastructure Enhancement Configuration
class InfrastructureManager {
  constructor() {
    this.cacheManager = new CacheManager();
    this.loadBalancer = new LoadBalancer();
    this.recommendationEngine = new RecommendationEngine();
    this.chatbot = new AIchatbot();
    this.dbOptimizer = null; // Initialize with DB connection
    
    this.setupInfrastructure();
  }

  setupInfrastructure() {
    // Configure load balancer
    this.loadBalancer.addServer({ url: 'http://localhost:3001', weight: 1 });
    this.loadBalancer.addServer({ url: 'http://localhost:3002', weight: 1 });
    this.loadBalancer.startHealthMonitoring();

    // Warm up cache
    this.cacheManager.warmCache();

    console.log('Infrastructure enhancements initialized');
  }

  // Express middleware setup
  setupMiddleware(app) {
    // Security middleware
    app.use(ddosProtection.securityHeaders);
    app.use(ddosProtection.ipBlocker);
    app.use('/api/', ddosProtection.apiLimiter);
    app.use(ddosProtection.rateLimiter);
    app.use(ddosProtection.speedLimiter);

    // Performance middleware
    app.use(this.loadBalancer.routeRequest());
    
    // Security scanning
    app.use(async (req, res, next) => {
      const scanResult = await securityTester.performSecurityScan(req);
      if (scanResult.vulnerabilities.length > 0) {
        console.warn('Security vulnerabilities detected:', scanResult);
        // Log for monitoring but don't block request
      }
      next();
    });

    console.log('Security and performance middleware configured');
  }

  // AI-powered endpoints
  setupAIEndpoints(app) {
    // Recommendation endpoint
    app.get('/api/recommendations/:userId', async (req, res) => {
      try {
        const { userId } = req.params;
        const { limit = 10 } = req.query;
        
        const recommendations = this.recommendationEngine.getHotelRecommendations(userId, limit);
        
        res.json({
          success: true,
          recommendations,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        res.status(500).json({ error: 'Recommendation service unavailable' });
      }
    });

    // Chatbot endpoint
    app.post('/api/chat', async (req, res) => {
      try {
        const { userId, message } = req.body;
        
        const response = this.chatbot.processMessage(userId, message);
        
        // Check if escalation needed
        if (this.chatbot.shouldEscalate(userId, message)) {
          response.escalate = true;
          response.message += ' Let me connect you with a human agent.';
        }
        
        res.json({
          success: true,
          ...response,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        res.status(500).json({ error: 'Chatbot service unavailable' });
      }
    });

    // Trending hotels
    app.get('/api/trending', async (req, res) => {
      try {
        const trending = this.recommendationEngine.getTrendingHotels();
        res.json({ success: true, trending });
      } catch (error) {
        res.status(500).json({ error: 'Trending service unavailable' });
      }
    });

    console.log('AI endpoints configured');
  }

  // Monitoring endpoints
  setupMonitoringEndpoints(app) {
    // System health
    app.get('/api/health', (req, res) => {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          cache: this.cacheManager.getStats(),
          loadBalancer: this.loadBalancer.getMetrics(),
          database: this.dbOptimizer?.getPerformanceMetrics() || 'not configured',
        },
      };
      
      res.json(health);
    });

    // Performance metrics
    app.get('/api/metrics', (req, res) => {
      const metrics = {
        cache: this.cacheManager.getStats(),
        loadBalancer: this.loadBalancer.getMetrics(),
        recommendations: {
          totalUsers: this.recommendationEngine.userProfiles.size,
          totalHotels: this.recommendationEngine.hotelFeatures.size,
        },
        chatbot: {
          activeConversations: this.chatbot.context.size,
        },
      };
      
      res.json(metrics);
    });

    console.log('Monitoring endpoints configured');
  }

  // Auto-scaling logic
  async checkAutoScaling() {
    if (this.loadBalancer.shouldScaleUp()) {
      console.log('Scaling up servers...');
      // Implement auto-scaling logic
      await this.scaleUp();
    } else if (this.loadBalancer.shouldScaleDown()) {
      console.log('Scaling down servers...');
      await this.scaleDown();
    }
  }

  async scaleUp() {
    // Add new server instance
    const newPort = 3000 + this.loadBalancer.servers.length + 1;
    this.loadBalancer.addServer({ 
      url: `http://localhost:${newPort}`, 
      weight: 1 
    });
  }

  async scaleDown() {
    // Remove least loaded server
    const servers = this.loadBalancer.servers.filter(s => s.active);
    if (servers.length > 2) {
      servers.sort((a, b) => a.load - b.load);
      servers[0].active = false;
    }
  }

  // Start background processes
  startBackgroundProcesses() {
    // Auto-scaling check every 5 minutes
    setInterval(() => {
      this.checkAutoScaling();
    }, 300000);

    // Cache cleanup every hour
    setInterval(() => {
      this.cacheManager.memoryCache.clear();
    }, 3600000);

    // Security scan summary every 24 hours
    setInterval(() => {
      console.log('Daily security summary generated');
    }, 86400000);

    console.log('Background processes started');
  }
}

module.exports = InfrastructureManager;