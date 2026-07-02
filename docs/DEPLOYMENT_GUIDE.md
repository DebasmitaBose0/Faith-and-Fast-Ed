# Production Deployment Guide

This document outlines the requirements and processes to successfully build and deploy the Faith & Fast project to a production hosting platform (e.g., Vercel, Render, Railway).

## 1. Code Standardization & Quality Checks
- Before deploying, run build checks and linting on both frontend and backend using `npm run check:all`.
- Ensure all environment variables are correctly populated in production dashboard platforms.

## 2. Platform Specific Deployment

### Frontend (Vercel)
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework Preset**: `Vite`
- **Routing**: Ensure a standard Vercel SPA rewrite rule configuration is placed inside `client/vercel.json` to handle client-side routing.

### Backend (Render / Railway / Vercel Serverless)
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `node index.js`
- **Environment Variables**:
  - `NODE_ENV=production`
  - `PORT=5000`
  - `MONGODB_URL` (Production Replica Set)
  - `JWT_SECRET` (A strong, generated secret)
  - `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  - `FRONTEND_URL` (Set to the final domain URL)
