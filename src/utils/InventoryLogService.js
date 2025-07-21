//  src/utils/InventoryLogService.js

const db = require('../../models');

await db.InventoryLog.create({
    product_id: product.id,
    change_type: 'reserve',
    quantity_change: -item.quantity,
    old_stock_quantity: oldStock,
    new_stock_quantity: product.stock_quantity,
    changed_by_user_id: userId,
    description: `Order ${newOrder.id} - Reserved ${item.quantity} units of ${product.id} for unpaid order.`,
}, { transaction: t });