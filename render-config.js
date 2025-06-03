// Render-specific configuration to prevent constant refreshing
// This file ensures the app runs in strict production mode on Render

// Force production environment
process.env.NODE_ENV = 'production';
process.env.RENDER = 'true';

// Disable any development features
process.env.VITE_DEV_MODE = 'false';
process.env.HMR_ENABLED = 'false';
process.env.WATCH_MODE = 'false';

// Optimize for Render deployment
process.env.RENDER_OPTIMIZED = 'true';

// Memory management
process.env.NODE_OPTIONS = '--max-old-space-size=512 --gc-interval=100';

// Logging configuration
process.env.LOG_LEVEL = 'info';

console.log('🚀 Render configuration loaded:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   RENDER:', process.env.RENDER);
console.log('   Memory limit: 512MB');
console.log('   Development features: DISABLED');
console.log('   Keep-alive system: ENABLED');

// Import and start the main server
import('./deploy.js').catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});