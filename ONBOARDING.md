# Faith & Fast — Developer Onboarding Guide

Welcome to **Faith & Fast**! This guide consolidates everything you need to go from zero to a running local development environment.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Architecture](#project-architecture)
3. [Local Development Setup](#local-development-setup)
4. [Environment Variables Explained](#environment-variables-explained)
5. [Admin Account Setup](#admin-account-setup)
6. [API Reference](#api-reference)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, make sure you have the following installed and set up:

| Requirement | Version            | Notes                            |
| ----------- | ------------------ | -------------------------------- |
| Node.js     | v18 or later       | [Download](https://nodejs.org/)  |
| npm         | v9 or later        | Comes with Node.js               |
| Git         | Any recent version | [Download](https://git-scm.com/) |

You will also need free accounts on these services:

- **MongoDB Atlas** — cloud database ([Sign up](https://www.mongodb.com/cloud/atlas))
- **Cloudinary** — image storage ([Sign up](https://cloudinary.com/))
- **Brevo** — email service for OTP ([Sign up](https://www.brevo.com/))

---

## Project Architecture

Faith & Fast is a **MERN stack** application split into two separate apps:

```text
Client (React) ──── Axios HTTP ────► Server (Express/Node)
│
├── MongoDB (data)
├── Cloudinary (images)
└── Brevo (emails/OTP)
```

- The **client** runs on `http://localhost:5173` (Vite dev server)
- The **server** runs on `http://localhost:5000` (Express API)
- The client talks to the server via Axios — configured in `client/src/api/`
- The server handles auth, products, orders, and user management
- JWT tokens are stored in cookies for authentication

### Folder Structure

```text
.
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── api/            # Axios instance and interceptors
│       ├── assets/         # Styles and images
│       ├── pages/          # Page components
│       ├── store/          # Redux Toolkit slices (global state)
│       └── App.jsx         # Main routing
└── server/                 # Node.js + Express backend
    ├── config/             # DB and service configurations
    ├── controllers/        # Request handlers (business logic)
    ├── middleware/         # Auth, error handling middlewares
    ├── models/             # Mongoose schemas (data models)
    ├── route/              # API route definitions
    └── utils/              # Helper functions and email templates
```

---

## Local Development Setup

### Step 1 — Clone the Repository

```bash
git clone https://github.com/SRV30/Faith-and-Fast.git
cd Faith-and-Fast
```

### Step 2 — Install Dependencies

Install dependencies for both client and server separately:

```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

### Step 3 — Configure Environment Variables

Create a `.env` file inside the `server/` directory:

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
ENCRYPTION_KEY=your_generated_encryption_key
```

> **`ENCRYPTION_KEY` is required — the server exits on startup without it.** Generate one with:
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

Create a `.env` file inside the `client/` directory:

```env
VITE_BACKEND_URL=http://localhost:5000
```

> See [Environment Variables Explained](#environment-variables-explained) for details on each variable.

### Step 4 — Run the Project

Open **two separate terminals**:

```bash
# Terminal 1 — Start the backend
cd server
npm run dev

# Terminal 2 — Start the frontend
cd client
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## Environment Variables Explained

### Server `.env`

| Variable                | Description                                                                     | Where to get it                                                                      |
| ----------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `PORT`                  | Port the Express server runs on                                                 | Keep as `5000`                                                                       |
| `MONGODB_URL`           | MongoDB Atlas connection string                                                 | Atlas dashboard → Connect → Drivers                                                  |
| `JWT_SECRET`            | Secret key for signing JWT tokens                                               | Any random string (min 32 chars)                                                     |
| `JWT_EXPIRE`            | How long JWT tokens stay valid                                                  | e.g. `3d` = 3 days, `7d` = 7 days                                                    |
| `COOKIE_EXPIRE`         | Cookie expiry in days                                                           | e.g. `5` = 5 days                                                                    |
| `CLOUDINARY_NAME`       | Your Cloudinary cloud name                                                      | Cloudinary dashboard → Settings                                                      |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                                                              | Cloudinary dashboard → Settings                                                      |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                                                           | Cloudinary dashboard → Settings                                                      |
| `BREVO_API_KEY`         | Brevo API key for sending emails                                                | Brevo dashboard → SMTP & API                                                         |
| `FRONTEND_URL`          | URL of the running frontend                                                     | `http://localhost:5173` for local dev                                                |
| `ENCRYPTION_KEY`        | Encrypts stored payment credentials. **Required** — the server exits without it | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

### Client `.env`

| Variable           | Description                   | Value                                 |
| ------------------ | ----------------------------- | ------------------------------------- |
| `VITE_BACKEND_URL` | URL of the Express API server | `http://localhost:5000` for local dev |

---

## Admin Account Setup

Admin access is required to test product management, order management, and the dashboard.

### Method 1 — Seed Script (Recommended)

```bash
cd server
npm run seed-admin
```

**Default credentials:**

- Email: `admin@faithandfast.com`
- Password: `Admin@123`

### Method 2 — Manual Promotion

1. Register a normal user through the app UI.
2. Open MongoDB Compass or Atlas UI.
3. Find your user in the `users` collection.
4. Change the `role` field from `"USER"` to `"ADMIN"`.
5. Log out and log back in.

---

## API Reference

All API endpoints are prefixed with `/api`. The server runs on `http://localhost:5000`.

### Auth

| Method | Endpoint               | Description                  |
| ------ | ---------------------- | ---------------------------- |
| POST   | `/api/auth/register`   | Register a new user          |
| POST   | `/api/auth/login`      | Login and receive JWT cookie |
| POST   | `/api/auth/logout`     | Clear auth cookie            |
| POST   | `/api/auth/verify-otp` | Verify email OTP             |

### Products

| Method | Endpoint           | Description            |
| ------ | ------------------ | ---------------------- |
| GET    | `/api/product/all` | Get all products       |
| GET    | `/api/product/:id` | Get single product     |
| POST   | `/api/product/new` | Create product (Admin) |
| PUT    | `/api/product/:id` | Update product (Admin) |
| DELETE | `/api/product/:id` | Delete product (Admin) |

### Orders

| Method | Endpoint         | Description                 |
| ------ | ---------------- | --------------------------- |
| POST   | `/api/order/new` | Place a new order           |
| GET    | `/api/order/my`  | Get current user's orders   |
| GET    | `/api/order/all` | Get all orders (Admin)      |
| PUT    | `/api/order/:id` | Update order status (Admin) |

### Cart & Wishlist

| Method | Endpoint               | Description           |
| ------ | ---------------------- | --------------------- |
| GET    | `/api/cart`            | Get user's cart       |
| POST   | `/api/cart/add`        | Add item to cart      |
| DELETE | `/api/cart/remove/:id` | Remove item from cart |
| GET    | `/api/wishlist`        | Get user's wishlist   |
| POST   | `/api/wishlist/add`    | Add item to wishlist  |

---

## Troubleshooting

### MongoDB connection fails

- Check your `MONGODB_URL` is correctly copied from Atlas
- Go to Atlas → Network Access → Add your current IP address
- Make sure your database user has read/write permissions

### Port already in use

```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Frontend can't reach backend

- Confirm backend is running on port 5000
- Check `VITE_BACKEND_URL=http://localhost:5000` in `client/.env`
- Check browser console for CORS errors

### OTP emails not sending

- Verify `BREVO_API_KEY` is correct
- Check Brevo dashboard for sending limits
- Make sure `FRONTEND_URL` matches your actual frontend URL

### Cloudinary image upload fails

- Double-check `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Ensure your Cloudinary account has upload permissions enabled

---

_For contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md)._
_For available issues, see [FAITH_FAST_ISSUES.md](FAITH_FAST_ISSUES.md)._
