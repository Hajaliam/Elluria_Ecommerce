// src/utils/emailService.js

const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    async sendMail({ to, subject, html }) {
        try {
            const info = await this.transporter.sendMail({
                from: process.env.EMAIL_USERNAME,
                to,
                subject,
                html
            });
            console.log(`📨 Email sent to ${to} - ID: ${info.messageId}`);
            return info;
        } catch (err) {
            console.error('❌ Email send failed:', err);
            throw err;
        }
    }
}

module.exports = new EmailService();
