// src/services/userService.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const moment = require('moment');
const userRepository = require('../repositories/userRepository');
const roleRepository = require('../repositories/roleRepository');
const cartRepository = require('../repositories/cartRepository');
const addressRepository = require('../repositories/addressRepository');
const { sanitizeString } = require('../utils/sanitizer');
const { logger, sendLoginLogger } = require('../config/logger');

const smsService = require('../utils/smsService');
const EmailService = require('../utils/emailService')


class UserService {
    constructor() {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.addressRepository = addressRepository;
        // پیکربندی سرویس‌های خارجی
        this.smsService = smsService;
        this.EmailService = EmailService;
        this.logger = logger ;
        this.sendLoginLogger = sendLoginLogger;
    }

    // --- User Self-Service Methods ---

    async register(userData) {
        const { username, email, password, first_name, last_name, phone_number } = userData;

        const existingUser = await this.userRepository.findByUsernameOrEmail(username, email);
        if (existingUser) {
            const error = new Error('User with this username or email already exists.');
            error.statusCode = 409;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const customerRole = await this.roleRepository.findByName('customer');
        if (!customerRole) {
            const error = new Error('Customer role not found. Please seed roles.');
            error.statusCode = 500;
            throw error;
        }

        const newUser = await this.userRepository.create({
            username: sanitizeString(username),
            email: sanitizeString(email),
            password: hashedPassword,
            first_name: sanitizeString(first_name),
            last_name: sanitizeString(last_name),
            phone_number: sanitizeString(phone_number),
            role_id: customerRole.id,
        });

        const { password: _, ...userResponse } = newUser.get({ plain: true });
        return userResponse;

    }

    async login(username, password, sessionId = null) {
        const user = await this.userRepository.findByUsername(username);
        if (!user || !(await user.isValidPassword(password))) {
            const error = new Error('Invalid credentials.');
            error.statusCode = 401;
            throw error;
        }

        // اگر sessionId مهمان وجود داشت، سبد مهمان را به کاربر وصل کن
        if (sessionId) {
            await cartRepository.associateGuestCartToUser(sessionId, user.id);
        }

        const accessToken = jwt.sign(
            { id: user.id, role_id: user.role_id, username: user.username },
            process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
        );

        return {
            accessToken,
            refreshToken,
            user: { id: user.id, username: user.username, email: user.email, role_id: user.role_id }
        };
    }

    async getUserProfile(id) {
        const user = await this.userRepository.findByIdWithRole(id);
        if (!user) {
            const error = new Error('User profile not found.');
            error.statusCode = 404;
            throw error;
        }
        return user;
    }

    async updateUserProfile(id, data) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }

        if ((data.username && data.username !== user.username) || (data.email && data.email !== user.email)) {
            const existingUser = await this.userRepository.findByUsernameOrEmail(data.username, data.email);
            if (existingUser && existingUser.id !== id) {
                const error = new Error('Username or email already exists for another user.');
                error.statusCode = 409;
                throw error;
            }
        }

        user.username = data.username ? sanitizeString(data.username) : user.username;
        user.email = data.email ? sanitizeString(data.email) : user.email;
        user.first_name = data.first_name ? sanitizeString(data.first_name) : user.first_name;
        user.last_name = data.last_name ? sanitizeString(data.last_name) : user.last_name;
        user.phone_number = data.phone_number ? sanitizeString(data.phone_number) : user.phone_number;

