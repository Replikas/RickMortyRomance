import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Request logging
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  }
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

// Root health check
app.get('/', (req, res) => {
  res.json({
    app: 'Rick and Morty Dating Simulator',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Character data
app.get('/api/characters', (req, res) => {
  res.json([
    {
      id: 1,
      name: "Rick Sanchez (C-137)",
      description: "Genius scientist with severe alcohol dependency and nihilistic worldview",
      personality: "sarcastic, brilliant, unpredictable, nihilistic",
      backstory: "Interdimensional scientist who has seen too much",
      relationshipStatus: "stranger",
      affectionLevel: 0,
      image: "/attached_assets/rick.jpg"
    },
    {
      id: 2,
      name: "Morty Smith",
      description: "Rick's anxious teenage grandson and reluctant adventure companion",
      personality: "nervous, kind-hearted, impressionable, awkward",
      backstory: "Just wants a normal life but keeps getting dragged into adventures",
      relationshipStatus: "stranger", 
      affectionLevel: 0,
      image: "/attached_assets/morty.jpg"
    },
    {
      id: 3,
      name: "Evil Morty",
      description: "A Morty who transcended his original purpose with calculating intelligence",
      personality: "calculating, mysterious, ambitious, ruthless",
      backstory: "The Morty who refused to be a sidekick",
      relationshipStatus: "stranger",
      affectionLevel: 0,
      image: "/attached_assets/evil-morty.png"
    },
    {
      id: 4,
      name: "Rick Prime",
      description: "The original Rick who murdered C-137's family",
      personality: "cruel, manipulative, sociopathic, genius",
      backstory: "The Rick who started it all",
      relationshipStatus: "stranger",
      affectionLevel: 0,
      image: "/attached_assets/RICKPRIME.webp"
    }
  ]);
});

// User settings
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

// Basic conversation endpoint
app.post('/api/conversation', (req, res) => {
  const { message, character, conversationHistory = [] } = req.body;
  
  const responses = {
    1: [ // Rick
      "Wubba lubba dub dub! *burp* What do you want?",
      "Listen, I'm busy inventing stuff that'll blow your tiny mind. Make it quick.",
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
      "You think you understand me, but you don't. Nobody does.",
      "Everything has a purpose. Even this conversation.",
      "I've transcended what Mortys are supposed to be. What about you?"
    ],
    4: [ // Rick Prime
      "You're wasting my time. I've destroyed better things than you.",
      "Pathetic. Just like all the infinite versions of everyone.",
      "I am the Rick. The original. The one who started everything.",
      "You want to talk? How quaint. I've killed for less."
    ]
  };
  
  const characterResponses = responses[character?.id] || responses[1];
  const response = characterResponses[Math.floor(Math.random() * characterResponses.length)];
  const affectionChange = Math.floor(Math.random() * 3) - 1;
  
  res.json({
    message: response,
    character: character,
    affectionChange: affectionChange,
    emotion: affectionChange > 0 ? 'happy' : affectionChange < 0 ? 'annoyed' : 'neutral'
  });
});

// Static file serving
const projectRoot = path.join(__dirname, '..');
const distPath = path.join(projectRoot, 'dist');
const publicPath = path.join(distPath, 'public');
const assetsPath = path.join(projectRoot, 'attached_assets');

console.log('Static file paths:');
console.log('Project root:', projectRoot);
console.log('Dist path:', distPath);
console.log('Public path:', publicPath);
console.log('Assets path:', assetsPath);

// Serve built frontend
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
  console.log('Serving static files from public directory');
} else if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log('Serving static files from dist directory');
}

// Serve attached assets
if (fs.existsSync(assetsPath)) {
  app.use('/attached_assets', express.static(assetsPath));
  console.log('Serving attached assets');
}

// SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  const indexPath = fs.existsSync(publicPath) 
    ? path.join(publicPath, 'index.html')
    : path.join(distPath, 'index.html');
    
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rick and Morty Dating Simulator</title>
          <style>
            body { 
              font-family: 'Courier New', monospace;
              background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
              color: #00ff88;
              margin: 0;
              padding: 50px;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              max-width: 600px;
              padding: 40px;
              border: 2px solid #00ff88;
              border-radius: 15px;
              background: rgba(0, 0, 0, 0.8);
              text-align: center;
            }
            h1 { color: #00ff88; margin-bottom: 20px; }
            .status { color: #ffa500; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🛸 Rick and Morty Dating Simulator</h1>
            <div class="status">Backend Status: ✅ Running</div>
            <p>Server is operational but frontend build not found.</p>
            <p>Run the build process to generate the frontend.</p>
          </div>
        </body>
      </html>
    `);
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Health check: http://${HOST}:${PORT}/api/health`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');  
  server.close(() => process.exit(0));
});