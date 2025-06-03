#!/usr/bin/env node

// Railway deployment script with enhanced debugging
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Railway deployment process...');
console.log('Node version:', process.version);
console.log('Working directory:', process.cwd());
console.log('Environment:', process.env.NODE_ENV);

// Check if package.json exists
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found!');
  process.exit(1);
}

try {
  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm ci', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');

  // Build frontend
  console.log('🔨 Building frontend...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Frontend build completed');

  // Verify build output
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    console.log('✅ Dist directory found');
    const distFiles = fs.readdirSync(distPath);
    console.log('📁 Files in dist:', distFiles);
    
    // Check for index.html
    if (distFiles.includes('index.html')) {
      console.log('✅ index.html found in dist');
    } else {
      console.log('⚠️ index.html not found in dist');
    }
  } else {
    console.error('❌ Dist directory not found after build!');
    process.exit(1);
  }

  // Start the server
  console.log('🚀 Starting Railway production server...');
  require('./server/railway-production.js');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}