const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const env = require('./config/env');
const logger = require('./utils/logger');
const { generalLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const centreRoutes = require('./routes/centreRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(generalLimiter);

app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/openapi.json', (req, res) => res.json(swaggerSpec));

app.use('/auth', authRoutes);
app.use('/centres', centreRoutes);
app.use('/bookings', bookingRoutes);
app.use('/payments', paymentRoutes);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    const { sequelize } = require('./models');
    await sequelize.authenticate();
    logger.info('Database connection established');

    app.listen(env.port, () => {
      logger.info(`Server listening on port ${env.port}`);
    });
  } catch (err) {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  }
};

if (require.main === module) {
  start();
}

module.exports = app;