// src/app.js
require('dotenv').config();
require('./models');         // runs sequelize.sync()

const express = require('express');
const morgan  = require('morgan');
const helmet  = require('helmet');
const cors    = require('cors');

const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');
const { rateLimiter } = require('./middleware/rateLimiter');

const app = express();

// Global middleware
app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

module.exports = app;
