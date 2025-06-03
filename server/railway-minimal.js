import express from 'express';

const app = express();

// Essential middleware
app.use(express.json());

// Health endpoint for Railway
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    app: 'Rick and Morty Dating Simulator',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Basic character data
app.get('/api/characters', (req, res) => {
  res.json([
    { id: 1, name: "Rick Sanchez (C-137)" },
    { id: 2, name: "Morty Smith" },
    { id: 3, name: "Evil Morty" },
    { id: 4, name: "Rick Prime" }
  ]);
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Railway server listening on port ${PORT}`);
});