const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("swap_db", "root", "", {
  host: "localhost",

  dialect: "mysql",
  timezone: "+03:00",
});

module.exports = sequelize;
