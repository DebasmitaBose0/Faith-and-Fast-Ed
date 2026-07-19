import express from "express";
import { getPopularReviews } from "../controllers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.get("/popular", getPopularReviews);

export default reviewRouter;
