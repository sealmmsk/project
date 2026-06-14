const sequelize = require('../config/db');
const User = require('./User');
const StudentProgress = require('./StudentProgress');
const TaskResult = require('./TaskResult');

module.exports = {
  sequelize,
  User,
  StudentProgress,
  TaskResult,
};