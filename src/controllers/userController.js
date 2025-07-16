// src/controllers/userController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // برای JWT
const db = require('../../models');
const User = db.User;
const Role = db.Role;
const Address = db.Address;
const Sequelize = db.Sequelize;
const { sanitizeString } = require('../utils/sanitizer'); // 👈 این خط رو اضافه کنید
const nodemailer = require('nodemailer'); // 👈 اضافه کنید
const crypto = require('crypto'); // 👈 اضافه کنید (built-in Node.js)
const moment = require('moment'); // 👈 اضافه کنید
const validator = require('validator');
const logger = require('../config/logger');
const expressWinston = require('express-winston');
// 👈 اضافه کنید: ایمپورت پکیج پیامک (مثال برای کاوه‌نگار)
const Kavenegar = require('kavenegar'); // اگر از کاوه‌نگار استفاده می‌کنید
const kavenegarAPI = new Kavenegar.KavenegarApi({
  apikey: process.env.SMS_API_KEY,
});

// تنظیمات Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.createAddress = async (req, res) => {
  let { street, city, state, zip_code, country, is_default } = req.body; // 👈 از let استفاده کنید

  // 👈 اعمال پاکسازی به فیلدهای متنی
  street = sanitizeString(street);
  city = sanitizeString(city);
  state = sanitizeString(state);
  zip_code = sanitizeString(zip_code);
  country = sanitizeString(country);

  const userIdFromToken = req.user.id; // ID کاربر از توکن احراز هویت شده

  try {
    const user = await User.findByPk(userIdFromToken);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // اگر آدرس پیش‌فرض جدیدی اضافه می‌شود، بقیه آدرس‌های کاربر را از حالت پیش‌فرض خارج کن
    if (is_default) {
      await Address.update(
        { is_default: false },
        {
          where: { user_id: userIdFromToken, is_default: true },
        },
      );
    }

    const newAddress = await Address.create({
      user_id: userIdFromToken,
      street,
      city,
      state,
      zip_code,
      country,
      is_default: is_default || false,
    });
    res
      .status(201)
      .json({ message: 'Address created successfully!', address: newAddress });
  } catch (error) {
    console.error('Error creating address:', error);
    res
      .status(500)
      .json({ message: 'Server error creating address', error: error.message });
  }
};

exports.register = async (req, res) => {
  let { username, email, password, first_name, last_name, phone_number } =
    req.body; // 👈 از let استفاده کنید

  // 👈 اعمال پاکسازی به فیلدهای متنی
  username = sanitizeString(username);
  email = sanitizeString(email);
  first_name = sanitizeString(first_name);
  last_name = sanitizeString(last_name);
  phone_number = sanitizeString(phone_number);

  try {
    // 1. بررسی وجود کاربر با نام کاربری یا ایمیل تکراری
    const existingUser = await User.findOne({
      where: {
        [Sequelize.Op.or]: [{ username: username }, { email: email }],
      },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: 'User with this username or email already exists.' });
    }

    // 2. هش کردن پسورد
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. یافتن نقش 'customer'
    const customerRole = await Role.findOne({ where: { name: 'customer' } });
    if (!customerRole) {
      return res
        .status(500)
        .json({ message: 'Customer role not found. Please seed the roles.' });
    }

    // 4. ایجاد کاربر جدید در دیتابیس
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      first_name,
      last_name,
      phone_number,
      role_id: customerRole.id,
    });

    // 5. ارسال پاسخ موفقیت‌آمیز
    const userResponse = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      phone_number: newUser.phone_number,
      role_id: newUser.role_id,
      createdAt: newUser.createdAt,
    };

    res
      .status(201)
      .json({ message: 'User registered successfully!', user: userResponse });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({
      message: 'Server error during registration',
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await db.User.findOne({ where: { username: username } });

    if (!user) {
      return res
        .status(401)
        .json({ message: 'Invalid credentials (User not found).' });
    }

    const isPasswordValid = await user.isValidPassword(password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: 'Invalid credentials (Wrong password).' });
    }

    // 3. تولید JWT (Access Token)
    const accessToken = jwt.sign(
      { id: user.id, role_id: user.role_id, username: user.username }, // username را به payload اضافه کنید
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    // 4. تولید Refresh Token (username به refresh token نیاز نیست)
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN },
    );

    // 5. ارسال پاسخ موفقیت‌آمیز
    res.status(200).json({
      message: 'Logged in successfully!',
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role_id: user.role_id,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res
      .status(500)
      .json({ message: 'Server error during login', error: error.message });
  }
};

