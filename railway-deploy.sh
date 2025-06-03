#!/bin/bash

echo "Starting Railway deployment..."

# Build the frontend
echo "Building React frontend..."
npm run build

# Check if build succeeded
if [ ! -d "dist" ]; then
  echo "Build failed - dist directory not found"
  exit 1
fi

echo "Build completed successfully"

# Start the server
echo "Starting server..."
node server/simple-railway.cjs