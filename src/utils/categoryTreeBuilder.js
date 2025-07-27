class CategoryTreeBuilder {
    constructor(products) {
        this.products = products;
        this.categoriesMap = {};
        this.categoryById = {};
    }

    groupProductsByCategory() {
        this.products.forEach(product => {
            const cat = product.category;
            if (!cat) return;

            if (!this.categoriesMap[cat.id]) {
                this.categoriesMap[cat.id] = {
                    id: cat.id,
                    name: cat.name,
                    parent_id: cat.parent_id,
                    products: []
                };
            }

            this.categoriesMap[cat.id].products.push({
                id: product.id,
                name: product.name,
                price: product.price
            });
        });
    }

    buildTree() {
        const tree = [];
        const categories = Object.values(this.categoriesMap);

        categories.forEach(cat => {
            cat.children = [];
            this.categoryById[cat.id] = cat;
        });

        categories.forEach(cat => {
            if (cat.parent_id && this.categoryById[cat.parent_id]) {
                this.categoryById[cat.parent_id].children.push(cat);
            } else {
                tree.push(cat);
            }
        });

        return tree;
    }

    generate() {
        this.groupProductsByCategory();
        return this.buildTree();
    }
}

module.exports = CategoryTreeBuilder;
