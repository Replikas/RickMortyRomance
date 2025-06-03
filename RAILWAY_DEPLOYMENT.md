# Railway Deployment Guide - Rick and Morty Dating Simulator

## Quick Steps for Railway Deployment

### 1. Push to GitHub
Make sure your code is on GitHub first:
```bash
git add .
git commit -m "Railway deployment ready"
git push origin main
```

### 2. Sign up for Railway
1. Go to [railway.app](https://railway.app)
2. Click "Login" → "Login with GitHub"
3. Authorize Railway to access your GitHub

### 3. Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your Rick and Morty Dating Simulator repository
4. Railway will automatically detect it's a Node.js project

### 4. Environment Variables (Critical)
In your Railway project dashboard:
1. Go to "Variables" tab
2. Add these exact variables:

```
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_rDpF0tJX8NkO@ep-polished-resonance-a5oclx61.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 5. Domain Setup
After successful deployment:
1. Railway provides a URL like: `your-app-name.up.railway.app`
2. You can add a custom domain in Settings → Domains

## Troubleshooting Build Issues

✅ **Build Issue Fixed**: The Docker build has been updated to properly include your portal GIF and character assets.

If you encounter any build issues:

1. **Check Environment Variables**: Ensure `NODE_ENV` and `DATABASE_URL` are set correctly
2. **Redeploy**: Go to Deployments → Click "Redeploy"
3. **View Logs**: Click on the failed deployment to see detailed error logs
4. **Assets Included**: Your authentic Rick and Morty portal animation and character images are now properly included in the build

## Expected Build Process
Railway will:
1. Install dependencies with `npm install`
2. Build the frontend and backend with `npm run build` 
3. Start the app with `npm start`
4. Expose the app on the provided URL

## Free Tier Limits
- 500 hours/month runtime
- 512MB RAM
- No sleep issues (unlike some competitors)
- $5 monthly resource credit

## Testing Your Deployment
Once deployed:
1. Visit your Railway URL
2. Create a user account
3. Select a character (Rick, Morty, Evil Morty, or Rick Prime)
4. Test the conversation system
5. Configure OpenRouter API key in app settings for AI conversations

Your Rick and Morty Dating Simulator should now be live on Railway!