import express from "express";
import auth from "../middleware/auth.js";
import admin from "../middleware/Admin.js";
import {
  askQuestion,
  answerQuestion,
  getProductFaq,
  getPendingFaqs,
} from "../controllers/faqController.js";

const faqRouter = express.Router();

faqRouter.post("/ask", auth, askQuestion);
faqRouter.put("/answer/:faqId", auth, admin, answerQuestion);
faqRouter.get("/product/:productId", getProductFaq);
faqRouter.get("/pending", auth, admin, getPendingFaqs);

export default faqRouter;
