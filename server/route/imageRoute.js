import express from "express";

const router = express.Router();
import upload from "../middleware/multer";
import { deleteImageController, uploadImageController } from "../controllers/imageController";


router.post("/upload", upload.single("image"), uploadImageController);

router.delete("/delete", deleteImageController);


export default router;