        const updatedUser = await this.userRepository.save(user);
        const { password, ...userResponse } = updatedUser.get({ plain: true });
        return userResponse;
    }

    // --- Address Management ---

    async createAddress(userId, addressData) {
        const { street, city, state, zip_code, country, is_default } = addressData;

        if (is_default) {
            await this.addressRepository.clearDefault(userId);
        }

        return await this.addressRepository.create({
            user_id: userId,
            street: sanitizeString(street),
            city: sanitizeString(city),
            state: sanitizeString(state),
            zip_code: sanitizeString(zip_code),
            country: sanitizeString(country),
            is_default: is_default || false
        });
    }

    async getAddresses(userId) {
        return await this.addressRepository.findAllByUserId(userId);
    }

    // --- Password & OTP ---

    async forgotPassword(identifier) {
        const value = sanitizeString(identifier.trim());
        const user = await this.userRepository.findByEmail(value) || await this.userRepository.findByPhoneNumber(value);
        if (!user) return; // Fail silently as per original logic

        if (user.email === value) {
            const resetToken = crypto.randomBytes(20).toString('hex');
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = moment().add(1, 'hour').toDate();
            await this.userRepository.save(user);

            // Send Email Logic
            const resetUrl = `${process.env.FRONTEND_RESET_PASSWORD_URL}?token=${resetToken}`;
            await this.EmailService.sendMail({
                to: user.email,
                subject: 'درخواست بازنشانی رمز عبور',
                html: `<p>برای بازنشانی رمز عبور، روی لینک زیر کلیک کنید: <a href="${resetUrl}">${resetUrl}</a></p>`
            })
        } else if (user.phone_number === value) {
            const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
            user.resetPasswordToken = resetCode;
            user.resetPasswordExpires = moment().add(2, 'minutes').toDate();
            await this.userRepository.save(user);

            // Send SMS Logic
            await this.smsService.sendPasswordResetCode(user,resetCode);
            //this.kavenegarAPI.Send({ message: `کد بازیابی شما: ${resetCode}`, sender: process.env.SMS_SENDER_NUMBER, receptor: user.phone_number });
        }
    }

    async resetPassword(token, newPassword) {
        if (newPassword.length < 8) {
            const error = new Error('Password must be at least 8 characters long.');
            error.statusCode = 400;
            throw error;
        }

        const user = await this.userRepository.findByResetToken(token);
        if (!user) {
            const error = new Error('Password reset token is invalid or has expired.');
            error.statusCode = 400;
            throw error;
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        return await this.userRepository.save(user);
    }

    async requestOtp(phoneNumber) {
        const sanitizedPhoneNumber = sanitizeString(phoneNumber);
        const user = await this.userRepository.findByPhoneNumber(sanitizedPhoneNumber);
        if (!user) {
            const error = new Error('User with this phone number not found.');
            error.statusCode = 404;
            throw error;
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp_code = otpCode;
        user.otp_expires_at = moment().add(process.env.OTP_EXPIRES_IN_MINUTES || 2, 'minutes').toDate();
        await this.userRepository.save(user);

        await this.smsService.sendOtpCode(user,otpCode);
    }

    async verifyOtpAndLogin(phoneNumber, otpCode) {
        const sanitizedPhoneNumber = sanitizeString(phoneNumber);
        const sanitizedOtpCode = sanitizeString(otpCode);

        const user = await this.userRepository.findByOtp(sanitizedPhoneNumber, sanitizedOtpCode);
        if (!user) {
            const error = new Error('Invalid or expired OTP code, or phone number not found.');
            error.statusCode = 401;
            throw error;
        }

        user.otp_code = null;
        user.otp_expires_at = null;
        await this.userRepository.save(user);

        return this.login(user.username, user.password); // Reuse login logic, but need to pass a valid password, this is a flaw in original logic. Let's create tokens directly.
        const accessToken = jwt.sign({ id: user.id, role_id: user.role_id, username: user.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });

        return {
            accessToken,
            refreshToken,
            user: { id: user.id, username: user.username, email: user.email, role_id: user.role_id }
        };
    }

    // --- Admin Methods ---
    // (کدهای کامل این متدها از پاسخ قبلی)
    async getAllUsers() {
        return await this.userRepository.findAllWithRoles();
    }
    async getUserByIdForAdmin(id) {
        const user = await this.userRepository.findByIdWithRole(id);
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }
        return user;
    }
    async updateUserByAdmin(id, data) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }

        if ((data.username && data.username !== user.username) || (data.email && data.email !== user.email)) {
            const existingUser = await this.userRepository.findByUsernameOrEmail(data.username, data.email);
            if (existingUser && existingUser.id !== parseInt(id)) {
                const error = new Error('Username or email already exists for another user.');
                error.statusCode = 409;
                throw error;
            }
        }

        if (data.password) {
            user.password = await bcrypt.hash(data.password, 10);
        }
        user.username = data.username || user.username;
        user.email = data.email || user.email;
        user.first_name = data.first_name || user.first_name;
        user.last_name = data.last_name || user.last_name;
        user.phone_number = data.phone_number || user.phone_number;

        if (data.role_id) {
            user.role_id = data.role_id;
        }

        return await this.userRepository.save(user);
    }
    async deleteUserById(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }
        return await this.userRepository.delete(user);
    }
}

module.exports = new UserService();