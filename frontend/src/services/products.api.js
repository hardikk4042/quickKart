// src/services/products.api.js
// Alias service wrapper re-exporting productAPI and categoryAPI
// Provides dual compatibility for imports from products.api or product.api

export * from './product.api';
export { productAPI as default } from './product.api';
