const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class User extends Model {}

User.init({
  id: {
    type:     DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  username: {
    type:      DataTypes.STRING,
    allowNull: false,
    unique:    true,
  },
  password: {
    type:      DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName:  'User',
  tableName:  'users',
  timestamps: true,
});

module.exports = User;
