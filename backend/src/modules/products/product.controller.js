'use strict';

/**
 * src/modules/products/product.controller.js
 *
 * HTTP layer for Product. Validates query params and delegates to service.
 */

const { productService } = require('./product.service');
const { sendSuccess, sendCreated } = require('../../utils/response');
const { listProductsQuerySchema, searchQuerySchema } = require('./product.validation');
const AppError = require('../../utils/errors');

const productController = {
  async getProducts(req, res, next) {
    try {
      // Validate + coerce query params
      const parseResult = listProductsQuerySchema.safeParse(req.query);
      if (!parseResult.success) {
        const details = parseResult.error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        }));
        return next(AppError.badRequest('Invalid query parameters', details));
      }

      const { products, pagination } = await productService.getProducts(parseResult.data, req.user);
      return sendSuccess(res, { products, pagination }, 'Products retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async getProductById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id, req.user);
      return sendSuccess(res, { product }, 'Product retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async getProductBySlug(req, res, next) {
    try {
      const product = await productService.getProductBySlug(req.params.slug, req.user);
      return sendSuccess(res, { product }, 'Product retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async searchProducts(req, res, next) {
    try {
      const parseResult = searchQuerySchema.safeParse(req.query);
      if (!parseResult.success) {
        const details = parseResult.error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        }));
        return next(AppError.badRequest('Invalid search parameters', details));
      }

      const result = await productService.searchProducts(parseResult.data, req.user);
      return sendSuccess(res, result, 'Search completed successfully');
    } catch (err) {
      next(err);
    }
  },

  async getSimilarProducts(req, res, next) {
    try {
      const products = await productService.getSimilarProducts(req.params.id, req.user);
      return sendSuccess(res, { products }, 'Similar products retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async createProduct(req, res, next) {
    try {
      const product = await productService.createProduct(req.body, req.user);
      return sendCreated(res, { product }, 'Product created successfully');
    } catch (err) {
      next(err);
    }
  },

  async updateProduct(req, res, next) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body, req.user);
      return sendSuccess(res, { product }, 'Product updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async setProductStatus(req, res, next) {
    try {
      const { isActive } = req.body;
      const product = await productService.setProductStatus(req.params.id, isActive, req.user);
      return sendSuccess(
        res,
        { product },
        `Product ${isActive ? 'activated' : 'deactivated'} successfully`,
      );
    } catch (err) {
      next(err);
    }
  },
};

module.exports = { productController };
