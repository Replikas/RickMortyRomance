const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ 
    app: 'Rick and Morty Dating Simulator',
    status: 'running',
    railway: true
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Characters API
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
      "I've transcended what Mortys are supposed to be."
    ],
    4: [ // Rick Prime
      "You're wasting my time.",
      "Pathetic. Just like all the infinite versions.",
      "I am the Rick. The original.",
      "You want to talk? How quaint."
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

// Static files - serve the built React app
const distPath = path.join(__dirname, '..', 'dist');
const publicPath = path.join(distPath, 'public');
const assetsPath = path.join(__dirname, '..', 'attached_assets');

// Serve built frontend
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
} else if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Serve attached assets
if (fs.existsSync(assetsPath)) {
  app.use('/attached_assets', express.static(assetsPath));
}

// SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  const indexPath = fs.existsSync(publicPath) 
    ? path.join(publicPath, 'index.html')
    : path.join(distPath, 'index.html');
    
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send(`
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
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🛸 Rick and Morty Dating Simulator</h1>
            <p>Server is running! Frontend will load after build completes.</p>
            <p><a href="/api/characters" style="color: #00ff88;">View Characters</a></p>
          </div>
        </body>
      </html>
    `);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Rick and Morty Dating Simulator running on port ${port}`);
});