// config/config.js

// این خط باعث میشه پکیج dotenv اجرا بشه و متغیرهای فایل .env رو در process.env بارگذاری کنه.
// باید مطمئن باشید که این پکیج در فایل اصلی سرور (مثلاً server.js یا app.js) هم در ابتدای اجرا فراخوانی شده باشه.
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,      // نام کاربری از .env
    password: process.env.DB_PASSWORD,  // رمز عبور از .env
    database: process.env.DB_NAME_DEV,  // نام دیتابیس توسعه از .env
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: process.env.DB_PORT,          // پورت از .env (معمولا 5432 برای PostgreSQL)
    logging: false, // برای محیط توسعه می‌تونید true بذارید تا کوئری‌ها رو در کنسول ببینید.
                    // برای پروداکشن بهتره false باشه.
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_TEST,
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: process.env.DB_PORT,
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_PROD,
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: process.env.DB_PORT,
    logging: false,
  }
};