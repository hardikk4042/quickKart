'use strict';

/**
 * src/modules/categories/category.controller.js
 *
 * HTTP layer for Category. Calls service, returns standard API response.
 */

const { categoryService } = require('./category.service');
const { sendSuccess, sendCreated } = require('../../utils/response');

const categoryController = {
  async getCategories(req, res, next) {
    try {
      // req.user may be undefined (public route with optional auth)
      const categories = await categoryService.getCategories(req.user);
      return sendSuccess(res, { categories }, 'Categories retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async getCategoryById(req, res, next) {
    try {
      const category = await categoryService.getCategoryById(req.params.id, req.user);
      return sendSuccess(res, { category }, 'Category retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async getCategoryBySlug(req, res, next) {
    try {
      const category = await categoryService.getCategoryBySlug(req.params.slug, req.user);
      return sendSuccess(res, { category }, 'Category retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async createCategory(req, res, next) {
    try {
      const category = await categoryService.createCategory(req.body);
      return sendCreated(res, { category }, 'Category created successfully');
    } catch (err) {
      next(err);
    }
  },

  async updateCategory(req, res, next) {
    try {
      const category = await categoryService.updateCategory(req.params.id, req.body);
      return sendSuccess(res, { category }, 'Category updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async setCategoryStatus(req, res, next) {
    try {
      const { isActive } = req.body;
      const category = await categoryService.setCategoryStatus(req.params.id, isActive);
      return sendSuccess(
        res,
        { category },
        `Category ${isActive ? 'activated' : 'deactivated'} successfully`,
      );
    } catch (err) {
      next(err);
    }
  },
};

module.exports = { categoryController };
