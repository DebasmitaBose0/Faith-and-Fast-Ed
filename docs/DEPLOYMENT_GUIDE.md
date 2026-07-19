# Deployment Guide — Faith & Fast

## Table of Contents

1. [Pre-deployment Code Quality Checks](#1-pre-deployment-code-quality-checks)
2. [Frontend Deployment (Vercel)](#2-frontend-deployment-vercel)
3. [Backend Deployment (Render / Railway)](#3-backend-deployment-render--railway)
4. [Environment Variable Reference](#4-environment-variable-reference)
5. [Pre-deployment Checklist](#5-pre-deployment-checklist)
6. [Post-deployment Verification](#6-post-deployment-verification)

---

## 1. Pre-deployment Code Quality Checks

Run these commands and confirm zero errors before deploying.

```bash
# Client
cd client
npm run lint          # ESLint — fix warnings
npm run build         # Vite production build

# Server
cd server
npm ls                # Verify no missing dependencies
```

- Remove all `console.log` statements that contain sensitive data.
- Confirm the project compiles without build errors.
- Check that `NODE_ENV` is not hard-coded to `development` anywhere in production branches.

---

## 2. Frontend Deployment (Vercel)

| Setting              | Value                      |
|----------------------|----------------------------|
| Root Directory       | `client`                   |
| Build Command        | `npm run build`            |
| Output Directory     | `dist`                     |
| Node.js Version      | 20.x (or project default)  |
| Environment Variables| See §4 below               |

**SPA Routing** — a `client/vercel.json` rewrites all paths to `/`:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
```

**Steps:**

1. Push the repo and import it into Vercel.
2. Set **Root Directory** to `client`.
3. Add the environment variables listed in §4.
4. Deploy. Vercel detects the `vercel.json` and applies SPA rewrites automatically.

---

## 3. Backend Deployment (Render / Railway)

| Setting              | Value                            |
|----------------------|----------------------------------|
| Root Directory       | `server`                         |
| Start Command        | `node index.js`                  |
| Build Command        | _(none — leave empty)_           |
| Node.js Version      | 20.x                             |
| Environment Variables| See §4 below                     |

**Steps (Render):**

1. Create a new **Web Service** and connect your repository.
2. Set **Root Directory** to `server`.
3. Set **Start Command** to `node index.js`.
4. Add all environment variables from §4.
5. Deploy and note the public URL (e.g. `https://faith-fast-api.onrender.com`).

**Steps (Railway):**

1. Create a new project and connect your repository.
2. Set **Root Directory** to `server`.
3. The **Start Command** defaults to `node index.js` (no change needed).
4. Add environment variables from §4.
5. Deploy and obtain the public URL.

---

## 4. Environment Variable Reference

### Frontend (`client`)

| Variable                     | Description                                |
|------------------------------|--------------------------------------------|
| `VITE_BACKEND_URL`           | Production API URL (e.g. `https://api.example.com`) |
| `VITE_STRIPE_PUBLISHABLE_KEY`| Stripe publishable key for card payments    |

### Backend (`server`)

| Variable                    | Description                                |
|-----------------------------|--------------------------------------------|
| `NODE_ENV`                  | Set to `production` in deployment          |
| `PORT`                      | Internal port (Render/Railway sets this)   |
| `MONGODB_URL`               | Production MongoDB connection string       |
| `JWT_SECRET`                | Secret key for signing JWT tokens          |
| `JWT_EXPIRE`                | JWT expiry duration (e.g. `5d`)            |
| `COOKIE_EXPIRE`             | Cookie expiry in days                      |
| `SECRET_KEY_ACCESS_TOKEN`   | Access token signing secret                |
| `SECRET_KEY_REFRESH_TOKEN`  | Refresh token signing secret               |
| `FRONTEND_URL`              | Vercel production domain                   |
| `FRONTEND_WWW_URL`          | Alternate frontend URL (if applicable)     |
| `BACKEND_URL`               | Self-referencing backend URL               |
| `CASHFREE_APP_ID`           | Cashfree payment gateway app ID            |
| `CASHFREE_SECRET_KEY`       | Cashfree payment gateway secret            |
| `STRIPE_SECRET_KEY`         | Stripe secret key                          |
| `BREVO_API_KEY`             | Brevo (Sendinblue) transactional email API |
| `BREVO_SENDER_EMAIL`        | Sender email address for Brevo             |
| `BREVO_SENDER_NAME`         | Sender display name                        |
| `CLOUDINARY_NAME`           | Cloudinary cloud name                      |
| `CLOUDINARY_API_KEY`        | Cloudinary API key                         |
| `CLOUDINARY_API_SECRET`     | Cloudinary API secret                      |

---

## 5. Pre-deployment Checklist

> This section is designed to be cut out and used as a standalone checklist.

- [ ] `npm run lint` passes in `client/`
- [ ] `npm run build` succeeds in `client/`
- [ ] All `console.log` statements with sensitive data removed
- [ ] `NODE_ENV` set to `production` in deployment environment
- [ ] `MONGODB_URL` points to a production-grade cluster (not local)
- [ ] `FRONTEND_URL` matches the Vercel production domain
- [ ] Cloudinary credentials are valid and the `ff` folder exists
- [ ] Payment gateway keys (Stripe / Cashfree) are active
- [ ] Brevo API key is valid and sender email is verified
- [ ] Authentication cookies use `secure: true` and `sameSite: "Strict"` in production
- [ ] `helmet` is active and CORS origin is set to the frontend domain
- [ ] Email templates do not reference `localhost`
- [ ] Backend start command confirmed as `node index.js`
- [ ] Vercel root directory set to `client`
- [ ] SPA rewrites in `client/vercel.json` are present
- [ ] All environment variables are set in the deploy dashboard (not just `.env`)

---

## 6. Post-deployment Verification

1. **Health check** — visit `<backend-url>/` or a health endpoint; confirm `200 OK`.
2. **Frontend loads** — visit the Vercel URL; confirm the app renders without blank screen or CORS errors.
3. **API reachable** — open DevTools Network tab; confirm XHR requests reach the backend and return `200`.
4. **Authentication** — register a new user, log in, and verify session persists (cookie set).
5. **Payment flow** — run a test transaction (Stripe test mode / Cashfree test).
6. **Admin dashboard** — log in as admin; create and update a product.
7. **Email delivery** — trigger a password-reset or order-confirmation email; confirm it arrives.
8. **Static assets** — verify images from Cloudinary load on product pages.
9. **Error monitoring** — watch server logs for `5xx` errors for the first 24 hours.
10. **SEO / meta** — verify `react-helmet` meta tags render correctly on key pages (Home, Product, Checkout).
