// models/index.js (در پوشه models/ ریشه پروژه)

'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config,
  );
}

const modelsPath = path.join(__dirname, '..', 'src', 'models');

// 1. همه مدل‌ها را ابتدا بارگذاری کنید
fs.readdirSync(modelsPath)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename && // Ensures index.js itself is not loaded again
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(modelsPath, file))(
      sequelize,
      Sequelize.DataTypes,
    );
    db[model.name] = model;
  });

// 2. سپس، تابع associate را برای همه مدل‌ها فراخوانی کنید
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db); // 'db' را به عنوان آرگومان models ارسال می‌کنیم
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
