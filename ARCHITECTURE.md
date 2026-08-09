# Architecture

## Overview

Faith & Fast follows a modern client-server architecture, separating the frontend application from the backend API. This separation enables independent development, deployment, and scaling of each component.

```
                   +----------------------+
                   |      Web Browser     |
                   +----------+-----------+
                              |
                              | HTTP / HTTPS
                              |
                   +----------v-----------+
                   | React + Vite Client  |
                   | Redux Toolkit        |
                   | Axios API Layer      |
                   +----------+-----------+
                              |
                              | REST API
                              |
                   +----------v-----------+
                   | Express.js Backend   |
                   | Authentication       |
                   | Business Logic       |
                   +----------+-----------+
                     |        |         |
                     |        |         |
          +----------v-+   +--v-----+   +---------------+
          | MongoDB    |   |Cloudinary| | Brevo Email   |
          | Database   |   | Storage  | | OTP Service   |
          +------------+   +----------+ +---------------+
```

---

# System Components

## Frontend

The frontend is a Single Page Application (SPA) built with React and Vite.

### Responsibilities

- User interface rendering
- Client-side routing
- State management using Redux Toolkit
- Form validation
- API communication
- Authentication persistence
- Shopping cart and wishlist management

### Main Modules

```
client/src
├── api
├── assets
├── components
├── pages
├── store
├── hooks
├── utils
└── App.jsx
```

---

## Backend

The backend exposes RESTful APIs responsible for business logic and data management.

### Responsibilities

- User authentication
- OTP verification
- Product management
- Order processing
- Image upload
- Email notifications
- Admin operations

### Main Modules

```
server
├── config
├── controllers
├── middleware
├── models
├── route
├── utils
└── index.js
```

---

# Request Lifecycle

A typical request follows this pipeline:

```
Browser
   │
   ▼
React Component
   │
   ▼
Axios Instance
   │
   ▼
Express Route
   │
   ▼
Authentication Middleware
   │
   ▼
Controller
   │
   ▼
Database / External Service
   │
   ▼
JSON Response
   │
   ▼
Redux Store Update
   │
   ▼
UI Re-render
```

---

# Authentication Flow

Authentication is based on JWT.

```
User Registration
        │
        ▼
Create User
        │
        ▼
Generate OTP
        │
        ▼
Send Email (Brevo)
        │
        ▼
User Verifies OTP
        │
        ▼
Generate JWT
        │
        ▼
Store Token (Client)
        │
        ▼
Authenticated Requests
```

Protected API routes verify the JWT before executing business logic.

---

# Product Flow

```
Admin Creates Product
        │
        ▼
Upload Images
        │
        ▼
Cloudinary
        │
        ▼
Image URLs Stored
        │
        ▼
MongoDB Product Collection
        │
        ▼
Available to Customers
```

---

# Shopping Flow

```
Browse Products
        │
        ▼
Search / Filter
        │
        ▼
View Product
        │
        ▼
Add to Cart
        │
        ▼
Checkout
        │
        ▼
Create Order
        │
        ▼
Order Status: PENDING
        │
        ▼
Admin Updates Status
```

---

# Admin Architecture

Admin users access protected endpoints through role-based authorisation.

```
Admin Login
      │
      ▼
JWT Authentication
      │
      ▼
Role Verification
      │
      ▼
Admin Dashboard
      │
      ├──────────► Products
      ├──────────► Orders
      ├──────────► Users
      └──────────► Coupons
```

---

# Database Design

The application is centred around several core entities.

```
User
 │
 ├────────── Orders
 │
 ├────────── Wishlist
 │
 └────────── Addresses

Product
 │
 ├────────── Reviews
 │
 ├────────── Images
 │
 └────────── Categories

Order
 │
 ├────────── User
 ├────────── Products
 ├────────── Payment Status
 └────────── Shipping Address
```

---

# External Services

## MongoDB

Stores:

- Users
- Products
- Orders
- Reviews
- Coupons

---

## Cloudinary

Responsible for:

- Product images
- Image optimisation
- CDN delivery

---

## Brevo

Responsible for:

- OTP verification emails
- Future transactional emails

---

# Security Architecture

Current security features include:

- JWT Authentication
- Password hashing
- Protected API routes
- Role-based authorisation
- Environment variable configuration
- Input validation
- HTTP-only server-side validation
- Cloud-hosted media assets

---

# Folder Responsibilities

| Folder | Responsibility |
|----------|----------------|
| client/api | API configuration and Axios instance |
| client/pages | Application pages |
| client/store | Redux global state |
| server/controllers | Business logic |
| server/models | Database schemas |
| server/route | REST API endpoints |
| server/middleware | Authentication and request processing |
| server/utils | Helper utilities and templates |

---

# Deployment Architecture

```
                 Internet
                     │
      ┌──────────────┴──────────────┐
      │                             │
      ▼                             ▼
Frontend (Vercel)          Backend (Node.js)
      │                             │
      └──────────────┬──────────────┘
                     │
                 MongoDB Atlas
                     │
          Cloudinary & Brevo APIs
```

---

# Scalability Considerations

The architecture is designed to support future enhancements, including:

- Online payment gateway integration
- Redis caching
- CDN optimisation
- Docker containerisation
- CI/CD pipelines
- Microservice migration
- WebSocket-based notifications
- Inventory management
- Recommendation engine
- Elasticsearch-powered product search

---

# Design Principles

The project follows several architectural principles:

- Separation of Concerns
- Modular folder structure
- RESTful API design
- Component-based frontend architecture
- Stateless backend services
- Environment-driven configuration
- Extensible service integrations
- Maintainable and scalable codebase
