const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Basic logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    database: !!process.env.DATABASE_URL
  });
});

// Basic API endpoints for testing
app.get('/api/characters', (req, res) => {
  res.json([
    { id: 1, name: "Rick Sanchez (C-137)" },
    { id: 2, name: "Morty Smith" },
    { id: 3, name: "Evil Morty" },
    { id: 4, name: "Rick Prime" }
  ]);
});

// Serve built frontend files
const fs = require('fs');
const distPath = './dist/public';
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Serve public assets (sounds, etc.)
app.use('/sounds', express.static('./public/sounds'));

// Catch-all route for SPA
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Try to serve index.html for SPA routing
  const indexPath = './dist/public/index.html';
  if (fs.existsSync(indexPath)) {
    res.sendFile(require('path').resolve(indexPath));
  } else {
    // Fallback status page if no frontend build exists
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Rick and Morty Dating Simulator</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
              color: #00ff88;
              margin: 0;
              padding: 20px;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
            }
            .container {
              max-width: 600px;
              padding: 40px;
              border: 2px solid #00ff88;
              border-radius: 15px;
              background: rgba(0, 0, 0, 0.8);
            }
            h1 { color: #00ff88; margin-bottom: 20px; }
            .status { color: #ffa500; margin: 20px 0; }
            .warning { color: #ffa500; }
            .info { color: #00aaff; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Rick and Morty Dating Simulator</h1>
            <div class="status warning">⚠️ Frontend Build Not Found</div>
            <p class="info">The backend API is running, but the frontend needs to be built and deployed.</p>
            <p>Backend Status: ✅ Running</p>
            <p>Database: ${process.env.DATABASE_URL ? '✅ Connected' : '❌ Not configured'}</p>
            <div class="status">
              Run 'npm run build' to generate the frontend, then redeploy.
            </div>
          </div>
        </body>
      </html>
    `);
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = parseInt(process.env.PORT || '5000', 10);

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Railway server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Database URL configured: ${!!process.env.DATABASE_URL}`);
  console.log(`Health check: http://0.0.0.0:${port}/api/health`);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});