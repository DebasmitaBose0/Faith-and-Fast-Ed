import { object, string, array } from './schema.js';

export const registerSchema = object({
  name: string().required('Name is required').min(2, 'Name must be at least 2 characters long'),
  email: string().required('Email is required').email('Must be a valid email address'),
  password: string().required('Password is required').min(6, 'Password must be at least 6 characters long'),
});

export const loginSchema = object({
  email: string().required('Email is required').email('Must be a valid email address'),
  password: string().required('Password is required'),
});

export const verifyEmailOtpSchema = object({
  email: string().required('Email is required').email('Must be a valid email address'),
  otp: string().required('OTP code is required'),
});

export const resendOtpSchema = object({
  email: string().required('Email is required').email('Must be a valid email address'),
});

export const forgotPasswordSchema = object({
  email: string().required('Email is required').email('Must be a valid email address'),
});

export const resetPasswordSchema = object({
  email: string().required('Email is required').email('Must be a valid email address'),
  newPassword: string().required('New password is required').min(6, 'Password must be at least 6 characters long'),
  confirmPassword: string().required('Confirm password is required'),
});

export const updateUserRoleSchema = object({
  email: string().required('Email is required').email('Must be a valid email address'),
  role: string().required('Role is required').enum(['USER', 'ADMIN'], 'Role must be either USER or ADMIN'),
  permissions: array(),
});
