// src/repositories/roleRepository.js

const { Role } = require('../../models');

class RoleRepository {
    async findByName(name, options = {}) {
        return await Role.findOne({ where: { name }, ...options });
    }
}

module.exports = new RoleRepository();