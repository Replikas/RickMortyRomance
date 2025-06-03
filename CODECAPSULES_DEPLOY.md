# CodeCapsules Deployment Guide

## Quick Setup for CodeCapsules

CodeCapsules is a South African cloud platform that offers excellent hosting for Node.js applications with PostgreSQL databases.

### Step 1: Prepare Your Repository

1. Push your code to GitHub (if not already done)
2. Ensure all files are committed, including:
   - `codecapsules.yml` (deployment configuration)
   - `package.json` with proper scripts
   - Built frontend assets

### Step 2: CodeCapsules Account Setup

1. Sign up at [CodeCapsules.io](https://codecapsules.io)
2. Connect your GitHub account
3. Create a new Team (free tier available)

### Step 3: Database Setup

You can either use your existing Neon database or create a new CodeCapsules database:

#### Option A: Use Existing Neon Database (Recommended)
Your app is already configured with a Neon PostgreSQL database. Simply use this connection string in your environment variables:

```
DATABASE_URL=postgresql://neondb_owner:npg_rDpF0tJX8NkO@ep-polished-resonance-a5oclx61.us-east-2.aws.neon.tech/neondb?sslmode=require
```

#### Option B: Create New CodeCapsules Database
1. In your CodeCapsules dashboard, click "Create New Capsule"
2. Select "Data Capsule"
3. Choose "PostgreSQL"
4. Select your preferred region (Cape Town recommended for SA users)
5. Choose the free tier plan
6. Name it: `rick-morty-db`
7. Click "Create Capsule"

### Step 4: Create a Backend Capsule (Application)

1. Click "Create New Capsule" again
2. Select "Backend Capsule"
3. Connect to your GitHub repository
4. Select the repository containing your Rick and Morty Dating Simulator
5. Choose your preferred region
6. Select the free tier plan
7. Name it: `rick-morty-app`

### Step 5: Configure Environment Variables

In your Backend Capsule settings, add these environment variables:

**Using Existing Neon Database:**
```
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_rDpF0tJX8NkO@ep-polished-resonance-a5oclx61.us-east-2.aws.neon.tech/neondb?sslmode=require
PORT=8080
```

**If using CodeCapsules Database:**
```
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database_name
PORT=8080
```

**Important**: Also add your OpenRouter API key in the CodeCapsules dashboard environment variables section for AI functionality to work.

### Step 6: Configure Build Settings

CodeCapsules will automatically detect your `codecapsules.yml` file and use these settings:

- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`
- **Port**: 8080 (automatically assigned)

### Step 7: Deploy

1. Click "Deploy" in your Backend Capsule
2. Monitor the build logs for any errors
3. Once deployed, your app will be available at the provided URL

### Step 8: Database Migration

After first deployment, you may need to run database migrations:

1. Access the capsule terminal (if available) or
2. Connect to your database using the provided credentials and run:

```sql
-- Your database schema will be automatically created by Drizzle ORM
-- No manual migration needed if using Drizzle's push feature
```

### Step 9: Configure Domain (Optional)

1. In your Backend Capsule settings, go to "Custom Domains"
2. Add your custom domain
3. Follow the DNS configuration instructions

### Troubleshooting

**Build Failures:**
- Check build logs in CodeCapsules dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

**Database Connection Issues:**
- Double-check DATABASE_URL format
- Ensure database capsule is running
- Verify network connectivity between capsules

**App Won't Start:**
- Check if PORT environment variable is set correctly
- Verify `npm start` script in package.json
- Review application logs

### Cost Estimation

**Free Tier Includes:**
- 1 Backend Capsule (512MB RAM, 0.5 CPU)
- 1 Data Capsule (PostgreSQL, 1GB storage)
- 100GB bandwidth
- Custom domain support

**Paid Plans:**
- Start from $5/month for more resources
- Auto-scaling available
- 24/7 support

### Benefits of CodeCapsules

- **African Hosting**: Low latency for South African users
- **Simple Deployment**: Git-based deployments
- **Free Tier**: Great for development and small projects
- **PostgreSQL Included**: Managed database service
- **Auto-scaling**: Handles traffic spikes
- **Local Support**: South African company with local support

### Environment Variables Required

Make sure to set these in your CodeCapsules dashboard:

```
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/dbname
PORT=8080
```

Your app will be live at: `https://your-app-name.codecapsules.co.za`