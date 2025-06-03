# Deploy to Cyclic (Free, No GitHub Required)

## Why Cyclic?
- Free tier with no sleep mode
- ZIP file upload deployment
- Full Node.js support
- External database connections supported
- No GitHub account required

## Deployment Steps

### 1. Build the Project
Run this command to build your app:
```bash
npm run build
```

### 2. Create Deployment Package
Your project is ready to zip. Include these files:
- All source files (client/, server/, shared/)
- package.json
- Built files in dist/
- migrate.js
- database_setup.sql

### 3. Deploy to Cyclic
1. Go to cyclic.sh
2. Click "Deploy Now"
3. Choose "Upload ZIP file"
4. Upload your project ZIP
5. Add environment variables:
   - `DATABASE_URL`: Your Neon database URL
   - `NODE_ENV`: production

### 4. Your Database URL
Use this exact string in Cyclic environment variables:
```
postgresql://neondb_owner:npg_rDpF0tJX8NkO@ep-polished-resonance-a5oclx61.us-east-2.aws.neon.tech/neondb?sslmode=require
```

## What Happens After Upload
- Cyclic automatically runs `npm install`
- Database migrations run on first startup
- Your app will be live at a .cyclic.app URL
- No sleep mode - stays active 24/7

## Alternative: Glitch
If Cyclic doesn't work:
1. Go to glitch.com
2. Create new project
3. Import your code by pasting files
4. Set DATABASE_URL in .env file

Your Rick & Morty Dating Simulator will run smoothly on either platform without the restart loops you experienced on Render.