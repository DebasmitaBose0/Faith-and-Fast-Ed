import { object, string, number } from './schema.js';

export const createDiscountSchema = object({
  discountCode: string().required('Discount code is required'),
  discountType: string().required('Discount type is required').enum(['PERCENTAGE', 'FIXED'], 'Discount type must be PERCENTAGE or FIXED'),
  discountValue: number().required('Discount value is required').min(0, 'Discount value must be non-negative'),
});

export const applyDiscountSchema = object({
  discountCode: string().required('Discount code is required'),
  orderAmount: number().required('Order amount is required').min(0, 'Order amount must be non-negative'),
});
