const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const dbService = require('./services/dbService');
const influencerRoutes = require('./routes/influencers');
const matchRoutes = require('./routes/match');
const brandsRoutes = require('./routes/brands');
const trustGraphRoutes = require('./routes/trustGraph');

const app = express();
const PORT = process.env.PORT || 5000;
const clientDistPath = path.join(__dirname, '..', 'frontend', 'dist');

app.use(cors({
  origin: process.env.CORS_ORIGIN || true
}));
app.use(express.json());

// Routes
app.use('/api/influencers', influencerRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/trust-graph', trustGraphRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Influencer Matching Engine running' });
});

// Production: serve the built React frontend from the same free Node service.
app.use(express.static(clientDistPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDistPath, 'index.html'), err => {
    if (err) next();
  });
});

// Initialize DB and start server
dbService.initializeDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Critical database initialization failed:', err.message);
  // Still start server to allow graceful degradation/mocking
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} (Database Offline)`);
  });
});
