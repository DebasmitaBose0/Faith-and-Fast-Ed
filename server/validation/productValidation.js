import { object, string, number } from './schema.js';

export const createProductSchema = object({
  name: string().required('Product name is required'),
  price: number().required('Price is required').min(0, 'Price must be non-negative'),
  category: string().required('Category ID is required'),
  description: string().required('Description is required'),
});

export const updateProductSchema = object({
  _id: string().required('Product ID is required'),
  name: string(),
  price: number().min(0, 'Price must be non-negative'),
});

export const addReviewSchema = object({
  productId: string().required('Product ID is required'),
  rating: number().required('Rating is required').min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  comment: string().required('Review comment is required'),
});
