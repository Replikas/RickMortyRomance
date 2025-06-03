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

// Serve static files
app.use(express.static('public'));

// Catch-all route
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rick and Morty Dating Simulator - Backend</title>
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
          .api-link { color: #00aaff; text-decoration: none; }
          .api-link:hover { text-decoration: underline; }
          .success { color: #00ff88; }
          .warning { color: #ffa500; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 Rick and Morty Dating Simulator</h1>
          <div class="status success">✅ Backend Server Running Successfully!</div>
          <p>The API server is operational and ready for connections.</p>
          
          <h3>Available Endpoints:</h3>
          <p><a href="/api/health" class="api-link">/api/health</a> - Server health check</p>
          <p><a href="/api/characters" class="api-link">/api/characters</a> - Character list</p>
          
          <h3>System Status:</h3>
          <p>Environment: <span class="success">${process.env.NODE_ENV || 'production'}</span></p>
          <p>Database: <span class="${process.env.DATABASE_URL ? 'success">✅ Connected' : 'warning">⚠️ Not configured'}</span></p>
          <p>Port: <span class="success">${process.env.PORT || '5000'}</span></p>
          
          <div class="status">
            Ready to serve frontend application when deployed together.
          </div>
        </div>
      </body>
    </html>
  `);
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