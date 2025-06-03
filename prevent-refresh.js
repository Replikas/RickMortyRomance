// Anti-refresh script for Render deployment
// This script implements multiple strategies to prevent constant refreshing

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Force production environment and disable all development features
process.env.NODE_ENV = 'production';
process.env.VITE_DEV_MODE = 'false';
process.env.HMR_ENABLED = 'false';
process.env.WATCH_MODE = 'false';
process.env.FAST_REFRESH = 'false';

const app = express();
const PORT = process.env.PORT || 10000;

console.log('🛡️  Anti-refresh system initializing...');
console.log('   Environment: PRODUCTION (forced)');
console.log('   Development features: DISABLED');
console.log('   Hot reload: DISABLED');
console.log('   Watch mode: DISABLED');

// Middleware to prevent caching issues that cause refreshes
app.use((req, res, next) => {
  // Prevent browser caching of HTML files
  if (req.path.endsWith('.html') || req.path === '/') {
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  } else {
    // Cache static assets for 1 hour
    res.set({
      'Cache-Control': 'public, max-age=3600'
    });
  }
  next();
});

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS with specific headers to prevent refresh loops
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Enhanced health check with anti-refresh indicators
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: 'production',
    antiRefresh: true,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '2.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    app: 'Rick and Morty Dating Simulator',
    status: 'running',
    mode: 'production-stable',
    antiRefresh: 'enabled',
    timestamp: new Date().toISOString()
  });
});

// Serve static files with proper headers
const distPath = path.join(__dirname, 'dist', 'public');
app.use(express.static(distPath, {
  maxAge: '1h',
  etag: true,
  lastModified: true
}));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start server with enhanced stability
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Anti-refresh server running on port ${PORT}`);
  console.log(`🛡️  Refresh prevention: ACTIVE`);
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/api/health`);
});

// Enhanced keep-alive system
const RENDER_URL = process.env.RENDER_EXTERNAL_URL || 'https://rick-morty-dating-sim.onrender.com';

const performKeepAlive = async () => {
  try {
    const response = await fetch(`${RENDER_URL}/api/health`, {
      headers: { 
        'User-Agent': 'AntiRefresh-KeepAlive/2.0',
        'Cache-Control': 'no-cache'
      },
      timeout: 8000
    });
    console.log(`✅ Keep-alive: ${response.status} - ${new Date().toISOString()}`);
  } catch (error) {
    console.log(`❌ Keep-alive failed: ${error.message}`);
  }
};

// Multiple keep-alive strategies
setTimeout(performKeepAlive, 5000);  // Initial ping
setInterval(performKeepAlive, 8 * 60 * 1000);  // Every 8 minutes

// Peak hours additional pings
setInterval(() => {
  const hour = new Date().getUTCHours();
  if (hour >= 8 && hour <= 22) {  // 8 AM - 10 PM UTC
    setTimeout(performKeepAlive, 1000);
  }
}, 4 * 60 * 1000);  // Every 4 minutes during peak hours

// Memory management to prevent crashes that cause refreshes
if (global.gc) {
  setInterval(() => {
    global.gc();
    console.log('🧹 Memory cleanup completed');
  }, 30000);
}

// Process monitoring
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Don't exit - try to recover
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - try to recover
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

console.log('🛡️  Anti-refresh system fully initialized!');
console.log('📈 Monitoring for refresh prevention...');