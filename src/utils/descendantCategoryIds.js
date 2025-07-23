// src/utils/descendantCategoryIds.js

function getDescendantCategoryIds(categoryId, allCategories) {
    const result = [categoryId];
    const queue = [categoryId];

    while (queue.length > 0) {
        const current = queue.shift();
        const children = allCategories.filter(cat => cat.parent_id === current);
        for (const child of children) {
            result.push(child.id);
            queue.push(child.id);
        }
    }

    return result;
}

module.exports = {
    getDescendantCategoryIds,
};
