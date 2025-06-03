const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

// Health check
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

// Static files
app.use(express.static('dist'));
app.use(express.static('dist/public'));

// Fallback
app.get('*', (req, res) => {
  res.send('Rick and Morty Dating Simulator - Server Running');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});