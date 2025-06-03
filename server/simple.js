import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const distPath = path.join(__dirname, '..', 'dist');
const publicPath = path.join(distPath, 'public');
app.use(express.static(publicPath));
app.use(express.static(distPath));

// Fallback
app.get('*', (req, res) => {
  res.send('Rick and Morty Dating Simulator - Server Running');
});

const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

console.log('Starting server with configuration:');
console.log('Port:', port);
console.log('Host:', host);
console.log('Environment:', process.env.NODE_ENV);
console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('PORT') || k.includes('HOST')));

app.listen(port, host, () => {
  console.log(`Server running on ${host}:${port}`);
  console.log('Server startup successful');
}).on('error', (err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});