import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Railway production server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);
console.log('Database URL configured:', !!process.env.DATABASE_URL);
console.log('Working directory:', process.cwd());
console.log('Available files:', fs.readdirSync(process.cwd()).slice(0, 10));

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoints
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'rick-morty-dating-simulator',
    railway: true
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString() 
  });
});

app.get('/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Rick and Morty Dating Simulator is running!',
    timestamp: new Date().toISOString() 
  });
});

// Basic API endpoints for the game
app.get('/api/characters', (req, res) => {
  res.json([
    {
      id: 1,
      name: "Rick Sanchez (C-137)",
      description: "Genius scientist with severe alcohol dependency",
      personality: "sarcastic, brilliant, unpredictable, nihilistic",
      relationshipStatus: "stranger",
      affectionLevel: 0,
      image: "/attached_assets/rick.jpg"
    },
    {
      id: 2,
      name: "Morty Smith", 
      description: "Rick's anxious teenage grandson",
      personality: "nervous, kind-hearted, impressionable, awkward",
      relationshipStatus: "stranger",
      affectionLevel: 0,
      image: "/attached_assets/morty.jpg"
    },
    {
      id: 3,
      name: "Evil Morty",
      description: "A Morty who transcended his original purpose",
      personality: "calculating, mysterious, ambitious, ruthless",
      relationshipStatus: "stranger",
      affectionLevel: 0,
      image: "/attached_assets/evil-morty.png"
    },
    {
      id: 4,
      name: "Rick Prime",
      description: "The original Rick who murdered C-137's family",
      personality: "cruel, manipulative, sociopathic, genius",
      relationshipStatus: "stranger",
      affectionLevel: 0,
      image: "/attached_assets/RICKPRIME.webp"
    }
  ]);
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

// Conversation endpoint
app.post('/api/conversation', (req, res) => {
  const { message, character } = req.body;
  
  const responses = {
    1: [ // Rick
      "Wubba lubba dub dub! *burp* What do you want?",
      "Listen, I'm busy inventing stuff. Make it quick.",
      "Great, another dimension where people ask stupid questions.",
      "You know what? Fine. *takes swig* What's your deal?"
    ],
    2: [ // Morty
      "Oh geez, h-hi there! I'm Morty!",
      "I-I don't know about this, but... hi?",
      "W-wow, this is really happening! Are you real?",
      "Aw geez, I hope Rick doesn't find out about this..."
    ],
    3: [ // Evil Morty
      "How... interesting. Another visitor.",
      "You think you understand me, but you don't.",
      "Everything has a purpose. Even this conversation.",
      "I've transcended what other Mortys could never imagine."
    ],
    4: [ // Rick Prime
      "*laughs maniacally* Oh, this is rich!",
      "You want to chat with the Rick who broke the game?",
      "I'm the Rick that other Ricks fear. What makes you special?",
      "Cute. Another ant thinks it can understand a god."
    ]
  };

  const characterResponses = responses[character] || responses[1];
  const randomResponse = characterResponses[Math.floor(Math.random() * characterResponses.length)];
  
  res.json({
    response: randomResponse,
    affectionChange: Math.floor(Math.random() * 3) - 1,
    choices: [
      { type: "flirt", text: "That's... actually kind of attractive", affectionPotential: 2 },
      { type: "support", text: "You seem like you could use someone to talk to", affectionPotential: 1 },
      { type: "challenge", text: "I think you're more complex than you let on", affectionPotential: 1 }
    ]
  });
});

// Serve static files
const publicPath = path.join(process.cwd(), 'public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
  console.log('✅ Serving static files from:', publicPath);
}

// Serve built frontend
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log('✅ Serving built frontend from:', distPath);
  
  // SPA fallback
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.log('⚠️  Built frontend not found at:', distPath);
  
  // Fallback HTML for when build is not available
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
            .api-link { color: #00aaff; text-decoration: none; }
            .api-link:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 Rick and Morty Dating Simulator</h1>
            <div class="status">✅ Server is running on Railway!</div>
            <p>The backend API is operational. Frontend build will be available after deployment completes.</p>
            <p>API Health Check: <a href="/api/health" class="api-link">/api/health</a></p>
            <p>Characters API: <a href="/api/characters" class="api-link">/api/characters</a></p>
          </div>
        </body>
      </html>
    `);
  });
}

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message,
    railway: true
  });
});

// Railway port configuration
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

console.log(`Attempting to start server on ${HOST}:${PORT}`);

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Railway server successfully running on ${HOST}:${PORT}`);
  console.log(`Health check: http://${HOST}:${PORT}/api/health`);
  console.log(`Characters API: http://${HOST}:${PORT}/api/characters`);
});

server.on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});