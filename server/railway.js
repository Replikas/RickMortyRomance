const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Basic logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// API Routes - Basic character endpoint
app.get('/api/characters', (req, res) => {
  res.json([
    {
      id: 1,
      name: "Rick Sanchez (C-137)",
      description: "Genius scientist with alcohol problems",
      personality: "sarcastic, nihilistic, brilliant",
      image: "/attached_assets/rick.jpg"
    },
    {
      id: 2,
      name: "Morty Smith",
      description: "Anxious teenager, Rick's sidekick",
      personality: "nervous, kind-hearted, awkward",
      image: "/attached_assets/morty.jpg"
    },
    {
      id: 3,
      name: "Evil Morty",
      description: "Morty from an alternate dimension",
      personality: "calculating, mysterious, ambitious",
      image: "/attached_assets/evil-morty.png"
    },
    {
      id: 4,
      name: "Rick Prime",
      description: "The original Rick who killed C-137's family",
      personality: "cruel, manipulative, sociopathic",
      image: "/attached_assets/RICKPRIME.webp"
    }
  ]);
});

// Simple conversation endpoint
app.post('/api/conversation', (req, res) => {
  const { message, character } = req.body;
  
  // Basic responses for testing
  const responses = {
    1: [ // Rick
      "Wubba lubba dub dub! What do you want?",
      "Listen, I'm busy inventing stuff. Make it quick.",
      "Ugh, another dimension where people ask stupid questions."
    ],
    2: [ // Morty
      "Oh geez, h-hi there!",
      "I-I don't know about this, Rick...",
      "W-wow, this is really happening!"
    ],
    3: [ // Evil Morty
      "How... interesting.",
      "You think you understand, but you don't.",
      "Everything has a purpose."
    ],
    4: [ // Rick Prime
      "You're wasting my time.",
      "Pathetic. Just like all the others.",
      "I've destroyed infinite versions of you."
    ]
  };
  
  const characterResponses = responses[character?.id] || responses[1];
  const response = characterResponses[Math.floor(Math.random() * characterResponses.length)];
  
  res.json({
    message: response,
    character: character,
    affectionChange: Math.floor(Math.random() * 3) - 1 // -1, 0, or 1
  });
});

// User settings endpoint
app.get('/api/user/:userId/settings', (req, res) => {
  res.json({
    aiModel: "deepseek/deepseek-chat-v3-0324:free",
    sfxVolume: 50,
    portalGlow: true,
    musicVolume: 25,
    nsfwContent: false,
    typingSpeed: "normal",
    masterVolume: 75,
    animationSpeed: "normal",
    particleEffects: true,
    openrouterApiKey: "",
    autosaveFrequency: 5
  });
});

// Static file serving
const distPath = path.join(__dirname, '..', 'dist');
const publicPath = path.join(distPath, 'public');

// Check which directory exists
let staticDir = distPath;
if (fs.existsSync(publicPath)) {
  staticDir = publicPath;
}

console.log('Checking static directories:');
console.log('distPath exists:', fs.existsSync(distPath));
console.log('publicPath exists:', fs.existsSync(publicPath));
console.log('Using static directory:', staticDir);

// Serve static files
if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir));
  console.log('Serving static files from:', staticDir);
} else {
  console.warn('No static directory found!');
}

// Serve attached assets
const assetsPath = path.join(__dirname, '..', 'attached_assets');
if (fs.existsSync(assetsPath)) {
  app.use('/attached_assets', express.static(assetsPath));
  console.log('Serving assets from:', assetsPath);
}

// SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  const indexPath = path.join(staticDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rick and Morty Dating Simulator</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              background: #0a0a0a; 
              color: #00ff88; 
              text-align: center; 
              padding: 50px; 
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 40px;
              border: 2px solid #00ff88;
              border-radius: 15px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Rick and Morty Dating Simulator</h1>
            <p>Backend is running, but frontend build not found.</p>
            <p>Static directory: ${staticDir}</p>
            <p>Index exists: ${fs.existsSync(indexPath)}</p>
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

const port = parseInt(process.env.PORT || '8080', 10);

// Try to start server with Railway-compatible configuration
const startServer = () => {
  try {
    const server = app.listen(port, () => {
      console.log(`🚀 Railway server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
      console.log(`Static directory: ${staticDir}`);
      console.log(`Process ID: ${process.pid}`);
      console.log(`Available environment variables:`, Object.keys(process.env).filter(k => k.includes('PORT')));
    });

    server.on('error', (err) => {
      console.error('Server startup error:', err);
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use`);
      }
      setTimeout(() => process.exit(1), 1000);
    });

    server.on('listening', () => {
      const addr = server.address();
      console.log(`Server successfully bound to:`, addr);
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

const server = startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});