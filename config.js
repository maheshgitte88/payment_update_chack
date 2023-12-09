const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('text_marks', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql', 
});

module.exports = sequelize;