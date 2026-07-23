# Contributor Onboarding Guide

Welcome to the **Faith & Fast E-commerce** project! This guide will help you get started with the project and understand our development workflow.

## Project Introduction

Faith & Fast is a full-stack e-commerce application built with the MERN stack (MongoDB, Express, React, Node.js). It offers a seamless shopping experience for users and a robust management system for admins.

## Architecture Overview

- **Frontend**: React.js with Vite, Redux Toolkit for state management, Tailwind CSS for styling, and Framer Motion for animations.
- **Backend**: Node.js with Express, MongoDB with Mongoose for data modeling.
- **Authentication**: JWT-based authentication with secure cookie and header handling.
- **Payments**: Cash on Delivery (COD) order flow.
- **File Storage**: Cloudinary for product and user avatar images.

## Development Workflow

### 1. Prerequisites

- Node.js (v18 or later)
- MongoDB account (or local installation)
- Cloudinary account
- Brevo account (for emails)

### 2. Setup

1. Clone the repository.
2. Install dependencies for both client and server:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```
3. Set up environment variables (see `.env.example` in each directory).
4. Run the development servers:
   ```bash
   # In server/
   npm run dev

   # In client/
   npm run dev
   ```

## Coding Standards

- Use ES6+ syntax.
- Follow functional component patterns in React.
- Use Redux slices for global state management.
- Ensure all API calls are handled via `axiosInstance`.
- Maintain consistent indentation (2 spaces).

## Branching Strategy

We follow a structured branching model:

- `main`: Production-ready code.
- `elusoc`: Target branch for ELUSOC 2026 contributions.
- `dev`: Integration branch for other features.
- `feature/*`: New feature development.
- `bugfix/*`: Bug fixes.
- `hotfix/*`: Urgent production fixes.

## Pull Request Process

1. Create a new branch from `elusoc` (for ELUSOC contributions) or `dev`.
2. Commit your changes with descriptive messages.
3. Push to your branch and open a PR against the appropriate target branch.
4. Ensure all tests pass and obtain at least one peer review.

## Commit Message Convention

We use conventional commits:

- `feat:` for new features.
- `fix:` for bug fixes.
- `docs:` for documentation changes.
- `style:` for formatting, missing semi-colons, etc.
- `refactor:` for code changes that neither fix a bug nor add a feature.
- `test:` for adding missing tests.
- `chore:` for updating build tasks, package manager configs, etc.

---

Thank you for contributing to Faith & Fast!
