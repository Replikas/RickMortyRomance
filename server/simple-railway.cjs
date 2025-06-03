const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('OK');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server on ${port}`);
});