// backend/src/agents/BaseAgent.js
const EventEmitter = require('events');

// Глобальная шина сообщений (можно вынести в отдельный модуль)
const messageBus = new EventEmitter();

class BaseAgent {
    constructor(name) {
        this.name = name;
        this.messageBus = messageBus;
        this.setupListeners();
    }

    setupListeners() {
        // Подписываемся на сообщения, адресованные этому агенту
        this.messageBus.on(`agent:${this.name}`, (msg, callback) => {
            this.handleMessage(msg, callback);
        });
    }

    handleMessage(msg, callback) {
        // Будет переопределено в наследниках
        callback(null, { status: 'ok' });
    }

    sendMessage(targetAgentName, message, callback) {
        this.messageBus.emit(`agent:${targetAgentName}`, message, callback);
    }
}

module.exports = { BaseAgent, messageBus };