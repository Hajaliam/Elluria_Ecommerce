// src/controllers/categoryController.js

const categoryService = require('../services/categoryService');
const {logger} = require('../config/logger');

exports.createCategory = async (req, res) => {
  try {
    const newCategory = await categoryService.createCategory(req.body);
    res.status(201).json({ message: 'Category created successfully!', category: newCategory });
  } catch (error) {
    logger.error(`Error in CategoryController createCategory: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categoryTree = await categoryService.getAllCategories();
    res.status(200).json({ categories: categoryTree });
  } catch (error) {
    logger.error(`Error in CategoryController getAllCategories: ${error.message}`);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.status(200).json({ category: category });
  } catch (error) {
    logger.error(`Error in CategoryController getCategoryById: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.getChildrenById = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const children = await categoryService.getChildrensById(categoryId);
    res.status(200).json({ children });
  } catch (error) {
    logger.error(`Error in CategoryController getChildrenById: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const updatedCategory = await categoryService.updateCategory(req.params.id, req.body);
    res.status(200).json({ message: 'Category updated successfully!', category: updatedCategory });
  } catch (error) {
    logger.error(`Error in CategoryController updateCategory: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.status(200).json({ message: 'Category deleted successfully!' });
  } catch (error) {
    logger.error(`Error in CategoryController deleteCategory: ${error.message}`);
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ message: 'Cannot delete category: Products are associated with it.' });
    }
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};