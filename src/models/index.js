const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const User = require('./user')(sequelize);
const Centre = require('./centre')(sequelize);
const Test = require('./test')(sequelize);
const CentreTest = require('./centreTest')(sequelize);
const Booking = require('./booking')(sequelize);
const Payment = require('./payment')(sequelize);
const ProcessedWebhook = require('./processedWebhook')(sequelize);

// Associations
Centre.belongsToMany(Test, {
  through: CentreTest,
  foreignKey: 'centre_id',
  otherKey: 'test_id',
  as: 'tests',
});
Test.belongsToMany(Centre, {
  through: CentreTest,
  foreignKey: 'test_id',
  otherKey: 'centre_id',
  as: 'centres',
});

CentreTest.belongsTo(Centre, { foreignKey: 'centre_id', as: 'centre' });
CentreTest.belongsTo(Test, { foreignKey: 'test_id', as: 'test' });
Centre.hasMany(CentreTest, { foreignKey: 'centre_id', as: 'centreTests' });
Test.hasMany(CentreTest, { foreignKey: 'test_id', as: 'centreTests' });

User.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Booking.belongsTo(Test, { foreignKey: 'test_id', as: 'test' });
Booking.belongsTo(Centre, { foreignKey: 'centre_id', as: 'centre' });

Booking.hasMany(Payment, { foreignKey: 'booking_id', as: 'payments' });
Payment.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Centre,
  Test,
  CentreTest,
  Booking,
  Payment,
  ProcessedWebhook,
};