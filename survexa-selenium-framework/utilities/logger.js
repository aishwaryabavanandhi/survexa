const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config/selenium.config');

// Ensure log directory exists
if (!fs.existsSync(config.logPath)) {
  fs.mkdirSync(config.logPath, { recursive: true });
}

const logFormat = winston.format.printf(({ timestamp, level, message, label }) => {
  const labelTag = label ? ` [${label}]` : '';
  return `${timestamp} [${level.toUpperCase()}]${labelTag}: ${message}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    logFormat
  ),
  transports: [
    new winston.transports.File({ 
      filename: path.join(config.logPath, 'execution.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    })
  ]
});

// If not in production, log to console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, label }) => {
        const labelTag = label ? ` [${label}]` : '';
        return `${timestamp} ${level}${labelTag}: ${message}`;
      })
    )
  }));
}

module.exports = logger;
