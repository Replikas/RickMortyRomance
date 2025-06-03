import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Railway deployment starting...');
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV);
console.log('Port from env:', process.env.PORT);
console.log('Working directory:', process.cwd());

const app = express();

// Essential middleware only
app.use(express.json({ limit: '1mb' }));

// Health check - Railway requires this
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    app: 'Rick and Morty Dating Simulator',
    status: 'running',
    railway: true
  });
});

// Characters endpoint
app.get('/api/characters', (req, res) => {
  res.status(200).json([
    { id: 1, name: "Rick Sanchez (C-137)", personality: "sarcastic, genius" },
    { id: 2, name: "Morty Smith", personality: "nervous, kind" },
    { id: 3, name: "Evil Morty", personality: "calculating, mysterious" },
    { id: 4, name: "Rick Prime", personality: "cruel, manipulative" }
  ]);
});

// User settings
app.get('/api/user/:userId/settings', (req, res) => {
  res.status(200).json({
    aiModel: "deepseek/deepseek-chat-v3-0324:free",
    sfxVolume: 50,
    musicVolume: 25,
    masterVolume: 75,
    openrouterApiKey: ""
  });
});

// Conversation endpoint
app.post('/api/conversation', (req, res) => {
  const { character } = req.body;
  const responses = {
    1: "Wubba lubba dub dub! What do you want?",
    2: "Oh geez, h-hi there!",
    3: "How... interesting.",
    4: "You're wasting my time."
  };
  
  res.status(200).json({
    message: responses[character?.id] || responses[1],
    affectionChange: 0,
    emotion: 'neutral'
  });
});

// Static files - check multiple paths
const staticPaths = [
  path.join(__dirname, '..', 'dist', 'public'),
  path.join(__dirname, '..', 'dist'),
  path.join(process.cwd(), 'dist', 'public'),
  path.join(process.cwd(), 'dist')
];

let staticDir = null;
for (const dir of staticPaths) {
  if (fs.existsSync(dir)) {
    staticDir = dir;
    console.log('Found static directory:', dir);
    break;
  }
}

if (staticDir) {
  app.use(express.static(staticDir));
  
  // SPA fallback
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    const indexPath = path.join(staticDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(200).send(`
        <!DOCTYPE html>
        <html><head><title>Rick and Morty Dating Simulator</title></head>
        <body style="background:#0a0a0a;color:#00ff88;font-family:monospace;text-align:center;padding:50px;">
          <h1>Rick and Morty Dating Simulator</h1>
          <p>Server is running on Railway</p>
          <p>Frontend build processing...</p>
        </body></html>
      `);
    }
  });
} else {
  console.log('No static directory found, serving API only');
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(200).send('Rick and Morty Dating Simulator - API Server Running');
  });
}

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Server error' });
});

// Railway port configuration
const PORT = parseInt(process.env.PORT || '3000', 10);

console.log('Attempting to start server on port:', PORT);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server successfully started on port ${PORT}`);
  console.log(`Health check available at: http://0.0.0.0:${PORT}/api/health`);
});

server.on('error', (err) => {
  console.error('Server failed to start:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  server.close(() => process.exit(0));
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});