// تابع برای درخواست بازیابی رمز عبور
exports.forgotPassword = async (req, res) => {
  const { identifier } = req.body;

  if (!identifier) {
    return res.status(400).json({
      message: 'لطفاً ایمیل یا شماره تلفن ثبت‌نامی خود را وارد کنید.',
    });
  }

  const value = sanitizeString(identifier.trim());
  const isEmail = validator.isEmail(value);
  const isPhone = /^09\d{9}$/.test(value); // شماره موبایل ایران

  if (!isEmail && !isPhone) {
    return res
      .status(400)
      .json({ message: 'فرمت ایمیل یا شماره تلفن صحیح نیست.' });
  }

  try {
    let user;
    if (isEmail) {
      user = await User.findOne({ where: { email: value } });
    } else {
      user = await User.findOne({ where: { phone_number: value } });
    }

    if (!user) {
      logger.warn(`درخواست بازیابی رمز عبور برای کاربر ناموجود: ${value}`);
      return res.status(200).json({
        message:
          'اگر کاربری با این ایمیل یا شماره وجود داشته باشد، لینک یا کد بازیابی برای او ارسال خواهد شد.',
      });
    }

    // ارسال ایمیل
    if (isEmail && user.email) {
      // تولید توکن و ذخیره در دیتابیس
      const resetToken = crypto.randomBytes(20).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = moment().add(1, 'hour').toDate();
      await user.save();

      const resetUrl = `${process.env.FRONTEND_RESET_PASSWORD_URL}?token=${resetToken}`;
      const mailOptions = {
        to: user.email,
        from: process.env.EMAIL_USER,
        subject: 'درخواست بازنشانی رمز عبور حساب لامورا',
        html: `
          <p>درخواست بازنشانی رمز عبور برای حساب شما ثبت شده است.</p>
          <p>برای بازنشانی رمز عبور، روی لینک زیر کلیک کنید:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>این لینک تا ۱ ساعت معتبر است.</p>
          <p>اگر شما این درخواست را ثبت نکرده‌اید، این پیام را نادیده بگیرید.</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      logger.info(`ایمیل بازنشانی رمز عبور به ${user.email} ارسال شد`);
    }

    // ارسال پیامک
    else if (isPhone && user.phone_number) {
      // تولید توکن و ذخیره در دیتابیس
      const resetCode = Math.floor(100000 + Math.random() * 900000);
      user.resetPasswordToken = resetCode;
      user.resetPasswordExpires = moment().add(2, 'minutes').toDate();
      await user.save();

      const smsMessage = `${user.first_name} عزیز 
       کد بازیابی رمز عبور شما در لامورا : 
      ${resetCode}
      اعتبار این کد 2 دقیقه میباشد .`;

      await new Promise((resolve, reject) => {
        kavenegarAPI.Send(
          {
            message: smsMessage,
            sender: process.env.SMS_SENDER_NUMBER,
            receptor: user.phone_number,
          },
          function (response, status) {
            if (status === 200) {
              logger.info(
                `پیامک بازنشانی رمز عبور به ${user.phone_number} ارسال شد`,
              );
              resolve();
            } else {
              reject(new Error('ارسال پیامک ناموفق بود.'));
            }
          },
        );
      });
    }

    // پاسخ نهایی
    res.status(200).json({
      message:
        'اگر کاربری با این ایمیل یا شماره وجود داشته باشد، لینک یا کد بازیابی برای او ارسال خواهد شد.',
    });
  } catch (error) {
    logger.error('خطا در forgotPassword:', error);
    res.status(500).json({
      message: 'خطای سرور در فرآیند بازیابی رمز عبور',
      error: error.message,
    });
  }
};

// تابع برای تنظیم رمز عبور جدید
exports.resetPassword = async (req, res) => {
  const { token } = req.params; // توکن از پارامترهای URL
  const { newPassword } = req.body;

  try {
    // اعتبارسنجی پسورد جدید
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters long.' });
    }

    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Sequelize.Op.gt]: new Date() }, // توکن منقضی نشده باشد
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: 'Password reset token is invalid or has expired.' });
    }

    // هش کردن پسورد جدید
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null; // پاک کردن توکن
    user.resetPasswordExpires = null; // پاک کردن زمان انقضا
    await user.save();

    // ارسال ایمیل یا پیامک اطلاع‌رسانی تغییر پسورد به کاربر

    res.status(200).json({ message: 'Password has been successfully reset.' });
  } catch (error) {
    logger.error('Error resetting password:', error);
    res.status(500).json({
      message: 'Server error resetting password',
      error: error.message,
    });
  }
};

exports.getUserProfile = async (req, res) => {
  const userId = req.user.id; // ID کاربر از توکن احراز هویت شده

  try {
    const user = await User.findByPk(userId, {
      attributes: {
        exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'],
      }, // پسورد و توکن‌ها را برنمی‌گردانیم
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['name'],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    res
      .status(200)
      .json({ message: 'User profile retrieved successfully!', user: user });
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({
      message: 'Server error fetching user profile',
      error: error.message,
    });
  }
};

exports.getAddresses = async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const userIdFromToken = req.user.id;
  const userRole = await db.Role.findByPk(req.user.role_id);

  // فقط مالک آدرس یا ادمین می‌تواند آدرس‌ها را ببیند
  if (userId !== userIdFromToken && userRole.name !== 'admin') {
    return res
      .status(403)
      .json({
        message: 'Access Denied: You can only view your own addresses.',
      });
  }

  try {
    const addresses = await db.Address.findAll({ where: { user_id: userId } });
    res.status(200).json({ addresses: addresses });
  } catch (error) {
    logger.error(
      `Error fetching addresses for user ${userId}: ${error.message}`,
      { stack: error.stack },
    );
    res
      .status(500)
      .json({
        message: 'Server error fetching addresses',
        error: error.message,
      });
  }
};

// 👈 تابع برای به‌روزرسانی اطلاعات پروفایل کاربر لاگین شده
exports.updateUserProfile = async (req, res) => {
  const userId = req.user.id; // ID کاربر از توکن احراز هویت شده
  let { username, email, first_name, last_name, phone_number } = req.body; // از let استفاده کنید

  // 👈 اعمال پاکسازی به فیلدهای متنی
  if (username) username = sanitizeString(username);
  if (email) email = sanitizeString(email);
  if (first_name) first_name = sanitizeString(first_name);
  if (last_name) last_name = sanitizeString(last_name);
  if (phone_number) phone_number = sanitizeString(phone_number);

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // بررسی نام کاربری یا ایمیل تکراری (اگر تغییر کنند)
    if (
      (username && username !== user.username) ||
      (email && email !== user.email)
    ) {
      const existingUser = await User.findOne({
        where: {
          [Sequelize.Op.or]: [
            { username: username || user.username },
            { email: email || user.email },
          ],
          id: { [Sequelize.Op.ne]: userId }, // به جز خود کاربر
        },
      });
      if (existingUser) {
        return res.status(409).json({
          message: 'Username or email already exists for another user.',
        });
      }
    }

    // به‌روزرسانی فیلدها
    user.username = username || user.username;
    user.email = email || user.email;
    user.first_name = first_name || user.first_name;
    user.last_name = last_name || user.last_name;
    user.phone_number = phone_number || user.phone_number;

    await user.save(); // ذخیره تغییرات

    // پاسخ بدون اطلاعات حساس (مثل پسورد)
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      role_id: user.role_id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      message: 'User profile updated successfully!',
      user: userResponse,
    });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({
      message: 'Server error updating user profile',
      error: error.message,
    });
  }
};

// 👈 تابع برای درخواست ارسال کد OTP
exports.requestOtp = async (req, res) => {
  const { phone_number } = req.body;
  const sanitizedPhoneNumber = sanitizeString(phone_number);

  if (!sanitizedPhoneNumber) {
    return res
      .status(400)
      .json({ message: 'وارد کردن شماره تلفن ضروری است.\n' });
  }

  try {
    const user = await User.findOne({
      where: { phone_number: sanitizedPhoneNumber },
    });
    if (!user) {
      return res
        .status(404)
        .json({ message: 'ما همچین شماره‌ای نداریم، لطفاً بررسی کن.\n' });
    }

    // تولید OTP (مثلاً 6 رقم)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = moment()
      .add(process.env.OTP_EXPIRES_IN_MINUTES || 2, 'minutes')
      .toDate();

    user.otp_code = otpCode;
    user.otp_expires_at = otpExpiresAt;
    await user.save();

    //  **ارسال پیامک حاوی OTP**
    const smsMessage = `کد ورود شما به لامورا: ${otpCode}
این کد تا ${process.env.OTP_EXPIRES_IN_MINUTES || 2} دقیقه اعتبار دارد.
`;
    //  برای کاوه‌نگار:
    await kavenegarAPI.Send({
      message: smsMessage,
      sender: process.env.SMS_SENDER_NUMBER,
      receptor: user.phone_number,
    });
    logger.info(`OTP sent to ${user.phone_number}: ${otpCode}`);

    res.status(200).json({ message: 'کد ورود به شماره موبایلتون ارسال شد.\n' });
  } catch (error) {
    logger.error('Error requesting OTP:', error);
    res.status(500).json({
      message: 'یه مشکلی تو سرور پیش اومده، لطفاً بعداً دوباره امتحان کن.\n',
      error: error.message,
    });
  }
};

// 👈 تابع برای تأیید OTP و ورود کاربر
exports.verifyOtpAndLogin = async (req, res) => {
  const { phone_number, otp_code } = req.body;
  const sanitizedPhoneNumber = sanitizeString(phone_number);
  const sanitizedOtpCode = sanitizeString(otp_code);

  if (!sanitizedPhoneNumber || !sanitizedOtpCode) {
    return res
      .status(400)
      .json({ message: 'لطفاً هم شماره موبایل رو وارد کن، هم کد تأیید رو \n' });
  }

  try {
    const user = await User.findOne({
      where: {
        phone_number: sanitizedPhoneNumber,
        otp_code: sanitizedOtpCode,
        otp_expires_at: { [Sequelize.Op.gt]: new Date() }, // OTP منقضی نشده باشد
      },
    });

    if (!user) {
      return res.status(401).json({
        message: 'یا کدی که زدی اشتباهه یا تموم شده، یا همچین شماره‌ای نداریم ',
      });
    }

    // پاک کردن OTP پس از استفاده موفق
    user.otp_code = null;
    user.otp_expires_at = null;
    await user.save();

    // تولید JWT (Access Token) و Refresh Token
    const accessToken = jwt.sign(
      { id: user.id, role_id: user.role_id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN },
    );

    res.status(200).json({
      message: 'با موفقیت وارد شدید!\n',
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone_number: user.phone_number,
        role_id: user.role_id,
      },
    });
  } catch (error) {
    logger.error('Error verifying OTP or logging in:', error);
    res.status(500).json({
      message: 'یه مشکل فنی پیش اومد، لطفاً دوباره تلاش کن.\n',
      error: error.message,
    });
  }
};
