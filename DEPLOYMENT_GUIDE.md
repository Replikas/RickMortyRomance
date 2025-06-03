# Rick and Morty Dating Simulator - Deployment Guide

## Current Status
✅ Complete application built and working locally
✅ Mobile-optimized portal-themed UI
✅ Character conversations with Rick, Morty, Evil Morty, Rick Prime
✅ Database integration with PostgreSQL
✅ Save/load game functionality
✅ Sound effects and animations
✅ OpenRouter AI integration configured

## Railway Deployment (Current Setup)

### Files Ready for Deployment:
- `server/deploy.js` - Production server with all APIs
- `railway.json` - Railway configuration
- Complete frontend build in `dist/public/`

### To Deploy on Railway:
1. Fix git lock: `rm .git/index.lock`
2. Commit changes:
   ```bash
   git add server/deploy.js railway.json
   git commit -m "Add production deployment server"
   git push
   ```
3. Redeploy on Railway dashboard

### Railway URL:
`https://rickmortyromance-production.up.railway.app`

## Alternative Deployment Options

### Option 1: Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts, configure:
# - Build Command: npm run build
# - Output Directory: dist/public
# - Add API routes in vercel.json
```

### Option 2: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist/public

# Configure serverless functions for API
```

### Option 3: Render
1. Connect GitHub repository
2. Configure build:
   - Build Command: `npm run build`
   - Start Command: `node server/deploy.js`
3. Deploy automatically

## Environment Variables Needed:
- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `PORT` - Set by hosting platform
- `NODE_ENV=production`

## API Endpoints Available:
- `GET /api/health` - Health check
- `GET /api/characters` - Character data
- `GET /api/user/:id/settings` - User preferences
- `POST /api/conversation` - Chat with characters

## Features Working:
- Portal-themed UI with teal accents
- Character selection screen
- Interactive conversations
- Emotional reactions and affection system
- Sound effects (uploaded audio files)
- Mobile responsive design
- Database persistence
- Save/load game states

## Local Development:
```bash
npm run dev
# Runs on http://localhost:5000
```

## Production Testing:
```bash
npm run build
node server/deploy.js
# Test production build locally
```

The application is fully functional and ready for deployment once the git repository issue is resolved.