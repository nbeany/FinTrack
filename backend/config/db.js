const { Sequelize } = require("sequelize");
const env = require("./env");

const sequelize = new Sequelize(
  env.db.database,
  env.db.user,
  env.db.password,
  {
    host: env.db.host,
    dialect: "postgres",
    port: env.db.port,
    logging: false,
  }
);

module.exports = sequelize;
