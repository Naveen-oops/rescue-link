const { createLogger, format, transports } = require('winston');
const path = require('path');
const config = require('../properties.json'); 

// Ensure the log directory exists
const fs = require('fs');
const logDir = path.dirname(config.logFilePath.errorLog);
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: config.logFilePath.errorLog, level: 'error' }),
        new transports.File({ filename: config.logFilePath.combinedLog })
    ],
});

module.exports = logger;
