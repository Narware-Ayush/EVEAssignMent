const sequelize = require('../config/database');
const { Centre, Test, CentreTest } = require('../models');
const logger = require('../utils/logger');

const run = async () => {
  try {
    await sequelize.authenticate();

    const tests = await Test.bulkCreate(
      [
        { name: 'Complete Blood Count (CBC)', description: 'Basic blood panel', price: 25.0 },
        { name: 'Lipid Profile', description: 'Cholesterol panel', price: 40.0 },
        { name: 'Thyroid Panel (TSH, T3, T4)', description: 'Thyroid function', price: 55.0 },
        { name: 'HbA1c', description: '3-month glucose average', price: 30.0 },
      ],
      { returning: true }
    );

    const centres = await Centre.bulkCreate(
      [
        { name: 'City Diagnostics - Downtown', location: '123 Main St, Downtown' },
        { name: 'HealthFirst Labs', location: '45 Park Ave, Midtown' },
        { name: 'Precision Labs - Uptown', location: '789 Elm St, Uptown' },
      ],
      { returning: true }
    );

    const links = [];
    for (const c of centres) {
      for (const t of tests) {
        // Slight price variation per centre
        const variation = 1 + (Math.random() * 0.2 - 0.1);
        links.push({
          centreId: c.id,
          testId: t.id,
          price: Number((Number(t.price) * variation).toFixed(2)),
          available: true,
        });
      }
    }
    await CentreTest.bulkCreate(links);

    logger.info(`Seeded ${tests.length} tests, ${centres.length} centres, ${links.length} links`);
    process.exit(0);
  } catch (err) {
    logger.error('Seeding failed', { error: err.message, stack: err.stack });
    process.exit(1);
  }
};

run();