// src/routes/auth.js
require('dotenv').config();
const express  = require('express');
const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const { User } = require('../models');

const router = express.Router();
const SALT_ROUNDS = 10;

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'username and password required' });
  }
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ username, password: hash });
    // Issue a token immediately
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.status(201).json({ token });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'username taken' });
    }
    console.error(err);
    res.status(500).json({ message: 'registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'username and password required' });
  }
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'invalid credentials' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'invalid credentials' });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'login error' });
  }
});

module.exports = router;
