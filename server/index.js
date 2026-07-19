import { createRequire } from "module";
const require = createRequire(import.meta.url);
const buffer = require("buffer");
if (!buffer.SlowBuffer) {
  buffer.SlowBuffer = buffer.Buffer;
}
import cloudinary from "cloudinary";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import securityMiddleware from "./middleware/security.js";
import connectDB from "./config/connectDB.js";
import validateEnv from "./config/validateEnv.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
dotenv.config();
validateEnv();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.set("trust proxy", 1);
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
app.use(responseWrapper);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(generalLimiter);
app.use(morgan("combined"));
app.use(errorMiddleware);
app.disable("x-powered-by");

app.get("/", (req, res) => {
  res.send("Server is running: " + PORT);
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
});

app.get("/ready", (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  if (isDbConnected) {
    res.status(200).json({ status: "UP", services: { database: "UP" } });
  } else {
    res.status(503).json({ status: "DOWN", services: { database: "DOWN" } });
  }
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
import healthRouter from "./route/healthRoute.js";
import { startMonitoring } from "./utils/systemMonitor.js";
import healthConfig from "./config/healthConfig.js";

app.use("/api/health", healthRouter);
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

app.use(errorMiddleware);

connectDB().then(() => {
  startMonitoring(healthConfig.monitoringInterval);

  const server = app.listen(PORT, () =>
    console.log(`Server is running on port ${PORT}`)
  );

  const shutdown = (reason, code = 1) => {
    console.error(`[shutdown] reason=${reason} code=${code}`);
    server.close(() => process.exit(code));
    setTimeout(() => process.exit(code), 10_000).unref();
  };

  process.on("unhandledRejection", (err) => {
    console.error(`[unhandledRejection] ${err?.message ?? err}`);
    shutdown("unhandledRejection");
  });

  process.on("uncaughtException", (err) => {
    console.error(`[uncaughtException] ${err?.message ?? err}`);
    shutdown("uncaughtException");
  });

  process.on("SIGTERM", () => shutdown("SIGTERM", 0));
  process.on("SIGINT", () => shutdown("SIGINT", 0));
});
