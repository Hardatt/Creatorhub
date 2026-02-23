const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");
const dbconfig = require("@config/database");

const basename = path.basename(__filename);
const environment = process.env.NODE_ENV || "development";
const config = dbconfig[environment];

if (!config) {
  throw new Error(
    `Database configuration for environment "${environment}" not found in config/database.js`
  );
}

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect || "mysql",
    logging: config.logging ?? false,
    ...(config.dialectOptions ? { dialectOptions: config.dialectOptions } : {}),
    ...(config.pool ? { pool: config.pool } : {}),
  }
);

const db = {};

// Auto-load all model files in this directory
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      path.extname(file) === ".js"
    );
  })
  .forEach((file) => {
    const modelFactory = require(path.join(__dirname, file));
    const model = modelFactory(sequelize, DataTypes);
    db[model.name] = model;
  });

// Run associations after all models are loaded
Object.keys(db).forEach((modelName) => {
  if (typeof db[modelName].associate === "function") {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
