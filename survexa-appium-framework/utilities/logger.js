/**
 * utilities/logger.js
 * Winston logger for Survexa Appium Framework
 * Outputs to console and logs/framework.log
 */
const { createLogger, format, transports } = require('winston')
const path = require('path')
const fs = require('fs')

const logDir = path.resolve(__dirname, '../logs')
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.printf(({ timestamp, level, message, stack }) => {
      const lvl = level.toUpperCase().padEnd(5)
      const msg = stack || message
      return `[${timestamp}] [${lvl}] ${msg}`
    })
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message }) => `${level}: ${message}`)
      ),
    }),
    new transports.File({
      filename: path.join(logDir, 'framework.log'),
      maxsize: 10 * 1024 * 1024, // 10 MB
      maxFiles: 5,
      tailable: true,
    }),
    new transports.File({
      filename: path.join(logDir, 'errors.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024,
      maxFiles: 3,
    }),
  ],
})

module.exports = logger
