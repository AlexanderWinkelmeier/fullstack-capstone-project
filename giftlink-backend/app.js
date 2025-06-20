/*jshint esversion: 8 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pinoHttp = require('pino-http');
const pinoLogger = require('./logger');
const authRoutes = require('./routes/authRoutes');
const giftRoutes = require('./routes/giftRoutes');
const searchRoutes = require('./routes/searchRoutes');
const connectToDatabase = require('./models/db');
const { loadData } = require('./util/import-mongo/index');

const app = express();
const port = 3060;

// Middleware
app.use('*', cors());
app.use(express.json());
app.use(pinoHttp({ logger: pinoLogger }));

// Connect to MongoDB
connectToDatabase()
  .then(() => {
    pinoLogger.info('Connected to DB');
  })
  .catch((e) => {
    pinoLogger.error('Failed to connect to DB', e);
    process.exit(1); // Exit if DB connection fails
  });

// Routes
app.get('/', (req, res) => {
  res.send('Inside the server');
});

app.use('/auth', authRoutes);
app.use('/api/gifts', giftRoutes);
app.use('/api/search', searchRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  pinoLogger.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  pinoLogger.info(`Server running on port ${port}`);
});