// src/utils/backupService.js

const cron = require('node-cron');
const { exec } = require('child_process'); // برای اجرای دستورات shell
const moment = require('moment');
const path = require('path');
const fs = require('fs/promises'); // برای کار با فایل سیستم
const {logger} = require('../config/logger'); // برای لاگ‌گیری

// دسترسی به متغیرهای محیطی
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME_DEV; // استفاده از دیتابیس توسعه برای بکاپ
const BACKUP_PATH = path.join(__dirname, '..', '..', process.env.DB_BACKUP_PATH || 'backups/');
const RETENTION_DAYS = parseInt(process.env.DB_BACKUP_RETENTION_DAYS || '7', 10);

// تابع برای اجرای بکاپ
const runBackup = async () => {
    const timestamp = moment().format('YYYYMMDD_HHmmss');
    const backupFileName = `${DB_NAME}_${timestamp}.sql`;
    const backupFilePath = path.join(BACKUP_PATH, backupFileName);

    // اطمینان از وجود پوشه بکاپ
    try {
        await fs.mkdir(BACKUP_PATH, { recursive: true });
    } catch (error) {
        logger.error(`Failed to create backup directory ${BACKUP_PATH}: ${error.message}`);
        return;
    }

    // دستور pg_dump برای PostgreSQL
    // رمز عبور از طریق PGPASSWORD برای امنیت
    // PGPASSWORD=${DB_PASSWORD}
    process.env.PGPASSWORD = DB_PASSWORD;
    const command = `pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} > ${backupFilePath}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            logger.error(`Backup failed: ${error.message}`);
            return;
        }
        if (stderr) {
            logger.warn(`Backup warnings: ${stderr}`);
        }
        logger.info(`Backup successful: ${backupFilePath}`);
        delete process.env.PGPASSWORD;
    });
};

// تابع برای حذف بکاپ‌های قدیمی
const cleanOldBackups = async () => {
    const files = await fs.readdir(BACKUP_PATH);
    const now = moment();

    for (const file of files) {
        const filePath = path.join(BACKUP_PATH, file);
        const stats = await fs.stat(filePath);
        const fileCreationTime = moment(stats.birthtime); // یا stats.mtime برای زمان آخرین تغییر

        if (now.diff(fileCreationTime, 'days') > RETENTION_DAYS) {
            try {
                await fs.unlink(filePath);
                logger.info(`Deleted old backup file: ${filePath}`);
            } catch (error) {
                logger.error(`Failed to delete old backup file ${filePath}: ${error.message}`);
            }
        }
    }
};

// راه‌اندازی زمان‌بندی برای بکاپ‌گیری (هر 24 ساعت / 0 0 * * *)
exports.startBackupScheduler = () => {
    // زمان‌بندی برای ساعت 00:00 هر روز
    cron.schedule('0 0 * * *', async () => {
        logger.info('Running daily database backup...');
        await runBackup();
        await cleanOldBackups();
    });

    // 👈 برای تست، می‌توانید آن را هر 1 دقیقه تنظیم کنید (بعداً به '0 0 * * *' تغییر دهید)
    //cron.schedule('*/1 * * * *', async () => { // هر 1 دقیقه برای تست
        //logger.info('Running database backup...');
        //await runBackup();
        //await cleanOldBackups();
   // });

    logger.info('Database backup scheduler started.');
};

// تابع برای اجرای بکاپ دستی (از طریق API)
exports.manualBackup = async (req, res) => {
    try {
        logger.info('Manual database backup initiated via API.');
        await runBackup();
        await cleanOldBackups();
        res.status(200).json({ message: 'Manual backup initiated. Check logs for status.' });
    } catch (error) {
        logger.error(`Manual backup API failed: ${error.message}`, { stack: error.stack });
        res.status(500).json({ message: 'Server error during manual backup.', error: error.message });
    }
};