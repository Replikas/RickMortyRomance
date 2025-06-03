const https = require('https');
const http = require('http');

class RenderPingService {
  constructor() {
    this.appUrl = process.env.RENDER_EXTERNAL_URL || 'https://rickortygame2.onrender.com';
    this.pingInterval = 14 * 60 * 1000; // 14 minutes
    this.isRunning = false;
    this.startTime = Date.now();
    this.pingCount = 0;
    this.failCount = 0;
  }

  makeRequest(url, options = {}) {
    const protocol = url.startsWith('https:') ? https : http;
    
    return new Promise((resolve, reject) => {
      const req = protocol.get(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        }));
      });
      
      req.on('error', reject);
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  async pingApp() {
    try {
      console.log(`[${new Date().toISOString()}] Pinging ${this.appUrl}/health`);
      
      const response = await this.makeRequest(`${this.appUrl}/health`);
      
      if (response.statusCode === 200) {
        this.pingCount++;
        console.log(`✅ Ping successful (${this.pingCount}) - Status: ${response.statusCode}`);
        this.failCount = 0;
      } else {
        this.failCount++;
        console.log(`⚠️ Ping returned ${response.statusCode} - Fail count: ${this.failCount}`);
      }
      
    } catch (error) {
      this.failCount++;
      console.error(`❌ Ping failed (${this.failCount}):`, error.message);
      
      if (this.failCount >= 3) {
        console.log('🔄 Multiple failures detected - attempting health check...');
        await this.healthCheck();
      }
    }
  }

  async healthCheck() {
    try {
      const response = await this.makeRequest(`${this.appUrl}/api/characters`);
      if (response.statusCode === 200) {
        console.log('💚 Health check passed - API is responding');
        this.failCount = 0;
      } else {
        console.log(`🔴 Health check failed - API returned ${response.statusCode}`);
      }
    } catch (error) {
      console.error('🔴 Health check error:', error.message);
    }
  }

  getUptime() {
    const uptimeMs = Date.now() - this.startTime;
    const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  getNextPingTime() {
    const nextPing = new Date(Date.now() + this.pingInterval);
    return nextPing.toLocaleTimeString();
  }

  start() {
    if (this.isRunning) {
      console.log('🔄 Ping service already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting Render ping service for continuous uptime');
    console.log(`📍 Target URL: ${this.appUrl}`);
    console.log(`⏰ Ping interval: ${this.pingInterval / 1000 / 60} minutes`);
    
    // Initial ping
    this.pingApp();
    
    // Set up interval
    this.intervalId = setInterval(() => {
      console.log(`📊 Uptime: ${this.getUptime()} | Next ping: ${this.getNextPingTime()}`);
      this.pingApp();
    }, this.pingInterval);
    
    console.log('✅ Ping service started successfully');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.isRunning = false;
      console.log('🛑 Ping service stopped');
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      uptime: this.getUptime(),
      pingCount: this.pingCount,
      failCount: this.failCount,
      nextPing: this.getNextPingTime()
    };
  }
}

// Auto-start in production
if (process.env.NODE_ENV === 'production') {
  const pingService = new RenderPingService();
  pingService.start();
  
  // Graceful shutdown
  process.on('SIGTERM', () => pingService.stop());
  process.on('SIGINT', () => pingService.stop());
}

module.exports = RenderPingService;