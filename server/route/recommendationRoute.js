import express from "express";
import {
  getHomeRecommendations,
  getProductRecommendations,
} from "../controllers/recommendationController.js";

const recommendationRouter = express.Router();

recommendationRouter.get("/home", getHomeRecommendations);
recommendationRouter.get("/product/:productId", getProductRecommendations);

export default recommendationRouter;
