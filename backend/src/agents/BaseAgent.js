// backend/src/agents/BaseAgent.js
const EventEmitter = require('events');

const messageBus = new EventEmitter();

class BaseAgent {
    constructor(name) {
        this.name = name;
        this.messageBus = messageBus;
        this.setupListeners();
    }

    setupListeners() {
        this.messageBus.on(`agent:${this.name}`, (msg, callback) => {
            console.log(`[${this.name}] получил сообщение: ${msg.type}`);
            this.perceive(msg);
            const decision = this.decide(msg);
            this.act(decision, callback);
        });
    }

    perceive(msg) {
        // Здесь можно логировать или сохранять состояние
        this.lastMessage = msg;
    }

    decide(msg) {
        // Логика принятия решения — переопределяется в наследниках
        return msg;
    }

    act(decision, callback) {
        this.handleMessage(decision, callback);
    }

    handleMessage(msg, callback) {
        callback(null, { status: 'ok' });
    }

    sendMessage(targetAgentName, message, callback) {
        console.log(`[${this.name}] → [${targetAgentName}]: ${message.type}`);
        this.messageBus.emit(`agent:${targetAgentName}`, message, callback);
    }
}

module.exports = { BaseAgent, messageBus };