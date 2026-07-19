# Faith & Fast E-commerce

![Logo](client/src/assets/logo-light.png)

A comprehensive, high-performance E-commerce platform built for speed, security, and seamless user experience.

## Overview
Faith & Fast is a modern e-commerce solution designed to provide users with a smooth shopping journey and administrators with powerful management tools. From product discovery to secure checkout, every step is optimized for performance and reliability.

## Features

### User Features
- **Secure Authentication**: JWT-based login/signup with email verification (OTP).
- **Product Discovery**: Advanced search and filtering (category, color, size, price).
- **Shopping Experience**: Dynamic cart, wishlist, and real-time product reviews.
- **Order Management**: Comprehensive checkout flow (Cash on Delivery), order tracking, and history.
- **Profile Management**: Address book, profile updates, and password security.

### Admin Features
- **Dashboard**: Real-time analytics and overview.
- **Product Management**: Full CRUD operations with multi-image upload.
- **User Management**: Role assignments and account status control.
- **Order Management**: Update order statuses, tracking info, and history.
- **Discounts/Coupons**: Create and manage promotional codes.

## Tech Stack
- **Frontend**: React 18, Vite, Redux Toolkit, Tailwind CSS, Framer Motion, Material UI.
- **Backend**: Node.js, Express, MongoDB, Mongoose.
- **Services**: Cloudinary (Media), Brevo (Email), Vercel (Deployment).

## Folder Structure
```
.
├── client/                 # Frontend React Application (Vite)
│   ├── public/             # Static assets
│   └── src/
│       ├── api/            # Axios instance and interceptors
│       ├── assets/         # Styles and local images
│       ├── pages/          # Page components
│       ├── store/          # Redux Toolkit slices
│       └── App.jsx         # Main routing
└── server/                 # Backend Node.js API
    ├── config/             # DB and Service configurations
    ├── controllers/        # Request logic
    ├── middleware/         # Security and Auth middlewares
    ├── models/             # Mongoose schemas
    ├── route/              # API routes
    └── utils/              # Helpers and templates
```

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd project-folder
```

### 2. Install Dependencies
```bash
# Frontend
cd client && npm install

# Backend
cd ../server && npm install
```

### 3. Environment Setup

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/faith-fast
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=3d
COOKIE_EXPIRE=5
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
BREVO_API_KEY=your_brevo_key
FRONTEND_URL=http://localhost:5173
```

#### MongoDB Atlas Setup
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user with read/write permissions.
3. In "Network Access", allow access from your IP address.
4. Go to "Clusters" -> "Connect" -> "Connect your application".
5. Copy the connection string and replace `<username>`, `<password>`, and `cluster.mongodb.net` in your `MONGODB_URL`.

Create a `.env` file in the `client` directory:
```env
VITE_BACKEND_URL=http://localhost:5000
```

### Prerequisite Software
Ensure you have the following installed on your machine:
- **Node.js**: v18.x or v20.x (Recommended)
- **npm**: v9.x or higher
- **MongoDB**: Local community server or Atlas Account

### 4. Run the Project
Open two separate terminal windows or run in background:

**Window 1: Start Backend (server/)**
```bash
cd server
npm install
npm run dev
```
By default, the server will start listening at `http://localhost:5000`.

**Window 2: Start Frontend (client/)**
```bash
cd client
npm install
npm run dev
```
By default, the client Vite application will run at `http://localhost:5173`. Make sure the frontend `VITE_BACKEND_URL` points exactly to the port used by the server backend.

## Cash on Delivery (COD) Payment Flow

Current Payment Method:
**Cash on Delivery (COD)**

- Users can place orders without an upfront online payment.
- Orders are initially marked as `PENDING`.
- Admins can update the payment status to `COMPLETED` upon physical collection of funds.

### Future Payment Gateway Integration
Future payment gateway integration is planned.

Contributors are encouraged to research and suggest payment providers that:

- Support Indian businesses
- Provide a test/sandbox mode
- Require minimal setup during development
- Preferably do not require mandatory KYC for local testing and development

The payment architecture should remain modular so that future gateways can be integrated easily.

## Local Admin Access
To test admin features locally, you need an account with the `ADMIN` role.

### Method 1: Seeding (Recommended)
We provide a script to create a default admin account in your local database.
```bash
cd server
npm run seed-admin
```
**Credentials:**
- **Email**: `admin@faithandfast.com`
- **Password**: `Admin@123`

### Method 2: Manual Promotion
1. Register a normal user through the application UI.
2. Open your MongoDB management tool (e.g., MongoDB Compass or Atlas UI).
3. Find your user document in the `users` collection.
4. Change the `role` field from `"USER"` to `"ADMIN"`.
5. Log out and log back in on the frontend.

## Deployment Guide

### Vercel (Frontend)
1. Import the repository to Vercel.
2. Set **Root Directory** to `client`.
3. Configure **Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add all required `VITE_` environment variables.

### Backend
1. Deploy to Vercel.
2. Set the start command to `node index.js`.
3. Add all required backend environment variables.

## ELUSOC 2026 Contribution Guide

#### Target Branch
All ELUSOC contributions must target the `elusoc` branch.

#### Contribution Workflow
Issue → Assignment → Development → PR to `elusoc` → Review → Merge

#### Labels
- `newbie`
- `adventurer`
- `veteran`
- `elusoc`

#### Important Rules
- Check existing issues before creating new ones.
- Do not create duplicate issues.
- Do not submit pull requests without issue assignment.
- Resolve merge conflicts before submitting PRs.
- Follow project coding standards and contribution guidelines.

## Contributing
We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) and [FAITH_FAST_ISSUES.md](FAITH_FAST_ISSUES.md) for more details.

## Security
For security issues or vulnerability reporting, please review our [Security Policy](SECURITY.md).

## License
This project is licensed under the ISC License.

## Author Information
**Project Admin**: Faith & Fast Team
**Developer**: Jules (Senior Staff Software Engineer)
