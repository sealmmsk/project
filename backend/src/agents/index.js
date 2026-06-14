// backend/src/agents/index.js
const CoordinatorAgent = require('./CoordinatorAgent');
const TutorAgent = require('./TutorAgent');
const StudentAgent = require('./StudentAgent');
const ContentAgent = require('./ContentAgent');

// Создаём экземпляры
const coordinator = new CoordinatorAgent();
const tutor = new TutorAgent();
const student = new StudentAgent();
const content = new ContentAgent();

module.exports = { coordinator };