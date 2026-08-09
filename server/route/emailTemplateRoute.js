import express from 'express';
import { saveTemplate } from '../controllers/emailTemplateController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
router.post('/', auth, saveTemplate);

export default router;