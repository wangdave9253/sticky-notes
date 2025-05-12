const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

class StickyNote extends Model {}

StickyNote.init({
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  title: {
    type:      DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type:      DataTypes.TEXT,
    allowNull: true,
  },
}, {
  sequelize,
  modelName:  'StickyNote',
  tableName:  'sticky_notes',
  timestamps: true,
});

// Associations
StickyNote.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(StickyNote, { foreignKey: 'userId' });

module.exports = StickyNote;
