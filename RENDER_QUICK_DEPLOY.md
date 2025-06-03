# Rick & Morty Dating Simulator - One-Click Render Deploy

## Pre-Deploy Checklist
✅ `render.yaml` - Database and web service configuration  
✅ `database_setup.sql` - Complete PostgreSQL schema with character data  
✅ `migrate.js` - Auto-migration script for database setup  
✅ `ping-service.js` - Continuous uptime service (prevents sleep)  

## Required Package.json Updates
Add to your package.json scripts section:
```json
{
  "scripts": {
    "migrate": "node migrate.js",
    "start": "node migrate.js && NODE_ENV=production node dist/index.js"
  }
}
```

## Deployment Steps
1. **Push to GitHub** with all files
2. **Connect to Render** - Link your GitHub repository
3. **Auto-Deploy** - Render will read `render.yaml` and:
   - Create PostgreSQL database (`rickortygame2-db`)
   - Build and deploy web service (`rickortygame2`)
   - Run migrations automatically on startup
   - Start ping service for continuous uptime

## Key Features Ready for Production
- **Global API Key Storage** - OpenRouter keys persist across all characters
- **PostgreSQL Database** - Full persistence with 4 pre-loaded characters
- **Continuous Uptime** - Ping service prevents Render free tier sleep
- **Character AI Conversations** - Rick C-137, Morty, Evil Morty, Rick Prime
- **Save/Load System** - Multiple save slots per user
- **Portal UI Theme** - Teal/green glassmorphism design

## Environment Variables (Auto-Configured)
- `DATABASE_URL` - PostgreSQL connection (from database service)
- `NODE_ENV=production` - Production mode
- `PORT=5000` - Web service port
- `RENDER_EXTERNAL_URL` - For ping service (auto-detected)

## Post-Deployment
Users configure OpenRouter API keys in settings panel. Keys persist globally across all character interactions.

Your Rick & Morty Dating Simulator will be live at: `https://rickortygame2.onrender.com`