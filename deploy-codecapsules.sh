#!/bin/bash

# CodeCapsules Deployment Script for Rick and Morty Dating Simulator
# This script helps prepare your app for deployment

echo "🚀 Preparing Rick and Morty Dating Simulator for CodeCapsules deployment..."

# Check if required files exist
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    exit 1
fi

if [ ! -f "codecapsules.yml" ]; then
    echo "❌ codecapsules.yml not found!"
    exit 1
fi

# Build the application
echo "📦 Building application..."
npm ci
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Check if dist folder was created
if [ -d "dist" ]; then
    echo "✅ Distribution files created successfully"
else
    echo "❌ Distribution folder not found!"
    exit 1
fi

# Display deployment checklist
echo ""
echo "📋 CodeCapsules Deployment Checklist:"
echo "1. ✅ Application built successfully"
echo "2. ⏳ Push code to GitHub repository"
echo "3. ⏳ Create CodeCapsules account"
echo "4. ⏳ Create Backend Capsule"
echo "5. ⏳ Set environment variables:"
echo "   - NODE_ENV=production"
echo "   - DATABASE_URL=postgresql://neondb_owner:npg_rDpF0tJX8NkO@ep-polished-resonance-a5oclx61.us-east-2.aws.neon.tech/neondb?sslmode=require"
echo "   - PORT=8080"
echo "6. ⏳ Deploy application"
echo ""
echo "📖 For detailed instructions, see CODECAPSULES_DEPLOY.md"
echo ""
echo "🎉 Your app is ready for CodeCapsules deployment!"