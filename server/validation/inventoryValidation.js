import { object, array } from './schema.js';

export const bulkUpdateStockSchema = object({
  updates: array().required('Updates array is required').min(1, 'Updates array must contain at least one update'),
});
