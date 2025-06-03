#!/bin/bash

echo "🚀 Starting Railway deployment for Rick and Morty Dating Simulator..."

# Set NODE_ENV to production
export NODE_ENV=production

echo "Environment: $NODE_ENV"
echo "Port: $PORT"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

if [ $? -ne 0 ]; then
  echo "❌ Failed to install dependencies"
  exit 1
fi

# Build the frontend
echo "🏗️  Building frontend..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Frontend build failed"
  echo "⚠️  Continuing with backend-only deployment..."
fi

# Check if dist directory exists
if [ -d "dist" ]; then
  echo "✅ Frontend build successful - dist directory found"
  ls -la dist/
else
  echo "⚠️  No dist directory found - running backend-only"
fi

# Start the server
echo "🚀 Starting Railway production server..."
node server/railway-production.js