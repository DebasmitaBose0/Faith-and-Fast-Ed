import cloudinary from "cloudinary";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/connectDB.js";
import validateEnv from "./config/validateEnv.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
dotenv.config();
validateEnv();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: "Too many requests, please try again later.",
});

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_WWW_URL,
  "http://localhost:5173"
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(limiter);
app.use(morgan("combined"));
app.use(errorMiddleware);
app.disable("x-powered-by");

app.get("/", (req, res) => {
  res.send("Server is running: " + PORT);
});

//routes
import addressRouter from "./route/addressRoute.js";
import cartRouter from "./route/cartRoute.js";
import categoryRouter from "./route/categoryRoute.js";
import discountRouter from "./route/discountRoute.js";
import inventoryRouter from "./route/inventoryRoute.js";
import orderRouter from "./route/orderRoute.js";
import paymentRouter from "./route/paymentRoute.js";
import paymentSettingsRouter from "./route/paymentSettingsRoute.js";
import productRouter from "./route/productRoute.js";
import supportRouter from "./route/supportRoute.js";
import userRouter from "./route/userRoute.js";
import wishListRouter from "./route/wishListRoute.js";
import reviewRouter from "./route/reviewRoute.js";

app.use("/api/address", addressRouter);
app.use("/api/cart", cartRouter);
app.use("/api/category", categoryRouter);
app.use("/api/discount", discountRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/order", orderRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/payment-settings", paymentSettingsRouter);
app.use("/api/product", productRouter);
app.use("/api/support", supportRouter);
app.use("/api/user", userRouter);
app.use("/api/wishlist", wishListRouter);
app.use("/api/review", reviewRouter);

connectDB().then(() => {
  const server = app.listen(PORT, () =>
    console.log(`Server is running on port ${PORT}`)
  );

  // Graceful shutdown helper — close the HTTP server so in-flight requests
  // can finish before the process exits. Log every exit reason distinctly so
  // operators can tell a crash from a signal-triggered stop in the logs.
  const shutdown = (reason, code = 1) => {
    console.error(`[shutdown] reason=${reason} code=${code}`);
    server.close(() => process.exit(code));
    // Safety net: force-exit after 10 s if connections linger.
    setTimeout(() => process.exit(code), 10_000).unref();
  };

  // Single unhandledRejection handler (was duplicated — both fired on every
  // unhandled rejection, causing a race between two concurrent shutdowns).
  process.on("unhandledRejection", (err) => {
    console.error(`[unhandledRejection] ${err?.message ?? err}`);
    shutdown("unhandledRejection");
  });

  // Synchronous throw that escaped all try/catch blocks.
  process.on("uncaughtException", (err) => {
    console.error(`[uncaughtException] ${err?.message ?? err}`);
    shutdown("uncaughtException");
  });

  // Container / PM2 / Heroku stop signal — exit cleanly with code 0.
  process.on("SIGTERM", () => shutdown("SIGTERM", 0));

  // Ctrl-C in development — same clean exit.
  process.on("SIGINT", () => shutdown("SIGINT", 0));
});
