# Rick & Morty Dating Simulator - Render Deployment Guide

## Quick Deploy to Render

### 1. Repository Setup
Push your code to GitHub with these key files:
- `render.yaml` (database + web service configuration)
- `database_setup.sql` (complete database schema)
- `migrate.js` (database migration script)

### 2. Package.json Scripts Update
Add these scripts to your package.json:
```json
"scripts": {
  "migrate": "node migrate.js",
  "start": "node migrate.js && NODE_ENV=production node dist/index.js"
}
```

### 3. Environment Variables
Render will automatically provide:
- `DATABASE_URL` (from the PostgreSQL database)
- `PORT` (automatically set to 5000)
- `NODE_ENV=production`

### 4. Key Features Implemented
✅ **API Key Persistence**: Global user settings persist across all characters
✅ **Database Integration**: PostgreSQL with Drizzle ORM
✅ **Character System**: Rick C-137, Morty, Evil Morty, Rick Prime
✅ **AI Conversations**: OpenRouter API integration
✅ **Save/Load System**: Multiple save slots per user
✅ **Portal-themed UI**: Teal/green color scheme with glassmorphism effects

### 5. Database Schema
The `database_setup.sql` includes:
- Users table with global settings (API keys, preferences)
- Characters table with 4 pre-loaded characters
- Game states for user-character relationships
- Dialogues for conversation history
- Save slots for game progress

### 6. Post-Deployment Setup
1. Users need to configure their OpenRouter API key in settings
2. API keys persist globally across all character interactions
3. All game progress saves automatically to PostgreSQL

### 7. File Structure
```
├── render.yaml              # Render configuration
├── database_setup.sql       # Database schema
├── migrate.js              # Migration script
├── server/                 # Backend API
├── client/                 # React frontend
├── shared/                 # Shared types/schema
└── public/                 # Static assets
```

### 8. Key API Endpoints
- `GET /api/characters` - Get all characters
- `GET /api/user/:userId/settings` - Get global user settings
- `PUT /api/user/:userId/settings` - Update global settings
- `POST /api/conversation` - AI character conversations
- `GET /api/game-state/:userId/:characterId` - Get game progress
- `POST /api/dialogues` - Save conversation messages

The application is now ready for Render deployment with full database persistence and cross-character API key sharing.