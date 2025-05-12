// src/models/index.js
const sequelize    = require('../config/db');
const User         = require('./User');
const StickyNote   = require('./StickyNote');

module.exports = { sequelize, User, StickyNote };
