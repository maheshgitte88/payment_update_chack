const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('paymentsystem', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql', 
});

module.exports = sequelize;