import { z } from 'zod';

export const guestCheckoutSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().min(1, 'Email address is required').email('Invalid email address'),
  mobile: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .regex(/^[0-9+\s-]+$/, 'Invalid mobile number format'),
  address_line: z.string().min(1, 'Address line is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z
    .string()
    .min(5, 'Pincode must be at least 5 digits')
    .max(10, 'Invalid pincode'),
});

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(2000, 'Message cannot exceed 2000 characters'),
});
