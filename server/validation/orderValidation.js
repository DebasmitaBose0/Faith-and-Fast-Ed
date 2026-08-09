import { object, string, number, array } from './schema.js';

export const createOrderSchema = object({
  list_items: array().required('Order must contain at least one item').min(1, 'Order must contain at least one item'),
  addressId: string().required('Delivery address ID is required'),
  totalAmt: number().required('Total amount is required').min(0, 'Total amount must be greater than or equal to 0'),
  payment_status: string().required('Payment status is required'),
});
