const winston = require('winston');
const env = require('../config/env');

const logger = winston.createLogger({
  level: env.nodeEnv === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'diagnostic-booking' },
  transports: [
    new winston.transports.Console({
      format: env.nodeEnv === 'development'
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        : winston.format.json(),
    }),
  ],
});

// Silence logs during tests
if (env.nodeEnv === 'test') {
  logger.silent = true;
}

module.exports = logger;