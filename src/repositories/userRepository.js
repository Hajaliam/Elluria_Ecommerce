// src/repositories/userRepository.js
const { User, Role, Sequelize } = require('../../models');
const { Op } = Sequelize;

class UserRepository {
    async create(data, options = {}) {
        return await User.create(data, options);
    }

    async findById(id, options = {}) {
        return await User.findByPk(id, options);
    }

    async findByUsername(username, options = {}) {
        return await User.findOne({ where: { username }, ...options });
    }

    async findByEmail(email, options = {}) {
        return await User.findOne({ where: { email }, ...options });
    }

    async findByPhoneNumber(phone_number, options = {}) {
        return await User.findOne({ where: { phone_number }, ...options });
    }

    async findByUsernameOrEmail(username, email, options = {}) {
        return await User.findOne({
            where: {
                [Op.or]: [{ username }, { email }]
            },
            ...options
        });
    }

    async findByResetToken(token, options = {}) {
        return await User.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { [Op.gt]: new Date() }
            },
            ...options
        });
    }

    async findByOtp(phone_number, otp_code, options = {}) {
        return await User.findOne({
            where: {
                phone_number,
                otp_code,
                otp_expires_at: { [Op.gt]: new Date() }
            },
            ...options
        });
    }

    async findAllWithRoles(options = {}) {
        return await User.findAll({
            ...options,
            attributes: { exclude: ['password'] },
            include: [{ model: Role, as: 'role', attributes: ['name'] }]
        });
    }

    async findByIdWithRole(id, options = {}) {
        return await User.findByPk(id, {
            ...options,
            attributes: { exclude: ['password'] },
            include: [{ model: Role, as: 'role', attributes: ['name'] }]
        });
    }

    async save(instance, options = {}) {
        return await instance.save(options);
    }

    async delete(instance, options = {}) {
        return await instance.destroy(options);
    }
}

module.exports = new UserRepository();