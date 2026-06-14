const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const TaskResult = sequelize.define('TaskResult', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  taskType: {
    type: DataTypes.ENUM('robot', 'typing'),
    allowNull: false,
  },
  taskId: {
    type: DataTypes.STRING,   // ID задания в модуле
    allowNull: false,
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  details: {
    type: DataTypes.JSON,     // дополнительная информация (ошибки, время)
    defaultValue: {},
  },
}, {
  tableName: 'task_results',
  timestamps: true,
});

User.hasMany(TaskResult, { foreignKey: 'userId' });
TaskResult.belongsTo(User, { foreignKey: 'userId' });

module.exports = TaskResult;