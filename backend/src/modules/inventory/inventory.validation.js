'use strict';

const { z } = require('zod');

// schema for pagination and search
const inventoryQuerySchema = z.object({
  page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
  limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 20)),
  storeId: z.string().cuid().optional(),
  productId: z.string().cuid().optional(),
  q: z.string().optional(),
});

// schema for adjusting stock
const adjustStockSchema = z.object({
  quantityDelta: z.number().int(),
  type: z.enum(['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT']),
  reason: z.string().optional(),
}).refine(data => {
  if (data.type === 'STOCK_IN' && data.quantityDelta <= 0) return false;
  if (data.type === 'STOCK_OUT' && data.quantityDelta <= 0) return false;
  return true;
}, {
  message: 'Quantity delta must be positive for STOCK_IN and STOCK_OUT. Use ADJUSTMENT for negative or positive values.',
  path: ['quantityDelta']
});

module.exports = {
  inventoryQuerySchema,
  adjustStockSchema
};
