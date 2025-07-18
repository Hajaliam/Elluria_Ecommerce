'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. اضافه کردن ستون is_exclusive به جدول Coupons
    await queryInterface.addColumn('Coupons', 'is_exclusive', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false // پیش‌فرض: قابل ترکیب با کوپن‌های دیگر
    });

    // 2. اضافه کردن ستون max_usage_per_user به جدول Coupons
    await queryInterface.addColumn('Coupons', 'max_usage_per_user', {
      type: Sequelize.INTEGER,
      allowNull: true // اگر محدودیت استفاده به ازای هر کاربر ندارد
    });

    // 3. ایجاد جدول CouponGroups برای دسته‌بندی کوپن‌ها
    await queryInterface.createTable('CouponGroups', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 4. اضافه کردن coupon_group_id به جدول Coupons
    await queryInterface.addColumn('Coupons', 'coupon_group_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // می‌تواند null باشد اگر کوپن به گروهی تعلق ندارد
      references: {
        model: 'CouponGroups',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL' // اگر گروه کوپن حذف شد، کوپن‌ها بدون گروه باقی بمانند
    });

    // 5. ایجاد جدول CouponProducts برای کوپن‌های محصول خاص (Many-to-Many)
    await queryInterface.createTable('CouponProducts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      coupon_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Coupons',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // اگر کوپن حذف شد، ارتباط آن با محصول حذف شود
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // اگر محصول حذف شد، ارتباط آن با کوپن حذف شود
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    // اضافه کردن Unique Constraint برای اطمینان از عدم تکرار (coupon_id, product_id)
    await queryInterface.addConstraint('CouponProducts', {
      fields: ['coupon_id', 'product_id'],
      type: 'unique',
      name: 'unique_coupon_product_constraint'
    });

    // 6. ایجاد جدول UserCoupons برای کوپن‌های خصوصی (Many-to-Many: User to Coupon)
    await queryInterface.createTable('UserCoupons', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // اگر کاربر حذف شد، کوپن خصوصی او هم حذف شود
      },
      coupon_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Coupons',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // اگر کوپن حذف شد، ارتباط آن با کاربر حذف شود
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    // اضافه کردن Unique Constraint برای اطمینان از عدم تکرار (user_id, coupon_id)
    await queryInterface.addConstraint('UserCoupons', {
      fields: ['user_id', 'coupon_id'],
      type: 'unique',
      name: 'unique_user_coupon_constraint'
    });

    // 7. ایجاد جدول UserCouponUsages برای ردیابی استفاده به ازای کاربر
    await queryInterface.createTable('UserCouponUsages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // اگر کاربر حذف شد، لاگ استفاده او هم حذف شود
      },
      coupon_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Coupons',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // اگر کوپن حذف شد، لاگ استفاده آن هم حذف شود
      },
      usage_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0 // شروع از 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    // اضافه کردن Unique Constraint برای اطمینان از عدم تکرار (user_id, coupon_id)
    await queryInterface.addConstraint('UserCouponUsages', {
      fields: ['user_id', 'coupon_id'],
      type: 'unique',
      name: 'unique_user_coupon_usage_constraint'
    });

  },

  async down (queryInterface, Sequelize) {
    // حذف به ترتیب معکوس ایجاد
    await queryInterface.removeConstraint('UserCouponUsages', 'unique_user_coupon_usage_constraint');
    await queryInterface.dropTable('UserCouponUsages');

    await queryInterface.removeConstraint('UserCoupons', 'unique_user_coupon_constraint');
    await queryInterface.dropTable('UserCoupons');

    await queryInterface.removeConstraint('CouponProducts', 'unique_coupon_product_constraint');
    await queryInterface.dropTable('CouponProducts');

    await queryInterface.removeColumn('Coupons', 'coupon_group_id');
    await queryInterface.dropTable('CouponGroups');

    await queryInterface.removeColumn('Coupons', 'max_usage_per_user');
    await queryInterface.removeColumn('Coupons', 'is_exclusive');
  }
};