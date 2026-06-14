const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const StudentProgress = sequelize.define('StudentProgress', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  totalPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  logicMastery: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  typingMastery: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  completedLevels: {
    type: DataTypes.TEXT, // храним JSON-массив пройденных уровней
    defaultValue: '[]',
  },
}, {
  tableName: 'student_progress',
  timestamps: true,
});

User.hasOne(StudentProgress, { foreignKey: 'userId', onDelete: 'CASCADE' });
StudentProgress.belongsTo(User, { foreignKey: 'userId' });

module.exports = StudentProgress;