import express from "express";
import {
  deleteUser,
  forgotPassword,
  getAllUsers,
  getSingleUser,
  getUserDetails,
  loginUser,
  logoutUser,
  registerUser,
  resendOtp,
  resetPassword,
  updateUserDetails,
  updateUserRole,
  updateUserStatus,
  uploadAvatar,
  verifyEmailOtp,
  verifyOtp,
} from "../controllers/userController.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import admin from "../middleware/Admin.js";
import { authLimiter, passwordResetLimiter } from "../middleware/rateLimiter.js";

const userRouter = express.Router();

userRouter.post("/register", authLimiter, registerUser);

userRouter.post("/verify-email", authLimiter, verifyEmailOtp);

userRouter.post("/resend-otp", authLimiter, resendOtp);

userRouter.post("/login", authLimiter, loginUser);

userRouter.get("/logout", logoutUser);

userRouter.put("/upload-avatar", upload.single("avatar"), auth, uploadAvatar);

userRouter.put("/forgot-password", passwordResetLimiter, forgotPassword);

userRouter.put("/verify-otp", authLimiter, verifyOtp);

userRouter.put("/reset-password", passwordResetLimiter, resetPassword);

userRouter.get("/me", auth, getUserDetails);

userRouter.put(
  "/update-user",
  auth,
  upload.single("avatar"),
  updateUserDetails
);

userRouter.get("/admin/get", auth, admin, getAllUsers);

userRouter.get("/admin/get/:id", auth, admin, getSingleUser);

userRouter.put("/admin/update", auth, admin, updateUserRole);

userRouter.delete("/admin/delete/:id", auth, admin, deleteUser);

userRouter.patch("/admin/:id/status", auth, admin, updateUserStatus);

export default userRouter;
