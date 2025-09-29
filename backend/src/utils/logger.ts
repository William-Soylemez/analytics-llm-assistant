// ABOUTME: Winston logger configuration for application-wide logging
// ABOUTME: Formats logs differently for development vs production environments

import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const isDevelopment = process.env.NODE_ENV !== 'production';

const devFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    isDevelopment ? colorize() : winston.format.json(),
    isDevelopment ? devFormat : winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
});

if (!isDevelopment) {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    })
  );
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
    })
  );
}

export default logger;