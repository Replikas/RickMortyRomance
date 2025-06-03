const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// Health check - required by Railway
app.get('/', (req, res) => {
  res.json({ status: 'ok', app: 'Rick and Morty Dating Simulator' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Basic API endpoints
app.get('/api/characters', (req, res) => {
  res.json([
    { id: 1, name: "Rick Sanchez (C-137)" },
    { id: 2, name: "Morty Smith" },
    { id: 3, name: "Evil Morty" },
    { id: 4, name: "Rick Prime" }
  ]);
});

app.get('/api/user/:userId/settings', (req, res) => {
  res.json({
    aiModel: "deepseek/deepseek-chat-v3-0324:free",
    sfxVolume: 50,
    musicVolume: 25,
    masterVolume: 75
  });
});

app.post('/api/conversation', (req, res) => {
  const responses = ["Hi there!", "How's it going?", "What's up?"];
  res.json({
    message: responses[Math.floor(Math.random() * responses.length)],
    affectionChange: 0
  });
});

// Static files
const distPath = path.join(__dirname, '..', 'dist');
const publicPath = path.join(distPath, 'public');

if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
} else if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.send('Rick and Morty Dating Simulator - Server Running');
});

// Railway port configuration - must match exactly
const PORT = process.env.PORT;

if (!PORT) {
  console.error('PORT environment variable not set');
  process.exit(1);
}

console.log('Railway PORT:', PORT);

app.listen(PORT, () => {
  console.log(`Railway server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});